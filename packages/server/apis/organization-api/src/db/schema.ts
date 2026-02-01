import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ============================================================================
// ENUMS
// ============================================================================

export const userRoleEnum = pgEnum('user_role', ['CUSTOMER', 'REPRESENTATIVE', 'ADMIN'])

export const representativeRoleEnum = pgEnum('representative_role', [
  'JUNIOR_SUPPORT',
  'SENIOR_SUPPORT',
  'TEAM_LEAD',
  'ADMIN',
])

export const representativeStatusEnum = pgEnum('representative_status', [
  'ONLINE',
  'AWAY',
  'OFFLINE',
])

export const organizationPlanEnum = pgEnum('organization_plan', [
  'FREE',
  'STARTER',
  'PROFESSIONAL',
  'ENTERPRISE',
])

export const organizationStatusEnum = pgEnum('organization_status', [
  'ACTIVE',
  'SUSPENDED',
  'TRIAL',
  'CANCELLED',
])

export const accountTierEnum = pgEnum('account_tier', ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'])

export const accountStandingEnum = pgEnum('account_standing', [
  'GOOD',
  'WARNING',
  'SUSPENDED',
  'CLOSED',
])

export const billingCycleEnum = pgEnum('billing_cycle', ['MONTHLY', 'QUARTERLY', 'YEARLY'])

export const currencyEnum = pgEnum('currency', ['USD', 'EUR', 'GBP', 'CAD', 'AUD'])

export const tokenUsageTrendEnum = pgEnum('token_usage_trend', [
  'INCREASING',
  'STABLE',
  'DECREASING',
])

export const ticketStatusEnum = pgEnum('ticket_status', [
  'OPEN',
  'IN_PROGRESS',
  'WAITING',
  'RESOLVED',
  'CLOSED',
])

export const ticketPriorityEnum = pgEnum('ticket_priority', ['LOW', 'NORMAL', 'HIGH', 'URGENT'])

export const ticketCategoryEnum = pgEnum('ticket_category', [
  'TECHNICAL_ISSUE',
  'BILLING_PAYMENT',
  'ACCOUNT_MANAGEMENT',
  'FEATURE_REQUEST',
  'BUG_REPORT',
  'OTHER',
])

export const escalationPriorityEnum = pgEnum('escalation_priority', [
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT',
  'CRITICAL',
])

export const escalationStatusEnum = pgEnum('escalation_status', [
  'PENDING',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
])

export const escalationReasonEnum = pgEnum('escalation_reason', [
  'AI_UNABLE_TO_RESOLVE',
  'CUSTOMER_REQUEST',
  'NEGATIVE_SENTIMENT',
  'TECHNICAL_ISSUE',
  'BILLING_DISPUTE',
  'HIGH_VALUE_CUSTOMER',
  'OTHER',
])

export const refundReasonEnum = pgEnum('refund_reason', [
  'AI_BUG',
  'SERVICE_DOWNTIME',
  'UX_ISSUE',
  'BILLING_ERROR',
  'CUSTOMER_REQUEST',
  'OTHER',
])

export const refundStatusEnum = pgEnum('refund_status', [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'COMPLETED',
])

export const refundTypeEnum = pgEnum('refund_type', [
  'FULL_TOKEN_REFUND',
  'PARTIAL_TOKEN_REFUND',
  'FULL_PAYMENT_REFUND',
  'PARTIAL_PAYMENT_REFUND',
  'TOKEN_CREDIT',
])

export const budgetTypeEnum = pgEnum('budget_type', [
  'REFUND',
  'COMPENSATION',
  'DISCOUNT',
  'CREDIT',
])

export const budgetPeriodEnum = pgEnum('budget_period', [
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'YEARLY',
])

export const agentTypeEnum = pgEnum('agent_type', [
  'RESPONSE_RECOMMENDATION',
  'CUSTOMER_SPEND',
  'SENTIMENT_ANALYSIS',
  'ESCALATION_PREDICTOR',
  'CUSTOM',
])

export const agentStatusEnum = pgEnum('agent_status', ['ACTIVE', 'PAUSED', 'DISABLED'])

export const decisionRuleActionEnum = pgEnum('decision_rule_action', [
  'AUTO_RESOLVE',
  'ESCALATE_TO_HUMAN',
  'REQUEST_MORE_INFO',
  'ROUTE_TO_SENIOR',
  'AUTO_APPROVE_REFUND',
  'DENY_REFUND',
  'CUSTOM',
])

export const metricPeriodEnum = pgEnum('metric_period', [
  'HOUR',
  'DAY',
  'WEEK',
  'MONTH',
  'QUARTER',
  'YEAR',
])

export const performanceTrendEnum = pgEnum('performance_trend', ['UP', 'DOWN', 'STABLE'])

// ============================================================================
// CORE TABLES
// ============================================================================

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  plan: organizationPlanEnum('plan').notNull().default('FREE'),
  status: organizationStatusEnum('status').notNull().default('TRIAL'),
  settings: jsonb('settings').notNull().default({}),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  trialEndsAt: timestamp('trial_ends_at'),
  suspendedAt: timestamp('suspended_at'),
})

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    role: userRoleEnum('role').notNull().default('CUSTOMER'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    orgIdIdx: index('users_org_id_idx').on(table.organizationId),
  }),
)

export const representatives = pgTable(
  'representatives',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(),
    role: representativeRoleEnum('role').notNull().default('JUNIOR_SUPPORT'),
    status: representativeStatusEnum('status').notNull().default('OFFLINE'),
    activeChats: integer('active_chats').notNull().default(0),
    maxChats: integer('max_chats').notNull().default(10),
    rating: decimal('rating', { precision: 3, scale: 2 }).notNull().default('0.00'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    lastActiveAt: timestamp('last_active_at'),
  },
  (table) => ({
    userIdIdx: index('representatives_user_id_idx').on(table.userId),
    orgIdIdx: index('representatives_org_id_idx').on(table.organizationId),
    statusIdx: index('representatives_status_idx').on(table.status),
  }),
)

export const customerProfiles = pgTable(
  'customer_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(),
    tier: accountTierEnum('tier').notNull().default('FREE'),
    standing: accountStandingEnum('standing').notNull().default('GOOD'),
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
    lifetimeValue: decimal('lifetime_value', { precision: 12, scale: 2 }).notNull().default('0.00'),
    // Billing info
    lastBillingDate: timestamp('last_billing_date'),
    nextBillingDate: timestamp('next_billing_date'),
    billingCycle: billingCycleEnum('billing_cycle'),
    billingAmount: decimal('billing_amount', { precision: 10, scale: 2 }),
    billingCurrency: currencyEnum('billing_currency').notNull().default('USD'),
    // Usage stats
    tokenBalance: integer('token_balance').notNull().default(0),
    tokenLimit: integer('token_limit').notNull().default(1000),
    activeSites: integer('active_sites').notNull().default(0),
    sitesLimit: integer('sites_limit').notNull().default(1),
    // Denormalized token usage tracking for spend analysis
    tokensUsedCurrentPeriod: integer('tokens_used_current_period').notNull().default(0),
    tokensUsedPreviousPeriod: integer('tokens_used_previous_period').notNull().default(0),
    tokenUsageTrend: tokenUsageTrendEnum('token_usage_trend').notNull().default('STABLE'),
    periodStartDate: timestamp('period_start_date').notNull().defaultNow(),
    // Context and preferences
    context: jsonb('context'),
    preferences: jsonb('preferences'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('customer_profiles_user_id_idx').on(table.userId),
    orgIdIdx: index('customer_profiles_org_id_idx').on(table.organizationId),
    tierIdx: index('customer_profiles_tier_idx').on(table.tier),
  }),
)

// ============================================================================
// SUPPORT & TICKETING
// ============================================================================

export const tickets = pgTable(
  'tickets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    ticketNumber: varchar('ticket_number', { length: 50 }).notNull(),
    conversationId: uuid('conversation_id'), // Reference to DynamoDB conversation
    customerId: uuid('customer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    assignedTo: uuid('assigned_to').references(() => representatives.id, { onDelete: 'set null' }),
    subject: varchar('subject', { length: 500 }).notNull(),
    description: text('description').notNull(),
    status: ticketStatusEnum('status').notNull().default('OPEN'),
    priority: ticketPriorityEnum('priority').notNull().default('NORMAL'),
    category: ticketCategoryEnum('category').notNull(),
    tags: jsonb('tags'),
    aiHandled: boolean('ai_handled').notNull().default(false),
    sentiment: decimal('sentiment', { precision: 3, scale: 2 }),
    estimatedResolutionTime: integer('estimated_resolution_time'),
    actualResolutionTime: integer('actual_resolution_time'),
    customerSatisfactionScore: decimal('customer_satisfaction_score', { precision: 2, scale: 1 }),
    internalNotes: text('internal_notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    resolvedAt: timestamp('resolved_at'),
    closedAt: timestamp('closed_at'),
  },
  (table) => ({
    ticketNumberIdx: index('tickets_ticket_number_idx').on(table.ticketNumber),
    customerIdIdx: index('tickets_customer_id_idx').on(table.customerId),
    assignedToIdx: index('tickets_assigned_to_idx').on(table.assignedTo),
    statusIdx: index('tickets_status_idx').on(table.status),
    priorityIdx: index('tickets_priority_idx').on(table.priority),
    orgIdIdx: index('tickets_org_id_idx').on(table.organizationId),
    createdAtIdx: index('tickets_created_at_idx').on(table.createdAt),
  }),
)

export const escalations = pgTable(
  'escalations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    conversationId: uuid('conversation_id').notNull(), // Reference to DynamoDB conversation
    customerId: uuid('customer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    assignedTo: uuid('assigned_to').references(() => representatives.id, { onDelete: 'set null' }),
    priority: escalationPriorityEnum('priority').notNull().default('NORMAL'),
    status: escalationStatusEnum('status').notNull().default('PENDING'),
    reason: escalationReasonEnum('reason').notNull(),
    issueDescription: text('issue_description').notNull(),
    waitTime: integer('wait_time').notNull().default(0),
    notes: text('notes'),
    aiSummary: text('ai_summary'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    assignedAt: timestamp('assigned_at'),
    resolvedAt: timestamp('resolved_at'),
  },
  (table) => ({
    conversationIdIdx: index('escalations_conversation_id_idx').on(table.conversationId),
    customerIdIdx: index('escalations_customer_id_idx').on(table.customerId),
    assignedToIdx: index('escalations_assigned_to_idx').on(table.assignedTo),
    statusIdx: index('escalations_status_idx').on(table.status),
    priorityIdx: index('escalations_priority_idx').on(table.priority),
    orgIdIdx: index('escalations_org_id_idx').on(table.organizationId),
  }),
)

// ============================================================================
// FINANCIAL
// ============================================================================

export const refunds = pgTable(
  'refunds',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    orderId: varchar('order_id', { length: 255 }), // Optional - not needed for token credits
    customerId: uuid('customer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: refundTypeEnum('type').notNull(),
    // For payment refunds: dollar amount. For token refunds: equivalent dollar value
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    // For token refunds/credits: number of tokens
    tokenAmount: integer('token_amount'),
    reason: refundReasonEnum('reason').notNull(),
    status: refundStatusEnum('status').notNull().default('PENDING'),
    notes: text('notes'),
    approvedBy: uuid('approved_by').references(() => representatives.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    processedAt: timestamp('processed_at'),
  },
  (table) => ({
    orderIdIdx: index('refunds_order_id_idx').on(table.orderId),
    customerIdIdx: index('refunds_customer_id_idx').on(table.customerId),
    statusIdx: index('refunds_status_idx').on(table.status),
    typeIdx: index('refunds_type_idx').on(table.type),
    orgIdIdx: index('refunds_org_id_idx').on(table.organizationId),
    createdAtIdx: index('refunds_created_at_idx').on(table.createdAt),
  }),
)

export const budgets = pgTable(
  'budgets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    type: budgetTypeEnum('type').notNull(),
    period: budgetPeriodEnum('period').notNull(),
    limit: decimal('limit', { precision: 12, scale: 2 }).notNull(),
    spent: decimal('spent', { precision: 12, scale: 2 }).notNull().default('0.00'),
    remaining: decimal('remaining', { precision: 12, scale: 2 }).notNull(),
    alertThresholds: jsonb('alert_thresholds').notNull().default([]),
    autoAlertsEnabled: boolean('auto_alerts_enabled').notNull().default(true),
    refundLimitPerUser: decimal('refund_limit_per_user', { precision: 10, scale: 2 }),
    periodStart: timestamp('period_start').notNull(),
    periodEnd: timestamp('period_end').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    orgIdIdx: index('budgets_org_id_idx').on(table.organizationId),
    typeIdx: index('budgets_type_idx').on(table.type),
    periodIdx: index('budgets_period_idx').on(table.period),
    periodStartIdx: index('budgets_period_start_idx').on(table.periodStart),
  }),
)

export const budgetUsageRecords = pgTable(
  'budget_usage_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    budgetId: uuid('budget_id')
      .notNull()
      .references(() => budgets.id, { onDelete: 'cascade' }),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    refundId: uuid('refund_id').references(() => refunds.id, { onDelete: 'set null' }),
    reason: text('reason'),
    approvedBy: uuid('approved_by').references(() => representatives.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    budgetIdIdx: index('budget_usage_records_budget_id_idx').on(table.budgetId),
    refundIdIdx: index('budget_usage_records_refund_id_idx').on(table.refundId),
    createdAtIdx: index('budget_usage_records_created_at_idx').on(table.createdAt),
  }),
)

// ============================================================================
// AI & AUTOMATION
// ============================================================================

export const agentConfigurations = pgTable(
  'agent_configurations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    type: agentTypeEnum('type').notNull(),
    description: text('description').notNull(),
    enabled: boolean('enabled').notNull().default(true),
    status: agentStatusEnum('status').notNull().default('ACTIVE'),
    assertions: integer('assertions').notNull().default(0),
    accuracy: decimal('accuracy', { precision: 5, scale: 2 }).notNull().default('0.00'),
    avgLatency: integer('avg_latency').notNull().default(0),
    dataSources: jsonb('data_sources').notNull().default([]),
    thresholds: jsonb('thresholds').notNull().default({}),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    lastRunAt: timestamp('last_run_at'),
  },
  (table) => ({
    orgIdIdx: index('agent_configurations_org_id_idx').on(table.organizationId),
    typeIdx: index('agent_configurations_type_idx').on(table.type),
    statusIdx: index('agent_configurations_status_idx').on(table.status),
  }),
)

export const decisionRules = pgTable(
  'decision_rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description').notNull(),
    enabled: boolean('enabled').notNull().default(true),
    priority: integer('priority').notNull(),
    conditions: jsonb('conditions').notNull(),
    action: decisionRuleActionEnum('action').notNull(),
    actionParams: jsonb('action_params'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    lastTriggeredAt: timestamp('last_triggered_at'),
  },
  (table) => ({
    orgIdIdx: index('decision_rules_org_id_idx').on(table.organizationId),
    priorityIdx: index('decision_rules_priority_idx').on(table.priority),
    enabledIdx: index('decision_rules_enabled_idx').on(table.enabled),
  }),
)

// ============================================================================
// ANALYTICS & PERFORMANCE
// ============================================================================

export const performanceMetrics = pgTable(
  'performance_metrics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    period: metricPeriodEnum('period').notNull(),
    periodStart: timestamp('period_start').notNull(),
    periodEnd: timestamp('period_end').notNull(),
    totalChats: integer('total_chats').notNull().default(0),
    activeChats: integer('active_chats').notNull().default(0),
    avgResponseTime: integer('avg_response_time').notNull().default(0),
    firstContactResolution: decimal('first_contact_resolution', { precision: 5, scale: 2 })
      .notNull()
      .default('0.00'),
    customerSatisfaction: decimal('customer_satisfaction', { precision: 3, scale: 2 })
      .notNull()
      .default('0.00'),
    escalationRate: decimal('escalation_rate', { precision: 5, scale: 2 })
      .notNull()
      .default('0.00'),
    aiResolutionRate: decimal('ai_resolution_rate', { precision: 5, scale: 2 })
      .notNull()
      .default('0.00'),
    ticketsResolved: integer('tickets_resolved').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    orgIdIdx: index('performance_metrics_org_id_idx').on(table.organizationId),
    periodIdx: index('performance_metrics_period_idx').on(table.period),
    periodStartIdx: index('performance_metrics_period_start_idx').on(table.periodStart),
  }),
)

export const teamPerformance = pgTable(
  'team_performance',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    representativeId: uuid('representative_id')
      .notNull()
      .references(() => representatives.id, { onDelete: 'cascade' }),
    period: metricPeriodEnum('period').notNull(),
    periodStart: timestamp('period_start').notNull(),
    periodEnd: timestamp('period_end').notNull(),
    ticketsHandled: integer('tickets_handled').notNull().default(0),
    avgResponseTime: integer('avg_response_time').notNull().default(0),
    resolutionRate: decimal('resolution_rate', { precision: 5, scale: 2 })
      .notNull()
      .default('0.00'),
    customerSatisfaction: decimal('customer_satisfaction', { precision: 3, scale: 2 })
      .notNull()
      .default('0.00'),
    trend: performanceTrendEnum('trend').notNull().default('STABLE'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    orgIdIdx: index('team_performance_org_id_idx').on(table.organizationId),
    repIdIdx: index('team_performance_rep_id_idx').on(table.representativeId),
    periodIdx: index('team_performance_period_idx').on(table.period),
    periodStartIdx: index('team_performance_period_start_idx').on(table.periodStart),
  }),
)

// ============================================================================
// RELATIONS
// ============================================================================

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  representatives: many(representatives),
  customerProfiles: many(customerProfiles),
  tickets: many(tickets),
  escalations: many(escalations),
  refunds: many(refunds),
  budgets: many(budgets),
  agentConfigurations: many(agentConfigurations),
  decisionRules: many(decisionRules),
  performanceMetrics: many(performanceMetrics),
  teamPerformance: many(teamPerformance),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  representative: one(representatives),
  customerProfile: one(customerProfiles),
  tickets: many(tickets),
  escalations: many(escalations),
  refunds: many(refunds),
}))

export const representativesRelations = relations(representatives, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [representatives.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [representatives.userId],
    references: [users.id],
  }),
  assignedTickets: many(tickets),
  assignedEscalations: many(escalations),
  approvedRefunds: many(refunds),
  teamPerformance: many(teamPerformance),
}))

export const customerProfilesRelations = relations(customerProfiles, ({ one }) => ({
  organization: one(organizations, {
    fields: [customerProfiles.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [customerProfiles.userId],
    references: [users.id],
  }),
}))

export const ticketsRelations = relations(tickets, ({ one }) => ({
  organization: one(organizations, {
    fields: [tickets.organizationId],
    references: [organizations.id],
  }),
  customer: one(users, {
    fields: [tickets.customerId],
    references: [users.id],
  }),
  assignee: one(representatives, {
    fields: [tickets.assignedTo],
    references: [representatives.id],
  }),
}))

export const escalationsRelations = relations(escalations, ({ one }) => ({
  organization: one(organizations, {
    fields: [escalations.organizationId],
    references: [organizations.id],
  }),
  customer: one(users, {
    fields: [escalations.customerId],
    references: [users.id],
  }),
  assignee: one(representatives, {
    fields: [escalations.assignedTo],
    references: [representatives.id],
  }),
}))

export const refundsRelations = relations(refunds, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [refunds.organizationId],
    references: [organizations.id],
  }),
  customer: one(users, {
    fields: [refunds.customerId],
    references: [users.id],
  }),
  approver: one(representatives, {
    fields: [refunds.approvedBy],
    references: [representatives.id],
  }),
  budgetUsageRecords: many(budgetUsageRecords),
}))

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [budgets.organizationId],
    references: [organizations.id],
  }),
  usageRecords: many(budgetUsageRecords),
}))

export const budgetUsageRecordsRelations = relations(budgetUsageRecords, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetUsageRecords.budgetId],
    references: [budgets.id],
  }),
  refund: one(refunds, {
    fields: [budgetUsageRecords.refundId],
    references: [refunds.id],
  }),
  approver: one(representatives, {
    fields: [budgetUsageRecords.approvedBy],
    references: [representatives.id],
  }),
}))

export const agentConfigurationsRelations = relations(agentConfigurations, ({ one }) => ({
  organization: one(organizations, {
    fields: [agentConfigurations.organizationId],
    references: [organizations.id],
  }),
}))

export const decisionRulesRelations = relations(decisionRules, ({ one }) => ({
  organization: one(organizations, {
    fields: [decisionRules.organizationId],
    references: [organizations.id],
  }),
}))

export const performanceMetricsRelations = relations(performanceMetrics, ({ one }) => ({
  organization: one(organizations, {
    fields: [performanceMetrics.organizationId],
    references: [organizations.id],
  }),
}))

export const teamPerformanceRelations = relations(teamPerformance, ({ one }) => ({
  organization: one(organizations, {
    fields: [teamPerformance.organizationId],
    references: [organizations.id],
  }),
  representative: one(representatives, {
    fields: [teamPerformance.representativeId],
    references: [representatives.id],
  }),
}))

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Organization = typeof organizations.$inferSelect
export type User = typeof users.$inferSelect
export type Representative = typeof representatives.$inferSelect
export type CustomerProfile = typeof customerProfiles.$inferSelect
export type Ticket = typeof tickets.$inferSelect
export type Escalation = typeof escalations.$inferSelect
export type Refund = typeof refunds.$inferSelect
export type Budget = typeof budgets.$inferSelect
export type BudgetUsageRecord = typeof budgetUsageRecords.$inferSelect
export type AgentConfiguration = typeof agentConfigurations.$inferSelect
export type DecisionRule = typeof decisionRules.$inferSelect
export type PerformanceMetric = typeof performanceMetrics.$inferSelect
export type TeamPerformance = typeof teamPerformance.$inferSelect
