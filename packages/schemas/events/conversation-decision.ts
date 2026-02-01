import { z } from 'zod'
import { BaseEventSchema, EventDetailsSchema, EventTypeSchema } from './base-event'
import { ConversationDecisionSchema } from '../models/conversation-decision'

export const DecisionEventSchema = BaseEventSchema.extend({
  event: EventDetailsSchema.extend({
    type: z.literal(EventTypeSchema.enum.MESSAGE_RECEIVED),
  }),
  decision: ConversationDecisionSchema,
})
export type DecisionEvent = z.infer<typeof DecisionEventSchema>
