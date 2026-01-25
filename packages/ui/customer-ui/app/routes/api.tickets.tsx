import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare'
import {
  createGraphQLClient,
  LIST_TICKETS,
  LIST_ESCALATIONS,
  CREATE_TICKET,
  UPDATE_TICKET,
  CREATE_ESCALATION,
  type Ticket,
  type Escalation,
  TicketStatus,
  EscalationStatus,
} from '../lib/graphql'

/**
 * API Route for ticket and escalation management
 */

export async function loader({ request, context }: LoaderFunctionArgs) {
  const graphqlClient = createGraphQLClient()
  const url = new URL(request.url)
  const orgId = url.searchParams.get('orgId') || context.env?.DEFAULT_ORG_ID || 'org_123'
  const dataType = url.searchParams.get('type') || 'tickets'

  if (dataType === 'escalations') {
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const status = url.searchParams.get('status') as EscalationStatus | undefined

    try {
      const data = await graphqlClient.request<{ escalations: Escalation[] }>(LIST_ESCALATIONS, {
        orgId,
        limit,
        offset,
        ...(status && { status }),
      })
      return json({ escalations: data.escalations })
    } catch (error) {
      console.error('Error listing escalations:', error)
      return json({ escalations: [] })
    }
  }

  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')
  const status = url.searchParams.get('status') as TicketStatus | undefined

  try {
    const data = await graphqlClient.request<{ tickets: Ticket[] }>(LIST_TICKETS, {
      orgId,
      limit,
      offset,
      ...(status && { status }),
    })
    return json({ tickets: data.tickets })
  } catch (error) {
    console.error('Error listing tickets:', error)
    return json({ tickets: [] })
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const graphqlClient = createGraphQLClient()
  const formData = await request.formData()
  const actionType = formData.get('_action')
  const orgId = (formData.get('orgId') as string) || context.env?.DEFAULT_ORG_ID || 'org_123'

  switch (actionType) {
    case 'createTicket': {
      const customerId = formData.get('customerId') as string
      const subject = formData.get('subject') as string
      const description = formData.get('description') as string
      const conversationId = formData.get('conversationId') as string | undefined

      try {
        const data = await graphqlClient.request<{ createTicket: Ticket }>(CREATE_TICKET, {
          orgId,
          customerId,
          subject,
          description,
          ...(conversationId && { conversationId }),
        })
        return json({ ticket: data.createTicket, success: true })
      } catch (error) {
        console.error('Error creating ticket:', error)
        return json({ error: 'Failed to create ticket' }, { status: 500 })
      }
    }

    case 'updateTicket': {
      const id = formData.get('id') as string
      const status = formData.get('status') as TicketStatus | undefined
      const assignedTo = formData.get('assignedTo') as string | undefined

      try {
        const data = await graphqlClient.request<{ updateTicket: Ticket }>(UPDATE_TICKET, {
          orgId,
          id,
          ...(status && { status }),
          ...(assignedTo && { assignedTo }),
        })
        return json({ ticket: data.updateTicket, success: true })
      } catch (error) {
        console.error('Error updating ticket:', error)
        return json({ error: 'Failed to update ticket' }, { status: 500 })
      }
    }

    case 'createEscalation': {
      const ticketId = formData.get('ticketId') as string
      const reason = formData.get('reason') as string
      const escalatedTo = formData.get('escalatedTo') as string
      const conversationId = formData.get('conversationId') as string | undefined
      const notes = formData.get('notes') as string | undefined

      try {
        const data = await graphqlClient.request<{ createEscalation: Escalation }>(
          CREATE_ESCALATION,
          {
            orgId,
            ticketId,
            reason,
            escalatedTo,
            ...(conversationId && { conversationId }),
            ...(notes && { notes }),
          },
        )
        return json({ escalation: data.createEscalation, success: true })
      } catch (error) {
        console.error('Error creating escalation:', error)
        return json({ error: 'Failed to create escalation' }, { status: 500 })
      }
    }

    default:
      return json({ error: 'Invalid action' }, { status: 400 })
  }
}
