import { z } from 'zod'
import { BaseEventSchema, EventDetailsSchema, EventTypeSchema } from './base-event'
import { ConversationSchema, MessageSchema } from '../index'

export const MessageReceivedEventSchema = BaseEventSchema.extend(
  z.object({
    event: z.object({
      ...EventDetailsSchema.pick({ id: true, schemaVersion: true }),
      type: EventTypeSchema.CONVERSATION_INITIATED,
    }),
    conversation: ConversationSchema,
    message: MessageSchema,
  }),
)
export type MessageReceivedEvent = z.infer<typeof MessageReceivedEventSchema>
