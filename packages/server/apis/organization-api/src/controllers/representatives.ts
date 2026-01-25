import { and, eq } from 'drizzle-orm'
import { schema } from '../db'
import { RouteContext, RouteResult } from '../types'
import {
  validateUUID,
  validateRequest,
  requireOrganizationId,
  parsePaginationParams,
} from '../middleware/validation'
import { CreateRepresentativeSchema, UpdateRepresentativeSchema } from '../schemas/requests'

/**
 * GET /organizations/:orgId/representatives
 */
export async function listRepresentatives(
  orgId: string,
  query: Record<string, string | undefined>,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)

  const { limit, offset } = parsePaginationParams(query)

  const reps = await ctx.db.query.representatives.findMany({
    where: eq(schema.representatives.organizationId, orgId),
    limit,
    offset,
    with: {
      user: true,
    },
  })

  return {
    status: 200,
    body: {
      data: reps,
      meta: { limit, offset },
    },
  }
}

/**
 * GET /organizations/:orgId/representatives/:id
 */
export async function getRepresentative(
  orgId: string,
  id: string,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid representative ID format' } }
  }

  const rep = await ctx.db.query.representatives.findFirst({
    where: and(eq(schema.representatives.id, id), eq(schema.representatives.organizationId, orgId)),
    with: {
      user: true,
      teamPerformance: {
        limit: 5,
      },
    },
  })

  if (!rep) {
    return { status: 404, body: { error: 'Representative not found' } }
  }

  return { status: 200, body: { data: rep } }
}

/**
 * POST /organizations/:orgId/representatives
 */
export async function createRepresentative(
  orgId: string,
  body: unknown,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)

  const validation = validateRequest(CreateRepresentativeSchema, body)

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

  const [rep] = await ctx.db
    .insert(schema.representatives)
    .values({
      organizationId: orgId,
      userId: data.userId,
      role: data.role,
      status: data.status,
      activeChats: data.activeChats,
      maxChats: data.maxChats,
      rating: data.rating,
    })
    .returning()

  return { status: 201, body: { data: rep } }
}

/**
 * PATCH /organizations/:orgId/representatives/:id
 */
export async function updateRepresentative(
  orgId: string,
  id: string,
  body: unknown,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid representative ID format' } }
  }

  const validation = validateRequest(UpdateRepresentativeSchema, body)

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

  // Auto-update lastActiveAt when status changes to ONLINE/AWAY
  if (data.status === 'ONLINE' || data.status === 'AWAY') {
    updateData.lastActiveAt = new Date()
  }

  const [rep] = await ctx.db
    .update(schema.representatives)
    .set(updateData)
    .where(and(eq(schema.representatives.id, id), eq(schema.representatives.organizationId, orgId)))
    .returning()

  if (!rep) {
    return { status: 404, body: { error: 'Representative not found' } }
  }

  return { status: 200, body: { data: rep } }
}

/**
 * DELETE /organizations/:orgId/representatives/:id
 */
export async function deleteRepresentative(
  orgId: string,
  id: string,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid representative ID format' } }
  }

  const [deleted] = await ctx.db
    .delete(schema.representatives)
    .where(and(eq(schema.representatives.id, id), eq(schema.representatives.organizationId, orgId)))
    .returning()

  if (!deleted) {
    return { status: 404, body: { error: 'Representative not found' } }
  }

  return { status: 200, body: { data: { deleted: true, id } } }
}
