import type { Context, SQSEvent, SQSRecord } from 'aws-lambda'
import { extractAgentContext } from '@grounded/agents-shared'
import { ConversationEvaluationEventSchema } from '@grounded/schemas/events/conversation-evaluation'
import { produceMessage } from '@grounded/server-shared/event-producer'
import {
  fetchConversationHistory,
  fetchCustomerContext,
  generateResponseRecommendation,
} from './agent.js'

const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092'
const OUTPUT_TOPIC = 'agent-results'
const CLIENT_ID = 'response-recommendation-agent'

const kafkaConfig = {
  brokers: [KAFKA_BROKER],
  clientId: CLIENT_ID,
}

async function processRecord(record: SQSRecord): Promise<void> {
  const body = JSON.parse(record.body)
  const parseResult = ConversationEvaluationEventSchema.safeParse(body)

  if (!parseResult.success) {
    console.error('Failed to parse evaluation event:', parseResult.error.message)
    return
  }

  const event = parseResult.data

  // Only process events that need response recommendations
  if (event.evaluation.type !== 'RESPONSE_RECOMMENDATION') {
    console.log('Skipping event - not a response recommendation request:', event.evaluation.type)
    return
  }

  const context = extractAgentContext(event)

  if (!context.message) {
    console.log('Skipping event - no message to respond to')
    return
  }

  console.log('Generating response recommendation:', {
    conversationId: context.conversationId,
    messageId: context.message.id,
    correlationId: context.correlationId,
  })

  // Fetch conversation history and customer context in parallel
  const [conversationHistory, customerContext] = await Promise.all([
    fetchConversationHistory(context.conversationId),
    fetchCustomerContext(context.customerId),
  ])

  // Generate response recommendation
  const result = await generateResponseRecommendation(context, conversationHistory, customerContext)

  if (result.success) {
    console.log('Response recommendation generated:', {
      tone: result.data?.recommendation.tone,
      escalationRecommended: result.data?.recommendation.escalationRecommended,
      confidence: result.data?.recommendation.confidence,
      executionTimeMs: result.metadata.executionTimeMs,
    })
  } else {
    console.error('Response recommendation failed:', result.error)
  }

  // Produce result to Kafka
  const outputEvent = {
    type: 'RESPONSE_RECOMMENDATION',
    correlationId: context.correlationId,
    conversationId: context.conversationId,
    messageId: context.message.id,
    result,
    timestamp: new Date().toISOString(),
  }

  await produceMessage(
    CLIENT_ID,
    kafkaConfig,
    OUTPUT_TOPIC,
    context.conversationId,
    JSON.stringify(outputEvent),
  )
}

export async function handler(event: SQSEvent, lambdaContext: Context): Promise<void> {
  console.log('Response Recommendation Agent Lambda invoked', {
    requestId: lambdaContext.awsRequestId,
    recordCount: event.Records.length,
  })

  const results = await Promise.allSettled(event.Records.map(processRecord))

  const failures = results.filter((r) => r.status === 'rejected')
  if (failures.length > 0) {
    console.error(`${failures.length} records failed to process`)
    throw new Error(`Failed to process ${failures.length} records`)
  }

  console.log('Successfully processed all records')
}
