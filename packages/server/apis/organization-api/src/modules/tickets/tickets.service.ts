import { Injectable, NotFoundException } from '@nestjs/common'
import { and, eq, desc } from 'drizzle-orm'
import { DatabaseService } from '../../database/database.service'
import { schema } from '../../database/database.service'
import { CreateTicketRequest, UpdateTicketRequest } from '../../schemas/requests'

@Injectable()
export class TicketsService {
  constructor(private readonly dbService: DatabaseService) {}

  async listTickets(orgId: string, pagination: { limit: number; offset: number }) {
    const db = await this.dbService.getDb()
    const tickets = await db.query.tickets.findMany({
      where: eq(schema.tickets.organizationId, orgId),
      orderBy: desc(schema.tickets.createdAt),
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
    return tickets
  }

  async getTicket(orgId: string, id: string) {
    const db = await this.dbService.getDb()
    const ticket = await db.query.tickets.findFirst({
      where: and(eq(schema.tickets.id, id), eq(schema.tickets.organizationId, orgId)),
      with: {
        customer: true,
        assignee: {
          with: {
            user: true,
          },
        },
      },
    })

    if (!ticket) {
      throw new NotFoundException('Ticket not found')
    }

    return ticket
  }

  async createTicket(orgId: string, data: CreateTicketRequest) {
    const db = await this.dbService.getDb()
    const [ticket] = await db
      .insert(schema.tickets)
      .values({
        organizationId: orgId,
        ticketNumber: data.ticketNumber,
        customerId: data.customerId,
        subject: data.subject,
        description: data.description,
        category: data.category,
        assignedTo: data.assignedTo,
        conversationId: data.conversationId,
        status: data.status,
        priority: data.priority,
        tags: data.tags,
        aiHandled: data.aiHandled,
        sentiment: data.sentiment,
        estimatedResolutionTime: data.estimatedResolutionTime,
        internalNotes: data.internalNotes,
      })
      .returning()

    return ticket
  }

  async updateTicket(orgId: string, id: string, data: UpdateTicketRequest) {
    const db = await this.dbService.getDb()
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    }

    if (data.status === 'RESOLVED') {
      updateData.resolvedAt = new Date()
    }
    if (data.status === 'CLOSED') {
      updateData.closedAt = new Date()
    }

    const [ticket] = await db
      .update(schema.tickets)
      .set(updateData)
      .where(and(eq(schema.tickets.id, id), eq(schema.tickets.organizationId, orgId)))
      .returning()

    if (!ticket) {
      throw new NotFoundException('Ticket not found')
    }

    return ticket
  }

  async deleteTicket(orgId: string, id: string) {
    const db = await this.dbService.getDb()
    const [deleted] = await db
      .delete(schema.tickets)
      .where(and(eq(schema.tickets.id, id), eq(schema.tickets.organizationId, orgId)))
      .returning()

    if (!deleted) {
      throw new NotFoundException('Ticket not found')
    }

    return deleted
  }
}
