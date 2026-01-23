import z from 'zod'
import { ConversationSchema } from './conversation'
import { UserSchema } from './user'

export const MessageSentFromSchema = z.object({
  user: UserSchema.pick({ id: true, name: true, role: true }),
})

export const MessageSchema = z.object({
  id: z.string().uuid(),
  conversation: ConversationSchema.pick({ id: true }),
  createdAt: z.date(),
  updatedAt: z.date(),
  sender: MessageSentFromSchema,
  details: z.object({
    content: z.string().min(1),
  }),
})

export type Message = z.infer<typeof MessageSchema>
