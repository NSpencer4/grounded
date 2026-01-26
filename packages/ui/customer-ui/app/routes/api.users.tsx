import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare'
import {
  createGraphQLClient,
  LIST_USERS,
  GET_USER,
  CREATE_USER,
  UPDATE_USER,
  DELETE_USER,
  type User,
} from '../lib/graphql'

/**
 * API Route for user management
 * Provides CRUD operations for users via GraphQL
 */

export async function loader({ request, context }: LoaderFunctionArgs) {
  const graphqlClient = createGraphQLClient()
  const url = new URL(request.url)
  const orgId = url.searchParams.get('orgId') || context.env?.DEFAULT_ORG_ID || 'acme-corp'
  const userId = url.searchParams.get('userId')

  if (userId) {
    // Get specific user
    try {
      const data = await graphqlClient.request<{ user: User }>(GET_USER, {
        orgId,
        id: userId,
      })
      return json({ user: data.user })
    } catch (error) {
      console.error('Error fetching user:', error)
      return json({ error: 'User not found' }, { status: 404 })
    }
  }

  // List users
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  try {
    const data = await graphqlClient.request<{ users: User[] }>(LIST_USERS, {
      orgId,
      limit,
      offset,
    })
    return json({ users: data.users })
  } catch (error) {
    console.error('Error listing users:', error)
    return json({ users: [] })
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const graphqlClient = createGraphQLClient()
  const formData = await request.formData()
  const actionType = formData.get('_action')
  const orgId = (formData.get('orgId') as string) || context.env?.DEFAULT_ORG_ID || 'acme-corp'

  switch (actionType) {
    case 'create': {
      const email = formData.get('email') as string
      const name = formData.get('name') as string
      const role = formData.get('role') as string

      try {
        const data = await graphqlClient.request<{ createUser: User }>(CREATE_USER, {
          orgId,
          email,
          name,
          role,
        })
        return json({ user: data.createUser, success: true })
      } catch (error) {
        console.error('Error creating user:', error)
        return json({ error: 'Failed to create user' }, { status: 500 })
      }
    }

    case 'update': {
      const id = formData.get('id') as string
      const email = formData.get('email') as string | undefined
      const name = formData.get('name') as string | undefined
      const role = formData.get('role') as string | undefined
      const status = formData.get('status') as string | undefined

      try {
        const data = await graphqlClient.request<{ updateUser: User }>(UPDATE_USER, {
          orgId,
          id,
          ...(email && { email }),
          ...(name && { name }),
          ...(role && { role }),
          ...(status && { status }),
        })
        return json({ user: data.updateUser, success: true })
      } catch (error) {
        console.error('Error updating user:', error)
        return json({ error: 'Failed to update user' }, { status: 500 })
      }
    }

    case 'delete': {
      const id = formData.get('id') as string

      try {
        await graphqlClient.request<{ deleteUser: boolean }>(DELETE_USER, {
          orgId,
          id,
        })
        return json({ success: true })
      } catch (error) {
        console.error('Error deleting user:', error)
        return json({ error: 'Failed to delete user' }, { status: 500 })
      }
    }

    default:
      return json({ error: 'Invalid action' }, { status: 400 })
  }
}
