/**
 * Sample ConversationEvaluationEvent test data
 */

import type {
  ConversationEvaluationEvent,
  EvaluationType,
} from '../../events/conversation-evaluation'
import {
  createConversation,
  createMessage,
  sampleConversationActive,
  sampleConversationWaiting,
  sampleCustomer1,
  sampleCustomerMessage,
  sampleFollowUpMessage,
  TEST_IDS,
} from './fixtures'

// ============================================================================
// Sample Events
// ============================================================================

/**
 * Evaluation indicating action is required (e.g., needs agent processing)
 */
export const evaluationActionRequired: ConversationEvaluationEvent = {
  event: {
    id: TEST_IDS.event1,
    type: 'CONVERSATION_EVALUATION',
    schemaVersion: '1.0.0',
  },
  actionContext: {
    action: 'CREATE',
    actionBy: 'actions-orchestrator',
  },
  metadata: {
    createdAt: new Date('2024-01-15T10:00:30.000Z'),
    updatedAt: new Date('2024-01-15T10:00:30.000Z'),
    correlationId: TEST_IDS.correlation1,
  },
  conversation: sampleConversationWaiting,
  message: sampleCustomerMessage,
  evaluation: {
    type: 'ACTION_REQUIRED',
    reasoning: 'Customer inquiry about order delivery requires investigation and response.',
    suggestedActions: ['lookup_order_status', 'check_delivery_tracking', 'prepare_response'],
  },
}

/**
 * Evaluation for response recommendation (agent should generate response)
 */
export const evaluationResponseRecommendation: ConversationEvaluationEvent = {
  event: {
    id: TEST_IDS.event2,
    type: 'CONVERSATION_EVALUATION',
    schemaVersion: '1.0.0',
  },
  actionContext: {
    action: 'CREATE',
    actionBy: 'actions-orchestrator',
  },
  metadata: {
    createdAt: new Date('2024-01-15T10:01:00.000Z'),
    updatedAt: new Date('2024-01-15T10:01:00.000Z'),
    correlationId: TEST_IDS.correlation1,
  },
  conversation: sampleConversationActive,
  message: sampleFollowUpMessage,
  evaluation: {
    type: 'RESPONSE_RECOMMENDATION',
    reasoning:
      'Customer has provided order number and asked about refund policy. AI should recommend appropriate response.',
    suggestedActions: ['analyze_customer_history', 'check_refund_eligibility', 'generate_response'],
  },
}

/**
 * Evaluation indicating no action needed
 */
export const evaluationNoAction: ConversationEvaluationEvent = {
  event: {
    id: TEST_IDS.event3,
    type: 'CONVERSATION_EVALUATION',
    schemaVersion: '1.0.0',
  },
  actionContext: {
    action: 'CREATE',
    actionBy: 'actions-orchestrator',
  },
  metadata: {
    createdAt: new Date('2024-01-15T10:05:30.000Z'),
    updatedAt: new Date('2024-01-15T10:05:30.000Z'),
    correlationId: TEST_IDS.correlation1,
  },
  conversation: sampleConversationActive,
  evaluation: {
    type: 'NO_ACTION',
    reasoning: 'Representative has already responded. Waiting for customer reply.',
  },
}

// ============================================================================
// Factory Function
// ============================================================================

export interface CreateConversationEvaluationEventOptions {
  eventId?: string
  correlationId?: string
  actionBy?: string
  schemaVersion?: string
  timestamp?: Date
  conversationId?: string
  includeMessage?: boolean
  messageContent?: string
  evaluationType: EvaluationType
  reasoning?: string
  suggestedActions?: string[]
}

/**
 * Factory to create ConversationEvaluationEvent with custom options
 */
export function createConversationEvaluationEvent(
  options: CreateConversationEvaluationEventOptions,
): ConversationEvaluationEvent {
  const {
    eventId = crypto.randomUUID(),
    correlationId = crypto.randomUUID(),
    actionBy = 'actions-orchestrator',
    schemaVersion = '1.0.0',
    timestamp = new Date(),
    conversationId = crypto.randomUUID(),
    includeMessage = true,
    messageContent = 'Customer message for evaluation',
    evaluationType,
    reasoning,
    suggestedActions,
  } = options

  const conversation = createConversation({
    id: conversationId,
    state: { status: evaluationType === 'NO_ACTION' ? 'ACTIVE' : 'WAITING' },
  })

  const event: ConversationEvaluationEvent = {
    event: {
      id: eventId,
      type: 'CONVERSATION_EVALUATION',
      schemaVersion,
    },
    actionContext: {
      action: 'CREATE',
      actionBy,
    },
    metadata: {
      createdAt: timestamp,
      updatedAt: timestamp,
      correlationId,
    },
    conversation,
    evaluation: {
      type: evaluationType,
      ...(reasoning && { reasoning }),
      ...(suggestedActions && { suggestedActions }),
    },
  }

  if (includeMessage) {
    event.message = createMessage(conversationId, {
      createdAt: timestamp,
      updatedAt: timestamp,
      sender: {
        user: {
          id: sampleCustomer1.id,
          name: sampleCustomer1.name,
          role: sampleCustomer1.role,
        },
      },
      details: { content: messageContent },
    })
  }

  return event
}

// ============================================================================
// Test Scenarios
// ============================================================================

/**
 * Collection of events for different test scenarios
 */
export const conversationEvaluationScenarios = {
  /** Action required - needs agent processing */
  actionRequired: evaluationActionRequired,

  /** Response recommendation requested */
  responseRecommendation: evaluationResponseRecommendation,

  /** No action needed */
  noAction: evaluationNoAction,

  /** Refund evaluation */
  refundEvaluation: createConversationEvaluationEvent({
    evaluationType: 'ACTION_REQUIRED',
    messageContent: 'I want a refund for order #12345',
    reasoning:
      'Customer is requesting a refund. Need to check order status and refund eligibility.',
    suggestedActions: ['lookup_order', 'check_refund_policy', 'calculate_refund_amount'],
  }),

  /** Escalation evaluation */
  escalationEvaluation: createConversationEvaluationEvent({
    evaluationType: 'ACTION_REQUIRED',
    messageContent: 'This is unacceptable! I want to speak to a manager immediately!',
    reasoning: 'Customer is expressing strong dissatisfaction and requesting escalation.',
    suggestedActions: ['flag_for_escalation', 'notify_supervisor', 'prepare_escalation_summary'],
  }),

  /** Simple inquiry evaluation */
  simpleInquiry: createConversationEvaluationEvent({
    evaluationType: 'RESPONSE_RECOMMENDATION',
    messageContent: 'What are your business hours?',
    reasoning: 'Simple FAQ-style question that can be answered directly.',
    suggestedActions: ['lookup_business_hours', 'generate_response'],
  }),

  /** Spam/irrelevant evaluation */
  irrelevantMessage: createConversationEvaluationEvent({
    evaluationType: 'NO_ACTION',
    messageContent: 'asdfasdf',
    reasoning: 'Message appears to be spam or accidental input. No action required.',
    includeMessage: true,
  }),

  /** Waiting for customer evaluation */
  waitingForCustomer: createConversationEvaluationEvent({
    evaluationType: 'NO_ACTION',
    reasoning: 'Representative has responded. Awaiting customer reply before further action.',
    includeMessage: false,
  }),

  /** Complex multi-issue evaluation */
  complexIssue: createConversationEvaluationEvent({
    evaluationType: 'ACTION_REQUIRED',
    messageContent:
      'I have multiple issues: my order is late, I was charged twice, and the product I received was damaged.',
    reasoning:
      'Customer has multiple issues that need to be addressed. Requires comprehensive investigation.',
    suggestedActions: [
      'lookup_order_status',
      'check_payment_history',
      'review_damage_policy',
      'prepare_comprehensive_response',
    ],
  }),

  /** Positive feedback evaluation */
  positiveFeedback: createConversationEvaluationEvent({
    evaluationType: 'RESPONSE_RECOMMENDATION',
    messageContent: 'Thank you so much for your help! Everything is resolved now.',
    reasoning:
      'Customer is expressing satisfaction. Should acknowledge and offer to close conversation.',
    suggestedActions: ['generate_closing_response', 'offer_satisfaction_survey'],
  }),
}
