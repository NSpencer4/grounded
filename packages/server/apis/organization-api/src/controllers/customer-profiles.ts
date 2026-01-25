import { and, eq } from 'drizzle-orm'
import { schema } from '../db'
import { RouteContext, RouteResult } from '../types'
import {
  validateUUID,
  validateRequest,
  requireOrganizationId,
  parsePaginationParams,
} from '../middleware/validation'
import { CreateCustomerProfileSchema, UpdateCustomerProfileSchema } from '../schemas/requests'

export async function listCustomerProfiles(
  orgId: string,
  query: Record<string, string | undefined>,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  const { limit, offset } = parsePaginationParams(query)

  const profiles = await ctx.db.query.customerProfiles.findMany({
    where: eq(schema.customerProfiles.organizationId, orgId),
    limit,
    offset,
    with: {
      user: true,
    },
  })

  return { status: 200, body: { data: profiles, meta: { limit, offset } } }
}

export async function getCustomerProfile(
  orgId: string,
  id: string,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid profile ID format' } }
  }

  const profile = await ctx.db.query.customerProfiles.findFirst({
    where: and(
      eq(schema.customerProfiles.id, id),
      eq(schema.customerProfiles.organizationId, orgId),
    ),
    with: {
      user: true,
    },
  })

  if (!profile) {
    return { status: 404, body: { error: 'Customer profile not found' } }
  }

  return { status: 200, body: { data: profile } }
}

export async function createCustomerProfile(
  orgId: string,
  body: unknown,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)

  const validation = validateRequest(CreateCustomerProfileSchema, body)

  if (!validation.success || !validation.data) {
    return {
      status: 400,
      body: {
        error: 'Validation failed',
        details: validation.errors,
      },
    }
  }

  const data = validation.data

  const [profile] = await ctx.db
    .insert(schema.customerProfiles)
    .values({
      organizationId: orgId,
      userId: data.userId,
      tier: data.tier,
      standing: data.standing,
      lifetimeValue: data.lifetimeValue,
      lastBillingDate: data.lastBillingDate ? new Date(data.lastBillingDate) : undefined,
      nextBillingDate: data.nextBillingDate ? new Date(data.nextBillingDate) : undefined,
      billingCycle: data.billingCycle,
      billingAmount: data.billingAmount,
      tokenBalance: data.tokenBalance,
      tokenLimit: data.tokenLimit,
      activeSites: data.activeSites,
      sitesLimit: data.sitesLimit,
      context: data.context,
      preferences: data.preferences,
      metadata: data.metadata,
    })
    .returning()

  return { status: 201, body: { data: profile } }
}

export async function updateCustomerProfile(
  orgId: string,
  id: string,
  body: unknown,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid profile ID format' } }
  }

  const validation = validateRequest(UpdateCustomerProfileSchema, body)

  if (!validation.success || !validation.data) {
    return {
      status: 400,
      body: {
        error: 'Validation failed',
        details: validation.errors,
      },
    }
  }

  const data = validation.data
  const updateData: any = {
    ...data,
    updatedAt: new Date(),
  }

  // Convert date strings to Date objects
  if (data.lastBillingDate) {
    updateData.lastBillingDate = new Date(data.lastBillingDate)
  }
  if (data.nextBillingDate) {
    updateData.nextBillingDate = new Date(data.nextBillingDate)
  }

  const [profile] = await ctx.db
    .update(schema.customerProfiles)
    .set(updateData)
    .where(
      and(eq(schema.customerProfiles.id, id), eq(schema.customerProfiles.organizationId, orgId)),
    )
    .returning()

  if (!profile) {
    return { status: 404, body: { error: 'Customer profile not found' } }
  }

  return { status: 200, body: { data: profile } }
}

export async function deleteCustomerProfile(
  orgId: string,
  id: string,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid profile ID format' } }
  }

  const [deleted] = await ctx.db
    .delete(schema.customerProfiles)
    .where(
      and(eq(schema.customerProfiles.id, id), eq(schema.customerProfiles.organizationId, orgId)),
    )
    .returning()

  if (!deleted) {
    return { status: 404, body: { error: 'Customer profile not found' } }
  }

  return { status: 200, body: { data: { deleted: true, id } } }
}
