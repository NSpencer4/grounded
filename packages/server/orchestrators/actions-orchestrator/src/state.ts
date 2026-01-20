import { DynamoDbConnection } from '@grounded/server-shared/dynamo'
import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import type { ConversationCommandEvent, ConversationState } from './types.js'

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
      PK: `CONVERSATION#${conversationId}`,
      SK: 'STATE#CURRENT',
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
      PK: `CONVERSATION#${state.conversationId}`,
      SK: 'STATE#CURRENT',
      GSI1: `STATUS#${state.status}`,
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

  if (updateExpressions.length === 0) return

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `CONVERSATION#${conversationId}`,
      SK: 'STATE#CURRENT',
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
      PK: `CONVERSATION#${conversationId}`,
      SK: `EVENT#${now}#${event.event.id}`,
      GSI1: `CORRELATION#${event.metadata.correlationId}`,
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
