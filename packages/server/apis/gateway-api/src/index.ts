import { createSchema, createYoga } from 'graphql-yoga'
import { typeDefs } from './schema'
import { GraphQLContext, resolvers } from './resolvers'
import { ConversationStream } from './durable-objects/conversation-stream'

// Re-export the Durable Object class for Wrangler
export { ConversationStream }

// Create GraphQL Yoga instance
const schema = createSchema({
  typeDefs,
  resolvers,
})

const yoga = createYoga<GraphQLContext>({
  schema,
  graphqlEndpoint: '/graphql',
  landingPage: false,
  graphiql: {
    title: 'Grounded Gateway API',
  },
})

/**
 * Cloudflare Worker Entry Point
 *
 * Routes:
 * - /graphql → GraphQL Yoga handler
 * - /sse/:conversationId → Durable Object for SSE streaming
 * - /sse/:conversationId/push → Push events to stream (from Responder Lambda)
 * - /health → Health check endpoint
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    try {
      // Route: GraphQL API
      if (url.pathname === '/graphql' || url.pathname.startsWith('/graphql')) {
        return yoga.handle(request, { env, request })
      }

      // Route: SSE Streaming
      if (url.pathname.startsWith('/sse/')) {
        return handleSSE(request, env)
      }

      // Route: Health check
      if (url.pathname === '/health') {
        return new Response(
          JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'grounded-gateway-api',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          },
        )
      }

      // 404 for unknown routes
      return new Response(
        JSON.stringify({
          error: 'Not Found',
          message: `No route matches ${url.pathname}`,
          availableRoutes: ['/graphql', '/sse/:conversationId', '/health'],
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      )
    } catch (error) {
      console.error('Worker error:', error)
      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      )
    }
  },
} satisfies ExportedHandler<Env>

/**
 * Handle SSE requests by routing to the ConversationStream Durable Object
 *
 * URL patterns:
 * - GET /sse/:conversationId - Connect to SSE stream
 * - POST /sse/:conversationId/push - Push event to stream (from backend)
 * - GET /sse/:conversationId/status - Get stream status
 */
async function handleSSE(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/').filter(Boolean)

  // Validate path: /sse/:conversationId[/push|/status]
  if (pathParts.length < 2) {
    return new Response(JSON.stringify({ error: 'Conversation ID required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  const conversationId = pathParts[1]

  // Get or create Durable Object instance for this conversation
  const id = env.CONVERSATION_STREAM.idFromName(conversationId)
  const stub = env.CONVERSATION_STREAM.get(id)

  // Forward the request to the Durable Object
  const doUrl = new URL(request.url)
  doUrl.pathname = `/${pathParts.slice(1).join('/')}`

  return stub.fetch(new Request(doUrl.toString(), request))
}
