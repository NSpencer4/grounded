import { z } from 'zod'

export const EventMetadataSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  correlationId: z.string(),
})
export type EventMetadata = z.infer<typeof EventMetadataSchema>

export const EventTypeSchema = z.enum([
  // conversation command events
  'CONVERSATION_INITIATED',
  'MESSAGE_RECEIVED',

  // conversation evaluation events
  'CONVERSATION_EVALUATION',

  // agent result events
  'CUSTOMER_SPEND_ANALYSIS',
  'RESPONSE_RECOMMENDATION',
])
export type EventType = z.infer<typeof EventTypeSchema>

export const ActionSchema = z.enum(['CREATE'])
export type Action = z.infer<typeof ActionSchema>

export const EventDetailsSchema = z.object({
  id: z.string().uuid(),
  type: EventTypeSchema,
  schemaVersion: z.string(),
})

export const ActionContextSchema = z.object({
  action: ActionSchema,
  actionBy: z.string(),
})

export const BaseEventSchema = z.object({
  event: EventDetailsSchema,
  actionContext: ActionContextSchema,
  metadata: EventMetadataSchema,
})
