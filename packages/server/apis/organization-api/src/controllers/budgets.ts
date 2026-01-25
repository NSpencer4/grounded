import { and, eq } from 'drizzle-orm'
import { schema } from '../db'
import { RouteContext, RouteResult } from '../types'
import {
  validateUUID,
  validateRequest,
  requireOrganizationId,
  parsePaginationParams,
} from '../middleware/validation'
import { CreateBudgetSchema, UpdateBudgetSchema } from '../schemas/requests'

export async function listBudgets(
  orgId: string,
  query: Record<string, string | undefined>,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  const { limit, offset } = parsePaginationParams(query)

  const budgets = await ctx.db.query.budgets.findMany({
    where: eq(schema.budgets.organizationId, orgId),
    limit,
    offset,
  })

  return { status: 200, body: { data: budgets, meta: { limit, offset } } }
}

export async function getBudget(
  orgId: string,
  id: string,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid budget ID format' } }
  }

  const budget = await ctx.db.query.budgets.findFirst({
    where: and(eq(schema.budgets.id, id), eq(schema.budgets.organizationId, orgId)),
    with: { usageRecords: { limit: 20 } },
  })

  if (!budget) {
    return { status: 404, body: { error: 'Budget not found' } }
  }

  return { status: 200, body: { data: budget } }
}

export async function createBudget(
  orgId: string,
  body: unknown,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)

  const validation = validateRequest(CreateBudgetSchema, body)

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

  const [budget] = await ctx.db
    .insert(schema.budgets)
    .values({
      organizationId: orgId,
      type: data.type,
      period: data.period,
      limit: data.limit,
      spent: data.spent,
      remaining: data.remaining,
      alertThresholds: data.alertThresholds,
      autoAlertsEnabled: data.autoAlertsEnabled,
      refundLimitPerUser: data.refundLimitPerUser,
      periodStart: new Date(data.periodStart),
      periodEnd: new Date(data.periodEnd),
    })
    .returning()

  return { status: 201, body: { data: budget } }
}

export async function updateBudget(
  orgId: string,
  id: string,
  body: unknown,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid budget ID format' } }
  }

  const validation = validateRequest(UpdateBudgetSchema, body)

  if (!validation.success || !validation.data) {
    return {
      status: 400,
      body: {
        error: 'Validation failed',
        details: validation.errors,
      },
    }
  }

  const [budget] = await ctx.db
    .update(schema.budgets)
    .set({
      ...validation.data,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.budgets.id, id), eq(schema.budgets.organizationId, orgId)))
    .returning()

  if (!budget) {
    return { status: 404, body: { error: 'Budget not found' } }
  }

  return { status: 200, body: { data: budget } }
}

export async function deleteBudget(
  orgId: string,
  id: string,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid budget ID format' } }
  }

  const [deleted] = await ctx.db
    .delete(schema.budgets)
    .where(and(eq(schema.budgets.id, id), eq(schema.budgets.organizationId, orgId)))
    .returning()

  if (!deleted) {
    return { status: 404, body: { error: 'Budget not found' } }
  }

  return { status: 200, body: { data: { deleted: true, id } } }
}
