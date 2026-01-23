import type { Context, MSKEvent, MSKRecord } from 'aws-lambda'
import { produceMessage, shutdownProducers } from '@grounded/server-shared/event-producer'
import { type AssertionEvent, AssertionEventSchema, type ProcessingResult } from './types.js'
import { analyzeAssertions, createDecisionEvent, createUpdateEvent } from './responder.js'
import {
  addAssertionToState,
  getConversationState,
  saveAssertionEvent,
  saveDecisionEvent,
  saveUpdateEvent,
  updateConversationState,
} from './state.js'

const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092'
const UPDATES_TOPIC = 'conversation-updates'
const DECISIONS_TOPIC = 'conversation-decisions'
const CLIENT_ID = 'conversation-responder'

const kafkaConfig = {
  brokers: [KAFKA_BROKER],
  clientId: CLIENT_ID,
}

/**
 * Parse assertion event from Kafka record
 */
function parseAssertionEvent(record: MSKRecord): AssertionEvent | null {
  try {
    const value = Buffer.from(record.value, 'base64').toString('utf-8')
    const parsed = JSON.parse(value)

    const result = AssertionEventSchema.safeParse(parsed)
    if (result.success) {
      return result.data
    }

    console.error('Failed to parse assertion event:', result.error.message)
    return null
  } catch (error) {
    console.error('Error parsing Kafka record:', error)
    return null
  }
}

/**
 * Process a single assertion record
 */
async function processRecord(record: MSKRecord): Promise<ProcessingResult> {
  const startTime = Date.now()
  const assertion = parseAssertionEvent(record)

  if (!assertion) {
    return {
      success: false,
      conversationId: 'unknown',
      assertionType: 'unknown',
      updateProduced: false,
      decisionProduced: false,
      processingTimeMs: Date.now() - startTime,
      error: 'Failed to parse assertion event',
    }
  }

  const conversationId = assertion.conversation.id

  try {
    console.info('Processing assertion event:', {
      eventId: assertion.event.id,
      assertionType: assertion.assertion.type,
      agentId: assertion.assertion.agentId,
      confidence: assertion.assertion.confidence,
      conversationId,
      correlationId: assertion.metadata.correlationId,
    })

    // Persist the incoming assertion event
    await saveAssertionEvent(conversationId, assertion)

    // Add assertion to conversation state
    await addAssertionToState(conversationId, assertion)

    // Get current conversation state for decision making
    const state = await getConversationState(conversationId)

    // Analyze assertions and decide on response
    const decision = analyzeAssertions(assertion, state)

    console.info('Response decision:', {
      conversationId,
      shouldRespond: decision.shouldRespond,
      decision: decision.decision,
      reasoning: decision.reasoning,
    })

    let updateProduced = false
    let decisionProduced = false

    // Create and publish update event if we should respond
    if (decision.shouldRespond) {
      const updateEvent = createUpdateEvent(assertion, decision)
      if (updateEvent) {
        await produceMessage(
          CLIENT_ID,
          kafkaConfig,
          UPDATES_TOPIC,
          conversationId,
          JSON.stringify(updateEvent),
        )
        await saveUpdateEvent(conversationId, updateEvent)
        updateProduced = true

        // Update response count in state
        if (state) {
          await updateConversationState(conversationId, {
            responsesSent: state.responsesSent + 1,
            updatedAt: new Date().toISOString(),
          })
        }

        console.info('Produced conversation update:', {
          eventId: updateEvent.event.id,
          updateType: updateEvent.update.type,
          conversationId,
        })
      }
    }

    // Always create and publish decision event for orchestrator feedback
    const decisionEvent = createDecisionEvent(assertion, decision)
    await produceMessage(
      CLIENT_ID,
      kafkaConfig,
      DECISIONS_TOPIC,
      conversationId,
      JSON.stringify(decisionEvent),
    )
    await saveDecisionEvent(conversationId, decisionEvent)
    decisionProduced = true

    // Update last decision in state
    await updateConversationState(conversationId, {
      lastDecision: {
        type: decision.decision,
        madeAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    })

    console.info('Produced conversation decision:', {
      eventId: decisionEvent.event.id,
      decisionType: decision.decision,
      conversationId,
    })

    return {
      success: true,
      conversationId,
      assertionType: assertion.assertion.type,
      decision: decision.decision,
      updateProduced,
      decisionProduced,
      processingTimeMs: Date.now() - startTime,
    }
  } catch (error) {
    console.error('Error processing assertion:', { conversationId, error })
    return {
      success: false,
      conversationId,
      assertionType: assertion.assertion.type,
      updateProduced: false,
      decisionProduced: false,
      processingTimeMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Lambda handler for processing conversation assertions
 */
export async function handler(event: MSKEvent, context: Context): Promise<void> {
  const startTime = Date.now()
  const totalRecords = Object.values(event.records).flat().length

  console.info('Conversation Responder Lambda invoked', {
    requestId: context.awsRequestId,
    recordCount: totalRecords,
    remainingTimeMs: context.getRemainingTimeInMillis(),
  })

  const results: ProcessingResult[] = []

  try {
    // Process all records from all topic partitions
    for (const [topicPartition, records] of Object.entries(event.records)) {
      console.info(`Processing ${records.length} records from ${topicPartition}`)

      for (const record of records) {
        const result = await processRecord(record)
        results.push(result)
      }
    }

    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length
    const updatesProduced = results.filter((r) => r.updateProduced).length
    const decisionsProduced = results.filter((r) => r.decisionProduced).length

    console.info('Processing complete', {
      totalRecords,
      successful,
      failed,
      updatesProduced,
      decisionsProduced,
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
  console.info('Received SIGTERM, shutting down producers...')
  await shutdownProducers()
  process.exit(0)
})
