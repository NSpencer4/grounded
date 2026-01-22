import { eq } from 'drizzle-orm'
import { Database, schema } from '../db'

interface RouteContext {
  db: Database
}

/**
 * GET /users/:id
 * Fetch a user by ID
 */
export async function getUserById(
  userId: string,
  ctx: RouteContext,
): Promise<{ status: number; body: unknown }> {
  try {
    const user = await ctx.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1)

    if (user.length === 0) {
      return {
        status: 404,
        body: { error: 'User not found', userId },
      }
    }

    return {
      status: 200,
      body: user[0],
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return {
      status: 500,
      body: { error: 'Failed to fetch user' },
    }
  }
}
