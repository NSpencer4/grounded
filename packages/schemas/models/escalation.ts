import { z } from 'zod'
import { UserSchema } from './user'
import { ConversationSchema } from './conversation'

export const EscalationPrioritySchema = z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL'])

export const EscalationStatusSchema = z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'])

export const EscalationReasonSchema = z.enum([
  'AI_UNABLE_TO_RESOLVE',
  'CUSTOMER_REQUEST',
  'NEGATIVE_SENTIMENT',
  'TECHNICAL_ISSUE',
  'BILLING_DISPUTE',
  'HIGH_VALUE_CUSTOMER',
  'OTHER',
])

export const EscalationSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  conversation: ConversationSchema.pick({ id: true }).optional(),
  customerId: z.string().uuid(),
  customer: UserSchema.pick({ id: true, name: true, email: true }),
  assignedTo: z.string().uuid().optional(),
  assignee: UserSchema.pick({ id: true, name: true }).optional(),
  priority: EscalationPrioritySchema,
  status: EscalationStatusSchema,
  reason: EscalationReasonSchema,
  issueDescription: z.string(),
  waitTime: z.number().int().min(0), // in seconds
  notes: z.string().optional(),
  aiSummary: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  assignedAt: z.date().optional(),
  resolvedAt: z.date().optional(),
})

export type Escalation = z.infer<typeof EscalationSchema>
export type EscalationPriority = z.infer<typeof EscalationPrioritySchema>
export type EscalationStatus = z.infer<typeof EscalationStatusSchema>
export type EscalationReason = z.infer<typeof EscalationReasonSchema>
