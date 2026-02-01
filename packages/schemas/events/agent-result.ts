import { z } from 'zod'
import { BaseEventSchema, EventDetailsSchema } from './base-event'
import { ConversationSchema } from '../models/conversation'
import { MessageSchema } from '../models/message'
import {
  AccountStandingSchema,
  AccountTierSchema,
  CurrencySchema,
  TokenUsageTrendSchema,
} from '../models/customer-profile'
import { RefundReasonSchema, RefundTypeSchema } from '../models/refund'

// ============================================================================
// Shared Agent Metadata
// ============================================================================

export const AgentMetadataSchema = z.object({
  agentName: z.string(),
  executionTimeMs: z.number(),
  modelUsed: z.string().optional(),
  tokenUsage: z
    .object({
      input: z.number(),
      output: z.number(),
    })
    .optional(),
  dataSourcesQueried: z.array(z.string()).optional(),
  inputsReceived: z.array(z.string()).optional(),
})

export type AgentMetadata = z.infer<typeof AgentMetadataSchema>

// ============================================================================
// Customer Spend Analysis Schemas
// ============================================================================

export const CustomerValueSchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'ENTERPRISE'])
export const ChurnRiskSchema = z.enum(['LOW', 'MEDIUM', 'HIGH'])
export const RefundRiskLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH'])
export const BudgetImpactSchema = z.enum(['NONE', 'MINIMAL', 'MODERATE', 'SIGNIFICANT'])

export const SpendAnalysisCustomerSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  tier: AccountTierSchema,
  standing: AccountStandingSchema,
  accountAgeMonths: z.number().int().min(0),
  joinedAt: z.date(),
})

export const SpendAnalysisBillingSchema = z.object({
  lifetimeValue: z.number().min(0),
  currency: CurrencySchema,
  billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  currentBillingAmount: z.number().min(0),
  lastBillingDate: z.date(),
  nextBillingDate: z.date(),
})

export const SpendAnalysisTokenUsageSchema = z.object({
  currentBalance: z.number().int().min(0),
  monthlyLimit: z.number().int().positive(),
  tokensUsedCurrentPeriod: z.number().int().min(0),
  tokensUsedPreviousPeriod: z.number().int().min(0),
  usageTrend: TokenUsageTrendSchema,
  periodStartDate: z.date(),
})

export const SpendAnalysisRefundHistorySchema = z.object({
  totalRefundsReceived: z.number().int().min(0),
  totalRefundAmount: z.number().min(0),
  totalTokensRefunded: z.number().int().min(0),
  lastRefundDate: z.date().nullable(),
  lastRefundType: RefundTypeSchema.nullable(),
  refundReasons: z.array(RefundReasonSchema),
})

export const RefundSuggestedAmountSchema = z.object({
  tokens: z.number().int().min(0),
  equivalentValue: z.number().min(0),
})

export const RefundAlternativeOptionSchema = z.object({
  type: RefundTypeSchema,
  amount: z.number().min(0).optional(),
  tokens: z.number().int().min(0).optional(),
  equivalentValue: z.number().min(0).optional(),
  description: z.string(),
})

export const SpendAnalysisRecommendationSchema = z.object({
  eligible: z.boolean(),
  type: RefundTypeSchema,
  suggestedAmount: RefundSuggestedAmountSchema,
  alternativeOptions: z.array(RefundAlternativeOptionSchema),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
  factors: z.object({
    customerValue: CustomerValueSchema,
    churnRisk: ChurnRiskSchema,
    refundRiskLevel: RefundRiskLevelSchema,
    budgetImpact: BudgetImpactSchema,
  }),
})

export const SpendAnalysisBudgetCheckSchema = z.object({
  organizationBudgetRemaining: z.number().min(0),
  perUserLimitRemaining: z.number().min(0),
  withinBudget: z.boolean(),
})

export const SpendAnalysisDataSchema = z.object({
  customer: SpendAnalysisCustomerSchema,
  billing: SpendAnalysisBillingSchema,
  tokenUsage: SpendAnalysisTokenUsageSchema,
  refundHistory: SpendAnalysisRefundHistorySchema,
  recommendation: SpendAnalysisRecommendationSchema,
  budgetCheck: SpendAnalysisBudgetCheckSchema,
})

export const SpendAnalysisResultSchema = z.object({
  success: z.boolean(),
  data: SpendAnalysisDataSchema.optional(),
  error: z.string().nullable(),
  metadata: AgentMetadataSchema,
})

export const CustomerSpendAnalysisEventSchema = BaseEventSchema.extend({
  event: EventDetailsSchema.extend({
    type: z.literal('CUSTOMER_SPEND_ANALYSIS'),
  }),
  conversation: ConversationSchema,
  message: MessageSchema,
  spendAnalysis: z.object({
    result: SpendAnalysisResultSchema,
  }),
})

export type SpendAnalysisData = z.infer<typeof SpendAnalysisDataSchema>
export type SpendAnalysisResult = z.infer<typeof SpendAnalysisResultSchema>
export type CustomerSpendAnalysisEvent = z.infer<typeof CustomerSpendAnalysisEventSchema>

// ============================================================================
// Response Recommendation Schemas
// ============================================================================

export const ResponseToneSchema = z.enum([
  'EMPATHETIC',
  'PROFESSIONAL',
  'FRIENDLY',
  'APOLOGETIC',
  'INFORMATIVE',
])

export const ResponseIntentSchema = z.enum([
  'RESOLVE_WITH_COMPENSATION',
  'RESOLVE_WITHOUT_COMPENSATION',
  'REQUEST_MORE_INFO',
  'ESCALATE_TO_HUMAN',
  'PROVIDE_INFORMATION',
  'CLOSE_CONVERSATION',
])

export const ResponseOptionTypeSchema = z.enum(['PRIMARY', 'ESCALATE', 'ALTERNATIVE'])

export const ResponseContentSchema = z.object({
  content: z.string(),
  tone: ResponseToneSchema,
  intent: ResponseIntentSchema,
})

export const ResponseOptionSchema = z.object({
  type: ResponseOptionTypeSchema,
  description: z.string(),
  escalationReason: z.string().optional(),
})

export const ResponseContextUsedSchema = z.object({
  customerTier: AccountTierSchema,
  customerStanding: AccountStandingSchema,
  spendAnalysisRecommendation: RefundTypeSchema.optional(),
  suggestedTokenAmount: z.number().int().min(0).optional(),
  suggestedEquivalentValue: z.number().min(0).optional(),
})

export const ResponseRecommendationDataSchema = z.object({
  response: ResponseContentSchema,
  responseOptions: z.array(ResponseOptionSchema),
  contextUsed: ResponseContextUsedSchema,
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
})

export const ResponseRecommendationResultSchema = z.object({
  success: z.boolean(),
  data: ResponseRecommendationDataSchema.optional(),
  error: z.string().nullable(),
  metadata: AgentMetadataSchema,
})

export const ResponseRecommendationEventSchema = BaseEventSchema.extend({
  event: EventDetailsSchema.extend({
    type: z.literal('RESPONSE_RECOMMENDATION'),
  }),
  conversation: ConversationSchema,
  message: MessageSchema,
  responseRecommendation: z.object({
    result: ResponseRecommendationResultSchema,
  }),
})

export type ResponseRecommendationData = z.infer<typeof ResponseRecommendationDataSchema>
export type ResponseRecommendationResult = z.infer<typeof ResponseRecommendationResultSchema>
export type ResponseRecommendationEvent = z.infer<typeof ResponseRecommendationEventSchema>

// ============================================================================
// Legacy exports for backwards compatibility
// ============================================================================

export const AgentResultTypeSchema = z.enum(['CUSTOMER_SPEND_ANALYSIS', 'RESPONSE_RECOMMENDATION'])
export type AgentResultType = z.infer<typeof AgentResultTypeSchema>
