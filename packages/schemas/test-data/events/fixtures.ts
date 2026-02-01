/**
 * Shared test fixtures for event test data
 * Provides reusable sample users, conversations, and messages
 */

import type { Conversation, Message, User } from '../../index'

// ============================================================================
// Sample UUIDs (consistent for test reproducibility)
// ============================================================================

export const TEST_IDS = {
  // Users
  customerUser1: '11111111-1111-1111-1111-111111111111',
  customerUser2: '22222222-2222-2222-2222-222222222222',
  representativeUser1: '33333333-3333-3333-3333-333333333333',
  representativeUser2: '44444444-4444-4444-4444-444444444444',
  adminUser1: '55555555-5555-5555-5555-555555555555',

  // Conversations
  conversation1: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  conversation2: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  conversation3: 'cccccccc-cccc-cccc-cccc-cccccccccccc',

  // Messages
  message1: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
  message2: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  message3: 'ffffffff-ffff-ffff-ffff-ffffffffffff',

  // Events
  event1: '10000000-0000-0000-0000-000000000001',
  event2: '10000000-0000-0000-0000-000000000002',
  event3: '10000000-0000-0000-0000-000000000003',
  event4: '10000000-0000-0000-0000-000000000004',

  // Correlation IDs
  correlation1: 'c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c0c0',
  correlation2: 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1',
} as const

// ============================================================================
// Sample Users
// ============================================================================

export const sampleCustomer1: User = {
  id: TEST_IDS.customerUser1,
  name: 'Alice Johnson',
  email: 'alice.johnson@example.com',
  role: 'CUSTOMER',
}

export const sampleCustomer2: User = {
  id: TEST_IDS.customerUser2,
  name: 'Bob Smith',
  email: 'bob.smith@example.com',
  role: 'CUSTOMER',
}

export const sampleRepresentative1: User = {
  id: TEST_IDS.representativeUser1,
  name: 'Carol Williams',
  email: 'carol.williams@company.com',
  role: 'REPRESENTATIVE',
}

export const sampleRepresentative2: User = {
  id: TEST_IDS.representativeUser2,
  name: 'David Brown',
  email: 'david.brown@company.com',
  role: 'REPRESENTATIVE',
}

export const sampleAdmin: User = {
  id: TEST_IDS.adminUser1,
  name: 'Eve Davis',
  email: 'eve.davis@company.com',
  role: 'ADMIN',
}

// ============================================================================
// Sample Conversations
// ============================================================================

const baseDate = new Date('2024-01-15T10:00:00.000Z')

export const sampleConversationWaiting: Conversation = {
  id: TEST_IDS.conversation1,
  createdAt: baseDate,
  updatedAt: baseDate,
  state: {
    status: 'WAITING',
  },
  customer: {
    user: sampleCustomer1,
  },
  assignee: null,
}

export const sampleConversationActive: Conversation = {
  id: TEST_IDS.conversation2,
  createdAt: baseDate,
  updatedAt: new Date('2024-01-15T10:05:00.000Z'),
  state: {
    status: 'ACTIVE',
  },
  customer: {
    user: sampleCustomer1,
  },
  assignee: {
    user: sampleRepresentative1,
  },
}

export const sampleConversationClosed: Conversation = {
  id: TEST_IDS.conversation3,
  createdAt: baseDate,
  updatedAt: new Date('2024-01-15T11:00:00.000Z'),
  state: {
    status: 'CLOSED',
    closedAt: new Date('2024-01-15T11:00:00.000Z'),
  },
  customer: {
    user: sampleCustomer2,
  },
  assignee: {
    user: sampleRepresentative1,
  },
}

// ============================================================================
// Sample Messages
// ============================================================================

export const sampleCustomerMessage: Message = {
  id: TEST_IDS.message1,
  conversation: { id: TEST_IDS.conversation1 },
  createdAt: baseDate,
  updatedAt: baseDate,
  sender: {
    user: {
      id: sampleCustomer1.id,
      name: sampleCustomer1.name,
      role: sampleCustomer1.role,
    },
  },
  details: {
    content:
      "Hi, I have a question about my recent order. It was supposed to arrive yesterday but I haven't received it yet.",
  },
}

export const sampleRepresentativeMessage: Message = {
  id: TEST_IDS.message2,
  conversation: { id: TEST_IDS.conversation1 },
  createdAt: new Date('2024-01-15T10:02:00.000Z'),
  updatedAt: new Date('2024-01-15T10:02:00.000Z'),
  sender: {
    user: {
      id: sampleRepresentative1.id,
      name: sampleRepresentative1.name,
      role: sampleRepresentative1.role,
    },
  },
  details: {
    content:
      "Hello Alice! I'd be happy to help you with your order. Let me look up the tracking information for you.",
  },
}

export const sampleFollowUpMessage: Message = {
  id: TEST_IDS.message3,
  conversation: { id: TEST_IDS.conversation1 },
  createdAt: new Date('2024-01-15T10:05:00.000Z'),
  updatedAt: new Date('2024-01-15T10:05:00.000Z'),
  sender: {
    user: {
      id: sampleCustomer1.id,
      name: sampleCustomer1.name,
      role: sampleCustomer1.role,
    },
  },
  details: {
    content:
      "Thank you! The order number is #12345. I'd also like to know if I can get a refund if it doesn't arrive by tomorrow.",
  },
}

// ============================================================================
// Factory Helpers
// ============================================================================

/**
 * Create a user with optional overrides
 */
export function createUser(overrides: Partial<User> = {}): User {
  return {
    id: crypto.randomUUID(),
    name: 'Test User',
    email: 'test.user@example.com',
    role: 'CUSTOMER',
    ...overrides,
  }
}

/**
 * Create a conversation with optional overrides
 */
export function createConversation(overrides: Partial<Conversation> = {}): Conversation {
  const now = new Date()
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    state: {
      status: 'WAITING',
    },
    customer: {
      user: sampleCustomer1,
    },
    assignee: null,
    ...overrides,
  }
}

/**
 * Create a message with optional overrides
 */
export function createMessage(
  conversationId: string,
  overrides: Partial<Omit<Message, 'conversation'>> = {},
): Message {
  const now = new Date()
  return {
    id: crypto.randomUUID(),
    conversation: { id: conversationId },
    createdAt: now,
    updatedAt: now,
    sender: {
      user: {
        id: sampleCustomer1.id,
        name: sampleCustomer1.name,
        role: sampleCustomer1.role,
      },
    },
    details: {
      content: 'Test message content',
    },
    ...overrides,
  }
}
