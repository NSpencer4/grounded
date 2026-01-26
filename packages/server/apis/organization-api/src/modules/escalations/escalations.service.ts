import { Injectable, NotFoundException } from '@nestjs/common'
import { and, eq, desc } from 'drizzle-orm'
import { DatabaseService } from '../../database/database.service'
import { schema } from '../../database/database.service'
import { CreateEscalationRequest, UpdateEscalationRequest } from '../../schemas/requests'

@Injectable()
export class EscalationsService {
  constructor(private readonly dbService: DatabaseService) {}

  async listEscalations(orgId: string, pagination: { limit: number; offset: number }) {
    const db = await this.dbService.getDb()
    const escalations = await db.query.escalations.findMany({
      where: eq(schema.escalations.organizationId, orgId),
      orderBy: desc(schema.escalations.createdAt),
      limit: pagination.limit,
      offset: pagination.offset,
      with: {
        customer: true,
        assignee: {
          with: {
            user: true,
          },
        },
      },
    })
    return escalations
  }

  async getEscalation(orgId: string, id: string) {
    const db = await this.dbService.getDb()
    const escalation = await db.query.escalations.findFirst({
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
      throw new NotFoundException('Escalation not found')
    }

    return escalation
  }

  async createEscalation(orgId: string, data: CreateEscalationRequest) {
    const db = await this.dbService.getDb()
    const [escalation] = await db
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

    return escalation
  }

  async updateEscalation(orgId: string, id: string, data: UpdateEscalationRequest) {
    const db = await this.dbService.getDb()
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    }

    if (data.assignedTo) {
      updateData.assignedAt = new Date()
    }

    if (data.status === 'RESOLVED') {
      updateData.resolvedAt = new Date()
    }

    const [escalation] = await db
      .update(schema.escalations)
      .set(updateData)
      .where(and(eq(schema.escalations.id, id), eq(schema.escalations.organizationId, orgId)))
      .returning()

    if (!escalation) {
      throw new NotFoundException('Escalation not found')
    }

    return escalation
  }

  async deleteEscalation(orgId: string, id: string) {
    const db = await this.dbService.getDb()
    const [deleted] = await db
      .delete(schema.escalations)
      .where(and(eq(schema.escalations.id, id), eq(schema.escalations.organizationId, orgId)))
      .returning()

    if (!deleted) {
      throw new NotFoundException('Escalation not found')
    }

    return deleted
  }
}
