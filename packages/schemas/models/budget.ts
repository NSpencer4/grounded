import { z } from 'zod'

export const BudgetPeriodSchema = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'])

export const BudgetTypeSchema = z.enum(['REFUND', 'COMPENSATION', 'DISCOUNT', 'CREDIT'])

export const BudgetAlertThresholdSchema = z.object({
  percentage: z.number().min(0).max(100),
  enabled: z.boolean(),
})

export const BudgetSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  type: BudgetTypeSchema,
  period: BudgetPeriodSchema,
  limit: z.number().positive(),
  spent: z.number().min(0),
  remaining: z.number().min(0),
  alertThresholds: z.array(BudgetAlertThresholdSchema),
  autoAlertsEnabled: z.boolean(),
  refundLimitPerUser: z.number().positive().optional(),
  periodStart: z.date(),
  periodEnd: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const BudgetUsageRecordSchema = z.object({
  id: z.string().uuid(),
  budgetId: z.string().uuid(),
  amount: z.number().positive(),
  refundId: z.string().uuid().optional(),
  reason: z.string().optional(),
  approvedBy: z.string().uuid().optional(),
  createdAt: z.date(),
})

export type Budget = z.infer<typeof BudgetSchema>
export type BudgetPeriod = z.infer<typeof BudgetPeriodSchema>
export type BudgetType = z.infer<typeof BudgetTypeSchema>
export type BudgetAlertThreshold = z.infer<typeof BudgetAlertThresholdSchema>
export type BudgetUsageRecord = z.infer<typeof BudgetUsageRecordSchema>
