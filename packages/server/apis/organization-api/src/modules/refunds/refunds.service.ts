import { Injectable, NotFoundException } from '@nestjs/common'
import { and, eq, desc } from 'drizzle-orm'
import { DatabaseService } from '../../database/database.service'
import { schema } from '../../database/database.service'
import { CreateRefundRequest, UpdateRefundRequest } from '../../schemas/requests'

@Injectable()
export class RefundsService {
  constructor(private readonly dbService: DatabaseService) {}

  async listRefunds(orgId: string, pagination: { limit: number; offset: number }) {
    const db = await this.dbService.getDb()
    const refunds = await db.query.refunds.findMany({
      where: eq(schema.refunds.organizationId, orgId),
      orderBy: desc(schema.refunds.createdAt),
      limit: pagination.limit,
      offset: pagination.offset,
      with: {
        customer: true,
        approver: { with: { user: true } },
      },
    })
    return refunds
  }

  async getRefund(orgId: string, id: string) {
    const db = await this.dbService.getDb()
    const refund = await db.query.refunds.findFirst({
      where: and(eq(schema.refunds.id, id), eq(schema.refunds.organizationId, orgId)),
      with: { customer: true, approver: { with: { user: true } } },
    })

    if (!refund) {
      throw new NotFoundException('Refund not found')
    }

    return refund
  }

  async createRefund(orgId: string, data: CreateRefundRequest) {
    const db = await this.dbService.getDb()
    const [refund] = await db
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

    return refund
  }

  async updateRefund(orgId: string, id: string, data: UpdateRefundRequest) {
    const db = await this.dbService.getDb()
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    }

    if (data.status === 'COMPLETED' || data.status === 'APPROVED') {
      updateData.processedAt = new Date()
    }

    const [refund] = await db
      .update(schema.refunds)
      .set(updateData)
      .where(and(eq(schema.refunds.id, id), eq(schema.refunds.organizationId, orgId)))
      .returning()

    if (!refund) {
      throw new NotFoundException('Refund not found')
    }

    return refund
  }

  async deleteRefund(orgId: string, id: string) {
    const db = await this.dbService.getDb()
    const [deleted] = await db
      .delete(schema.refunds)
      .where(and(eq(schema.refunds.id, id), eq(schema.refunds.organizationId, orgId)))
      .returning()

    if (!deleted) {
      throw new NotFoundException('Refund not found')
    }

    return deleted
  }
}
