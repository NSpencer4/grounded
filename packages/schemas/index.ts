import { z } from 'zod'

export const OutboxStatusSchema = z.enum(['PENDING', 'COMPLETED'])
export type OutboxStatus = z.infer<typeof OutboxStatusSchema>
export const OutboxSchema = z.object({
  status: OutboxStatusSchema,
})
export const UserRoleSchema = z.enum(['CUSTOMER', 'REPRESENTATIVE', 'ADMIN'])

export const UserSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  email: z.email(),
  role: UserRoleSchema,
})

export type User = z.infer<typeof UserSchema>

export const ConversationStatusSchema = z.enum(['WAITING', 'ACTIVE', 'CLOSED'])

export const ConversationSchema = z.object({
  id: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  state: z.object({
    status: ConversationStatusSchema,
    closedAt: z.date().optional(),
  }),
  customer: z.object({
    user: UserSchema,
  }),
  assignee: z.object({
    user: UserSchema,
  }),
})

export type Conversation = z.infer<typeof ConversationSchema>

export const MessageSentFromSchema = z.object({
  user: UserSchema.pick({ id: true, name: true, role: true }),
})

export const MessageSchema = z.object({
  id: z.uuid(),
  conversation: ConversationSchema.pick({ id: true }),
  createdAt: z.date(),
  updatedAt: z.date(),
  sender: MessageSentFromSchema,
  details: z.object({
    content: z.string().min(1),
  }),
})

export type Message = z.infer<typeof MessageSchema>
