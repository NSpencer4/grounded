import type { AgentContext, AgentResult } from '@grounded/agents-shared'
import { completeWithJson } from '@grounded/agents-shared'
import type { CustomerSpendAgentOutput, CustomerSpendData, SpendAnalysis } from './types.js'

const SYSTEM_PROMPT = `You are a customer spend analysis agent. Your role is to analyze customer spending data and provide actionable insights for customer service representatives.

Given customer spending data, you must analyze:
1. Customer value tier based on spending patterns
2. Churn risk based on usage trends and recent activity
3. Upsell opportunities based on usage vs limits
4. Key insights about the customer's relationship with the product
5. Recommended actions for the customer service representative

Respond with a JSON object matching this structure:
{
  "customerValue": "low" | "medium" | "high" | "enterprise",
  "churnRisk": "low" | "medium" | "high",
  "upsellOpportunity": boolean,
  "keyInsights": string[],
  "recommendedActions": string[],
  "spendTrend": "increasing" | "stable" | "decreasing",
  "lifetimeValue": number
}`

export async function fetchCustomerSpendData(customerId: string): Promise<CustomerSpendData> {
  // TODO: Replace with actual data fetching from organization-api
  // This is mock data for scaffolding purposes
  return {
    customerId,
    totalSpend: 2450.0,
    currency: 'USD',
    subscriptionTier: 'professional',
    accountAge: {
      months: 14,
      startDate: '2023-11-15',
    },
    recentTransactions: [
      {
        id: 'txn_001',
        date: '2025-01-15',
        amount: 199.0,
        type: 'subscription',
        description: 'Professional Plan - Monthly',
      },
      {
        id: 'txn_002',
        date: '2025-01-10',
        amount: 25.0,
        type: 'usage',
        description: 'API overage charges',
      },
    ],
    usageMetrics: {
      apiCallsThisMonth: 45000,
      apiCallsLimit: 50000,
      storageUsedGb: 8.5,
      storageLimitGb: 10,
      activeUsers: 12,
      userLimit: 15,
    },
  }
}

export async function analyzeCustomerSpend(
  context: AgentContext,
  spendData: CustomerSpendData,
): Promise<AgentResult<CustomerSpendAgentOutput>> {
  const startTime = Date.now()

  try {
    const userMessage = `Analyze the following customer spending data and provide insights:

Customer ID: ${spendData.customerId}
Subscription Tier: ${spendData.subscriptionTier}
Total Spend: ${spendData.currency} ${spendData.totalSpend}
Account Age: ${spendData.accountAge.months} months

Usage Metrics:
- API Calls: ${spendData.usageMetrics.apiCallsThisMonth}/${spendData.usageMetrics.apiCallsLimit} (${Math.round((spendData.usageMetrics.apiCallsThisMonth / spendData.usageMetrics.apiCallsLimit) * 100)}%)
- Storage: ${spendData.usageMetrics.storageUsedGb}/${spendData.usageMetrics.storageLimitGb} GB (${Math.round((spendData.usageMetrics.storageUsedGb / spendData.usageMetrics.storageLimitGb) * 100)}%)
- Active Users: ${spendData.usageMetrics.activeUsers}/${spendData.usageMetrics.userLimit}

Recent Transactions:
${spendData.recentTransactions.map((t) => `- ${t.date}: ${t.type} - ${spendData.currency} ${t.amount} (${t.description})`).join('\n')}

${context.message ? `Current conversation context: Customer sent message: "${context.message.content}"` : ''}`

    const { parsed: analysis, raw } = await completeWithJson<SpendAnalysis>(
      [{ role: 'user', content: userMessage }],
      {
        systemPrompt: SYSTEM_PROMPT,
        temperature: 0.3,
        maxTokens: 1024,
      },
    )

    const output: CustomerSpendAgentOutput = {
      customerId: spendData.customerId,
      spendData,
      analysis,
      generatedAt: new Date().toISOString(),
    }

    return {
      success: true,
      data: output,
      metadata: {
        agentName: 'customer-spend-agent',
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
        agentName: 'customer-spend-agent',
        executionTimeMs: Date.now() - startTime,
      },
    }
  }
}
