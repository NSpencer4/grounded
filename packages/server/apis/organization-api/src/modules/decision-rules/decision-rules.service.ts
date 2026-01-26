import { Injectable, NotFoundException } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import { DatabaseService } from '../../database/database.service'
import { schema } from '../../database/database.service'
import { CreateDecisionRuleRequest, UpdateDecisionRuleRequest } from '../../schemas/requests'

@Injectable()
export class DecisionRulesService {
  constructor(private readonly dbService: DatabaseService) {}

  async listDecisionRules(orgId: string, pagination: { limit: number; offset: number }) {
    const db = await this.dbService.getDb()
    const rules = await db.query.decisionRules.findMany({
      where: eq(schema.decisionRules.organizationId, orgId),
      limit: pagination.limit,
      offset: pagination.offset,
    })
    return rules
  }

  async getDecisionRule(orgId: string, id: string) {
    const db = await this.dbService.getDb()
    const rule = await db.query.decisionRules.findFirst({
      where: and(eq(schema.decisionRules.id, id), eq(schema.decisionRules.organizationId, orgId)),
    })

    if (!rule) {
      throw new NotFoundException('Decision rule not found')
    }

    return rule
  }

  async createDecisionRule(orgId: string, data: CreateDecisionRuleRequest) {
    const db = await this.dbService.getDb()
    const [rule] = await db
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

    return rule
  }

  async updateDecisionRule(orgId: string, id: string, data: UpdateDecisionRuleRequest) {
    const db = await this.dbService.getDb()
    const [rule] = await db
      .update(schema.decisionRules)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(schema.decisionRules.id, id), eq(schema.decisionRules.organizationId, orgId)))
      .returning()

    if (!rule) {
      throw new NotFoundException('Decision rule not found')
    }

    return rule
  }

  async deleteDecisionRule(orgId: string, id: string) {
    const db = await this.dbService.getDb()
    const [deleted] = await db
      .delete(schema.decisionRules)
      .where(and(eq(schema.decisionRules.id, id), eq(schema.decisionRules.organizationId, orgId)))
      .returning()

    if (!deleted) {
      throw new NotFoundException('Decision rule not found')
    }

    return deleted
  }
}
