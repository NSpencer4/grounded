import { Injectable, NotFoundException } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import { DatabaseService } from '../../database/database.service'
import { schema } from '../../database/database.service'
import {
  CreateAgentConfigurationRequest,
  UpdateAgentConfigurationRequest,
} from '../../schemas/requests'

@Injectable()
export class AgentsService {
  constructor(private readonly dbService: DatabaseService) {}

  async listAgentConfigurations(orgId: string, pagination: { limit: number; offset: number }) {
    const db = await this.dbService.getDb()
    const agents = await db.query.agentConfigurations.findMany({
      where: eq(schema.agentConfigurations.organizationId, orgId),
      limit: pagination.limit,
      offset: pagination.offset,
    })
    return agents
  }

  async getAgentConfiguration(orgId: string, id: string) {
    const db = await this.dbService.getDb()
    const agent = await db.query.agentConfigurations.findFirst({
      where: and(
        eq(schema.agentConfigurations.id, id),
        eq(schema.agentConfigurations.organizationId, orgId),
      ),
    })

    if (!agent) {
      throw new NotFoundException('Agent configuration not found')
    }

    return agent
  }

  async createAgentConfiguration(orgId: string, data: CreateAgentConfigurationRequest) {
    const db = await this.dbService.getDb()
    const [agent] = await db
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

    return agent
  }

  async updateAgentConfiguration(orgId: string, id: string, data: UpdateAgentConfigurationRequest) {
    const db = await this.dbService.getDb()
    const [agent] = await db
      .update(schema.agentConfigurations)
      .set({
        ...data,
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
      throw new NotFoundException('Agent configuration not found')
    }

    return agent
  }

  async deleteAgentConfiguration(orgId: string, id: string) {
    const db = await this.dbService.getDb()
    const [deleted] = await db
      .delete(schema.agentConfigurations)
      .where(
        and(
          eq(schema.agentConfigurations.id, id),
          eq(schema.agentConfigurations.organizationId, orgId),
        ),
      )
      .returning()

    if (!deleted) {
      throw new NotFoundException('Agent configuration not found')
    }

    return deleted
  }
}
