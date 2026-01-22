import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda'
import { Database, getDb } from './db'
import { getUserById } from './routes/users'

interface DbCredentials {
  host: string
  port?: number
  username: string
  password: string
  database: string
}

/**
 * Get database credentials from environment
 */
function getDbCredentials(): DbCredentials {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'grounded',
  }
}

/**
 * Create a JSON response
 */
function jsonResponse(
  statusCode: number,
  body: unknown,
  headers: Record<string, string> = {},
): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers,
    },
    body: JSON.stringify(body),
  }
}

/**
 * Route matcher
 */
interface RouteMatch {
  handler: string
  params: Record<string, string>
}

function matchRoute(method: string, path: string): RouteMatch | null {
  const routes: Array<{ method: string; pattern: RegExp; handler: string; paramNames: string[] }> =
    [
      { method: 'GET', pattern: /^\/users\/([^/]+)$/, handler: 'getUserById', paramNames: ['id'] },
      { method: 'GET', pattern: /^\/health$/, handler: 'health', paramNames: [] },
    ]

  for (const route of routes) {
    if (route.method !== method) continue
    const match = path.match(route.pattern)
    if (match) {
      const params: Record<string, string> = {}
      route.paramNames.forEach((name, index) => {
        params[name] = match[index + 1]
      })
      return { handler: route.handler, params }
    }
  }

  return null
}

/**
 * Lambda Handler
 * Supports AWS Lambda Function URLs and API Gateway HTTP API
 */
export async function handler(
  event: APIGatewayProxyEventV2,
  context: Context,
): Promise<APIGatewayProxyResultV2> {
  // Prevent Lambda from waiting for event loop
  context.callbackWaitsForEmptyEventLoop = false

  const method = event.requestContext.http.method
  const path = event.rawPath

  console.log(`${method} ${path}`)

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    }
  }

  // Match route
  const route = matchRoute(method, path)
  if (!route) {
    return jsonResponse(404, {
      error: 'Not Found',
      message: `No route matches ${method} ${path}`,
      availableRoutes: [
        'GET /health',
        'GET /users?orgId=:orgId',
        'GET /users/:id',
        'GET /users/:id/details',
      ],
    })
  }

  // Health check (no DB needed)
  if (route.handler === 'health') {
    return jsonResponse(200, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'organization-api',
    })
  }

  // Get database connection
  let db: Database
  try {
    db = await getDb(getDbCredentials())
  } catch (error) {
    console.error('Database connection error:', error)
    return jsonResponse(500, { error: 'Database connection failed' })
  }

  const ctx = { db }

  // Route handlers
  try {
    let result: { status: number; body: unknown }

    switch (route.handler) {
      case 'getUserById':
        result = await getUserById(route.params.id, ctx)
        break

      default:
        return jsonResponse(500, { error: 'Handler not implemented' })
    }

    return jsonResponse(result.status, result.body)
  } catch (error) {
    console.error('Handler error:', error)
    return jsonResponse(500, {
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
