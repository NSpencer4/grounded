import { and, eq } from 'drizzle-orm'
import { schema } from '../db'
import { RouteContext, RouteResult } from '../types'
import {
  validateUUID,
  validateRequest,
  requireOrganizationId,
  parsePaginationParams,
} from '../middleware/validation'
import { CreateAgentConfigurationSchema, UpdateAgentConfigurationSchema } from '../schemas/requests'

export async function listAgentConfigurations(
  orgId: string,
  query: Record<string, string | undefined>,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  const { limit, offset } = parsePaginationParams(query)

  const agents = await ctx.db.query.agentConfigurations.findMany({
    where: eq(schema.agentConfigurations.organizationId, orgId),
    limit,
    offset,
  })

  return { status: 200, body: { data: agents, meta: { limit, offset } } }
}

export async function getAgentConfiguration(
  orgId: string,
  id: string,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid agent ID format' } }
  }

  const agent = await ctx.db.query.agentConfigurations.findFirst({
    where: and(
      eq(schema.agentConfigurations.id, id),
      eq(schema.agentConfigurations.organizationId, orgId),
    ),
  })

  if (!agent) {
    return { status: 404, body: { error: 'Agent configuration not found' } }
  }

  return { status: 200, body: { data: agent } }
}

export async function createAgentConfiguration(
  orgId: string,
  body: unknown,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)

  const validation = validateRequest(CreateAgentConfigurationSchema, body)

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

  const [agent] = await ctx.db
    .insert(schema.agentConfigurations)
    .values({
      organizationId: orgId,
      name: data.name,
      type: data.type,
      description: data.description,
      enabled: data.enabled,
      status: data.status,
      assertions: data.assertions,
      accuracy: data.accuracy,
      avgLatency: data.avgLatency,
      dataSources: data.dataSources,
      thresholds: data.thresholds,
      metadata: data.metadata,
    })
    .returning()

  return { status: 201, body: { data: agent } }
}

export async function updateAgentConfiguration(
  orgId: string,
  id: string,
  body: unknown,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid agent ID format' } }
  }

  const validation = validateRequest(UpdateAgentConfigurationSchema, body)

  if (!validation.success || !validation.data) {
    return {
      status: 400,
      body: {
        error: 'Validation failed',
        details: validation.errors,
      },
    }
  }

  const [agent] = await ctx.db
    .update(schema.agentConfigurations)
    .set({
      ...validation.data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(schema.agentConfigurations.id, id),
        eq(schema.agentConfigurations.organizationId, orgId),
      ),
    )
    .returning()

  if (!agent) {
    return { status: 404, body: { error: 'Agent configuration not found' } }
  }

  return { status: 200, body: { data: agent } }
}

export async function deleteAgentConfiguration(
  orgId: string,
  id: string,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid agent ID format' } }
  }

  const [deleted] = await ctx.db
    .delete(schema.agentConfigurations)
    .where(
      and(
        eq(schema.agentConfigurations.id, id),
        eq(schema.agentConfigurations.organizationId, orgId),
      ),
    )
    .returning()

  if (!deleted) {
    return { status: 404, body: { error: 'Agent configuration not found' } }
  }

  return { status: 200, body: { data: { deleted: true, id } } }
}
