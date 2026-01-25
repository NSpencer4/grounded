import { gql } from 'graphql-request'

/**
 * GraphQL Queries for Grounded Gateway API
 * Contains all query operations for fetching data
 */

// ==================== HEALTH & SYSTEM ====================

export const HEALTH_QUERY = gql`
  query Health {
    health {
      status
      timestamp
    }
  }
`

// ==================== CONVERSATIONS ====================

export const GET_CONVERSATION = gql`
  query GetConversation($id: ID!) {
    conversation(id: $id) {
      id
      orgId
      userId
      status
      messages {
        id
        role
        content
        timestamp
      }
      createdAt
      updatedAt
    }
  }
`

export const LIST_CONVERSATIONS = gql`
  query ListConversations($orgId: ID!, $limit: Int, $cursor: String) {
    conversations(orgId: $orgId, limit: $limit, cursor: $cursor) {
      edges {
        node {
          id
          orgId
          userId
          status
          createdAt
          updatedAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

export const GET_CONVERSATION_MESSAGES = gql`
  query GetConversationMessages($conversationId: ID!) {
    conversationMessages(conversationId: $conversationId) {
      id
      conversationId
      role
      content
      timestamp
    }
  }
`

// ==================== ORGANIZATIONS ====================

export const GET_ORGANIZATION = gql`
  query GetOrganization($id: ID!) {
    organization(id: $id) {
      id
      name
      slug
      settings {
        timezone
        locale
        features
      }
      createdAt
      updatedAt
    }
  }
`

// ==================== USERS ====================

export const LIST_USERS = gql`
  query ListUsers($orgId: ID!, $limit: Int, $offset: Int) {
    users(orgId: $orgId, limit: $limit, offset: $offset) {
      id
      orgId
      email
      name
      role
      status
      metadata {
        phone
        department
        title
      }
      createdAt
      updatedAt
    }
  }
`

export const GET_USER = gql`
  query GetUser($orgId: ID!, $id: ID!) {
    user(orgId: $orgId, id: $id) {
      id
      email
      name
      role
      status
      metadata {
        phone
        department
        title
      }
      createdAt
      updatedAt
    }
  }
`

// ==================== REPRESENTATIVES ====================

export const LIST_REPRESENTATIVES = gql`
  query ListRepresentatives($orgId: ID!, $limit: Int, $offset: Int) {
    representatives(orgId: $orgId, limit: $limit, offset: $offset) {
      id
      orgId
      userId
      name
      email
      department
      status
      availability {
        isAvailable
        schedule {
          dayOfWeek
          startTime
          endTime
        }
      }
      metrics {
        totalConversations
        averageResponseTime
        resolutionRate
        customerSatisfaction
      }
      createdAt
      updatedAt
    }
  }
`

export const GET_REPRESENTATIVE = gql`
  query GetRepresentative($orgId: ID!, $id: ID!) {
    representative(orgId: $orgId, id: $id) {
      id
      orgId
      userId
      name
      email
      department
      status
      availability {
        isAvailable
        schedule {
          dayOfWeek
          startTime
          endTime
        }
      }
      metrics {
        totalConversations
        averageResponseTime
        resolutionRate
        customerSatisfaction
      }
      createdAt
      updatedAt
    }
  }
`

// ==================== CUSTOMERS ====================

export const LIST_CUSTOMERS = gql`
  query ListCustomers($orgId: ID!, $limit: Int, $offset: Int) {
    customers(orgId: $orgId, limit: $limit, offset: $offset) {
      id
      orgId
      userId
      name
      email
      phone
      address {
        street
        city
        state
        zip
        country
      }
      status
      metadata {
        accountNumber
        segment
        tags
      }
      createdAt
      updatedAt
    }
  }
`

export const GET_CUSTOMER = gql`
  query GetCustomer($orgId: ID!, $id: ID!) {
    customer(orgId: $orgId, id: $id) {
      id
      orgId
      userId
      name
      email
      phone
      address {
        street
        city
        state
        zip
        country
      }
      status
      metadata {
        accountNumber
        segment
        tags
      }
      createdAt
      updatedAt
    }
  }
`

// ==================== TICKETS ====================

export const LIST_TICKETS = gql`
  query ListTickets(
    $orgId: ID!
    $status: TicketStatus
    $priority: TicketPriority
    $limit: Int
    $offset: Int
  ) {
    tickets(orgId: $orgId, status: $status, priority: $priority, limit: $limit, offset: $offset) {
      id
      orgId
      customerId
      conversationId
      subject
      description
      status
      priority
      category
      assignedTo
      tags
      createdAt
      updatedAt
      resolvedAt
    }
  }
`

// ==================== ESCALATIONS ====================

export const LIST_ESCALATIONS = gql`
  query ListEscalations($orgId: ID!, $status: EscalationStatus, $limit: Int, $offset: Int) {
    escalations(orgId: $orgId, status: $status, limit: $limit, offset: $offset) {
      id
      orgId
      ticketId
      conversationId
      reason
      status
      escalatedFrom
      escalatedTo
      notes
      createdAt
      resolvedAt
    }
  }
`

// ==================== REFUNDS ====================

export const LIST_REFUNDS = gql`
  query ListRefunds($orgId: ID!, $status: RefundStatus, $limit: Int, $offset: Int) {
    refunds(orgId: $orgId, status: $status, limit: $limit, offset: $offset) {
      id
      orgId
      customerId
      orderId
      amount
      currency
      reason
      status
      method
      notes
      processedBy
      createdAt
      processedAt
    }
  }
`

// ==================== BUDGETS ====================

export const LIST_BUDGETS = gql`
  query ListBudgets($orgId: ID!, $limit: Int, $offset: Int) {
    budgets(orgId: $orgId, limit: $limit, offset: $offset) {
      id
      orgId
      name
      type
      amount
      currency
      period
      spent
      remaining
      startDate
      endDate
      status
      createdAt
      updatedAt
    }
  }
`

// ==================== AGENTS ====================

export const LIST_AGENTS = gql`
  query ListAgents($orgId: ID!, $limit: Int, $offset: Int) {
    agents(orgId: $orgId, limit: $limit, offset: $offset) {
      id
      orgId
      name
      type
      description
      status
      config {
        model
        temperature
        maxTokens
        systemPrompt
        tools
      }
      metrics {
        totalInvocations
        successRate
        averageLatency
        lastInvoked
      }
      createdAt
      updatedAt
    }
  }
`

// ==================== PERFORMANCE METRICS ====================

export const GET_PERFORMANCE_METRICS = gql`
  query GetPerformanceMetrics($orgId: ID!, $startDate: String!, $endDate: String!) {
    performanceMetrics(orgId: $orgId, startDate: $startDate, endDate: $endDate) {
      orgId
      period {
        start
        end
      }
      conversations {
        total
        active
        resolved
        escalated
        averageDuration
      }
      representatives {
        total
        active
        averageResponseTime
        averageResolutionRate
      }
      customers {
        total
        new
        returning
        satisfactionScore
      }
      ai {
        totalInvocations
        successRate
        averageLatency
        costSavings
      }
      timestamp
    }
  }
`
