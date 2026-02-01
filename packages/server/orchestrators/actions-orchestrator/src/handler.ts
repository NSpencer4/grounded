import type { Context, MSKEvent, MSKRecord } from 'aws-lambda'
import { randomUUID } from 'crypto'
import { produceMessage, shutdownProducers } from '@grounded/server-shared/event-producer'
import { ConversationInitiatedEventSchema } from '@grounded/schemas/events/conversation-initiated'
import { MessageReceivedEventSchema } from '@grounded/schemas/events/message-received'
import type { ActionRecord, DecisionRecord, DecisionType, ProcessingResult } from './types.js'
import { evaluateConversation } from './evaluator.js'
import {
  createInitialState,
  getConversationState,
  saveActionRecord,
  saveConversationState,
  saveDecisionRecord,
  saveEvent,
  updateConversationState,
} from './state.js'
import { type ConversationCommandEvent } from '@grounded/schemas/events'

const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092'
const EVALUATION_TOPIC = 'conversation-evaluations'
const CLIENT_ID = 'actions-orchestrator'

const kafkaConfig = {
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

function mapAgentToDecisionType(agent: string): DecisionType {
  switch (agent) {
    case 'customer-spend-agent':
      return 'EVALUATE_CUSTOMER_SPEND'
    case 'response-recommendation-agent':
      return 'EVALUATE_RESPONSE_RECOMMENDATION'
    default:
      return 'EVALUATE_RESPONSE_RECOMMENDATION'
  }
}

async function processRecord(record: MSKRecord): Promise<ProcessingResult> {
  const startTime = Date.now()
  const event = parseConversationCommandEvent(record)

  if (!event) {
    return {
      success: false,
      conversationId: 'unknown',
      evaluationType: 'unknown',
      agentsTriggered: [],
      decisionsCreated: [],
      actionsCreated: [],
      processingTimeMs: Date.now() - startTime,
      error: 'Failed to parse event',
    }
  }

  const conversationId = event.conversation.id
  const now = new Date().toISOString()
  const decisionsCreated: string[] = []
  const actionsCreated: string[] = []

  try {
    console.log('Processing conversation command event:', {
      eventType: event.event.type,
      conversationId,
      correlationId: event.metadata.correlationId,
    })

    // Persist the incoming event
    await saveEvent(conversationId, event)

    // Get or create conversation state
    let state = await getConversationState(conversationId)
    if (!state) {
      state = createInitialState(event)
      await saveConversationState(state)
      console.log('Created new conversation state:', { conversationId })
    } else {
      // Update existing state
      const hasMessage = 'message' in event && event.message
      await updateConversationState(conversationId, {
        status: event.conversation.state.status,
        messageCount: hasMessage ? state.messageCount + 1 : state.messageCount,
        lastEventType: event.event.type,
        lastUpdated: now,
      })
    }

    // Evaluate the conversation and determine next actions
    const evaluationResult = evaluateConversation(event)

    // Create decision records for each agent that should be triggered
    const decisionIds: string[] = []
    for (const agent of evaluationResult.agentsToTrigger) {
      const decisionId = randomUUID()
      const decision: DecisionRecord = {
        id: decisionId,
        conversationId,
        type: mapAgentToDecisionType(agent),
        status: 'PENDING',
        triggerEventId: event.event.id,
        reasoning: evaluationResult.event.evaluation.reasoning,
        createdAt: now,
      }
      await saveDecisionRecord(decision)
      decisionIds.push(decisionId)
      decisionsCreated.push(decisionId)
      console.log('Created decision record:', { decisionId, type: decision.type, conversationId })
    }

    // Produce evaluation event to Kafka
    await produceMessage(
      CLIENT_ID,
      kafkaConfig,
      EVALUATION_TOPIC,
      conversationId,
      JSON.stringify(evaluationResult.event),
    )

    // Create action record for producing the evaluation event
    const actionId = randomUUID()
    const action: ActionRecord = {
      id: actionId,
      conversationId,
      type: 'PRODUCE_EVENT',
      decisionIds,
      details: {
        topic: EVALUATION_TOPIC,
        evaluationType: evaluationResult.event.evaluation.type,
        agentsToTrigger: evaluationResult.agentsToTrigger,
      },
      createdAt: now,
    }
    await saveActionRecord(action)
    actionsCreated.push(actionId)

    console.log('Produced evaluation event and recorded action:', {
      actionId,
      evaluationType: evaluationResult.event.evaluation.type,
      conversationId,
      shouldTriggerAgents: evaluationResult.shouldTriggerAgents,
      agentsToTrigger: evaluationResult.agentsToTrigger,
      decisionIds,
    })

    return {
      success: true,
      conversationId,
      evaluationType: evaluationResult.event.evaluation.type,
      agentsTriggered: evaluationResult.agentsToTrigger,
      decisionsCreated,
      actionsCreated,
      processingTimeMs: Date.now() - startTime,
    }
  } catch (error) {
    console.error('Error processing record:', { conversationId, error })
    return {
      success: false,
      conversationId,
      evaluationType: 'unknown',
      agentsTriggered: [],
      decisionsCreated,
      actionsCreated,
      processingTimeMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function handler(event: MSKEvent, context: Context): Promise<void> {
  const startTime = Date.now()
  const totalRecords = Object.values(event.records).flat().length

  console.log('Actions Orchestrator Lambda invoked', {
    requestId: context.awsRequestId,
    recordCount: totalRecords,
    remainingTimeMs: context.getRemainingTimeInMillis(),
  })

  const results: ProcessingResult[] = []

  try {
    // Process all records from all topic partitions
    for (const [topicPartition, records] of Object.entries(event.records)) {
      console.log(`Processing ${records.length} records from ${topicPartition}`)

      for (const record of records) {
        const result = await processRecord(record)
        results.push(result)
      }
    }

    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length
    const totalDecisions = results.reduce((sum, r) => sum + r.decisionsCreated.length, 0)
    const totalActions = results.reduce((sum, r) => sum + r.actionsCreated.length, 0)

    console.log('Processing complete', {
      totalRecords,
      successful,
      failed,
      totalDecisions,
      totalActions,
      totalProcessingTimeMs: Date.now() - startTime,
    })

    if (failed > 0) {
      const errors = results.filter((r) => !r.success).map((r) => r.error)
      console.error('Some records failed to process:', { errors })
      // Don't throw - let Lambda report partial success
      // Failed records will be retried by MSK
    }
  } catch (error) {
    console.error('Fatal error processing Kafka event:', error)
    throw error
  }
}

// Graceful shutdown handler for Lambda extensions
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down producers...')
  await shutdownProducers()
  process.exit(0)
})
