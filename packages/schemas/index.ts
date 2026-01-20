import { z } from 'zod'

export const RecordMetadataSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type RecordMetadata = z.infer<typeof RecordMetadataSchema>

export const UserRoleSchema = z.enum(['CUSTOMER', 'REPRESENTATIVE', 'ADMIN'])

export const UserSchema = RecordMetadataSchema.extend(
  z.object({
    id: z.uuid(),
    name: z.string().min(1),
    email: z.email(),
    role: UserRoleSchema,
  }),
)

export type User = z.infer<typeof UserSchema>

export const ConversationStatusSchema = z.enum(['WAITING', 'ACTIVE', 'CLOSED'])
export const OutboxStatus = z.enum(['PENDING', 'COMPLETED'])

export const BaseEventSchema = z.object({
  event: z.object({
    id: z.uuid(),
    type: z.string(),
    schemaVersion: z.string(),
  }),
  metadata: z.object({
    createdAt: z.date(),
    updatedAt: z.date(),
    correlationId: z.string(),
  }),
  actionContext: z.object({
    action: z.string(),
    actionBy: z.string(),
  }),
  outbox: z.object({
    status: z.string(),
  }),
})

export const ConversationEventSchema = BaseEventSchema.extend({
  customer: z.object({
    user: z.object({
      id: z.string().uuid(),
    }),
  }),
  conversation: z.object({
    id: z.string().uuid(),
    status: z.string(), // "active" by default in Ruby
  }),
})

export type ConversationEvent = z.infer<typeof ConversationEventSchema>

export const ConversationSchema = RecordMetadataSchema.extend(
  z.object({
    id: z.uuid(),
    customerId: z.uuid(),
    representativeId: z.uuid().optional(),
    status: ConversationStatusSchema,
    closedAt: z.date().optional(),
  }),
)

export type Index = z.infer<typeof ConversationSchema>

export const MessageSchema = RecordMetadataSchema.extend(
  z.object({
    id: z.uuid(),
    conversationId: z.uuid(),
    senderId: z.uuid(),
    content: z.string().min(1),
  }),
)

export type Message = z.infer<typeof MessageSchema>
