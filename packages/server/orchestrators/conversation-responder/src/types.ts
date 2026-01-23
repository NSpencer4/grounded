import { z } from 'zod'

/**
 * Assertion types from evaluator agents
 */
export const AssertionTypeSchema = z.enum([
  'CUSTOMER_SPEND_ANALYSIS',
  'RESPONSE_RECOMMENDATION',
  'ACTION_REQUIRED',
  'NO_ACTION_NEEDED',
])
export type AssertionType = z.infer<typeof AssertionTypeSchema>

/**
 * Decision types for the orchestrator feedback loop
 */
export const DecisionTypeSchema = z.enum([
  'RESPOND_TO_CUSTOMER',
  'ESCALATE_TO_HUMAN',
  'WAIT_FOR_MORE_INFO',
  'CLOSE_CONVERSATION',
  'NO_ACTION',
])
export type DecisionType = z.infer<typeof DecisionTypeSchema>

/**
 * Assertion event from evaluator agents
 */
export const AssertionEventSchema = z.object({
  event: z.object({
    id: z.string().uuid(),
    type: z.literal('CONVERSATION_ASSERTION'),
    schemaVersion: z.string(),
  }),
  conversation: z.object({
    id: z.string().uuid(),
    customerId: z.string(),
    organizationId: z.string(),
  }),
  assertion: z.object({
    type: AssertionTypeSchema,
    agentId: z.string(),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
    recommendation: z.string().optional(),
    data: z.record(z.string(), z.unknown()).optional(),
  }),
  metadata: z.object({
    correlationId: z.string(),
    createdAt: z.string(),
  }),
})
export type AssertionEvent = z.infer<typeof AssertionEventSchema>

/**
 * Conversation update event for client streaming
 */
export interface ConversationUpdateEvent {
  event: {
    id: string
    type: 'CONVERSATION_UPDATE'
    schemaVersion: string
  }
  conversation: {
    id: string
    customerId: string
    organizationId: string
  }
  update: {
    type: 'AI_RESPONSE' | 'STATUS_CHANGE' | 'AGENT_INSIGHT'
    content: string
    metadata?: Record<string, unknown>
  }
  metadata: {
    correlationId: string
    createdAt: string
  }
}

/**
 * Decision event for orchestrator feedback loop
 */
export interface ConversationDecisionEvent {
  event: {
    id: string
    type: 'CONVERSATION_DECISION'
    schemaVersion: string
  }
  conversation: {
    id: string
    customerId: string
    organizationId: string
  }
  decision: {
    type: DecisionType
    reasoning: string
    assertionsConsidered: string[]
    nextActions: string[]
  }
  metadata: {
    correlationId: string
    createdAt: string
  }
}

/**
 * Conversation state stored in DynamoDB
 */
export interface ConversationState {
  conversationId: string
  customerId: string
  organizationId: string
  status: 'WAITING' | 'ACTIVE' | 'CLOSED'
  assertions: Array<{
    id: string
    type: AssertionType
    agentId: string
    confidence: number
    receivedAt: string
  }>
  lastDecision?: {
    type: DecisionType
    madeAt: string
  }
  responsesSent: number
  createdAt: string
  updatedAt: string
}

/**
 * Result of processing an assertion
 */
export interface ProcessingResult {
  success: boolean
  conversationId: string
  assertionType: string
  decision?: DecisionType
  updateProduced: boolean
  decisionProduced: boolean
  processingTimeMs: number
  error?: string
}
