import { GraphQLClient } from 'graphql-request'

/**
 * GraphQL Client for Grounded Gateway API
 * Provides a configured client instance for making GraphQL requests
 */

/**
 * Create a GraphQL client instance
 * This should be used in loaders and actions on the server side
 * 
 * @param endpoint - Optional GraphQL endpoint (defaults to localhost for development)
 * @param options - Optional configuration including headers
 */
export function createGraphQLClient(
  endpoint?: string,
  options?: { headers?: Record<string, string> }
) {
  const graphqlEndpoint = endpoint || 'http://localhost:8787/graphql'
  
  return new GraphQLClient(graphqlEndpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
}

/**
 * Default client instance for basic queries (development only)
 * For production, always pass the endpoint from context.env in loaders/actions
 */
export const graphqlClient = createGraphQLClient()

/**
 * Helper function to handle GraphQL errors consistently
 */
export function handleGraphQLError(error: unknown): Error {
  if (error instanceof Error) {
    console.error('GraphQL Error:', error.message)
    return error
  }
  console.error('Unknown GraphQL Error:', error)
  return new Error('An unknown error occurred')
}
