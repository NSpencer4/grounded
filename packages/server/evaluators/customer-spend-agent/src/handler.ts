import type { Context, SQSEvent, SQSRecord } from 'aws-lambda'
import { extractAgentContext } from '@grounded/agents-shared'
import { ConversationEvaluationEventSchema } from '@grounded/schemas/events/conversation-evaluation'
import { produceMessage } from '@grounded/server-shared/event-producer'
import { analyzeCustomerSpend, fetchCustomerSpendData } from './agent.js'

const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092'
const OUTPUT_TOPIC = 'conversation-assertions'
const CLIENT_ID = 'customer-spend-agent'

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
  const context = extractAgentContext(event)

  console.log('Processing customer spend analysis:', {
    conversationId: context.conversationId,
    customerId: context.customerId,
    correlationId: context.correlationId,
  })

  // Fetch customer spend data
  const spendData = await fetchCustomerSpendData(context.customerId)

  // Analyze the data with LLM
  const result = await analyzeCustomerSpend(context, spendData)

  if (result.success) {
    console.log('Customer spend analysis completed:', {
      customerValue: result.data?.analysis.customerValue,
      churnRisk: result.data?.analysis.churnRisk,
      executionTimeMs: result.metadata.executionTimeMs,
    })
  } else {
    console.error('Customer spend analysis failed:', result.error)
  }

  // Produce result to Kafka
  const outputEvent = {
    type: 'CUSTOMER_SPEND_ANALYSIS',
    correlationId: context.correlationId,
    conversationId: context.conversationId,
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
  console.log('Customer Spend Agent Lambda invoked', {
    requestId: lambdaContext.awsRequestId,
    recordCount: event.Records.length,
  })

  const results = await Promise.allSettled(event.Records.map(processRecord))

  const failures = results.filter((r) => r.status === 'rejected')
  if (failures.length > 0) {
    console.error(`${failures.length} records failed to process`)
    // Throw to trigger SQS retry for failed records
    throw new Error(`Failed to process ${failures.length} records`)
  }

  console.log('Successfully processed all records')
}
