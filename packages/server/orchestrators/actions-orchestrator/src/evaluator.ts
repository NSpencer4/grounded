import { v4 as uuidv4 } from 'uuid'
import type {
  AgentType,
  ConversationCommandEvent,
  ConversationEvaluationEvent,
  EvaluationResult,
} from './types.js'

type EvaluationType = 'ACTION_REQUIRED' | 'RESPONSE_RECOMMENDATION' | 'NO_ACTION'

interface EvaluationDecision {
  type: EvaluationType
  reasoning: string
  suggestedActions: string[]
  agentsToTrigger: AgentType[]
}

function determineEvaluation(event: ConversationCommandEvent): EvaluationDecision {
  const hasMessage = 'message' in event && event.message !== undefined
  const isNewConversation = event.event.type === 'CONVERSATION_INITIATED'
  const messageContent = hasMessage ? event.message?.details.content.toLowerCase() : ''

  // Check for urgent keywords that require immediate action
  const urgentKeywords = ['urgent', 'emergency', 'asap', 'immediately', 'critical']
  const isUrgent = urgentKeywords.some((keyword) => messageContent.includes(keyword))

  // Check for billing/payment related keywords
  const billingKeywords = ['bill', 'charge', 'payment', 'refund', 'invoice', 'subscription']
  const isBillingRelated = billingKeywords.some((keyword) => messageContent.includes(keyword))

  // Check for cancellation intent
  const cancellationKeywords = ['cancel', 'terminate', 'close account', 'stop service']
  const hasCancellationIntent = cancellationKeywords.some((keyword) =>
    messageContent.includes(keyword),
  )

  // Determine evaluators to trigger
  const agentsToTrigger: AgentType[] = []

  if (hasMessage) {
    // Always trigger response recommendation for messages
    agentsToTrigger.push('response-recommendation-agent')

    // Trigger spend analysis for billing or cancellation conversations
    if (isBillingRelated || hasCancellationIntent) {
      agentsToTrigger.push('customer-spend-agent')
    }
  }

  // Determine evaluation type
  if (isUrgent || hasCancellationIntent) {
    return {
      type: 'ACTION_REQUIRED',
      reasoning: isUrgent
        ? 'Urgent message detected - requires immediate attention'
        : 'Cancellation intent detected - retention opportunity',
      suggestedActions: [
        'prioritize_response',
        'notify_supervisor',
        ...(hasCancellationIntent ? ['prepare_retention_offer'] : []),
      ],
      agentsToTrigger,
    }
  }

  if (hasMessage) {
    return {
      type: 'RESPONSE_RECOMMENDATION',
      reasoning: 'Customer message received - generating response recommendation',
      suggestedActions: ['generate_response', 'analyze_sentiment'],
      agentsToTrigger,
    }
  }

  if (isNewConversation) {
    return {
      type: 'NO_ACTION',
      reasoning: 'New conversation initiated - waiting for customer message',
      suggestedActions: [],
      agentsToTrigger: [],
    }
  }

  return {
    type: 'NO_ACTION',
    reasoning: 'No immediate action required',
    suggestedActions: [],
    agentsToTrigger: [],
  }
}

export function evaluateConversation(event: ConversationCommandEvent): EvaluationResult {
  const now = new Date()
  const decision = determineEvaluation(event)

  const hasMessage = 'message' in event && event.message !== undefined

  const evaluationEvent: ConversationEvaluationEvent = {
    event: {
      id: uuidv4(),
      type: 'CONVERSATION_EVALUATION',
      schemaVersion: '1.0.0',
    },
    actionContext: {
      action: 'CREATE',
      actionBy: 'actions-orchestrator',
    },
    metadata: {
      createdAt: now,
      updatedAt: now,
      correlationId: event.metadata.correlationId,
    },
    conversation: event.conversation,
    message: hasMessage ? event.message : undefined,
    evaluation: {
      type: decision.type,
      reasoning: decision.reasoning,
      suggestedActions: decision.suggestedActions,
    },
  }

  return {
    event: evaluationEvent,
    shouldTriggerAgents: decision.agentsToTrigger.length > 0,
    agentsToTrigger: decision.agentsToTrigger,
  }
}
