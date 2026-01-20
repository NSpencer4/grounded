import type { MSKEvent, MSKRecord, Context } from 'aws-lambda'
import { produceMessage, shutdownProducers } from '@grounded/server/shared/event-producer'
import { ConversationInitiatedEventSchema } from '@grounded/schemas/events/conversation-initiated'
import { MessageReceivedEventSchema } from '@grounded/schemas/events/message-received'
import type { ConversationCommandEvent } from '@grounded/schemas/events/conversation-command'
import type { ConversationEvaluationEvent } from '@grounded/schemas/events/conversation-evaluation'
import { v4 as uuidv4 } from 'uuid'

const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092'
const EVALUATION_TOPIC = 'conversation-evaluation'
const CLIENT_ID = 'actions-orchestrator'

interface KafkaConfig {
  brokers: string[]
  clientId: string
}

const kafkaConfig: KafkaConfig = {
  brokers: [KAFKA_BROKER],
  clientId: CLIENT_ID,
}

function parseConversationCommandEvent(record: MSKRecord): ConversationCommandEvent | null {
  try {
    const value = Buffer.from(record.value, 'base64').toString('utf-8')
    const parsed = JSON.parse(value)

    // Try parsing as ConversationInitiatedEvent first
    const initiatedResult = ConversationInitiatedEventSchema.safeParse(parsed)
    if (initiatedResult.success) {
      return initiatedResult.data
    }

    // Try parsing as MessageReceivedEvent
    const messageResult = MessageReceivedEventSchema.safeParse(parsed)
    if (messageResult.success) {
      return messageResult.data
    }

    console.error('Failed to parse event as any known type:', {
      initiatedError: initiatedResult.error?.message,
      messageError: messageResult.error?.message,
    })
    return null
  } catch (error) {
    console.error('Error parsing Kafka record:', error)
    return null
  }
}

function evaluateConversation(event: ConversationCommandEvent): ConversationEvaluationEvent {
  const now = new Date()

  // Determine evaluation type based on event characteristics
  const hasMessage = 'message' in event && event.message
  const evaluationType = hasMessage ? 'RESPONSE_RECOMMENDATION' : 'NO_ACTION'

  const evaluation: ConversationEvaluationEvent = {
    event: {
      id: uuidv4(),
      type: 'CONVERSATION_EVALUATION',
      schemaVersion: '1.0.0',
    },
    actionContext: {
      action: 'CREATE',
      actionBy: 'actions-orchestrator',
    },
    metadata: {
      createdAt: now,
      updatedAt: now,
      correlationId: event.metadata.correlationId,
    },
    conversation: event.conversation,
    message: hasMessage ? event.message : undefined,
    evaluation: {
      type: evaluationType,
      reasoning: hasMessage
        ? 'New message received - generating response recommendation'
        : 'Conversation initiated - no immediate action required',
      suggestedActions: hasMessage ? ['generate_response', 'analyze_sentiment'] : [],
    },
  }

  return evaluation
}

async function processRecord(record: MSKRecord): Promise<void> {
  const event = parseConversationCommandEvent(record)

  if (!event) {
    console.warn('Skipping invalid record')
    return
  }

  console.log('Processing conversation command event:', {
    eventType: event.event.type,
    conversationId: event.conversation.id,
    correlationId: event.metadata.correlationId,
  })

  const evaluationEvent = evaluateConversation(event)

  await produceMessage(
    CLIENT_ID,
    kafkaConfig,
    EVALUATION_TOPIC,
    event.conversation.id,
    JSON.stringify(evaluationEvent),
  )

  console.log('Produced evaluation event:', {
    evaluationType: evaluationEvent.evaluation.type,
    conversationId: evaluationEvent.conversation.id,
  })
}

export async function handler(event: MSKEvent, context: Context): Promise<void> {
  console.log('Actions Orchestrator Lambda invoked', {
    requestId: context.awsRequestId,
    recordCount: Object.values(event.records).flat().length,
  })

  try {
    // Process all records from all topic partitions
    for (const [topicPartition, records] of Object.entries(event.records)) {
      console.log(`Processing ${records.length} records from ${topicPartition}`)

      for (const record of records) {
        await processRecord(record)
      }
    }

    console.log('Successfully processed all records')
  } catch (error) {
    console.error('Error processing Kafka event:', error)
    throw error
  }
}

// Graceful shutdown handler for Lambda extensions
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down producers...')
  await shutdownProducers()
  process.exit(0)
})
