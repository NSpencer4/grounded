import { z } from 'zod'

export const OutboxStatusSchema = z.enum(['PENDING', 'COMPLETED'])
export type OutboxStatus = z.infer<typeof OutboxStatusSchema>
export const OutboxSchema = z.object({
  status: OutboxStatusSchema,
})
