import { DynamoDbConnection } from '@grounded/server-shared/dynamo'
import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import type {
  ActionRecord,
  ConversationCommandEvent,
  ConversationState,
  DecisionRecord,
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

export async function saveConversationState(state: ConversationState): Promise<void> {
  const connection = getDynamoConnection()

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `conversation#${state.conversationId}`,
      SK: 'state#CURRENT',
      GSI1: `status#${state.status}`,
      ...state,
    },
  })

  await connection.ddbDoc.send(command)
}

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

export async function saveEvent(
  conversationId: string,
  event: ConversationCommandEvent,
): Promise<void> {
  const connection = getDynamoConnection()
  const now = new Date().toISOString()

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `conversation#${conversationId}`,
      SK: `action#${now}#${event.event.id}`,
      eventType: event.event.type,
      eventId: event.event.id,
      correlationId: event.metadata.correlationId,
      createdAt: now,
      data: event,
    },
  })

  await connection.ddbDoc.send(command)
}

export function createInitialState(event: ConversationCommandEvent): ConversationState {
  const now = new Date().toISOString()
  return {
    conversationId: event.conversation.id,
    status: event.conversation.state.status,
    messageCount: 'message' in event && event.message ? 1 : 0,
    lastEventType: event.event.type,
    lastUpdated: now,
    createdAt: now,
  }
}

// Decision Record Functions

export async function saveDecisionRecord(decision: DecisionRecord): Promise<void> {
  const connection = getDynamoConnection()

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `conversation#${decision.conversationId}`,
      SK: `decision#${decision.createdAt}#${decision.id}`,
      ...decision,
    },
  })

  await connection.ddbDoc.send(command)
}

export async function getDecisionsByConversation(
  conversationId: string,
): Promise<DecisionRecord[]> {
  const connection = getDynamoConnection()

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `conversation#${conversationId}`,
      ':sk': 'decision#',
    },
  })

  const response = await connection.ddbDoc.send(command)
  return (response.Items || []) as DecisionRecord[]
}

export async function getPendingDecisions(conversationId: string): Promise<DecisionRecord[]> {
  const decisions = await getDecisionsByConversation(conversationId)
  return decisions.filter((d) => d.status === 'PENDING')
}

export async function resolveDecision(
  conversationId: string,
  decisionId: string,
  createdAt: string,
  resolution: string,
): Promise<void> {
  const connection = getDynamoConnection()
  const now = new Date().toISOString()

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `conversation#${conversationId}`,
      SK: `decision#${createdAt}#${decisionId}`,
    },
    UpdateExpression: 'SET #status = :status, #resolvedAt = :resolvedAt, #resolution = :resolution',
    ExpressionAttributeNames: {
      '#status': 'status',
      '#resolvedAt': 'resolvedAt',
      '#resolution': 'resolution',
    },
    ExpressionAttributeValues: {
      ':status': 'RESOLVED',
      ':resolvedAt': now,
      ':resolution': resolution,
    },
  })

  await connection.ddbDoc.send(command)
}

// Action Record Functions

export async function saveActionRecord(action: ActionRecord): Promise<void> {
  const connection = getDynamoConnection()

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `conversation#${action.conversationId}`,
      SK: `action#${action.createdAt}#${action.id}`,
      ...action,
    },
  })

  await connection.ddbDoc.send(command)
}

export async function getActionsByConversation(conversationId: string): Promise<ActionRecord[]> {
  const connection = getDynamoConnection()

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `conversation#${conversationId}`,
      ':sk': 'action#',
    },
  })

  const response = await connection.ddbDoc.send(command)
  return (response.Items || []) as ActionRecord[]
}
