import { RecordMetadataSchema } from '../index'
import { z } from 'zod'

export const RecordMetadataSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type RecordMetadata = z.infer<typeof RecordMetadataSchema>
export const OutboxStatusSchema = z.enum(['PENDING', 'COMPLETED'])

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
    status: OutboxStatusSchema,
  }),
})
