import { v4 as uuidv4 } from 'uuid'
import type {
  AssertionEvent,
  ConversationDecisionEvent,
  ConversationState,
  ConversationUpdateEvent,
  DecisionType,
} from './types.js'

const SCHEMA_VERSION = '1.0.0'

interface ResponseDecision {
  shouldRespond: boolean
  decision: DecisionType
  reasoning: string
  responseContent?: string
  nextActions: string[]
}

/**
 * Analyze assertions and decide on the appropriate response
 */
export function analyzeAssertions(
  assertion: AssertionEvent,
  state: ConversationState | null,
): ResponseDecision {
  const { type, confidence, reasoning, recommendation } = assertion.assertion

  // High confidence response recommendation - respond to customer
  if (type === 'RESPONSE_RECOMMENDATION' && confidence >= 0.7 && recommendation) {
    return {
      shouldRespond: true,
      decision: 'RESPOND_TO_CUSTOMER',
      reasoning: `High confidence (${confidence}) response recommendation from agent`,
      responseContent: recommendation,
      nextActions: ['await_customer_response'],
    }
  }

  // Action required - might need human escalation
  if (type === 'ACTION_REQUIRED') {
    if (confidence >= 0.8) {
      return {
        shouldRespond: true,
        decision: 'ESCALATE_TO_HUMAN',
        reasoning: `High confidence action required: ${reasoning}`,
        responseContent:
          'Your request requires special attention. A team member will assist you shortly.',
        nextActions: ['notify_human_agent', 'await_human_response'],
      }
    }
    return {
      shouldRespond: false,
      decision: 'WAIT_FOR_MORE_INFO',
      reasoning: `Action required but confidence too low (${confidence}), waiting for more analysis`,
      nextActions: ['request_additional_analysis'],
    }
  }

  // Customer spend analysis - inform the response
  if (type === 'CUSTOMER_SPEND_ANALYSIS') {
    // This assertion informs but doesn't directly trigger a response
    return {
      shouldRespond: false,
      decision: 'NO_ACTION',
      reasoning: 'Spend analysis received, will inform future responses',
      nextActions: ['store_for_context'],
    }
  }

  // No action needed
  if (type === 'NO_ACTION_NEEDED') {
    return {
      shouldRespond: false,
      decision: 'NO_ACTION',
      reasoning: 'Agent determined no action needed',
      nextActions: [],
    }
  }

  // Default: wait for more information
  return {
    shouldRespond: false,
    decision: 'WAIT_FOR_MORE_INFO',
    reasoning: `Unknown assertion type or low confidence: ${type} (${confidence})`,
    nextActions: ['request_additional_analysis'],
  }
}

/**
 * Create a conversation update event for client streaming
 */
export function createUpdateEvent(
  assertion: AssertionEvent,
  decision: ResponseDecision,
): ConversationUpdateEvent | null {
  if (!decision.shouldRespond || !decision.responseContent) {
    return null
  }

  const now = new Date().toISOString()

  return {
    event: {
      id: uuidv4(),
      type: 'CONVERSATION_UPDATE',
      schemaVersion: SCHEMA_VERSION,
    },
    conversation: {
      id: assertion.conversation.id,
      customerId: assertion.conversation.customerId,
      organizationId: assertion.conversation.organizationId,
    },
    update: {
      type: decision.decision === 'ESCALATE_TO_HUMAN' ? 'STATUS_CHANGE' : 'AI_RESPONSE',
      content: decision.responseContent,
      metadata: {
        assertionId: assertion.event.id,
        agentId: assertion.assertion.agentId,
        confidence: assertion.assertion.confidence,
      },
    },
    metadata: {
      correlationId: assertion.metadata.correlationId,
      createdAt: now,
    },
  }
}

/**
 * Create a decision event for the orchestrator feedback loop
 */
export function createDecisionEvent(
  assertion: AssertionEvent,
  decision: ResponseDecision,
): ConversationDecisionEvent {
  const now = new Date().toISOString()

  return {
    event: {
      id: uuidv4(),
      type: 'CONVERSATION_DECISION',
      schemaVersion: SCHEMA_VERSION,
    },
    conversation: {
      id: assertion.conversation.id,
      customerId: assertion.conversation.customerId,
      organizationId: assertion.conversation.organizationId,
    },
    decision: {
      type: decision.decision,
      reasoning: decision.reasoning,
      assertionsConsidered: [assertion.event.id],
      nextActions: decision.nextActions,
    },
    metadata: {
      correlationId: assertion.metadata.correlationId,
      createdAt: now,
    },
  }
}
