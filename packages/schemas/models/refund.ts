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

export const RefundTypeSchema = z.enum([
  'FULL_TOKEN_REFUND', // Full refund of tokens to balance
  'PARTIAL_TOKEN_REFUND', // Partial refund of tokens to balance
  'FULL_PAYMENT_REFUND', // Full refund to original payment method
  'PARTIAL_PAYMENT_REFUND', // Partial refund to original payment method
  'TOKEN_CREDIT', // Bonus tokens as goodwill (not tied to a specific charge)
])

export const RefundSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().optional(), // Optional - not needed for token credits
  customerId: z.string().uuid(),
  customer: UserSchema.pick({ id: true, name: true, email: true }),
  type: RefundTypeSchema,
  // For payment refunds: dollar amount. For token refunds: equivalent dollar value
  amount: z.number().min(0),
  // For token refunds/credits: number of tokens
  tokenAmount: z.number().int().min(0).optional(),
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
export type RefundType = z.infer<typeof RefundTypeSchema>
