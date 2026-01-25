import { z } from 'zod'

/**
 * Request validation schemas for all API endpoints
 * These enforce API contracts and provide type inference
 */

// ============================================================================
// Organizations
// ============================================================================

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
  plan: z.enum(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']).default('FREE'),
  status: z.enum(['TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED']).default('TRIAL'),
  settings: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export const UpdateOrganizationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  plan: z.enum(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']).optional(),
  status: z.enum(['TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED']).optional(),
  settings: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
})

// ============================================================================
// Users
// ============================================================================

export const CreateUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  role: z.enum(['CUSTOMER', 'REPRESENTATIVE', 'ADMIN']),
})

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  role: z.enum(['CUSTOMER', 'REPRESENTATIVE', 'ADMIN']).optional(),
})

// ============================================================================
// Representatives
// ============================================================================

export const CreateRepresentativeSchema = z.object({
  userId: z.string().uuid(),
  role: z
    .enum(['JUNIOR_SUPPORT', 'SENIOR_SUPPORT', 'TEAM_LEAD', 'ADMIN'])
    .default('JUNIOR_SUPPORT'),
  status: z.enum(['OFFLINE', 'AWAY', 'ONLINE']).default('OFFLINE'),
  activeChats: z.number().int().min(0).default(0),
  maxChats: z.number().int().min(1).max(50).default(10),
  rating: z
    .string()
    .regex(/^\d+\.\d{2}$/)
    .default('0.00'),
})

export const UpdateRepresentativeSchema = z.object({
  role: z.enum(['JUNIOR_SUPPORT', 'SENIOR_SUPPORT', 'TEAM_LEAD', 'ADMIN']).optional(),
  status: z.enum(['OFFLINE', 'AWAY', 'ONLINE']).optional(),
  activeChats: z.number().int().min(0).optional(),
  maxChats: z.number().int().min(1).max(50).optional(),
  rating: z
    .string()
    .regex(/^\d+\.\d{2}$/)
    .optional(),
})

// ============================================================================
// Customer Profiles
// ============================================================================

export const CreateCustomerProfileSchema = z.object({
  userId: z.string().uuid(),
  tier: z.enum(['FREE', 'STARTER', 'PRO', 'ENTERPRISE']).default('FREE'),
  standing: z.enum(['GOOD', 'WARNING', 'SUSPENDED', 'CLOSED']).default('GOOD'),
  lifetimeValue: z
    .string()
    .regex(/^\d+\.\d{2}$/)
    .default('0.00'),
  lastBillingDate: z.string().datetime().optional(),
  nextBillingDate: z.string().datetime().optional(),
  billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
  billingAmount: z
    .string()
    .regex(/^\d+\.\d{2}$/)
    .optional(),
  tokenBalance: z.number().int().min(0).default(0),
  tokenLimit: z.number().int().min(0).default(1000),
  activeSites: z.number().int().min(0).default(0),
  sitesLimit: z.number().int().min(1).default(1),
  context: z.record(z.unknown()).optional(),
  preferences: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export const UpdateCustomerProfileSchema = z.object({
  tier: z.enum(['FREE', 'STARTER', 'PRO', 'ENTERPRISE']).optional(),
  standing: z.enum(['GOOD', 'WARNING', 'SUSPENDED', 'CLOSED']).optional(),
  lifetimeValue: z
    .string()
    .regex(/^\d+\.\d{2}$/)
    .optional(),
  lastBillingDate: z.string().datetime().optional(),
  nextBillingDate: z.string().datetime().optional(),
  billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
  billingAmount: z
    .string()
    .regex(/^\d+\.\d{2}$/)
    .optional(),
  tokenBalance: z.number().int().min(0).optional(),
  tokenLimit: z.number().int().min(0).optional(),
  activeSites: z.number().int().min(0).optional(),
  sitesLimit: z.number().int().min(1).optional(),
  context: z.record(z.unknown()).optional(),
  preferences: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
})

// ============================================================================
// Tickets
// ============================================================================

export const CreateTicketSchema = z.object({
  ticketNumber: z.string().min(1).max(50),
  customerId: z.string().uuid(),
  assignedTo: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
  subject: z.string().min(1).max(500),
  description: z.string().min(1),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED']).default('OPEN'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  category: z.enum([
    'TECHNICAL_ISSUE',
    'BILLING_PAYMENT',
    'ACCOUNT_MANAGEMENT',
    'FEATURE_REQUEST',
    'BUG_REPORT',
    'OTHER',
  ]),
  tags: z.array(z.string()).default([]),
  aiHandled: z.boolean().default(false),
  sentiment: z
    .string()
    .regex(/^-?\d+\.\d{2}$/)
    .optional(),
  estimatedResolutionTime: z.number().int().min(0).optional(),
  internalNotes: z.string().optional(),
})

export const UpdateTicketSchema = z.object({
  assignedTo: z.string().uuid().optional(),
  subject: z.string().min(1).max(500).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  category: z
    .enum([
      'TECHNICAL_ISSUE',
      'BILLING_PAYMENT',
      'ACCOUNT_MANAGEMENT',
      'FEATURE_REQUEST',
      'BUG_REPORT',
      'OTHER',
    ])
    .optional(),
  tags: z.array(z.string()).optional(),
  sentiment: z
    .string()
    .regex(/^-?\d+\.\d{2}$/)
    .optional(),
  internalNotes: z.string().optional(),
  customerSatisfactionScore: z
    .string()
    .regex(/^\d+\.\d{2}$/)
    .optional(),
  actualResolutionTime: z.number().int().min(0).optional(),
})

// ============================================================================
// Escalations
// ============================================================================

export const CreateEscalationSchema = z.object({
  conversationId: z.string().uuid(),
  customerId: z.string().uuid(),
  assignedTo: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']).default('NORMAL'),
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED']).default('PENDING'),
  reason: z.enum([
    'AI_UNABLE_TO_RESOLVE',
    'CUSTOMER_REQUEST',
    'NEGATIVE_SENTIMENT',
    'TECHNICAL_ISSUE',
    'BILLING_DISPUTE',
    'HIGH_VALUE_CUSTOMER',
    'OTHER',
  ]),
  issueDescription: z.string().min(1),
  waitTime: z.number().int().min(0).default(0),
  notes: z.string().optional(),
  aiSummary: z.string().optional(),
})

export const UpdateEscalationSchema = z.object({
  assignedTo: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']).optional(),
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED']).optional(),
  waitTime: z.number().int().min(0).optional(),
  notes: z.string().optional(),
  aiSummary: z.string().optional(),
})

// ============================================================================
// Refunds
// ============================================================================

export const CreateRefundSchema = z.object({
  orderId: z.string().min(1).max(100),
  customerId: z.string().uuid(),
  amount: z.string().regex(/^\d+\.\d{2}$/),
  reason: z.enum([
    'AI_BUG',
    'SERVICE_DOWNTIME',
    'UX_ISSUE',
    'BILLING_ERROR',
    'CUSTOMER_REQUEST',
    'OTHER',
  ]),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']).default('PENDING'),
  notes: z.string().optional(),
  approvedBy: z.string().uuid().optional(),
})

export const UpdateRefundSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']).optional(),
  notes: z.string().optional(),
  approvedBy: z.string().uuid().optional(),
})

// ============================================================================
// Budgets
// ============================================================================

const BudgetAlertThresholdSchema = z.object({
  percentage: z.number().int().min(0).max(100),
  enabled: z.boolean(),
})

export const CreateBudgetSchema = z.object({
  type: z.enum(['REFUND', 'COMPENSATION', 'DISCOUNT', 'CREDIT']),
  period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  limit: z.string().regex(/^\d+\.\d{2}$/),
  spent: z
    .string()
    .regex(/^\d+\.\d{2}$/)
    .default('0.00'),
  remaining: z.string().regex(/^\d+\.\d{2}$/),
  alertThresholds: z.array(BudgetAlertThresholdSchema).default([]),
  autoAlertsEnabled: z.boolean().default(true),
  refundLimitPerUser: z
    .string()
    .regex(/^\d+\.\d{2}$/)
    .optional(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
})

export const UpdateBudgetSchema = z.object({
  limit: z
    .string()
    .regex(/^\d+\.\d{2}$/)
    .optional(),
  spent: z
    .string()
    .regex(/^\d+\.\d{2}$/)
    .optional(),
  remaining: z
    .string()
    .regex(/^\d+\.\d{2}$/)
    .optional(),
  alertThresholds: z.array(BudgetAlertThresholdSchema).optional(),
  autoAlertsEnabled: z.boolean().optional(),
  refundLimitPerUser: z
    .string()
    .regex(/^\d+\.\d{2}$/)
    .optional(),
})

// ============================================================================
// AI Agent Configurations
// ============================================================================

export const CreateAgentConfigurationSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['RESPONSE_RECOMMENDATION', 'CUSTOMER_SPEND', 'SENTIMENT_ANALYSIS', 'CUSTOM']),
  description: z.string().min(1),
  enabled: z.boolean().default(true),
  status: z.enum(['ACTIVE', 'PAUSED', 'DISABLED']).default('ACTIVE'),
  assertions: z.number().int().min(0).default(0),
  accuracy: z
    .string()
    .regex(/^\d+\.\d{2}$/)
    .default('0.00'),
  avgLatency: z.number().int().min(0).default(0),
  dataSources: z.array(z.string()).default([]),
  thresholds: z.record(z.unknown()).default({}),
  metadata: z.record(z.unknown()).optional(),
})

export const UpdateAgentConfigurationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  enabled: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'DISABLED']).optional(),
  assertions: z.number().int().min(0).optional(),
  accuracy: z
    .string()
    .regex(/^\d+\.\d{2}$/)
    .optional(),
  avgLatency: z.number().int().min(0).optional(),
  dataSources: z.array(z.string()).optional(),
  thresholds: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
})

// ============================================================================
// Decision Rules
// ============================================================================

const DecisionRuleConditionSchema = z.object({
  field: z.string(),
  operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'contains']),
  value: z.unknown(),
})

export const CreateDecisionRuleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  enabled: z.boolean().default(true),
  priority: z.number().int().min(0),
  conditions: z.array(DecisionRuleConditionSchema).min(1),
  action: z.enum([
    'AUTO_RESOLVE',
    'ESCALATE_TO_HUMAN',
    'REQUEST_MORE_INFO',
    'ROUTE_TO_SENIOR',
    'AUTO_APPROVE_REFUND',
    'DENY_REFUND',
    'CUSTOM',
  ]),
  actionParams: z.record(z.unknown()).optional(),
})

export const UpdateDecisionRuleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  enabled: z.boolean().optional(),
  priority: z.number().int().min(0).optional(),
  conditions: z.array(DecisionRuleConditionSchema).min(1).optional(),
  action: z
    .enum([
      'AUTO_RESOLVE',
      'ESCALATE_TO_HUMAN',
      'REQUEST_MORE_INFO',
      'ROUTE_TO_SENIOR',
      'AUTO_APPROVE_REFUND',
      'DENY_REFUND',
      'CUSTOM',
    ])
    .optional(),
  actionParams: z.record(z.unknown()).optional(),
})

// ============================================================================
// Type inference exports
// ============================================================================

export type CreateOrganizationRequest = z.infer<typeof CreateOrganizationSchema>
export type UpdateOrganizationRequest = z.infer<typeof UpdateOrganizationSchema>
export type CreateUserRequest = z.infer<typeof CreateUserSchema>
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>
export type CreateRepresentativeRequest = z.infer<typeof CreateRepresentativeSchema>
export type UpdateRepresentativeRequest = z.infer<typeof UpdateRepresentativeSchema>
export type CreateCustomerProfileRequest = z.infer<typeof CreateCustomerProfileSchema>
export type UpdateCustomerProfileRequest = z.infer<typeof UpdateCustomerProfileSchema>
export type CreateTicketRequest = z.infer<typeof CreateTicketSchema>
export type UpdateTicketRequest = z.infer<typeof UpdateTicketSchema>
export type CreateEscalationRequest = z.infer<typeof CreateEscalationSchema>
export type UpdateEscalationRequest = z.infer<typeof UpdateEscalationSchema>
export type CreateRefundRequest = z.infer<typeof CreateRefundSchema>
export type UpdateRefundRequest = z.infer<typeof UpdateRefundSchema>
export type CreateBudgetRequest = z.infer<typeof CreateBudgetSchema>
export type UpdateBudgetRequest = z.infer<typeof UpdateBudgetSchema>
export type CreateAgentConfigurationRequest = z.infer<typeof CreateAgentConfigurationSchema>
export type UpdateAgentConfigurationRequest = z.infer<typeof UpdateAgentConfigurationSchema>
export type CreateDecisionRuleRequest = z.infer<typeof CreateDecisionRuleSchema>
export type UpdateDecisionRuleRequest = z.infer<typeof UpdateDecisionRuleSchema>
