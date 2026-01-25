import { z } from 'zod'
import { UserSchema } from './user'

export const RefundReasonSchema = z.enum([
  'AI_BUG',
  'SERVICE_DOWNTIME',
  'UX_ISSUE',
  'BILLING_ERROR',
  'CUSTOMER_REQUEST',
  'OTHER',
])

export const RefundStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'])

export const RefundSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string(),
  customerId: z.string().uuid(),
  customer: UserSchema.pick({ id: true, name: true, email: true }),
  amount: z.number().positive(),
  reason: RefundReasonSchema,
  status: RefundStatusSchema,
  notes: z.string().optional(),
  approvedBy: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  processedAt: z.date().optional(),
})

export type Refund = z.infer<typeof RefundSchema>
export type RefundReason = z.infer<typeof RefundReasonSchema>
export type RefundStatus = z.infer<typeof RefundStatusSchema>
