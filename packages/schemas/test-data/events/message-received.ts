/**
 * Sample MessageReceivedEvent test data
 */

import type { MessageReceivedEvent } from '../../events/message-received'
import {
  createConversation,
  createMessage,
  sampleConversationActive,
  sampleCustomer1,
  sampleCustomerMessage,
  sampleFollowUpMessage,
  sampleRepresentative1,
  sampleRepresentativeMessage,
  TEST_IDS,
} from './fixtures'

// ============================================================================
// Sample Events
// ============================================================================

/**
 * Customer sends initial message in a conversation
 */
export const messageReceivedFromCustomer: MessageReceivedEvent = {
  event: {
    id: TEST_IDS.event1,
    type: 'MESSAGE_RECEIVED',
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
  conversation: sampleConversationActive,
  message: sampleCustomerMessage,
}

/**
 * Representative responds to customer
 */
export const messageReceivedFromRepresentative: MessageReceivedEvent = {
  event: {
    id: TEST_IDS.event2,
    type: 'MESSAGE_RECEIVED',
    schemaVersion: '1.0.0',
  },
  actionContext: {
    action: 'CREATE',
    actionBy: 'representative-ui',
  },
  metadata: {
    createdAt: new Date('2024-01-15T10:02:00.000Z'),
    updatedAt: new Date('2024-01-15T10:02:00.000Z'),
    correlationId: TEST_IDS.correlation1,
  },
  conversation: sampleConversationActive,
  message: sampleRepresentativeMessage,
}

/**
 * Customer follow-up message
 */
export const messageReceivedFollowUp: MessageReceivedEvent = {
  event: {
    id: TEST_IDS.event3,
    type: 'MESSAGE_RECEIVED',
    schemaVersion: '1.0.0',
  },
  actionContext: {
    action: 'CREATE',
    actionBy: 'customer-ui',
  },
  metadata: {
    createdAt: new Date('2024-01-15T10:05:00.000Z'),
    updatedAt: new Date('2024-01-15T10:05:00.000Z'),
    correlationId: TEST_IDS.correlation1,
  },
  conversation: sampleConversationActive,
  message: sampleFollowUpMessage,
}

// ============================================================================
// Factory Function
// ============================================================================

export interface CreateMessageReceivedEventOptions {
  eventId?: string
  correlationId?: string
  actionBy?: string
  schemaVersion?: string
  timestamp?: Date
  conversationId?: string
  messageId?: string
  content: string
  senderType?: 'customer' | 'representative'
  senderId?: string
  senderName?: string
}

/**
 * Factory to create MessageReceivedEvent with custom options
 */
export function createMessageReceivedEvent(
  options: CreateMessageReceivedEventOptions,
): MessageReceivedEvent {
  const {
    eventId = crypto.randomUUID(),
    correlationId = crypto.randomUUID(),
    actionBy = options.senderType === 'representative' ? 'representative-ui' : 'customer-ui',
    schemaVersion = '1.0.0',
    timestamp = new Date(),
    conversationId = crypto.randomUUID(),
    messageId = crypto.randomUUID(),
    content,
    senderType = 'customer',
    senderId = senderType === 'representative' ? sampleRepresentative1.id : sampleCustomer1.id,
    senderName = senderType === 'representative'
      ? sampleRepresentative1.name
      : sampleCustomer1.name,
  } = options

  const conversation = createConversation({
    id: conversationId,
    state: { status: 'ACTIVE' },
    ...(senderType === 'representative' && {
      assignee: { user: sampleRepresentative1 },
    }),
  })

  const message = createMessage(conversationId, {
    id: messageId,
    createdAt: timestamp,
    updatedAt: timestamp,
    sender: {
      user: {
        id: senderId,
        name: senderName,
        role: senderType === 'representative' ? 'REPRESENTATIVE' : 'CUSTOMER',
      },
    },
    details: { content },
  })

  return {
    event: {
      id: eventId,
      type: 'MESSAGE_RECEIVED',
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
    message,
  }
}

// ============================================================================
// Test Scenarios
// ============================================================================

/**
 * Collection of events for different test scenarios
 */
export const messageReceivedScenarios = {
  /** Customer sends initial message */
  customerInitial: messageReceivedFromCustomer,

  /** Representative responds */
  representativeResponse: messageReceivedFromRepresentative,

  /** Customer follow-up */
  customerFollowUp: messageReceivedFollowUp,

  /** Customer asking for refund */
  refundRequest: createMessageReceivedEvent({
    content: "I'm not satisfied with the product. I'd like to request a full refund please.",
    senderType: 'customer',
  }),

  /** Customer expressing frustration */
  frustratedCustomer: createMessageReceivedEvent({
    content:
      "This is the third time I'm reaching out about this issue. Why hasn't it been resolved yet?",
    senderType: 'customer',
  }),

  /** Customer providing order details */
  orderDetails: createMessageReceivedEvent({
    content:
      'Here are my order details: Order #12345, placed on January 10th, total amount $150.00',
    senderType: 'customer',
  }),

  /** Representative asking for information */
  repRequestInfo: createMessageReceivedEvent({
    content: 'Could you please provide your order number so I can look up the details?',
    senderType: 'representative',
  }),

  /** Representative offering solution */
  repOfferingSolution: createMessageReceivedEvent({
    content:
      "I've reviewed your account and I can offer you a 20% discount on your next purchase as compensation.",
    senderType: 'representative',
  }),

  /** Customer agreeing to resolution */
  customerAcceptsSolution: createMessageReceivedEvent({
    content: "That sounds fair. I'll accept the discount. Thank you for your help!",
    senderType: 'customer',
  }),

  /** Short acknowledgment */
  shortAck: createMessageReceivedEvent({
    content: 'Ok, thanks.',
    senderType: 'customer',
  }),

  /** Technical issue description */
  technicalIssue: createMessageReceivedEvent({
    content:
      "When I click the submit button, I get error code 500 and the page crashes. I'm using Chrome on Windows 11.",
    senderType: 'customer',
  }),
}
