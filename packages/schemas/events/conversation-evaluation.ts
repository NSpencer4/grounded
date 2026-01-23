import { z } from 'zod'
import { BaseEventSchema, EventDetailsSchema, EventTypeSchema } from './base-event'
import { ConversationSchema, MessageSchema } from '../index'

export const EvaluationTypeSchema = z.enum([
  'ACTION_REQUIRED',
  'RESPONSE_RECOMMENDATION',
  'NO_ACTION',
])
export type EvaluationType = z.infer<typeof EvaluationTypeSchema>

export const ConversationEvaluationEventSchema = BaseEventSchema.extend({
  event: EventDetailsSchema.extend({
    type: z.literal(EventTypeSchema.enum.CONVERSATION_EVALUATION),
  }),
  conversation: ConversationSchema,
  message: MessageSchema.optional(),
  evaluation: z.object({
    type: EvaluationTypeSchema,
    reasoning: z.string().optional(),
    suggestedActions: z.array(z.string()).optional(),
  }),
})

export type ConversationEvaluationEvent = z.infer<typeof ConversationEvaluationEventSchema>
