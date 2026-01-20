import { completeWithJson } from '@grounded/agents-shared'
import type { AgentContext, AgentResult } from '@grounded/agents-shared'
import type {
  ConversationHistory,
  CustomerContext,
  ResponseRecommendation,
  ResponseRecommendationAgentOutput,
} from './types.js'

const SYSTEM_PROMPT = `You are a customer service response recommendation agent. Your role is to analyze customer messages and generate helpful, empathetic, and effective response recommendations for customer service representatives.

Given a customer message and context, you must provide:
1. A primary recommended response
2. 2-3 alternative response options
3. The appropriate tone for the response
4. Detected sentiment of the customer message
5. Suggested follow-up actions
6. Whether escalation is recommended

Guidelines:
- Always be empathetic and professional
- Acknowledge customer concerns before providing solutions
- Be specific and actionable
- If the issue is complex or the customer is frustrated, recommend escalation
- Consider the customer's tier and history when crafting responses

Respond with a JSON object matching this structure:
{
  "primaryResponse": "string",
  "alternativeResponses": ["string", "string"],
  "tone": "empathetic" | "professional" | "apologetic" | "enthusiastic",
  "sentiment": "positive" | "neutral" | "negative",
  "suggestedActions": [
    {
      "type": "refund" | "discount" | "escalate" | "follow_up" | "documentation" | "feature_request",
      "description": "string",
      "priority": "low" | "medium" | "high"
    }
  ],
  "escalationRecommended": boolean,
  "escalationReason": "string or null",
  "confidence": number (0-1),
  "detectedIntent": "string",
  "detectedTopics": ["string"],
  "urgencyLevel": "low" | "medium" | "high" | "critical"
}`

export async function fetchConversationHistory(conversationId: string): Promise<ConversationHistory> {
  // TODO: Replace with actual data fetching from DynamoDB
  return {
    messages: [],
    summary: undefined,
  }
}

export async function fetchCustomerContext(customerId: string): Promise<CustomerContext> {
  // TODO: Replace with actual data fetching from organization-data-api
  return {
    name: 'Customer',
    tier: 'professional',
    accountStatus: 'active',
    previousInteractions: 5,
    satisfactionScore: 4.2,
  }
}

interface LLMResponse extends ResponseRecommendation {
  detectedIntent: string
  detectedTopics: string[]
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
}

export async function generateResponseRecommendation(
  context: AgentContext,
  conversationHistory: ConversationHistory,
  customerContext: CustomerContext,
): Promise<AgentResult<ResponseRecommendationAgentOutput>> {
  const startTime = Date.now()

  if (!context.message) {
    return {
      success: false,
      error: 'No message provided in context',
      metadata: {
        agentName: 'response-recommendation-agent',
        executionTimeMs: Date.now() - startTime,
      },
    }
  }

  try {
    const historyContext =
      conversationHistory.messages.length > 0
        ? `Previous messages in this conversation:
${conversationHistory.messages.map((m) => `[${m.role}]: ${m.content}`).join('\n')}
`
        : 'This is the first message in the conversation.'

    const userMessage = `Analyze this customer message and generate response recommendations:

Customer Message: "${context.message.content}"

Customer Context:
- Name: ${customerContext.name}
- Account Tier: ${customerContext.tier}
- Account Status: ${customerContext.accountStatus}
- Previous Interactions: ${customerContext.previousInteractions}
- Satisfaction Score: ${customerContext.satisfactionScore || 'N/A'}

${historyContext}

Generate a helpful response recommendation for the customer service representative.`

    const { parsed, raw } = await completeWithJson<LLMResponse>(
      [{ role: 'user', content: userMessage }],
      {
        systemPrompt: SYSTEM_PROMPT,
        temperature: 0.7,
        maxTokens: 2048,
      },
    )

    const output: ResponseRecommendationAgentOutput = {
      conversationId: context.conversationId,
      messageId: context.message.id,
      customerMessage: context.message.content,
      recommendation: {
        primaryResponse: parsed.primaryResponse,
        alternativeResponses: parsed.alternativeResponses,
        tone: parsed.tone,
        sentiment: parsed.sentiment,
        suggestedActions: parsed.suggestedActions,
        escalationRecommended: parsed.escalationRecommended,
        escalationReason: parsed.escalationReason,
        confidence: parsed.confidence,
      },
      analysisContext: {
        detectedIntent: parsed.detectedIntent,
        detectedTopics: parsed.detectedTopics,
        urgencyLevel: parsed.urgencyLevel,
      },
      generatedAt: new Date().toISOString(),
    }

    return {
      success: true,
      data: output,
      metadata: {
        agentName: 'response-recommendation-agent',
        executionTimeMs: Date.now() - startTime,
        modelUsed: raw.model,
        tokenUsage: raw.tokenUsage,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      metadata: {
        agentName: 'response-recommendation-agent',
        executionTimeMs: Date.now() - startTime,
      },
    }
  }
}
