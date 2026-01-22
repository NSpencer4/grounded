import { DurableObject } from 'cloudflare:workers'

interface ConversationEvent {
  type: 'message' | 'status' | 'typing' | 'error'
  conversationId: string
  data: unknown
  timestamp: string
}

interface StreamClient {
  writer: WritableStreamDefaultWriter<Uint8Array>
  connectedAt: number
}

/**
 * ConversationStream Durable Object
 *
 * Manages SSE connections for real-time conversation updates.
 * Each instance handles a single conversation's event stream.
 *
 * Flow:
 * 1. Client connects via GET /sse/:conversationId
 * 2. Responder Lambda pushes updates via POST /sse/:conversationId/push
 * 3. Durable Object broadcasts to all connected clients
 */
export class ConversationStream extends DurableObject<Env> {
  private clients: Map<string, StreamClient> = new Map()
  private conversationId: string | null = null
  private encoder = new TextEncoder()

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/').filter(Boolean)

    // Extract conversation ID from the Durable Object name
    if (!this.conversationId) {
      this.conversationId = this.ctx.id.toString()
    }

    // Handle different request types
    if (request.method === 'GET' && pathParts[pathParts.length - 1] !== 'push') {
      return this.handleSSEConnection(request)
    }

    if (request.method === 'POST' && pathParts[pathParts.length - 1] === 'push') {
      return this.handlePushEvent(request)
    }

    if (request.method === 'GET' && url.pathname.endsWith('/status')) {
      return this.handleStatusRequest()
    }

    return new Response('Not Found', { status: 404 })
  }

  /**
   * Handle new SSE client connection
   */
  private handleSSEConnection(request: Request): Response {
    const clientId = crypto.randomUUID()

    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
    const writer = writable.getWriter()

    this.clients.set(clientId, {
      writer,
      connectedAt: Date.now(),
    })

    // Send initial connection event
    this.sendToClient(clientId, {
      type: 'status',
      conversationId: this.conversationId || 'unknown',
      data: { connected: true, clientId },
      timestamp: new Date().toISOString(),
    })

    // Cleanup when client disconnects
    request.signal.addEventListener('abort', () => {
      this.removeClient(clientId)
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  /**
   * Handle push event from Responder Lambda
   */
  private async handlePushEvent(request: Request): Promise<Response> {
    try {
      const event = (await request.json()) as ConversationEvent

      if (!event.type || !event.conversationId) {
        return new Response(JSON.stringify({ error: 'Invalid event format' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      await this.broadcast(event)

      return new Response(
        JSON.stringify({
          success: true,
          clientCount: this.clients.size,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    } catch (error) {
      console.error('Error handling push event:', error)
      return new Response(JSON.stringify({ error: 'Failed to process event' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  /**
   * Handle status request
   */
  private handleStatusRequest(): Response {
    return new Response(
      JSON.stringify({
        conversationId: this.conversationId,
        connectedClients: this.clients.size,
        clients: Array.from(this.clients.entries()).map(([id, client]) => ({
          id,
          connectedAt: new Date(client.connectedAt).toISOString(),
        })),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  /**
   * Broadcast event to all connected clients
   */
  private async broadcast(event: ConversationEvent): Promise<void> {
    const deadClients: string[] = []

    for (const [clientId] of this.clients) {
      try {
        await this.sendToClient(clientId, event)
      } catch {
        deadClients.push(clientId)
      }
    }

    for (const clientId of deadClients) {
      this.removeClient(clientId)
    }
  }

  /**
   * Send event to a specific client
   */
  private async sendToClient(clientId: string, event: ConversationEvent): Promise<void> {
    const client = this.clients.get(clientId)
    if (!client) return

    const sseMessage = this.formatSSEMessage(event)
    await client.writer.write(this.encoder.encode(sseMessage))
  }

  /**
   * Format event as SSE message
   */
  private formatSSEMessage(event: ConversationEvent): string {
    return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`
  }

  /**
   * Remove a client from the connection pool
   */
  private removeClient(clientId: string): void {
    const client = this.clients.get(clientId)
    if (client) {
      try {
        client.writer.close()
      } catch {
        // Writer may already be closed
      }
      this.clients.delete(clientId)
    }
  }
}
