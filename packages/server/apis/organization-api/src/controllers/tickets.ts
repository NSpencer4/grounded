import { and, eq, desc } from 'drizzle-orm'
import { schema } from '../db'
import { RouteContext, RouteResult } from '../types'
import {
  validateUUID,
  validateRequest,
  requireOrganizationId,
  parsePaginationParams,
} from '../middleware/validation'
import { CreateTicketSchema, UpdateTicketSchema } from '../schemas/requests'

/**
 * GET /organizations/:orgId/tickets
 */
export async function listTickets(
  orgId: string,
  query: Record<string, string | undefined>,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)

  const { limit, offset } = parsePaginationParams(query)

  const tickets = await ctx.db.query.tickets.findMany({
    where: eq(schema.tickets.organizationId, orgId),
    orderBy: desc(schema.tickets.createdAt),
    limit,
    offset,
    with: {
      customer: true,
      assignee: {
        with: {
          user: true,
        },
      },
    },
  })

  return {
    status: 200,
    body: {
      data: tickets,
      meta: { limit, offset },
    },
  }
}

/**
 * GET /organizations/:orgId/tickets/:id
 */
export async function getTicket(
  orgId: string,
  id: string,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid ticket ID format' } }
  }

  const ticket = await ctx.db.query.tickets.findFirst({
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
    return { status: 404, body: { error: 'Ticket not found' } }
  }

  return { status: 200, body: { data: ticket } }
}

/**
 * POST /organizations/:orgId/tickets
 */
export async function createTicket(
  orgId: string,
  body: unknown,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)

  const validation = validateRequest(CreateTicketSchema, body)

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

  const [ticket] = await ctx.db
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

  return { status: 201, body: { data: ticket } }
}

/**
 * PATCH /organizations/:orgId/tickets/:id
 */
export async function updateTicket(
  orgId: string,
  id: string,
  body: unknown,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid ticket ID format' } }
  }

  const validation = validateRequest(UpdateTicketSchema, body)

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
  const updateData: any = {
    ...data,
    updatedAt: new Date(),
  }

  // Set resolved/closed timestamps based on status
  if (data.status === 'RESOLVED') {
    updateData.resolvedAt = new Date()
  }
  if (data.status === 'CLOSED') {
    updateData.closedAt = new Date()
  }

  const [ticket] = await ctx.db
    .update(schema.tickets)
    .set(updateData)
    .where(and(eq(schema.tickets.id, id), eq(schema.tickets.organizationId, orgId)))
    .returning()

  if (!ticket) {
    return { status: 404, body: { error: 'Ticket not found' } }
  }

  return { status: 200, body: { data: ticket } }
}

/**
 * DELETE /organizations/:orgId/tickets/:id
 */
export async function deleteTicket(
  orgId: string,
  id: string,
  ctx: RouteContext,
): Promise<RouteResult> {
  requireOrganizationId(orgId)
  if (!validateUUID(id)) {
    return { status: 400, body: { error: 'Invalid ticket ID format' } }
  }

  const [deleted] = await ctx.db
    .delete(schema.tickets)
    .where(and(eq(schema.tickets.id, id), eq(schema.tickets.organizationId, orgId)))
    .returning()

  if (!deleted) {
    return { status: 404, body: { error: 'Ticket not found' } }
  }

  return { status: 200, body: { data: { deleted: true, id } } }
}
