import { and, eq, desc } from 'drizzle-orm'
import { schema } from '../db'
import { RouteContext, RouteResult } from '../types'
import {
  validateUUID,
  validateRequest,
  requireOrganizationId,
  parsePaginationParams,
} from '../middleware/validation'
import { CreateEscalationSchema, UpdateEscalationSchema } from '../schemas/requests'

/**
 * GET /organizations/:orgId/escalations
 */
export async function listEscalations(
  orgId: string,
  query: Record<string, string | undefined>,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)

  const { limit, offset } = parsePaginationParams(query)

  const escalations = await ctx.db.query.escalations.findMany({
    where: eq(schema.escalations.organizationId, orgId),
    orderBy: desc(schema.escalations.createdAt),
    limit,
    offset,
    with: {
      customer: true,
      assignee: {
        with: {
          user: true,
        },
      },
    },
  })

  return {
    status: 200,
    body: {
      data: escalations,
      meta: { limit, offset },
    },
  }
}

/**
 * GET /organizations/:orgId/escalations/:id
 */
export async function getEscalation(
  orgId: string,
  id: string,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid escalation ID format' } }
  }

  const escalation = await ctx.db.query.escalations.findFirst({
    where: and(eq(schema.escalations.id, id), eq(schema.escalations.organizationId, orgId)),
    with: {
      customer: true,
      assignee: {
        with: {
          user: true,
        },
      },
    },
  })

  if (!escalation) {
    return { status: 404, body: { error: 'Escalation not found' } }
  }

  return { status: 200, body: { data: escalation } }
}

/**
 * POST /organizations/:orgId/escalations
 */
export async function createEscalation(
  orgId: string,
  body: unknown,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)

  const validation = validateRequest(CreateEscalationSchema, body)

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

  const [escalation] = await ctx.db
    .insert(schema.escalations)
    .values({
      organizationId: orgId,
      conversationId: data.conversationId,
      customerId: data.customerId,
      reason: data.reason,
      issueDescription: data.issueDescription,
      assignedTo: data.assignedTo,
      priority: data.priority,
      status: data.status,
      waitTime: data.waitTime,
      notes: data.notes,
      aiSummary: data.aiSummary,
    })
    .returning()

  return { status: 201, body: { data: escalation } }
}

/**
 * PATCH /organizations/:orgId/escalations/:id
 */
export async function updateEscalation(
  orgId: string,
  id: string,
  body: unknown,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid escalation ID format' } }
  }

  const validation = validateRequest(UpdateEscalationSchema, body)

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

  // Set assignedAt when assigned
  if (data.assignedTo) {
    updateData.assignedAt = new Date()
  }

  // Set resolved timestamp
  if (data.status === 'RESOLVED') {
    updateData.resolvedAt = new Date()
  }

  const [escalation] = await ctx.db
    .update(schema.escalations)
    .set(updateData)
    .where(and(eq(schema.escalations.id, id), eq(schema.escalations.organizationId, orgId)))
    .returning()

  if (!escalation) {
    return { status: 404, body: { error: 'Escalation not found' } }
  }

  return { status: 200, body: { data: escalation } }
}

/**
 * DELETE /organizations/:orgId/escalations/:id
 */
export async function deleteEscalation(
  orgId: string,
  id: string,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid escalation ID format' } }
  }

  const [deleted] = await ctx.db
    .delete(schema.escalations)
    .where(and(eq(schema.escalations.id, id), eq(schema.escalations.organizationId, orgId)))
    .returning()

  if (!deleted) {
    return { status: 404, body: { error: 'Escalation not found' } }
  }

  return { status: 200, body: { data: { deleted: true, id } } }
}
