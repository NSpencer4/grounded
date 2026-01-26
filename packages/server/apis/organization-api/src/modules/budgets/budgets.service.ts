import { Injectable, NotFoundException } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import { DatabaseService } from '../../database/database.service'
import { schema } from '../../database/database.service'
import { CreateBudgetRequest, UpdateBudgetRequest } from '../../schemas/requests'

@Injectable()
export class BudgetsService {
  constructor(private readonly dbService: DatabaseService) {}

  async listBudgets(orgId: string, pagination: { limit: number; offset: number }) {
    const db = await this.dbService.getDb()
    const budgets = await db.query.budgets.findMany({
      where: eq(schema.budgets.organizationId, orgId),
      limit: pagination.limit,
      offset: pagination.offset,
    })
    return budgets
  }

  async getBudget(orgId: string, id: string) {
    const db = await this.dbService.getDb()
    const budget = await db.query.budgets.findFirst({
      where: and(eq(schema.budgets.id, id), eq(schema.budgets.organizationId, orgId)),
      with: { usageRecords: { limit: 20 } },
    })

    if (!budget) {
      throw new NotFoundException('Budget not found')
    }

    return budget
  }

  async createBudget(orgId: string, data: CreateBudgetRequest) {
    const db = await this.dbService.getDb()
    const [budget] = await db
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

    return budget
  }

  async updateBudget(orgId: string, id: string, data: UpdateBudgetRequest) {
    const db = await this.dbService.getDb()
    const [budget] = await db
      .update(schema.budgets)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(schema.budgets.id, id), eq(schema.budgets.organizationId, orgId)))
      .returning()

    if (!budget) {
      throw new NotFoundException('Budget not found')
    }

    return budget
  }

  async deleteBudget(orgId: string, id: string) {
    const db = await this.dbService.getDb()
    const [deleted] = await db
      .delete(schema.budgets)
      .where(and(eq(schema.budgets.id, id), eq(schema.budgets.organizationId, orgId)))
      .returning()

    if (!deleted) {
      throw new NotFoundException('Budget not found')
    }

    return deleted
  }
}
