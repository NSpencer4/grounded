import { z } from 'zod'
import { BaseEventSchema } from './base-event'

export const OutboxStatusSchema = z.enum(['PENDING', 'SENT', 'FAILED'])
export type OutboxStatus = z.infer<typeof OutboxStatusSchema>

export const ConversationStatusSchema = z.enum(['WAITING', 'ACTIVE', 'CLOSED'])
export type ConversationStatus = z.infer<typeof ConversationStatusSchema>

export const EventTypeSchema = z.enum(['CONVERSATION_INITIATED', 'MESSAGE_RECEIVED'])
export type EventType = z.infer<typeof EventTypeSchema>

export const EventMetadataSchema = z.object({
  id: z.uuid(),
  type: EventTypeSchema,
  schemaVersion: z.string(),
})

export const AuditMetadataSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  correlationId: z.uuid(),
})

export const ActionContextSchema = z.object({
  action: z.string(),
  actionBy: z.string(),
})

export const OutboxSchema = z.object({
  status: OutboxStatusSchema,
})

export const CustomerSchema = z.object({
  user: z.object({
    id: z.string(),
  }),
})

export const ConversationStateSchema = z.object({
  id: z.uuid(),
  state: z.object({
    status: ConversationStatusSchema,
  }),
})

export const ConversationInitiatedEventSchema = BaseEventSchema.extend(
  z.object({
    customer: CustomerSchema,
    conversation: ConversationStateSchema,
  }),
)

export type ConversationInitiatedEvent = z.infer<typeof ConversationInitiatedEventSchema>
