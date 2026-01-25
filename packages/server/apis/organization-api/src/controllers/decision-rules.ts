import { and, eq } from 'drizzle-orm'
import { schema } from '../db'
import { RouteContext, RouteResult } from '../types'
import {
  validateUUID,
  validateRequest,
  requireOrganizationId,
  parsePaginationParams,
} from '../middleware/validation'
import { CreateDecisionRuleSchema, UpdateDecisionRuleSchema } from '../schemas/requests'

export async function listDecisionRules(
  orgId: string,
  query: Record<string, string | undefined>,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  const { limit, offset } = parsePaginationParams(query)

  const rules = await ctx.db.query.decisionRules.findMany({
    where: eq(schema.decisionRules.organizationId, orgId),
    limit,
    offset,
  })

  return { status: 200, body: { data: rules, meta: { limit, offset } } }
}

export async function getDecisionRule(
  orgId: string,
  id: string,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid decision rule ID format' } }
  }

  const rule = await ctx.db.query.decisionRules.findFirst({
    where: and(eq(schema.decisionRules.id, id), eq(schema.decisionRules.organizationId, orgId)),
  })

  if (!rule) {
    return { status: 404, body: { error: 'Decision rule not found' } }
  }

  return { status: 200, body: { data: rule } }
}

export async function createDecisionRule(
  orgId: string,
  body: unknown,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)

  const validation = validateRequest(CreateDecisionRuleSchema, body)

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

  const [rule] = await ctx.db
    .insert(schema.decisionRules)
    .values({
      organizationId: orgId,
      name: data.name,
      description: data.description,
      enabled: data.enabled,
      priority: data.priority,
      conditions: data.conditions,
      action: data.action,
      actionParams: data.actionParams,
    })
    .returning()

  return { status: 201, body: { data: rule } }
}

export async function updateDecisionRule(
  orgId: string,
  id: string,
  body: unknown,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid decision rule ID format' } }
  }

  const validation = validateRequest(UpdateDecisionRuleSchema, body)

  if (!validation.success || !validation.data) {
    return {
      status: 400,
      body: {
        error: 'Validation failed',
        details: validation.errors,
      },
    }
  }

  const [rule] = await ctx.db
    .update(schema.decisionRules)
    .set({
      ...validation.data,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.decisionRules.id, id), eq(schema.decisionRules.organizationId, orgId)))
    .returning()

  if (!rule) {
    return { status: 404, body: { error: 'Decision rule not found' } }
  }

  return { status: 200, body: { data: rule } }
}

export async function deleteDecisionRule(
  orgId: string,
  id: string,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid decision rule ID format' } }
  }

  const [deleted] = await ctx.db
    .delete(schema.decisionRules)
    .where(and(eq(schema.decisionRules.id, id), eq(schema.decisionRules.organizationId, orgId)))
    .returning()

  if (!deleted) {
    return { status: 404, body: { error: 'Decision rule not found' } }
  }

  return { status: 200, body: { data: { deleted: true, id } } }
}
