import { and, eq, desc } from 'drizzle-orm'
import { schema } from '../db'
import { RouteContext, RouteResult } from '../types'
import {
  validateUUID,
  requireOrganizationId,
  parsePaginationParams,
} from '../middleware/validation'

/**
 * GET /organizations/:orgId/performance-metrics
 */
export async function listPerformanceMetrics(
  orgId: string,
  query: Record<string, string | undefined>,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  const { limit, offset } = parsePaginationParams(query)

  const metrics = await ctx.db.query.performanceMetrics.findMany({
    where: eq(schema.performanceMetrics.organizationId, orgId),
    orderBy: desc(schema.performanceMetrics.periodStart),
    limit,
    offset,
  })

  return { status: 200, body: { data: metrics, meta: { limit, offset } } }
}

/**
 * GET /organizations/:orgId/team-performance
 */
export async function listTeamPerformance(
  orgId: string,
  query: Record<string, string | undefined>,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  const { limit, offset } = parsePaginationParams(query)

  const performance = await ctx.db.query.teamPerformance.findMany({
    where: eq(schema.teamPerformance.organizationId, orgId),
    orderBy: desc(schema.teamPerformance.periodStart),
    limit,
    offset,
    with: {
      representative: {
        with: {
          user: true,
        },
      },
    },
  })

  return { status: 200, body: { data: performance, meta: { limit, offset } } }
}

/**
 * GET /organizations/:orgId/representatives/:repId/performance
 */
export async function getRepresentativePerformance(
  orgId: string,
  repId: string,
  query: Record<string, string | undefined>,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(repId)) {
    return { status: 400, body: { error: 'Invalid representative ID format' } }
  }

  const { limit, offset } = parsePaginationParams(query)

  const performance = await ctx.db.query.teamPerformance.findMany({
    where: and(
      eq(schema.teamPerformance.organizationId, orgId),
      eq(schema.teamPerformance.representativeId, repId),
    ),
    orderBy: desc(schema.teamPerformance.periodStart),
    limit,
    offset,
  })

  return { status: 200, body: { data: performance, meta: { limit, offset } } }
}
