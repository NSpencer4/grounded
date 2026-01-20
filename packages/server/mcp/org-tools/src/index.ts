import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js'
import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { DynamoDbConnection } from '@grounded/server-shared/dynamo'

const TABLE_NAME = process.env.DYNAMO_TABLE_NAME || 'grounded-datastore'
const AWS_REGION = process.env.AWS_REGION || 'us-east-1'
const DYNAMO_ENDPOINT = process.env.DYNAMO_ENDPOINT || 'https://dynamodb.us-east-1.amazonaws.com'

const dynamoConnection = new DynamoDbConnection(DYNAMO_ENDPOINT, AWS_REGION)
const ddbDoc = dynamoConnection.ddbDoc

const tools: Tool[] = [
  {
    name: 'get_conversation_events',
    description:
      'Get all events for a specific conversation. Returns both commands and updates in chronological order.',
    inputSchema: {
      type: 'object',
      properties: {
        conversationId: {
          type: 'string',
          description: 'The UUID of the conversation to query',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of events to return (default: 50)',
        },
      },
      required: ['conversationId'],
    },
  },
  {
    name: 'get_events_by_correlation_id',
    description:
      'Get all events that share a correlation ID. Useful for tracing a request through the system.',
    inputSchema: {
      type: 'object',
      properties: {
        correlationId: {
          type: 'string',
          description: 'The correlation ID to search for',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of events to return (default: 50)',
        },
      },
      required: ['correlationId'],
    },
  },
  {
    name: 'get_events_by_type',
    description:
      'Get events filtered by event type (e.g., CONVERSATION_INITIATED, MESSAGE_RECEIVED)',
    inputSchema: {
      type: 'object',
      properties: {
        eventType: {
          type: 'string',
          description: 'The event type to filter by',
          enum: ['CONVERSATION_INITIATED', 'MESSAGE_RECEIVED', 'CONVERSATION_EVALUATION'],
        },
        limit: {
          type: 'number',
          description: 'Maximum number of events to return (default: 50)',
        },
      },
      required: ['eventType'],
    },
  },
  {
    name: 'get_recent_events',
    description:
      'Get the most recent events across all conversations. Useful for monitoring system activity.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of events to return (default: 20)',
        },
      },
    },
  },
  {
    name: 'get_conversation_state',
    description:
      'Get the current state of a conversation including status, participants, and latest message.',
    inputSchema: {
      type: 'object',
      properties: {
        conversationId: {
          type: 'string',
          description: 'The UUID of the conversation',
        },
      },
      required: ['conversationId'],
    },
  },
]

async function getConversationEvents(
  conversationId: string,
  limit: number = 50,
): Promise<Record<string, unknown>[]> {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `CONVERSATION#${conversationId}`,
    },
    Limit: limit,
    ScanIndexForward: true, // chronological order
  })

  const response = await ddbDoc.send(command)
  return response.Items || []
}

async function getEventsByCorrelationId(
  correlationId: string,
  limit: number = 50,
): Promise<Record<string, unknown>[]> {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1 = :correlationId',
    ExpressionAttributeValues: {
      ':correlationId': `CORRELATION#${correlationId}`,
    },
    Limit: limit,
  })

  const response = await ddbDoc.send(command)
  return response.Items || []
}

async function getEventsByType(
  eventType: string,
  limit: number = 50,
): Promise<Record<string, unknown>[]> {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: 'eventType = :eventType',
    ExpressionAttributeValues: {
      ':eventType': eventType,
    },
    Limit: limit,
  })

  const response = await ddbDoc.send(command)
  return response.Items || []
}

async function getRecentEvents(limit: number = 20): Promise<Record<string, unknown>[]> {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    Limit: limit,
  })

  const response = await ddbDoc.send(command)
  // Sort by createdAt descending
  const items = response.Items || []
  return items.sort((a, b) => {
    const dateA = new Date(a.createdAt as string).getTime()
    const dateB = new Date(b.createdAt as string).getTime()
    return dateB - dateA
  })
}

async function getConversationState(
  conversationId: string,
): Promise<Record<string, unknown> | null> {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `CONVERSATION#${conversationId}`,
      ':sk': 'STATE#',
    },
    Limit: 1,
    ScanIndexForward: false, // get latest state
  })

  const response = await ddbDoc.send(command)
  return response.Items?.[0] || null
}

const server = new Server(
  {
    name: 'state-machine-query-tools',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
)

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case 'get_conversation_events': {
        const { conversationId, limit } = args as { conversationId: string; limit?: number }
        const events = await getConversationEvents(conversationId, limit)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(events, null, 2),
            },
          ],
        }
      }

      case 'get_events_by_correlation_id': {
        const { correlationId, limit } = args as { correlationId: string; limit?: number }
        const events = await getEventsByCorrelationId(correlationId, limit)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(events, null, 2),
            },
          ],
        }
      }

      case 'get_events_by_type': {
        const { eventType, limit } = args as { eventType: string; limit?: number }
        const events = await getEventsByType(eventType, limit)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(events, null, 2),
            },
          ],
        }
      }

      case 'get_recent_events': {
        const { limit } = (args as { limit?: number }) || {}
        const events = await getRecentEvents(limit)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(events, null, 2),
            },
          ],
        }
      }

      case 'get_conversation_state': {
        const { conversationId } = args as { conversationId: string }
        const state = await getConversationState(conversationId)
        return {
          content: [
            {
              type: 'text',
              text: state ? JSON.stringify(state, null, 2) : 'No state found for conversation',
            },
          ],
        }
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${errorMessage}`,
        },
      ],
      isError: true,
    }
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('State Machine Query Tools MCP Server running on stdio')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
