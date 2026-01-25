import { z } from 'zod'

export const RepresentativeRoleSchema = z.enum([
  'JUNIOR_SUPPORT',
  'SENIOR_SUPPORT',
  'TEAM_LEAD',
  'ADMIN',
])

export const RepresentativeStatusSchema = z.enum(['ONLINE', 'AWAY', 'OFFLINE'])

export const RepresentativeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: RepresentativeRoleSchema,
  status: RepresentativeStatusSchema,
  activeChats: z.number().int().min(0),
  maxChats: z.number().int().positive(),
  rating: z.number().min(0).max(5),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastActiveAt: z.date().optional(),
})

export type Representative = z.infer<typeof RepresentativeSchema>
export type RepresentativeRole = z.infer<typeof RepresentativeRoleSchema>
export type RepresentativeStatus = z.infer<typeof RepresentativeStatusSchema>
