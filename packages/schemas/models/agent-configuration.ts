import { z } from 'zod'

export const AgentStatusSchema = z.enum(['ACTIVE', 'PAUSED', 'DISABLED'])

export const AgentTypeSchema = z.enum([
  'RESPONSE_RECOMMENDATION',
  'CUSTOMER_SPEND',
  'SENTIMENT_ANALYSIS',
  'ESCALATION_PREDICTOR',
  'CUSTOM',
])

export const AgentThresholdsSchema = z.record(z.string(), z.union([z.number(), z.string()]))

export const AgentConfigurationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: AgentTypeSchema,
  description: z.string(),
  enabled: z.boolean(),
  status: AgentStatusSchema,
  assertions: z.number().int().min(0),
  accuracy: z.number().min(0).max(100),
  avgLatency: z.number().positive(), // in milliseconds
  dataSources: z.array(z.string()),
  thresholds: AgentThresholdsSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastRunAt: z.date().optional(),
})

export type AgentConfiguration = z.infer<typeof AgentConfigurationSchema>
export type AgentStatus = z.infer<typeof AgentStatusSchema>
export type AgentType = z.infer<typeof AgentTypeSchema>
export type AgentThresholds = z.infer<typeof AgentThresholdsSchema>
