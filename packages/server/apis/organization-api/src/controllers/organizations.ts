import { eq } from 'drizzle-orm'
import { schema } from '../db'
import { RouteContext, RouteResult } from '../types'
import { validateUUID, validateRequest } from '../middleware/validation'
import { CreateOrganizationSchema, UpdateOrganizationSchema } from '../schemas/requests'

/**
 * GET /organizations/:id
 */
export async function getOrganization(id: string, ctx: RouteContext): Promise<RouteResult> {
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid organization ID format' } }
  }

  const org = await ctx.db.query.organizations.findFirst({
    where: eq(schema.organizations.id, id),
  })

  if (!org) {
    return { status: 404, body: { error: 'Organization not found' } }
  }

  return { status: 200, body: { data: org } }
}

/**
 * POST /organizations
 */
export async function createOrganization(body: unknown, ctx: RouteContext): Promise<RouteResult> {
  const validation = validateRequest(CreateOrganizationSchema, body)

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

  const [org] = await ctx.db
    .insert(schema.organizations)
    .values({
      name: data.name,
      slug: data.slug,
      plan: data.plan,
      status: data.status,
      settings: data.settings || {},
      metadata: data.metadata,
    })
    .returning()

  return { status: 201, body: { data: org } }
}

/**
 * PATCH /organizations/:id
 */
export async function updateOrganization(
  id: string,
  body: unknown,
  ctx: RouteContext,
): Promise<RouteResult> {
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid organization ID format' } }
  }

  const validation = validateRequest(UpdateOrganizationSchema, body)

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

  // Check if any fields to update
  const hasUpdates = Object.keys(data).length > 0
  if (!hasUpdates) {
    return { status: 400, body: { error: 'No fields to update' } }
  }

  const [org] = await ctx.db
    .update(schema.organizations)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(schema.organizations.id, id))
    .returning()

  if (!org) {
    return { status: 404, body: { error: 'Organization not found' } }
  }

  return { status: 200, body: { data: org } }
}

/**
 * DELETE /organizations/:id
 */
export async function deleteOrganization(id: string, ctx: RouteContext): Promise<RouteResult> {
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid organization ID format' } }
  }

  const [deleted] = await ctx.db
    .delete(schema.organizations)
    .where(eq(schema.organizations.id, id))
    .returning()

  if (!deleted) {
    return { status: 404, body: { error: 'Organization not found' } }
  }

  return { status: 200, body: { data: { deleted: true, id } } }
}
