import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare'
import {
  createGraphQLClient,
  LIST_REPRESENTATIVES,
  GET_REPRESENTATIVE,
  CREATE_REPRESENTATIVE,
  UPDATE_REPRESENTATIVE,
  DELETE_REPRESENTATIVE,
  type Representative,
} from '../lib/graphql'

/**
 * API Route for representative management
 */

export async function loader({ request, context }: LoaderFunctionArgs) {
  const graphqlClient = createGraphQLClient()
  const url = new URL(request.url)
  const orgId = url.searchParams.get('orgId') || context.env?.DEFAULT_ORG_ID || 'org_123'
  const repId = url.searchParams.get('repId')

  if (repId) {
    try {
      const data = await graphqlClient.request<{ representative: Representative }>(
        GET_REPRESENTATIVE,
        {
          orgId,
          id: repId,
        },
      )
      return json({ representative: data.representative })
    } catch (error) {
      console.error('Error fetching representative:', error)
      return json({ error: 'Representative not found' }, { status: 404 })
    }
  }

  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  try {
    const data = await graphqlClient.request<{ representatives: Representative[] }>(
      LIST_REPRESENTATIVES,
      {
        orgId,
        limit,
        offset,
      },
    )
    return json({ representatives: data.representatives })
  } catch (error) {
    console.error('Error listing representatives:', error)
    return json({ representatives: [] })
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const graphqlClient = createGraphQLClient()
  const formData = await request.formData()
  const actionType = formData.get('_action')
  const orgId = (formData.get('orgId') as string) || context.env?.DEFAULT_ORG_ID || 'org_123'

  switch (actionType) {
    case 'create': {
      const userId = formData.get('userId') as string
      const name = formData.get('name') as string
      const email = formData.get('email') as string
      const department = formData.get('department') as string | undefined

      try {
        const data = await graphqlClient.request<{ createRepresentative: Representative }>(
          CREATE_REPRESENTATIVE,
          {
            orgId,
            userId,
            name,
            email,
            ...(department && { department }),
          },
        )
        return json({ representative: data.createRepresentative, success: true })
      } catch (error) {
        console.error('Error creating representative:', error)
        return json({ error: 'Failed to create representative' }, { status: 500 })
      }
    }

    case 'update': {
      const id = formData.get('id') as string
      const name = formData.get('name') as string | undefined
      const email = formData.get('email') as string | undefined
      const department = formData.get('department') as string | undefined
      const status = formData.get('status') as string | undefined

      try {
        const data = await graphqlClient.request<{ updateRepresentative: Representative }>(
          UPDATE_REPRESENTATIVE,
          {
            orgId,
            id,
            ...(name && { name }),
            ...(email && { email }),
            ...(department && { department }),
            ...(status && { status }),
          },
        )
        return json({ representative: data.updateRepresentative, success: true })
      } catch (error) {
        console.error('Error updating representative:', error)
        return json({ error: 'Failed to update representative' }, { status: 500 })
      }
    }

    case 'delete': {
      const id = formData.get('id') as string

      try {
        await graphqlClient.request<{ deleteRepresentative: boolean }>(DELETE_REPRESENTATIVE, {
          orgId,
          id,
        })
        return json({ success: true })
      } catch (error) {
        console.error('Error deleting representative:', error)
        return json({ error: 'Failed to delete representative' }, { status: 500 })
      }
    }

    default:
      return json({ error: 'Invalid action' }, { status: 400 })
  }
}
