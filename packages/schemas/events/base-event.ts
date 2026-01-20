import { z } from 'zod'

export const EventMetadataSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  correlationId: z.string(),
})
export type EventMetadata = z.infer<typeof EventMetadataSchema>
export const OutboxStatusSchema = z.enum(['PENDING', 'COMPLETED'])

export const BaseEventSchema = z.object({
  event: z.object({
    id: z.uuid(),
    type: z.string(),
    schemaVersion: z.string(),
  }),
  metadata: EventMetadataSchema,
  actionContext: z.object({
    action: z.string(),
    actionBy: z.string(),
  }),
  outbox: z
    .object({
      status: OutboxStatusSchema,
    })
    .optional(),
})
