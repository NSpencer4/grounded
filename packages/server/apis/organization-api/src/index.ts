import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda'
import { Database, getDb } from './db'
import { matchRoute, executeHandler } from './router'
import { RouteContext } from './types'
import { authenticate, authorizeOrganization, AuthenticationError } from './middleware/auth'

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
 * Parse request body
 */
function parseBody(body: string | undefined): Record<string, unknown> | undefined {
  if (!body) {
    return undefined
  }
  try {
    return JSON.parse(body) as Record<string, unknown>
  } catch {
    return undefined
  }
}

/**
 * Parse query parameters
 */
function parseQuery(
  queryStringParameters: Record<string, string | undefined> | undefined,
): Record<string, string | undefined> {
  return queryStringParameters || {}
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
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
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
      hint: 'Try GET /health or GET /organizations/:orgId/...',
    })
  }

  // Health check (no authentication or DB needed)
  if (route.handler === 'health') {
    return jsonResponse(200, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'organization-api',
      version: '1.0.0',
      authentication: 'enabled',
    })
  }

  // Authenticate request
  let authContext
  try {
    const authHeader = event.headers?.authorization || event.headers?.Authorization
    authContext = authenticate(authHeader)
    console.log('Authenticated user:', authContext.userId, 'org:', authContext.organizationId)
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return jsonResponse(error.statusCode, {
        error: error.code,
        message: error.message,
      })
    }
    console.error('Authentication error:', error)
    return jsonResponse(401, {
      error: 'AUTHENTICATION_FAILED',
      message: 'Authentication failed',
    })
  }

  // Authorize organization access (if route has orgId parameter)
  if (route.params.orgId) {
    try {
      authorizeOrganization(authContext, route.params.orgId)
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return jsonResponse(error.statusCode, {
          error: error.code,
          message: error.message,
        })
      }
      console.error('Authorization error:', error)
      return jsonResponse(403, {
        error: 'AUTHORIZATION_FAILED',
        message: 'Authorization failed',
      })
    }
  }

  // Get database connection
  let db: Database
  try {
    db = await getDb(getDbCredentials())
  } catch (error) {
    console.error('Database connection error:', error)
    return jsonResponse(500, {
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  // Parse request body and query
  const body = parseBody(event.body)
  const query = parseQuery(event.queryStringParameters)

  const ctx: RouteContext = {
    db,
    auth: authContext,
    userId: authContext.userId,
    organizationId: authContext.organizationId,
  }

  // Execute route handler
  try {
    const result = await executeHandler(route.handler, route.params, query, body, ctx)
    return jsonResponse(result.status, result.body)
  } catch (error) {
    console.error('Handler error:', error)
    return jsonResponse(500, {
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
