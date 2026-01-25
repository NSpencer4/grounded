import { z } from 'zod'
import { UserSchema } from './user'
import { ConversationSchema } from './conversation'

export const TicketStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED'])

export const TicketPrioritySchema = z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT'])

export const TicketCategorySchema = z.enum([
  'TECHNICAL_ISSUE',
  'BILLING_PAYMENT',
  'ACCOUNT_MANAGEMENT',
  'FEATURE_REQUEST',
  'BUG_REPORT',
  'OTHER',
])

export const TicketSchema = z.object({
  id: z.string().uuid(),
  ticketNumber: z.string(),
  conversationId: z.string().uuid().optional(),
  conversation: ConversationSchema.pick({ id: true }).optional(),
  customerId: z.string().uuid(),
  customer: UserSchema.pick({ id: true, name: true, email: true }),
  assignedTo: z.string().uuid().optional(),
  assignee: UserSchema.pick({ id: true, name: true }).optional(),
  subject: z.string().min(1),
  description: z.string(),
  status: TicketStatusSchema,
  priority: TicketPrioritySchema,
  category: TicketCategorySchema,
  tags: z.array(z.string()).optional(),
  aiHandled: z.boolean(),
  sentiment: z.number().min(-1).max(1).optional(),
  estimatedResolutionTime: z.number().int().positive().optional(), // in seconds
  actualResolutionTime: z.number().int().positive().optional(), // in seconds
  customerSatisfactionScore: z.number().min(1).max(5).optional(),
  internalNotes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  resolvedAt: z.date().optional(),
  closedAt: z.date().optional(),
})

export type Ticket = z.infer<typeof TicketSchema>
export type TicketStatus = z.infer<typeof TicketStatusSchema>
export type TicketPriority = z.infer<typeof TicketPrioritySchema>
export type TicketCategory = z.infer<typeof TicketCategorySchema>
