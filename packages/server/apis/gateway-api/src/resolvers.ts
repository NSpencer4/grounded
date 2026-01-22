export interface GraphQLContext {
  env: Env
  request: Request
}

export const resolvers = {
  Query: {
    health: () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }),

    conversation: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext) => {
      // TODO: Fetch from Conversation Updates API
      const updatesApiUrl = context.env.CONVERSATION_UPDATES_API_URL
      if (!updatesApiUrl) {
        console.log('CONVERSATION_UPDATES_API_URL not configured')
        return null
      }

      try {
        const response = await fetch(`${updatesApiUrl}/conversations/${id}`)
        if (!response.ok) return null
        return response.json()
      } catch (error) {
        console.error('Error fetching conversation:', error)
        return null
      }
    },

    conversations: async (
      _parent: unknown,
      { orgId, limit = 20, cursor }: { orgId: string; limit?: number; cursor?: string },
      context: GraphQLContext,
    ) => {
      // TODO: Fetch from Conversation Updates API
      const updatesApiUrl = context.env.CONVERSATION_UPDATES_API_URL
      if (!updatesApiUrl) {
        console.log('CONVERSATION_UPDATES_API_URL not configured')
        return {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: null },
        }
      }

      try {
        const params = new URLSearchParams({
          orgId,
          limit: String(limit),
          ...(cursor && { cursor }),
        })
        const response = await fetch(`${updatesApiUrl}/conversations?${params}`)
        if (!response.ok) {
          return { edges: [], pageInfo: { hasNextPage: false, endCursor: null } }
        }
        return response.json()
      } catch (error) {
        console.error('Error fetching conversations:', error)
        return { edges: [], pageInfo: { hasNextPage: false, endCursor: null } }
      }
    },
  },

  Mutation: {
    sendMessage: async (
      _parent: unknown,
      { conversationId, content }: { conversationId: string; content: string },
      context: GraphQLContext,
    ) => {
      const commandsApiUrl = context.env.CONVERSATION_COMMANDS_API_URL
      if (!commandsApiUrl) {
        console.log('CONVERSATION_COMMANDS_API_URL not configured, returning mock')
        return {
          id: crypto.randomUUID(),
          conversationId,
          role: 'USER',
          content,
          timestamp: new Date().toISOString(),
        }
      }

      try {
        const response = await fetch(`${commandsApiUrl}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId, content }),
        })

        if (!response.ok) {
          throw new Error(`Commands API error: ${response.status}`)
        }

        return response.json()
      } catch (error) {
        console.error('Error sending message:', error)
        throw new Error('Failed to send message')
      }
    },

    createConversation: async (
      _parent: unknown,
      { orgId, userId, initialMessage }: { orgId: string; userId: string; initialMessage: string },
      context: GraphQLContext,
    ) => {
      const commandsApiUrl = context.env.CONVERSATION_COMMANDS_API_URL
      if (!commandsApiUrl) {
        console.log('CONVERSATION_COMMANDS_API_URL not configured, returning mock')
        const id = crypto.randomUUID()
        return {
          id,
          orgId,
          userId,
          status: 'ACTIVE',
          messages: [
            {
              id: crypto.randomUUID(),
              conversationId: id,
              role: 'USER',
              content: initialMessage,
              timestamp: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }

      try {
        const response = await fetch(`${commandsApiUrl}/conversations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orgId, userId, initialMessage }),
        })

        if (!response.ok) {
          throw new Error(`Commands API error: ${response.status}`)
        }

        return response.json()
      } catch (error) {
        console.error('Error creating conversation:', error)
        throw new Error('Failed to create conversation')
      }
    },
  },
}
