import { GraphQLClient } from 'graphql-request'

/**
 * GraphQL Client for Grounded Gateway API
 * Provides a configured client instance for making GraphQL requests
 */

// Get the GraphQL endpoint from environment variables
// Default to localhost for development
const GRAPHQL_ENDPOINT =
  typeof process !== 'undefined'
    ? process.env.GRAPHQL_ENDPOINT || 'http://localhost:8787/graphql'
    : 'http://localhost:8787/graphql'

/**
 * Create a GraphQL client instance
 * This can be used in loaders and actions on the server side
 */
export function createGraphQLClient(options?: { headers?: Record<string, string> }) {
  return new GraphQLClient(GRAPHQL_ENDPOINT, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
}

/**
 * Default client instance for basic queries
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
