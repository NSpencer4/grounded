/**
 * Sample AgentResultEvent test data
 */

import type { AgentResultEvent, AgentResultType } from '../../events/agent-result'
import { TEST_IDS } from './fixtures'

// ============================================================================
// Sample Events
// ============================================================================

/**
 * Successful customer spend analysis result
 */
export const agentResultSpendAnalysisSuccess: AgentResultEvent = {
  event: {
    id: TEST_IDS.event1,
    type: 'AGENT_RESULT',
    schemaVersion: '1.0.0',
  },
  actionContext: {
    action: 'CREATE',
    actionBy: 'customer-spend-agent',
  },
  metadata: {
    createdAt: new Date('2024-01-15T10:01:00.000Z'),
    updatedAt: new Date('2024-01-15T10:01:00.000Z'),
    correlationId: TEST_IDS.correlation1,
  },
  agentResultType: 'CUSTOMER_SPEND_ANALYSIS',
  conversationId: TEST_IDS.conversation1,
  messageId: TEST_IDS.message1,
  result: {
    success: true,
    data: {
      customerId: TEST_IDS.customerUser1,
      totalSpend: 1250.0,
      orderCount: 15,
      averageOrderValue: 83.33,
      customerTier: 'GOLD',
      lastOrderDate: '2024-01-10',
      refundHistory: {
        totalRefunds: 2,
        totalRefundAmount: 75.0,
        refundRate: 0.06,
      },
      recommendation: 'High-value customer with low refund rate. Consider priority support.',
    },
    metadata: {
      agentName: 'customer-spend-agent',
      executionTimeMs: 1234,
      modelUsed: 'claude-3-5-sonnet-20241022',
      tokenUsage: {
        input: 1500,
        output: 350,
      },
    },
  },
}

/**
 * Successful response recommendation result
 */
export const agentResultResponseRecommendationSuccess: AgentResultEvent = {
  event: {
    id: TEST_IDS.event2,
    type: 'AGENT_RESULT',
    schemaVersion: '1.0.0',
  },
  actionContext: {
    action: 'CREATE',
    actionBy: 'response-recommendation-agent',
  },
  metadata: {
    createdAt: new Date('2024-01-15T10:01:30.000Z'),
    updatedAt: new Date('2024-01-15T10:01:30.000Z'),
    correlationId: TEST_IDS.correlation1,
  },
  agentResultType: 'RESPONSE_RECOMMENDATION',
  conversationId: TEST_IDS.conversation1,
  messageId: TEST_IDS.message1,
  result: {
    success: true,
    data: {
      recommendedResponse:
        "Hello Alice! I apologize for the delay with your order. I've checked the tracking and it shows your package is currently at the local distribution center. It should arrive by end of day tomorrow. As a gesture of goodwill for the inconvenience, I'd like to offer you a 15% discount on your next order. Would that work for you?",
      confidence: 0.92,
      reasoning:
        'Customer is a high-value GOLD tier member with good history. Delay is carrier-related. Proactive compensation aligns with retention strategy.',
      suggestedActions: ['apply_discount_code', 'flag_delivery_issue'],
      tone: 'empathetic',
      escalationRequired: false,
    },
    metadata: {
      agentName: 'response-recommendation-agent',
      executionTimeMs: 2150,
      modelUsed: 'claude-3-5-sonnet-20241022',
      tokenUsage: {
        input: 2800,
        output: 450,
      },
    },
  },
}

/**
 * Failed agent result (error case)
 */
export const agentResultError: AgentResultEvent = {
  event: {
    id: TEST_IDS.event3,
    type: 'AGENT_RESULT',
    schemaVersion: '1.0.0',
  },
  actionContext: {
    action: 'CREATE',
    actionBy: 'customer-spend-agent',
  },
  metadata: {
    createdAt: new Date('2024-01-15T10:01:00.000Z'),
    updatedAt: new Date('2024-01-15T10:01:00.000Z'),
    correlationId: TEST_IDS.correlation2,
  },
  agentResultType: 'CUSTOMER_SPEND_ANALYSIS',
  conversationId: TEST_IDS.conversation2,
  result: {
    success: false,
    error: 'Failed to retrieve customer data: Customer not found in database',
    metadata: {
      agentName: 'customer-spend-agent',
      executionTimeMs: 250,
    },
  },
}

/**
 * Agent result without message ID (conversation-level analysis)
 */
export const agentResultNoMessageId: AgentResultEvent = {
  event: {
    id: TEST_IDS.event4,
    type: 'AGENT_RESULT',
    schemaVersion: '1.0.0',
  },
  actionContext: {
    action: 'CREATE',
    actionBy: 'customer-spend-agent',
  },
  metadata: {
    createdAt: new Date('2024-01-15T10:02:00.000Z'),
    updatedAt: new Date('2024-01-15T10:02:00.000Z'),
    correlationId: TEST_IDS.correlation1,
  },
  agentResultType: 'CUSTOMER_SPEND_ANALYSIS',
  conversationId: TEST_IDS.conversation1,
  result: {
    success: true,
    data: {
      summary: 'Periodic customer analysis completed',
      customerId: TEST_IDS.customerUser1,
      totalSpend: 1250.0,
    },
    metadata: {
      agentName: 'customer-spend-agent',
      executionTimeMs: 890,
    },
  },
}

// ============================================================================
// Factory Function
// ============================================================================

export interface CreateAgentResultEventOptions {
  eventId?: string
  correlationId?: string
  schemaVersion?: string
  timestamp?: Date
  agentResultType: AgentResultType
  conversationId?: string
  messageId?: string
  success: boolean
  data?: unknown
  error?: string
  agentName?: string
  executionTimeMs?: number
  modelUsed?: string
  tokenUsage?: { input: number; output: number }
}

/**
 * Factory to create AgentResultEvent with custom options
 */
export function createAgentResultEvent(options: CreateAgentResultEventOptions): AgentResultEvent {
  const {
    eventId = crypto.randomUUID(),
    correlationId = crypto.randomUUID(),
    schemaVersion = '1.0.0',
    timestamp = new Date(),
    agentResultType,
    conversationId = crypto.randomUUID(),
    messageId,
    success,
    data,
    error,
    agentName = agentResultType === 'CUSTOMER_SPEND_ANALYSIS'
      ? 'customer-spend-agent'
      : 'response-recommendation-agent',
    executionTimeMs = 1000,
    modelUsed,
    tokenUsage,
  } = options

  const event: AgentResultEvent = {
    event: {
      id: eventId,
      type: 'AGENT_RESULT',
      schemaVersion,
    },
    actionContext: {
      action: 'CREATE',
      actionBy: agentName,
    },
    metadata: {
      createdAt: timestamp,
      updatedAt: timestamp,
      correlationId,
    },
    agentResultType,
    conversationId,
    result: {
      success,
      metadata: {
        agentName,
        executionTimeMs,
        ...(modelUsed && { modelUsed }),
        ...(tokenUsage && { tokenUsage }),
      },
    },
  }

  if (messageId) {
    event.messageId = messageId
  }

  if (success && data) {
    event.result.data = data
  }

  if (!success && error) {
    event.result.error = error
  }

  return event
}

// ============================================================================
// Test Scenarios
// ============================================================================

/**
 * Collection of events for different test scenarios
 */
export const agentResultScenarios = {
  /** Successful spend analysis */
  spendAnalysisSuccess: agentResultSpendAnalysisSuccess,

  /** Successful response recommendation */
  responseRecommendationSuccess: agentResultResponseRecommendationSuccess,

  /** Error case */
  error: agentResultError,

  /** Without message ID */
  noMessageId: agentResultNoMessageId,

  /** High-value customer analysis */
  highValueCustomer: createAgentResultEvent({
    agentResultType: 'CUSTOMER_SPEND_ANALYSIS',
    success: true,
    data: {
      customerId: 'high-value-customer-id',
      totalSpend: 15000.0,
      orderCount: 150,
      averageOrderValue: 100.0,
      customerTier: 'PLATINUM',
      lifetimeValue: 25000.0,
      recommendation: 'VIP customer. Prioritize for white-glove service.',
    },
    modelUsed: 'claude-3-5-sonnet-20241022',
    tokenUsage: { input: 1200, output: 280 },
  }),

  /** New customer analysis */
  newCustomer: createAgentResultEvent({
    agentResultType: 'CUSTOMER_SPEND_ANALYSIS',
    success: true,
    data: {
      customerId: 'new-customer-id',
      totalSpend: 50.0,
      orderCount: 1,
      averageOrderValue: 50.0,
      customerTier: 'STANDARD',
      recommendation: 'New customer. Focus on positive first experience.',
    },
  }),

  /** Escalation recommendation */
  escalationRecommendation: createAgentResultEvent({
    agentResultType: 'RESPONSE_RECOMMENDATION',
    success: true,
    data: {
      recommendedResponse:
        "I understand your frustration and I sincerely apologize for this experience. I'm escalating this to our senior support team who will reach out to you within the next 2 hours.",
      confidence: 0.88,
      reasoning:
        'Customer sentiment is very negative. Multiple unresolved issues. Escalation recommended.',
      escalationRequired: true,
      escalationReason: 'Multiple complaints and negative sentiment',
      priority: 'HIGH',
    },
    modelUsed: 'claude-3-5-sonnet-20241022',
    tokenUsage: { input: 3500, output: 520 },
  }),

  /** Refund approval recommendation */
  refundApproval: createAgentResultEvent({
    agentResultType: 'RESPONSE_RECOMMENDATION',
    success: true,
    data: {
      recommendedResponse:
        "I've reviewed your request and I'm happy to process a full refund for order #12345. The refund of $89.99 will be credited to your original payment method within 3-5 business days.",
      confidence: 0.95,
      reasoning: 'Order within refund window. Customer has good history. Product issue confirmed.',
      suggestedActions: ['process_refund', 'send_confirmation_email'],
      refundAmount: 89.99,
      refundApproved: true,
    },
  }),

  /** Rate limit error */
  rateLimitError: createAgentResultEvent({
    agentResultType: 'RESPONSE_RECOMMENDATION',
    success: false,
    error: 'Rate limit exceeded. Please retry after 60 seconds.',
    executionTimeMs: 150,
  }),

  /** Timeout error */
  timeoutError: createAgentResultEvent({
    agentResultType: 'CUSTOMER_SPEND_ANALYSIS',
    success: false,
    error: 'Request timed out after 30000ms',
    executionTimeMs: 30000,
  }),

  /** Low confidence response */
  lowConfidenceResponse: createAgentResultEvent({
    agentResultType: 'RESPONSE_RECOMMENDATION',
    success: true,
    data: {
      recommendedResponse:
        'Thank you for your message. Let me look into this further and get back to you with more information.',
      confidence: 0.45,
      reasoning: 'Customer inquiry is ambiguous. Requesting clarification recommended.',
      needsClarification: true,
    },
    modelUsed: 'claude-3-5-sonnet-20241022',
    tokenUsage: { input: 1800, output: 180 },
  }),
}
