import { and, eq, desc } from 'drizzle-orm'
import { schema } from '../db'
import { RouteContext, RouteResult } from '../types'
import {
  validateUUID,
  validateRequest,
  requireOrganizationId,
  parsePaginationParams,
} from '../middleware/validation'
import { CreateRefundSchema, UpdateRefundSchema } from '../schemas/requests'

export async function listRefunds(
  orgId: string,
  query: Record<string, string | undefined>,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  const { limit, offset } = parsePaginationParams(query)

  const refunds = await ctx.db.query.refunds.findMany({
    where: eq(schema.refunds.organizationId, orgId),
    orderBy: desc(schema.refunds.createdAt),
    limit,
    offset,
    with: {
      customer: true,
      approver: { with: { user: true } },
    },
  })

  return { status: 200, body: { data: refunds, meta: { limit, offset } } }
}

export async function getRefund(
  orgId: string,
  id: string,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid refund ID format' } }
  }

  const refund = await ctx.db.query.refunds.findFirst({
    where: and(eq(schema.refunds.id, id), eq(schema.refunds.organizationId, orgId)),
    with: { customer: true, approver: { with: { user: true } } },
  })

  if (!refund) {
    return { status: 404, body: { error: 'Refund not found' } }
  }

  return { status: 200, body: { data: refund } }
}

export async function createRefund(
  orgId: string,
  body: unknown,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)

  const validation = validateRequest(CreateRefundSchema, body)

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

  const [refund] = await ctx.db
    .insert(schema.refunds)
    .values({
      organizationId: orgId,
      orderId: data.orderId,
      customerId: data.customerId,
      amount: data.amount,
      reason: data.reason,
      status: data.status,
      notes: data.notes,
      approvedBy: data.approvedBy,
    })
    .returning()

  return { status: 201, body: { data: refund } }
}

export async function updateRefund(
  orgId: string,
  id: string,
  body: unknown,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid refund ID format' } }
  }

  const validation = validateRequest(UpdateRefundSchema, body)

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

  if (data.status === 'COMPLETED' || data.status === 'APPROVED') {
    updateData.processedAt = new Date()
  }

  const [refund] = await ctx.db
    .update(schema.refunds)
    .set(updateData)
    .where(and(eq(schema.refunds.id, id), eq(schema.refunds.organizationId, orgId)))
    .returning()

  if (!refund) {
    return { status: 404, body: { error: 'Refund not found' } }
  }

  return { status: 200, body: { data: refund } }
}

export async function deleteRefund(
  orgId: string,
  id: string,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid refund ID format' } }
  }

  const [deleted] = await ctx.db
    .delete(schema.refunds)
    .where(and(eq(schema.refunds.id, id), eq(schema.refunds.organizationId, orgId)))
    .returning()

  if (!deleted) {
    return { status: 404, body: { error: 'Refund not found' } }
  }

  return { status: 200, body: { data: { deleted: true, id } } }
}
