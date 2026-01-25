import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare'
import {
  createGraphQLClient,
  LIST_REFUNDS,
  CREATE_REFUND,
  PROCESS_REFUND,
  LIST_BUDGETS,
  type Refund,
  type Budget,
  RefundStatus,
} from '../lib/graphql'

/**
 * API Route for refund management
 */

export async function loader({ request, context }: LoaderFunctionArgs) {
  const graphqlClient = createGraphQLClient()
  const url = new URL(request.url)
  const orgId = url.searchParams.get('orgId') || context.env?.DEFAULT_ORG_ID || 'org_123'
  const dataType = url.searchParams.get('type') || 'refunds'

  if (dataType === 'budgets') {
    try {
      const data = await graphqlClient.request<{ budgets: Budget[] }>(LIST_BUDGETS, {
        orgId,
        limit: 10,
      })
      return json({ budgets: data.budgets })
    } catch (error) {
      console.error('Error fetching budgets:', error)
      return json({ budgets: [] })
    }
  }

  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')
  const status = url.searchParams.get('status') as RefundStatus | undefined

  try {
    const data = await graphqlClient.request<{ refunds: Refund[] }>(LIST_REFUNDS, {
      orgId,
      limit,
      offset,
      ...(status && { status }),
    })
    return json({ refunds: data.refunds })
  } catch (error) {
    console.error('Error listing refunds:', error)
    return json({ refunds: [] })
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const graphqlClient = createGraphQLClient()
  const formData = await request.formData()
  const actionType = formData.get('_action')
  const orgId = (formData.get('orgId') as string) || context.env?.DEFAULT_ORG_ID || 'org_123'

  switch (actionType) {
    case 'create': {
      const customerId = formData.get('customerId') as string
      const orderId = formData.get('orderId') as string
      const amount = parseFloat(formData.get('amount') as string)
      const currency = formData.get('currency') as string
      const reason = formData.get('reason') as string
      const method = formData.get('method') as string | undefined
      const notes = formData.get('notes') as string | undefined

      try {
        const data = await graphqlClient.request<{ createRefund: Refund }>(CREATE_REFUND, {
          orgId,
          customerId,
          orderId,
          amount,
          currency,
          reason,
          ...(method && { method }),
          ...(notes && { notes }),
        })
        return json({ refund: data.createRefund, success: true })
      } catch (error) {
        console.error('Error creating refund:', error)
        return json({ error: 'Failed to create refund' }, { status: 500 })
      }
    }

    case 'process': {
      const id = formData.get('id') as string
      const notes = formData.get('notes') as string | undefined

      try {
        const data = await graphqlClient.request<{ processRefund: Refund }>(PROCESS_REFUND, {
          orgId,
          id,
          ...(notes && { notes }),
        })
        return json({ refund: data.processRefund, success: true })
      } catch (error) {
        console.error('Error processing refund:', error)
        return json({ error: 'Failed to process refund' }, { status: 500 })
      }
    }

    default:
      return json({ error: 'Invalid action' }, { status: 400 })
  }
}
