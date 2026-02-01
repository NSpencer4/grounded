import z from 'zod'
import { UserSchema } from './user'

export const ConversationStatusSchema = z.enum(['WAITING', 'ACTIVE', 'CLOSED'])

export const ConversationSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  state: z.object({
    status: ConversationStatusSchema,
    closedAt: z.date().optional(),
  }),
  customer: z.object({
    user: UserSchema,
  }),
  assignee: z
    .object({
      user: UserSchema,
    })
    .nullable(),
})

export type Conversation = z.infer<typeof ConversationSchema>
