import type { ConversationEvaluationEvent as ConversationEvaluationEventType } from '@grounded/schemas/events/conversation-evaluation'

export type { ConversationEvaluationEvent } from '@grounded/schemas/events/conversation-evaluation'
export type { ConversationCommandEvent } from '@grounded/schemas/events/conversation-command'

export interface ProcessingContext {
  correlationId: string
  conversationId: string
  startTime: number
}

export interface EvaluationResult {
  event: ConversationEvaluationEventType
  shouldTriggerAgents: boolean
  agentsToTrigger: AgentType[]
}

export type AgentType = 'customer-spend-agent' | 'response-recommendation-agent'

export interface ConversationState {
  conversationId: string
  status: 'WAITING' | 'ACTIVE' | 'CLOSED'
  messageCount: number
  lastEventType: string
  lastUpdated: string
  createdAt: string
}

export type DecisionStatus = 'PENDING' | 'RESOLVED'

export type DecisionType =
  | 'EVALUATE_CUSTOMER_SPEND'
  | 'EVALUATE_RESPONSE_RECOMMENDATION'
  | 'EVALUATE_ESCALATION'

export interface DecisionRecord {
  id: string
  conversationId: string
  type: DecisionType
  status: DecisionStatus
  triggerEventId: string
  reasoning?: string
  createdAt: string
  resolvedAt?: string
  resolution?: string
}

export type ActionType = 'TRIGGER_EVALUATION' | 'UPDATE_STATE' | 'PRODUCE_EVENT'

export interface ActionRecord {
  id: string
  conversationId: string
  type: ActionType
  decisionIds: string[]
  details: Record<string, unknown>
  createdAt: string
}

export interface ProcessingResult {
  success: boolean
  conversationId: string
  evaluationType: string
  agentsTriggered: AgentType[]
  processingTimeMs: number
  decisionsCreated: string[]
  actionsCreated: string[]
  error?: string
}
