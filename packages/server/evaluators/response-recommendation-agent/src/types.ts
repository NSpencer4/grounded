export interface ConversationHistory {
  messages: HistoricalMessage[]
  summary?: string
}

export interface HistoricalMessage {
  id: string
  role: 'customer' | 'representative' | 'system'
  content: string
  timestamp: string
  sentiment?: 'positive' | 'neutral' | 'negative'
}

export interface CustomerContext {
  name: string
  tier: string
  accountStatus: 'active' | 'suspended' | 'churned'
  previousInteractions: number
  satisfactionScore?: number
}

export interface ResponseRecommendation {
  primaryResponse: string
  alternativeResponses: string[]
  tone: 'empathetic' | 'professional' | 'apologetic' | 'enthusiastic'
  sentiment: 'positive' | 'neutral' | 'negative'
  suggestedActions: SuggestedAction[]
  escalationRecommended: boolean
  escalationReason?: string
  confidence: number
}

export interface SuggestedAction {
  type: 'refund' | 'discount' | 'escalate' | 'follow_up' | 'documentation' | 'feature_request'
  description: string
  priority: 'low' | 'medium' | 'high'
}

export interface ResponseRecommendationAgentOutput {
  conversationId: string
  messageId: string
  customerMessage: string
  recommendation: ResponseRecommendation
  analysisContext: {
    detectedIntent: string
    detectedTopics: string[]
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  }
  generatedAt: string
}
