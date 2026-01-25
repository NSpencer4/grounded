import { z } from 'zod'

export const MetricPeriodSchema = z.enum(['HOUR', 'DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'])

export const KPIMetricSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  unit: z.string().optional(),
  change: z.number().optional(),
  changePercentage: z.number().optional(),
  isPositiveTrend: z.boolean().optional(),
  description: z.string().optional(),
})

export const TeamPerformanceSchema = z.object({
  representativeId: z.string().uuid(),
  representativeName: z.string(),
  ticketsHandled: z.number().int().min(0),
  avgResponseTime: z.number().positive(), // in seconds
  resolutionRate: z.number().min(0).max(100),
  customerSatisfaction: z.number().min(0).max(5),
  trend: z.enum(['UP', 'DOWN', 'STABLE']),
  period: MetricPeriodSchema,
  periodStart: z.date(),
  periodEnd: z.date(),
})

export const PerformanceMetricsSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  period: MetricPeriodSchema,
  periodStart: z.date(),
  periodEnd: z.date(),
  metrics: z.object({
    totalChats: z.number().int().min(0),
    activeChats: z.number().int().min(0),
    avgResponseTime: z.number().positive(),
    firstContactResolution: z.number().min(0).max(100),
    customerSatisfaction: z.number().min(0).max(5),
    escalationRate: z.number().min(0).max(100),
    aiResolutionRate: z.number().min(0).max(100),
    ticketsResolved: z.number().int().min(0),
  }),
  createdAt: z.date(),
})

export const TicketCategoryStatsSchema = z.object({
  label: z.string(),
  value: z.number().int().min(0),
  percentage: z.number().min(0).max(100),
})

export type KPIMetric = z.infer<typeof KPIMetricSchema>
export type TeamPerformance = z.infer<typeof TeamPerformanceSchema>
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>
export type MetricPeriod = z.infer<typeof MetricPeriodSchema>
export type TicketCategoryStats = z.infer<typeof TicketCategoryStatsSchema>
