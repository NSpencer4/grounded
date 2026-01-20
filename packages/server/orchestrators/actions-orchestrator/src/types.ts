import type { ConversationCommandEvent } from '@grounded/schemas/events/conversation-command'
import type { ConversationEvaluationEvent } from '@grounded/schemas/events/conversation-evaluation'

export interface ProcessingContext {
  correlationId: string
  conversationId: string
  startTime: number
}

export interface EvaluationResult {
  event: ConversationEvaluationEvent
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

export interface ProcessingResult {
  success: boolean
  conversationId: string
  evaluationType: string
  agentsTriggered: AgentType[]
  processingTimeMs: number
  error?: string
}

export { ConversationCommandEvent, ConversationEvaluationEvent }
