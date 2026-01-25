import { and, eq } from 'drizzle-orm'
import { schema } from '../db'
import { RouteContext, RouteResult } from '../types'
import {
  validateUUID,
  validateRequest,
  requireOrganizationId,
  parsePaginationParams,
} from '../middleware/validation'
import { CreateUserSchema, UpdateUserSchema } from '../schemas/requests'

/**
 * GET /organizations/:orgId/users
 */
export async function listUsers(
  orgId: string,
  query: Record<string, string | undefined>,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)

  const { limit, offset } = parsePaginationParams(query)

  const users = await ctx.db.query.users.findMany({
    where: eq(schema.users.organizationId, orgId),
    limit,
    offset,
  })

  return {
    status: 200,
    body: {
      data: users,
      meta: { limit, offset },
    },
  }
}

/**
 * GET /organizations/:orgId/users/:id
 */
export async function getUser(orgId: string, id: string, ctx: RouteContext): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid user ID format' } }
  }

  const user = await ctx.db.query.users.findFirst({
    where: and(eq(schema.users.id, id), eq(schema.users.organizationId, orgId)),
  })

  if (!user) {
    return { status: 404, body: { error: 'User not found' } }
  }

  return { status: 200, body: { data: user } }
}

/**
 * POST /organizations/:orgId/users
 */
export async function createUser(
  orgId: string,
  body: unknown,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)

  const validation = validateRequest(CreateUserSchema, body)

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

  const [user] = await ctx.db
    .insert(schema.users)
    .values({
      organizationId: orgId,
      name: data.name,
      email: data.email,
      role: data.role,
    })
    .returning()

  return { status: 201, body: { data: user } }
}

/**
 * PATCH /organizations/:orgId/users/:id
 */
export async function updateUser(
  orgId: string,
  id: string,
  body: unknown,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid user ID format' } }
  }

  const validation = validateRequest(UpdateUserSchema, body)

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

  const [user] = await ctx.db
    .update(schema.users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.users.id, id), eq(schema.users.organizationId, orgId)))
    .returning()

  if (!user) {
    return { status: 404, body: { error: 'User not found' } }
  }

  return { status: 200, body: { data: user } }
}

/**
 * DELETE /organizations/:orgId/users/:id
 */
export async function deleteUser(
  orgId: string,
  id: string,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid user ID format' } }
  }

  const [deleted] = await ctx.db
    .delete(schema.users)
    .where(and(eq(schema.users.id, id), eq(schema.users.organizationId, orgId)))
    .returning()

  if (!deleted) {
    return { status: 404, body: { error: 'User not found' } }
  }

  return { status: 200, body: { data: { deleted: true, id } } }
}
