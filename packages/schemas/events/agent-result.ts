import { z } from 'zod'
import { BaseEventSchema, EventDetailsSchema } from './base-event'
import { ConversationSchema } from '../models/conversation'
import { MessageSchema } from '../models/message'

export const AgentResultTypeSchema = z.enum(['CUSTOMER_SPEND_ANALYSIS', 'RESPONSE_RECOMMENDATION'])
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

export const AgentSchema = z.object({
  result: AgentResultSchema,
})

export const AgentResultEventSchema = BaseEventSchema.extend({
  event: EventDetailsSchema.extend({
    type: z.literal('CUSTOMER_SPEND_ANALYSIS'),
  }),
  conversation: ConversationSchema.pick({ id: true }),
  message: MessageSchema.pick({ id: true }),
  agent: AgentSchema,
})

export type AgentResultEvent = z.infer<typeof AgentResultEventSchema>
