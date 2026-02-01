import { z } from 'zod'
import { BaseEventSchema, EventDetailsSchema, EventTypeSchema } from './base-event'
import { ConversationSchema, MessageSchema } from '../index'

export const ConversationInitiatedEventSchema = BaseEventSchema.extend({
  event: EventDetailsSchema.extend({
    type: z.literal(EventTypeSchema.enum.CONVERSATION_INITIATED),
  }),
  conversation: ConversationSchema,
  message: MessageSchema,
})
export type ConversationInitiatedEvent = z.infer<typeof ConversationInitiatedEventSchema>
