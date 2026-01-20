import { z } from 'zod'
import { BaseEventSchema, EventDetailsSchema } from './base-event'

export const AgentResultTypeSchema = z.enum([
  'CUSTOMER_SPEND_ANALYSIS',
  'RESPONSE_RECOMMENDATION',
])
export type AgentResultType = z.infer<typeof AgentResultTypeSchema>

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
})

export const AgentResultSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  metadata: AgentMetadataSchema,
})

export const AgentResultEventSchema = BaseEventSchema.extend({
  event: EventDetailsSchema.extend({
    type: z.literal('AGENT_RESULT'),
  }),
  agentResultType: AgentResultTypeSchema,
  conversationId: z.string().uuid(),
  messageId: z.string().uuid().optional(),
  result: AgentResultSchema,
})

export type AgentResultEvent = z.infer<typeof AgentResultEventSchema>
