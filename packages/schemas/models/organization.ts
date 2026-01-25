import { z } from 'zod'

export const OrganizationPlanSchema = z.enum(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'])

export const OrganizationStatusSchema = z.enum(['ACTIVE', 'SUSPENDED', 'TRIAL', 'CANCELLED'])

export const OrganizationSettingsSchema = z.object({
  autoEscalationEnabled: z.boolean(),
  aiResolutionEnabled: z.boolean(),
  refundAutoApprovalEnabled: z.boolean(),
  maxRefundPerUser: z.number().positive(),
  businessHours: z
    .object({
      timezone: z.string(),
      days: z.array(z.number().min(0).max(6)),
      startTime: z.string(),
      endTime: z.string(),
    })
    .optional(),
})

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  plan: OrganizationPlanSchema,
  status: OrganizationStatusSchema,
  settings: OrganizationSettingsSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  trialEndsAt: z.date().optional(),
  suspendedAt: z.date().optional(),
})

export type Organization = z.infer<typeof OrganizationSchema>
export type OrganizationPlan = z.infer<typeof OrganizationPlanSchema>
export type OrganizationStatus = z.infer<typeof OrganizationStatusSchema>
export type OrganizationSettings = z.infer<typeof OrganizationSettingsSchema>
