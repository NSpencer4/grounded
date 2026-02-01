/**
 * Sample Agent Result Event test data
 */

import type {
  CustomerSpendAnalysisEvent,
  ResponseRecommendationEvent,
} from '../../events/agent-result'
import {
  sampleConversationWaiting,
  sampleCustomer1,
  sampleCustomerMessage,
  TEST_IDS,
} from './fixtures'

// ============================================================================
// Sample Customer Spend Analysis Event
// ============================================================================

export const sampleSpendAnalysisEvent: CustomerSpendAnalysisEvent = {
  event: {
    id: TEST_IDS.event1,
    type: 'CUSTOMER_SPEND_ANALYSIS',
    schemaVersion: '1.0.0',
  },
  actionContext: {
    action: 'CREATE',
    actionBy: 'customer-spend-agent',
  },
  metadata: {
    createdAt: new Date('2024-01-15T10:01:00.000Z'),
    updatedAt: new Date('2024-01-15T10:01:00.000Z'),
    correlationId: TEST_IDS.correlation1,
  },
  conversation: sampleConversationWaiting,
  message: sampleCustomerMessage,
  spendAnalysis: {
    result: {
      success: true,
      data: {
        customer: {
          id: sampleCustomer1.id,
          profileId: `prof-${sampleCustomer1.id}`,
          tier: 'PRO',
          standing: 'GOOD',
          accountAgeMonths: 14,
          joinedAt: new Date('2022-11-15T00:00:00.000Z'),
        },
        billing: {
          lifetimeValue: 1680.0,
          currency: 'USD',
          billingCycle: 'MONTHLY',
          currentBillingAmount: 120.0,
          lastBillingDate: new Date('2024-01-01T00:00:00.000Z'),
          nextBillingDate: new Date('2024-02-01T00:00:00.000Z'),
        },
        tokenUsage: {
          currentBalance: 2500,
          monthlyLimit: 50000,
          tokensUsedCurrentPeriod: 47500,
          tokensUsedPreviousPeriod: 42000,
          usageTrend: 'INCREASING',
          periodStartDate: new Date('2024-01-01T00:00:00.000Z'),
        },
        refundHistory: {
          totalRefundsReceived: 1,
          totalRefundAmount: 25.0,
          totalTokensRefunded: 5000,
          lastRefundDate: new Date('2023-08-10T00:00:00.000Z'),
          lastRefundType: 'PARTIAL_TOKEN_REFUND',
          refundReasons: ['SERVICE_DOWNTIME'],
        },
        recommendation: {
          eligible: true,
          type: 'PARTIAL_TOKEN_REFUND',
          suggestedAmount: {
            tokens: 5000,
            equivalentValue: 10.0,
          },
          alternativeOptions: [
            {
              type: 'PARTIAL_PAYMENT_REFUND',
              amount: 10.0,
              description: 'Refund to original payment method',
            },
            {
              type: 'TOKEN_CREDIT',
              tokens: 6000,
              equivalentValue: 12.0,
              description: '10% bonus tokens as goodwill gesture',
            },
          ],
          reasoning:
            'Customer is a PRO tier member in good standing with 14 months tenure. High token usage suggests active engagement.',
          confidence: 0.89,
          factors: {
            customerValue: 'HIGH',
            churnRisk: 'MEDIUM',
            refundRiskLevel: 'LOW',
            budgetImpact: 'MINIMAL',
          },
        },
        budgetCheck: {
          organizationBudgetRemaining: 4500.0,
          perUserLimitRemaining: 75.0,
          withinBudget: true,
        },
      },
      error: null,
      metadata: {
        agentName: 'customer-spend-agent',
        executionTimeMs: 1250,
        modelUsed: 'claude-3-haiku-20240307',
        tokenUsage: {
          input: 850,
          output: 320,
        },
        dataSourcesQueried: ['customer-profiles', 'refunds', 'budgets'],
      },
    },
  },
}

// ============================================================================
// Sample Response Recommendation Event
// ============================================================================

export const sampleResponseRecommendationEvent: ResponseRecommendationEvent = {
  event: {
    id: TEST_IDS.event2,
    type: 'RESPONSE_RECOMMENDATION',
    schemaVersion: '1.0.0',
  },
  actionContext: {
    action: 'CREATE',
    actionBy: 'response-recommendation-agent',
  },
  metadata: {
    createdAt: new Date('2024-01-15T10:01:30.000Z'),
    updatedAt: new Date('2024-01-15T10:01:30.000Z'),
    correlationId: TEST_IDS.correlation1,
  },
  conversation: sampleConversationWaiting,
  message: sampleCustomerMessage,
  responseRecommendation: {
    result: {
      success: true,
      data: {
        response: {
          content:
            "Hi Alice, I'm really sorry to hear about the issue you've been experiencing. I've reviewed your account and would like to offer you 5,000 tokens as compensation. Would that work for you?",
          tone: 'EMPATHETIC',
          intent: 'RESOLVE_WITH_COMPENSATION',
        },
        responseOptions: [
          {
            type: 'PRIMARY',
            description: 'Empathetic response offering token refund',
          },
          {
            type: 'ESCALATE',
            description: 'If customer is dissatisfied, escalate to human representative',
            escalationReason: 'CUSTOMER_REQUEST',
          },
        ],
        contextUsed: {
          customerTier: 'PRO',
          customerStanding: 'GOOD',
          spendAnalysisRecommendation: 'PARTIAL_TOKEN_REFUND',
          suggestedTokenAmount: 5000,
          suggestedEquivalentValue: 10.0,
        },
        confidence: 0.91,
        reasoning:
          'Customer is reporting a legitimate service quality issue. Spend analysis indicates they are eligible for a partial token refund.',
      },
      error: null,
      metadata: {
        agentName: 'response-recommendation-agent',
        executionTimeMs: 1850,
        modelUsed: 'claude-sonnet-4-20250514',
        tokenUsage: {
          input: 1450,
          output: 420,
        },
        inputsReceived: ['conversation-context', 'message-history', 'spend-analysis-result'],
      },
    },
  },
}

// ============================================================================
// Sample Error Events
// ============================================================================

export const sampleSpendAnalysisErrorEvent: CustomerSpendAnalysisEvent = {
  event: {
    id: TEST_IDS.event3,
    type: 'CUSTOMER_SPEND_ANALYSIS',
    schemaVersion: '1.0.0',
  },
  actionContext: {
    action: 'CREATE',
    actionBy: 'customer-spend-agent',
  },
  metadata: {
    createdAt: new Date('2024-01-15T10:01:00.000Z'),
    updatedAt: new Date('2024-01-15T10:01:00.000Z'),
    correlationId: TEST_IDS.correlation2,
  },
  conversation: sampleConversationWaiting,
  message: sampleCustomerMessage,
  spendAnalysis: {
    result: {
      success: false,
      error: 'Failed to retrieve customer data: Customer profile not found',
      metadata: {
        agentName: 'customer-spend-agent',
        executionTimeMs: 250,
      },
    },
  },
}

// ============================================================================
// Exports
// ============================================================================

export const agentResultScenarios = {
  spendAnalysisSuccess: sampleSpendAnalysisEvent,
  responseRecommendationSuccess: sampleResponseRecommendationEvent,
  spendAnalysisError: sampleSpendAnalysisErrorEvent,
}
