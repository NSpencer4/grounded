import { z } from 'zod'
import { UserSchema } from './user'

export const AccountTierSchema = z.enum(['FREE', 'STARTER', 'PRO', 'ENTERPRISE'])

export const AccountStandingSchema = z.enum(['GOOD', 'WARNING', 'SUSPENDED', 'CLOSED'])

export const BillingInfoSchema = z.object({
  lastBillingDate: z.date(),
  nextBillingDate: z.date(),
  billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  amount: z.number().positive(),
})

export const UsageStatsSchema = z.object({
  tokenBalance: z.number().int().min(0),
  tokenLimit: z.number().int().positive(),
  activeSites: z.number().int().min(0),
  sitesLimit: z.number().int().positive(),
})

export const CustomerContextSchema = z.object({
  browser: z.string().optional(),
  os: z.string().optional(),
  location: z.string().optional(),
  device: z.string().optional(),
  ipAddress: z.string().optional(),
})

export const CustomerProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  user: UserSchema.pick({ id: true, name: true, email: true }),
  tier: AccountTierSchema,
  standing: AccountStandingSchema,
  joinedAt: z.date(),
  lifetimeValue: z.number().min(0),
  billing: BillingInfoSchema,
  usage: UsageStatsSchema,
  context: CustomerContextSchema.optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type CustomerProfile = z.infer<typeof CustomerProfileSchema>
export type AccountTier = z.infer<typeof AccountTierSchema>
export type AccountStanding = z.infer<typeof AccountStandingSchema>
export type BillingInfo = z.infer<typeof BillingInfoSchema>
export type UsageStats = z.infer<typeof UsageStatsSchema>
export type CustomerContext = z.infer<typeof CustomerContextSchema>
