import { DynamoDbConnection } from '@grounded/server-shared/dynamo'
import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import type {
  AssertionEvent,
  ConversationDecisionEvent,
  ConversationState,
  ConversationUpdateEvent,
} from './types.js'

const TABLE_NAME = process.env.DYNAMO_TABLE_NAME || 'grounded-datastore'
const AWS_REGION = process.env.AWS_REGION || 'us-east-1'
const DYNAMO_ENDPOINT =
  process.env.DYNAMO_ENDPOINT || `https://dynamodb.${AWS_REGION}.amazonaws.com`

let dynamoConnection: DynamoDbConnection | null = null

function getDynamoConnection(): DynamoDbConnection {
  if (!dynamoConnection) {
    dynamoConnection = new DynamoDbConnection(DYNAMO_ENDPOINT, AWS_REGION)
  }
  return dynamoConnection
}

/**
 * Get conversation state from DynamoDB
 */
export async function getConversationState(
  conversationId: string,
): Promise<ConversationState | null> {
  const connection = getDynamoConnection()

  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `conversation#${conversationId}`,
      SK: 'state#CURRENT',
    },
  })

  const response = await connection.ddbDoc.send(command)
  return response.Item as ConversationState | null
}

/**
 * Save conversation state to DynamoDB
 */
export async function saveConversationState(state: ConversationState): Promise<void> {
  const connection = getDynamoConnection()

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `conversation#${state.conversationId}`,
      SK: 'state#CURRENT',
      GSI1PK: `STATUS#${state.status}`,
      GSI1SK: state.updatedAt,
      ...state,
    },
  })

  await connection.ddbDoc.send(command)
}

/**
 * Update conversation state in DynamoDB
 */
export async function updateConversationState(
  conversationId: string,
  updates: Partial<ConversationState>,
): Promise<void> {
  const connection = getDynamoConnection()

  const updateExpressions: string[] = []
  const expressionAttributeNames: Record<string, string> = {}
  const expressionAttributeValues: Record<string, unknown> = {}

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      updateExpressions.push(`#${key} = :${key}`)
      expressionAttributeNames[`#${key}`] = key
      expressionAttributeValues[`:${key}`] = value
    }
  })

  if (updateExpressions.length === 0) {
    return
  }

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `conversation#${conversationId}`,
      SK: 'state#CURRENT',
    },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  })

  await connection.ddbDoc.send(command)
}

/**
 * Save assertion event to DynamoDB event history
 */
export async function saveAssertionEvent(
  conversationId: string,
  event: AssertionEvent,
): Promise<void> {
  const connection = getDynamoConnection()
  const now = new Date().toISOString()

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `conversation#${conversationId}`,
      SK: `ASSERTION#${now}#${event.event.id}`,
      GSI1PK: `CORRELATION#${event.metadata.correlationId}`,
      GSI1SK: now,
      eventType: 'CONVERSATION_ASSERTION',
      assertionType: event.assertion.type,
      agentId: event.assertion.agentId,
      confidence: event.assertion.confidence,
      eventId: event.event.id,
      correlationId: event.metadata.correlationId,
      createdAt: now,
      data: event,
    },
  })

  await connection.ddbDoc.send(command)
}

/**
 * Save update event to DynamoDB event history
 */
export async function saveUpdateEvent(
  conversationId: string,
  event: ConversationUpdateEvent,
): Promise<void> {
  const connection = getDynamoConnection()
  const now = new Date().toISOString()

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `conversation#${conversationId}`,
      SK: `UPDATE#${now}#${event.event.id}`,
      GSI1PK: `CORRELATION#${event.metadata.correlationId}`,
      GSI1SK: now,
      eventType: 'CONVERSATION_UPDATE',
      updateType: event.update.type,
      eventId: event.event.id,
      correlationId: event.metadata.correlationId,
      createdAt: now,
      data: event,
    },
  })

  await connection.ddbDoc.send(command)
}

/**
 * Save decision event to DynamoDB event history
 */
export async function saveDecisionEvent(
  conversationId: string,
  event: ConversationDecisionEvent,
): Promise<void> {
  const connection = getDynamoConnection()
  const now = new Date().toISOString()

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `conversation#${conversationId}`,
      SK: `DECISION#${now}#${event.event.id}`,
      GSI1PK: `CORRELATION#${event.metadata.correlationId}`,
      GSI1SK: now,
      eventType: 'CONVERSATION_DECISION',
      decisionType: event.decision.type,
      eventId: event.event.id,
      correlationId: event.metadata.correlationId,
      createdAt: now,
      data: event,
    },
  })

  await connection.ddbDoc.send(command)
}

/**
 * Add assertion to conversation state
 */
export async function addAssertionToState(
  conversationId: string,
  assertion: AssertionEvent,
): Promise<void> {
  const state = await getConversationState(conversationId)
  if (!state) {
    console.warn(`No state found for conversation ${conversationId}, creating new state`)
    const now = new Date().toISOString()
    await saveConversationState({
      conversationId,
      customerId: assertion.conversation.customerId,
      organizationId: assertion.conversation.organizationId,
      status: 'ACTIVE',
      assertions: [
        {
          id: assertion.event.id,
          type: assertion.assertion.type,
          agentId: assertion.assertion.agentId,
          confidence: assertion.assertion.confidence,
          receivedAt: now,
        },
      ],
      responsesSent: 0,
      createdAt: now,
      updatedAt: now,
    })
    return
  }

  const now = new Date().toISOString()
  const newAssertion = {
    id: assertion.event.id,
    type: assertion.assertion.type,
    agentId: assertion.assertion.agentId,
    confidence: assertion.assertion.confidence,
    receivedAt: now,
  }

  await updateConversationState(conversationId, {
    assertions: [...state.assertions, newAssertion],
    updatedAt: now,
  })
}
