import type { ConversationEvaluationEvent } from '@grounded/schemas/events/conversation-evaluation'

export interface AgentContext {
  conversationId: string
  correlationId: string
  customerId: string
  message?: {
    id: string
    content: string
    senderId: string
  }
}

export interface AgentResult<T> {
  success: boolean
  data?: T
  error?: string
  metadata: {
    agentName: string
    executionTimeMs: number
    modelUsed?: string
    tokenUsage?: {
      input: number
      output: number
    }
  }
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMCompletionOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export function extractAgentContext(event: ConversationEvaluationEvent): AgentContext {
  return {
    conversationId: event.conversation.id,
    correlationId: event.metadata.correlationId,
    customerId: event.conversation.customer.user.id,
    message: event.message
      ? {
          id: event.message.id,
          content: event.message.details.content,
          senderId: event.message.sender.user.id,
        }
      : undefined,
  }
}
