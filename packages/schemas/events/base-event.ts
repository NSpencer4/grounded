import { z } from 'zod'

export const EventMetadataSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  correlationId: z.string(),
})
export type EventMetadata = z.infer<typeof EventMetadataSchema>

export const EventTypeSchema = z.enum(['CONVERSATION_INITIATED', 'MESSAGE_RECEIVED'])
export type EventType = z.infer<typeof EventTypeSchema>

export const EventDetailsSchema = z.object({
  id: z.uuid(),
  type: EventTypeSchema,
  schemaVersion: z.string(),
})

export const ActionContextSchema = z.object({
  action: z.string(),
  actionBy: z.string(),
})

export const ConversationStatusSchema = z.enum(['WAITING', 'ACTIVE', 'CLOSED'])
export type ConversationStatus = z.infer<typeof ConversationStatusSchema>

export const BaseEventSchema = z.object({
  event: EventDetailsSchema,
  actionContext: ActionContextSchema,
  metadata: EventMetadataSchema,
})
