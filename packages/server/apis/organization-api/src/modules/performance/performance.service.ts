import { Injectable } from '@nestjs/common'
import { and, eq, desc } from 'drizzle-orm'
import { DatabaseService } from '../../database/database.service'
import { schema } from '../../database/database.service'

@Injectable()
export class PerformanceService {
  constructor(private readonly dbService: DatabaseService) {}

  async listPerformanceMetrics(orgId: string, pagination: { limit: number; offset: number }) {
    const db = await this.dbService.getDb()
    const metrics = await db.query.performanceMetrics.findMany({
      where: eq(schema.performanceMetrics.organizationId, orgId),
      orderBy: desc(schema.performanceMetrics.periodStart),
      limit: pagination.limit,
      offset: pagination.offset,
    })
    return metrics
  }

  async listTeamPerformance(orgId: string, pagination: { limit: number; offset: number }) {
    const db = await this.dbService.getDb()
    const performance = await db.query.teamPerformance.findMany({
      where: eq(schema.teamPerformance.organizationId, orgId),
      orderBy: desc(schema.teamPerformance.periodStart),
      limit: pagination.limit,
      offset: pagination.offset,
      with: {
        representative: {
          with: {
            user: true,
          },
        },
      },
    })
    return performance
  }

  async getRepresentativePerformance(
    orgId: string,
    repId: string,
    pagination: { limit: number; offset: number },
  ) {
    const db = await this.dbService.getDb()
    const performance = await db.query.teamPerformance.findMany({
      where: and(
        eq(schema.teamPerformance.organizationId, orgId),
        eq(schema.teamPerformance.representativeId, repId),
      ),
      orderBy: desc(schema.teamPerformance.periodStart),
      limit: pagination.limit,
      offset: pagination.offset,
    })
    return performance
  }
}
