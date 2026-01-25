export interface GraphQLContext {
  env: Env
  request: Request
}

/**
 * Helper to make API calls with error handling
 */
async function callAPI(url: string, options?: RequestInit): Promise<unknown> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error (${response.status}):`, errorText)
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}

/**
 * Build query parameters for list endpoints
 */
function buildQueryParams(params: Record<string, unknown>): string {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value))
    }
  })
  return query.toString()
}

export const resolvers = {
  Query: {
    // ===== HEALTH CHECK =====
    health: () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }),

    // ===== CONVERSATIONS (Conversation Updates API) =====
    conversation: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext) => {
      const url = context.env.CONVERSATION_UPDATES_API_URL
      if (!url) {
        return null
      }

      try {
        return await callAPI(`${url}/conversations/${id}`)
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
      const url = context.env.CONVERSATION_UPDATES_API_URL
      if (!url) {
        return {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: null },
        }
      }

      try {
        const params = buildQueryParams({ orgId, limit, cursor })
        return await callAPI(`${url}/conversations?${params}`)
      } catch (error) {
        console.error('Error fetching conversations:', error)
        return {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: null },
        }
      }
    },

    conversationMessages: async (
      _parent: unknown,
      { conversationId }: { conversationId: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.CONVERSATION_UPDATES_API_URL
      if (!url) {
        return []
      }

      try {
        return await callAPI(`${url}/conversations/${conversationId}/messages`)
      } catch (error) {
        console.error('Error fetching messages:', error)
        return []
      }
    },

    // ===== ORGANIZATIONS (Organization API) =====
    organization: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return null
      }

      try {
        return await callAPI(`${url}/organizations/${id}`)
      } catch (error) {
        console.error('Error fetching organization:', error)
        return null
      }
    },

    // ===== USERS (Organization API) =====
    users: async (
      _parent: unknown,
      { orgId, limit, offset }: { orgId: string; limit?: number; offset?: number },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return []
      }

      try {
        const params = buildQueryParams({ limit, offset })
        return await callAPI(`${url}/organizations/${orgId}/users?${params}`)
      } catch (error) {
        console.error('Error fetching users:', error)
        return []
      }
    },

    user: async (
      _parent: unknown,
      { orgId, id }: { orgId: string; id: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return null
      }

      try {
        return await callAPI(`${url}/organizations/${orgId}/users/${id}`)
      } catch (error) {
        console.error('Error fetching user:', error)
        return null
      }
    },

    // ===== REPRESENTATIVES (Organization API) =====
    representatives: async (
      _parent: unknown,
      { orgId, limit, offset }: { orgId: string; limit?: number; offset?: number },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return []
      }

      try {
        const params = buildQueryParams({ limit, offset })
        return await callAPI(`${url}/organizations/${orgId}/representatives?${params}`)
      } catch (error) {
        console.error('Error fetching representatives:', error)
        return []
      }
    },

    representative: async (
      _parent: unknown,
      { orgId, id }: { orgId: string; id: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return null
      }

      try {
        return await callAPI(`${url}/organizations/${orgId}/representatives/${id}`)
      } catch (error) {
        console.error('Error fetching representative:', error)
        return null
      }
    },

    representativePerformance: async (
      _parent: unknown,
      {
        orgId,
        repId,
        startDate,
        endDate,
      }: { orgId: string; repId: string; startDate?: string; endDate?: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return null
      }

      try {
        const params = buildQueryParams({ startDate, endDate })
        return await callAPI(
          `${url}/organizations/${orgId}/representatives/${repId}/performance?${params}`,
        )
      } catch (error) {
        console.error('Error fetching representative performance:', error)
        return null
      }
    },

    // ===== CUSTOMER PROFILES (Organization API) =====
    customerProfiles: async (
      _parent: unknown,
      { orgId, limit, offset }: { orgId: string; limit?: number; offset?: number },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return []
      }

      try {
        const params = buildQueryParams({ limit, offset })
        return await callAPI(`${url}/organizations/${orgId}/customer-profiles?${params}`)
      } catch (error) {
        console.error('Error fetching customer profiles:', error)
        return []
      }
    },

    customerProfile: async (
      _parent: unknown,
      { orgId, id }: { orgId: string; id: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return null
      }

      try {
        return await callAPI(`${url}/organizations/${orgId}/customer-profiles/${id}`)
      } catch (error) {
        console.error('Error fetching customer profile:', error)
        return null
      }
    },

    // ===== TICKETS (Organization API) =====
    tickets: async (
      _parent: unknown,
      {
        orgId,
        status,
        limit,
        offset,
      }: { orgId: string; status?: string; limit?: number; offset?: number },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return []
      }

      try {
        const params = buildQueryParams({ status, limit, offset })
        return await callAPI(`${url}/organizations/${orgId}/tickets?${params}`)
      } catch (error) {
        console.error('Error fetching tickets:', error)
        return []
      }
    },

    ticket: async (
      _parent: unknown,
      { orgId, id }: { orgId: string; id: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return null
      }

      try {
        return await callAPI(`${url}/organizations/${orgId}/tickets/${id}`)
      } catch (error) {
        console.error('Error fetching ticket:', error)
        return null
      }
    },

    // ===== ESCALATIONS (Organization API) =====
    escalations: async (
      _parent: unknown,
      {
        orgId,
        status,
        limit,
        offset,
      }: { orgId: string; status?: string; limit?: number; offset?: number },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return []
      }

      try {
        const params = buildQueryParams({ status, limit, offset })
        return await callAPI(`${url}/organizations/${orgId}/escalations?${params}`)
      } catch (error) {
        console.error('Error fetching escalations:', error)
        return []
      }
    },

    escalation: async (
      _parent: unknown,
      { orgId, id }: { orgId: string; id: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return null
      }

      try {
        return await callAPI(`${url}/organizations/${orgId}/escalations/${id}`)
      } catch (error) {
        console.error('Error fetching escalation:', error)
        return null
      }
    },

    // ===== REFUNDS (Organization API) =====
    refunds: async (
      _parent: unknown,
      {
        orgId,
        status,
        limit,
        offset,
      }: { orgId: string; status?: string; limit?: number; offset?: number },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return []
      }

      try {
        const params = buildQueryParams({ status, limit, offset })
        return await callAPI(`${url}/organizations/${orgId}/refunds?${params}`)
      } catch (error) {
        console.error('Error fetching refunds:', error)
        return []
      }
    },

    refund: async (
      _parent: unknown,
      { orgId, id }: { orgId: string; id: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return null
      }

      try {
        return await callAPI(`${url}/organizations/${orgId}/refunds/${id}`)
      } catch (error) {
        console.error('Error fetching refund:', error)
        return null
      }
    },

    // ===== BUDGETS (Organization API) =====
    budgets: async (
      _parent: unknown,
      { orgId, limit, offset }: { orgId: string; limit?: number; offset?: number },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return []
      }

      try {
        const params = buildQueryParams({ limit, offset })
        return await callAPI(`${url}/organizations/${orgId}/budgets?${params}`)
      } catch (error) {
        console.error('Error fetching budgets:', error)
        return []
      }
    },

    budget: async (
      _parent: unknown,
      { orgId, id }: { orgId: string; id: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return null
      }

      try {
        return await callAPI(`${url}/organizations/${orgId}/budgets/${id}`)
      } catch (error) {
        console.error('Error fetching budget:', error)
        return null
      }
    },

    // ===== AGENT CONFIGURATIONS (Organization API) =====
    agentConfigurations: async (
      _parent: unknown,
      { orgId, limit, offset }: { orgId: string; limit?: number; offset?: number },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return []
      }

      try {
        const params = buildQueryParams({ limit, offset })
        return await callAPI(`${url}/organizations/${orgId}/agents?${params}`)
      } catch (error) {
        console.error('Error fetching agent configurations:', error)
        return []
      }
    },

    agentConfiguration: async (
      _parent: unknown,
      { orgId, id }: { orgId: string; id: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return null
      }

      try {
        return await callAPI(`${url}/organizations/${orgId}/agents/${id}`)
      } catch (error) {
        console.error('Error fetching agent configuration:', error)
        return null
      }
    },

    // ===== DECISION RULES (Organization API) =====
    decisionRules: async (
      _parent: unknown,
      { orgId, limit, offset }: { orgId: string; limit?: number; offset?: number },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return []
      }

      try {
        const params = buildQueryParams({ limit, offset })
        return await callAPI(`${url}/organizations/${orgId}/decision-rules?${params}`)
      } catch (error) {
        console.error('Error fetching decision rules:', error)
        return []
      }
    },

    decisionRule: async (
      _parent: unknown,
      { orgId, id }: { orgId: string; id: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return null
      }

      try {
        return await callAPI(`${url}/organizations/${orgId}/decision-rules/${id}`)
      } catch (error) {
        console.error('Error fetching decision rule:', error)
        return null
      }
    },

    // ===== PERFORMANCE METRICS (Organization API) =====
    performanceMetrics: async (
      _parent: unknown,
      { orgId, startDate, endDate }: { orgId: string; startDate?: string; endDate?: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return []
      }

      try {
        const params = buildQueryParams({ startDate, endDate })
        return await callAPI(`${url}/organizations/${orgId}/performance-metrics?${params}`)
      } catch (error) {
        console.error('Error fetching performance metrics:', error)
        return []
      }
    },

    teamPerformance: async (
      _parent: unknown,
      { orgId, startDate, endDate }: { orgId: string; startDate?: string; endDate?: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        return []
      }

      try {
        const params = buildQueryParams({ startDate, endDate })
        return await callAPI(`${url}/organizations/${orgId}/team-performance?${params}`)
      } catch (error) {
        console.error('Error fetching team performance:', error)
        return []
      }
    },
  },

  Mutation: {
    // ===== CONVERSATIONS (Conversation Commands API) =====
    sendMessage: async (
      _parent: unknown,
      { conversationId, content }: { conversationId: string; content: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.CONVERSATION_COMMANDS_API_URL
      if (!url) {
        throw new Error('CONVERSATION_COMMANDS_API_URL not configured')
      }

      return await callAPI(`${url}/api/v1/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      })
    },

    createConversation: async (
      _parent: unknown,
      { orgId, userId, initialMessage }: { orgId: string; userId: string; initialMessage: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.CONVERSATION_COMMANDS_API_URL
      if (!url) {
        throw new Error('CONVERSATION_COMMANDS_API_URL not configured')
      }

      return await callAPI(`${url}/api/v1/conversations`, {
        method: 'POST',
        body: JSON.stringify({ orgId, userId, initialMessage }),
      })
    },

    // ===== ORGANIZATIONS (Organization API) =====
    createOrganization: async (
      _parent: unknown,
      { input }: { input: unknown },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      return await callAPI(`${url}/organizations`, {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },

    updateOrganization: async (
      _parent: unknown,
      { id, input }: { id: string; input: unknown },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      return await callAPI(`${url}/organizations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      })
    },

    deleteOrganization: async (
      _parent: unknown,
      { id }: { id: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      await callAPI(`${url}/organizations/${id}`, {
        method: 'DELETE',
      })

      return { success: true, message: 'Organization deleted successfully' }
    },

    // ===== USERS (Organization API) =====
    createUser: async (
      _parent: unknown,
      { orgId, input }: { orgId: string; input: unknown },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      return await callAPI(`${url}/organizations/${orgId}/users`, {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },

    updateUser: async (
      _parent: unknown,
      { orgId, id, input }: { orgId: string; id: string; input: unknown },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      return await callAPI(`${url}/organizations/${orgId}/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      })
    },

    deleteUser: async (
      _parent: unknown,
      { orgId, id }: { orgId: string; id: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      await callAPI(`${url}/organizations/${orgId}/users/${id}`, {
        method: 'DELETE',
      })

      return { success: true, message: 'User deleted successfully' }
    },

    // ===== REPRESENTATIVES (Organization API) =====
    createRepresentative: async (
      _parent: unknown,
      { orgId, input }: { orgId: string; input: unknown },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      return await callAPI(`${url}/organizations/${orgId}/representatives`, {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },

    updateRepresentative: async (
      _parent: unknown,
      { orgId, id, input }: { orgId: string; id: string; input: unknown },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      return await callAPI(`${url}/organizations/${orgId}/representatives/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      })
    },

    deleteRepresentative: async (
      _parent: unknown,
      { orgId, id }: { orgId: string; id: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      await callAPI(`${url}/organizations/${orgId}/representatives/${id}`, {
        method: 'DELETE',
      })

      return { success: true, message: 'Representative deleted successfully' }
    },

    // ===== CUSTOMER PROFILES (Organization API) =====
    createCustomerProfile: async (
      _parent: unknown,
      { orgId, input }: { orgId: string; input: unknown },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      return await callAPI(`${url}/organizations/${orgId}/customer-profiles`, {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },

    updateCustomerProfile: async (
      _parent: unknown,
      { orgId, id, input }: { orgId: string; id: string; input: unknown },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      return await callAPI(`${url}/organizations/${orgId}/customer-profiles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      })
    },

    deleteCustomerProfile: async (
      _parent: unknown,
      { orgId, id }: { orgId: string; id: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      await callAPI(`${url}/organizations/${orgId}/customer-profiles/${id}`, {
        method: 'DELETE',
      })

      return { success: true, message: 'Customer profile deleted successfully' }
    },

    // ===== TICKETS (Organization API) =====
    createTicket: async (
      _parent: unknown,
      { orgId, input }: { orgId: string; input: unknown },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      return await callAPI(`${url}/organizations/${orgId}/tickets`, {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },

    updateTicket: async (
      _parent: unknown,
      { orgId, id, input }: { orgId: string; id: string; input: unknown },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      return await callAPI(`${url}/organizations/${orgId}/tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      })
    },

    deleteTicket: async (
      _parent: unknown,
      { orgId, id }: { orgId: string; id: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      await callAPI(`${url}/organizations/${orgId}/tickets/${id}`, {
        method: 'DELETE',
      })

      return { success: true, message: 'Ticket deleted successfully' }
    },

    // ===== ESCALATIONS (Organization API) =====
    createEscalation: async (
      _parent: unknown,
      { orgId, input }: { orgId: string; input: unknown },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      return await callAPI(`${url}/organizations/${orgId}/escalations`, {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },

    updateEscalation: async (
      _parent: unknown,
      { orgId, id, input }: { orgId: string; id: string; input: unknown },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      return await callAPI(`${url}/organizations/${orgId}/escalations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      })
    },

    deleteEscalation: async (
      _parent: unknown,
      { orgId, id }: { orgId: string; id: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      await callAPI(`${url}/organizations/${orgId}/escalations/${id}`, {
        method: 'DELETE',
      })

      return { success: true, message: 'Escalation deleted successfully' }
    },

    // ===== REFUNDS (Organization API) =====
    createRefund: async (
      _parent: unknown,
      { orgId, input }: { orgId: string; input: unknown },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      return await callAPI(`${url}/organizations/${orgId}/refunds`, {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },

    updateRefund: async (
      _parent: unknown,
      { orgId, id, input }: { orgId: string; id: string; input: unknown },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      return await callAPI(`${url}/organizations/${orgId}/refunds/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      })
    },

    deleteRefund: async (
      _parent: unknown,
      { orgId, id }: { orgId: string; id: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      await callAPI(`${url}/organizations/${orgId}/refunds/${id}`, {
        method: 'DELETE',
      })

      return { success: true, message: 'Refund deleted successfully' }
    },

    // ===== BUDGETS (Organization API) =====
    createBudget: async (
      _parent: unknown,
      { orgId, input }: { orgId: string; input: unknown },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      return await callAPI(`${url}/organizations/${orgId}/budgets`, {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },

    updateBudget: async (
      _parent: unknown,
      { orgId, id, input }: { orgId: string; id: string; input: unknown },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      return await callAPI(`${url}/organizations/${orgId}/budgets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      })
    },

    deleteBudget: async (
      _parent: unknown,
      { orgId, id }: { orgId: string; id: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      await callAPI(`${url}/organizations/${orgId}/budgets/${id}`, {
        method: 'DELETE',
      })

      return { success: true, message: 'Budget deleted successfully' }
    },

    // ===== AGENT CONFIGURATIONS (Organization API) =====
    createAgentConfiguration: async (
      _parent: unknown,
      { orgId, input }: { orgId: string; input: unknown },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      return await callAPI(`${url}/organizations/${orgId}/agents`, {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },

    updateAgentConfiguration: async (
      _parent: unknown,
      { orgId, id, input }: { orgId: string; id: string; input: unknown },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      return await callAPI(`${url}/organizations/${orgId}/agents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      })
    },

    deleteAgentConfiguration: async (
      _parent: unknown,
      { orgId, id }: { orgId: string; id: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      await callAPI(`${url}/organizations/${orgId}/agents/${id}`, {
        method: 'DELETE',
      })

      return { success: true, message: 'Agent configuration deleted successfully' }
    },

    // ===== DECISION RULES (Organization API) =====
    createDecisionRule: async (
      _parent: unknown,
      { orgId, input }: { orgId: string; input: unknown },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      return await callAPI(`${url}/organizations/${orgId}/decision-rules`, {
        method: 'POST',
        body: JSON.stringify(input),
      })
    },

    updateDecisionRule: async (
      _parent: unknown,
      { orgId, id, input }: { orgId: string; id: string; input: unknown },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      return await callAPI(`${url}/organizations/${orgId}/decision-rules/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      })
    },

    deleteDecisionRule: async (
      _parent: unknown,
      { orgId, id }: { orgId: string; id: string },
      context: GraphQLContext,
    ) => {
      const url = context.env.ORGANIZATION_API_URL
      if (!url) {
        throw new Error('ORGANIZATION_API_URL not configured')
      }

      await callAPI(`${url}/organizations/${orgId}/decision-rules/${id}`, {
        method: 'DELETE',
      })

      return { success: true, message: 'Decision rule deleted successfully' }
    },
  },
}
