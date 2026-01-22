export const typeDefs = /* GraphQL */ `
  type Query {
    health: HealthCheck!
    conversation(id: ID!): Conversation
    conversations(orgId: ID!, limit: Int, cursor: String): ConversationConnection!
  }

  type Mutation {
    sendMessage(conversationId: ID!, content: String!): Message!
    createConversation(orgId: ID!, userId: ID!, initialMessage: String!): Conversation!
  }

  type HealthCheck {
    status: String!
    timestamp: String!
  }

  type Conversation {
    id: ID!
    orgId: ID!
    userId: ID!
    status: ConversationStatus!
    messages: [Message!]!
    createdAt: String!
    updatedAt: String!
  }

  type Message {
    id: ID!
    conversationId: ID!
    role: MessageRole!
    content: String!
    timestamp: String!
  }

  type ConversationConnection {
    edges: [ConversationEdge!]!
    pageInfo: PageInfo!
  }

  type ConversationEdge {
    node: Conversation!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  enum ConversationStatus {
    ACTIVE
    RESOLVED
    PENDING_REVIEW
  }

  enum MessageRole {
    USER
    ASSISTANT
    SYSTEM
  }
`
