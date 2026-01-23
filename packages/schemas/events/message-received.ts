import { z } from 'zod'
import { BaseEventSchema, EventDetailsSchema, EventTypeSchema } from './base-event'
import { ConversationSchema, MessageSchema } from '../index'

export const MessageReceivedEventSchema = BaseEventSchema.extend({
  event: EventDetailsSchema.extend({
    type: z.literal(EventTypeSchema.enum.MESSAGE_RECEIVED),
  }),
  conversation: ConversationSchema,
  message: MessageSchema,
})
export type MessageReceivedEvent = z.infer<typeof MessageReceivedEventSchema>
