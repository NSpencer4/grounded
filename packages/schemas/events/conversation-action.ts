import { z } from 'zod'
import { BaseEventSchema, EventDetailsSchema, EventTypeSchema } from './base-event'

export const ConversationActionEventSchema = BaseEventSchema.extend({
  event: EventDetailsSchema.extend({
    type: z.literal(EventTypeSchema.enum.MESSAGE_RECEIVED),
  }),
})
export type ConversationActionEvent = z.infer<typeof ConversationActionEventSchema>
