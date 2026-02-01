/**
 * Sample ConversationInitiatedEvent test data
 */

import type { ConversationInitiatedEvent } from '../../events/conversation-initiated'
import {
  createConversation,
  createMessage,
  sampleConversationWaiting,
  sampleCustomer2,
  sampleCustomerMessage,
  TEST_IDS,
} from './fixtures'

// ============================================================================
// Sample Events
// ============================================================================

/**
 * Basic conversation initiated event without an initial message
 */
export const conversationInitiatedBasic: ConversationInitiatedEvent = {
  event: {
    id: TEST_IDS.event1,
    type: 'CONVERSATION_INITIATED',
    schemaVersion: '1.0.0',
  },
  actionContext: {
    action: 'CREATE',
    actionBy: 'customer-ui',
  },
  metadata: {
    createdAt: new Date('2024-01-15T10:00:00.000Z'),
    updatedAt: new Date('2024-01-15T10:00:00.000Z'),
    correlationId: TEST_IDS.correlation1,
  },
  conversation: sampleConversationWaiting,
}

/**
 * Conversation initiated event with an initial customer message
 */
export const conversationInitiatedWithMessage: ConversationInitiatedEvent = {
  event: {
    id: TEST_IDS.event2,
    type: 'CONVERSATION_INITIATED',
    schemaVersion: '1.0.0',
  },
  actionContext: {
    action: 'CREATE',
    actionBy: 'customer-ui',
  },
  metadata: {
    createdAt: new Date('2024-01-15T10:00:00.000Z'),
    updatedAt: new Date('2024-01-15T10:00:00.000Z'),
    correlationId: TEST_IDS.correlation1,
  },
  conversation: sampleConversationWaiting,
  message: sampleCustomerMessage,
}

/**
 * Conversation initiated by a different customer
 */
export const conversationInitiatedCustomer2: ConversationInitiatedEvent = {
  event: {
    id: '20000000-0000-0000-0000-000000000001',
    type: 'CONVERSATION_INITIATED',
    schemaVersion: '1.0.0',
  },
  actionContext: {
    action: 'CREATE',
    actionBy: 'customer-ui',
  },
  metadata: {
    createdAt: new Date('2024-01-15T11:00:00.000Z'),
    updatedAt: new Date('2024-01-15T11:00:00.000Z'),
    correlationId: 'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2',
  },
  conversation: {
    ...sampleConversationWaiting,
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    customer: {
      user: sampleCustomer2,
    },
  },
  message: {
    id: 'aaaaaaaa-bbbb-cccc-dddd-ffffffffffff',
    conversation: { id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' },
    createdAt: new Date('2024-01-15T11:00:00.000Z'),
    updatedAt: new Date('2024-01-15T11:00:00.000Z'),
    sender: {
      user: {
        id: sampleCustomer2.id,
        name: sampleCustomer2.name,
        role: sampleCustomer2.role,
      },
    },
    details: {
      content: 'I need help with a billing issue on my account.',
    },
  },
}

// ============================================================================
// Factory Function
// ============================================================================

export interface CreateConversationInitiatedEventOptions {
  eventId?: string
  correlationId?: string
  actionBy?: string
  schemaVersion?: string
  timestamp?: Date
  includeMessage?: boolean
  messageContent?: string
  customerId?: string
  customerName?: string
  customerEmail?: string
}

/**
 * Factory to create ConversationInitiatedEvent with custom options
 */
export function createConversationInitiatedEvent(
  options: CreateConversationInitiatedEventOptions = {},
): ConversationInitiatedEvent {
  const {
    eventId = crypto.randomUUID(),
    correlationId = crypto.randomUUID(),
    actionBy = 'customer-ui',
    schemaVersion = '1.0.0',
    timestamp = new Date(),
    includeMessage = true,
    messageContent = 'Hello, I need assistance.',
    customerId = crypto.randomUUID(),
    customerName = 'Test Customer',
    customerEmail = 'test@example.com',
  } = options

  const conversationId = crypto.randomUUID()

  const customer = {
    id: customerId,
    name: customerName,
    email: customerEmail,
    role: 'CUSTOMER' as const,
  }

  const conversation = createConversation({
    id: conversationId,
    createdAt: timestamp,
    updatedAt: timestamp,
    customer: { user: customer },
  })

  const event: ConversationInitiatedEvent = {
    event: {
      id: eventId,
      type: 'CONVERSATION_INITIATED',
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
  }

  if (includeMessage) {
    event.message = createMessage(conversationId, {
      createdAt: timestamp,
      updatedAt: timestamp,
      sender: {
        user: {
          id: customer.id,
          name: customer.name,
          role: customer.role,
        },
      },
      details: {
        content: messageContent,
      },
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
export const conversationInitiatedScenarios = {
  /** Basic conversation without message */
  basic: conversationInitiatedBasic,

  /** Conversation with initial message */
  withMessage: conversationInitiatedWithMessage,

  /** Different customer */
  differentCustomer: conversationInitiatedCustomer2,

  /** Urgent/priority conversation */
  urgent: createConversationInitiatedEvent({
    messageContent: 'URGENT: My service is completely down and I need immediate help!',
  }),

  /** Refund request */
  refundRequest: createConversationInitiatedEvent({
    messageContent: 'I would like to request a refund for my recent purchase. Order #98765.',
  }),

  /** Technical support */
  technicalSupport: createConversationInitiatedEvent({
    messageContent: "I'm getting an error code E-5001 when trying to log in to my account.",
  }),

  /** Billing inquiry */
  billingInquiry: createConversationInitiatedEvent({
    messageContent:
      "I noticed a charge on my account that I don't recognize. Can you help me understand it?",
  }),
}
