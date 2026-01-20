import { z } from 'zod'
import { BaseEventSchema } from './events/base-event'

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
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  state: z.object({
    status: ConversationStatusSchema,
    closedAt: z.date().optional(),
  }),
  customer: z.object({
    user: UserSchema,
  }),
  representative: z.object({
    user: UserSchema,
  }),
})

export type Conversation = z.infer<typeof ConversationSchema>

export const MessageSchema = z.object({
  id: z.uuid(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  sender: z.object({
    user: UserSchema.pick({ id: true, name: true, role: true }),
  }),
  details: z.object({
    content: z.string().min(1),
  }),
})

export type Message = z.infer<typeof MessageSchema>
