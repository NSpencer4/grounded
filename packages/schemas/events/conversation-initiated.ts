import { z } from 'zod'
import { BaseEventSchema } from './base-event'
import { ConversationSchema, MessageSchema } from '../index'

export const ConversationInitiatedEventSchema = BaseEventSchema.extend(
  z.object({
    conversation: ConversationSchema,
    message: MessageSchema.optional(),
  }),
)
export type ConversationInitiatedEvent = z.infer<typeof ConversationInitiatedEventSchema>
