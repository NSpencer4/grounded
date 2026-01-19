export const typeDefs = `#graphql
  type Query {
    health: HealthCheck!
  }

  type HealthCheck {
    status: String!
    timestamp: String!
  }
`
