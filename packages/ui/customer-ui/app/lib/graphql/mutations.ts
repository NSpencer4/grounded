import { gql } from 'graphql-request'

/**
 * GraphQL Mutations for Grounded Gateway API
 * Contains all mutation operations for creating, updating, and deleting data
 */

// ==================== CONVERSATIONS ====================

export const CREATE_CONVERSATION = gql`
  mutation CreateConversation($orgId: ID!, $userId: ID!, $initialMessage: String!) {
    createConversation(orgId: $orgId, userId: $userId, initialMessage: $initialMessage) {
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

export const SEND_MESSAGE = gql`
  mutation SendMessage($conversationId: ID!, $content: String!) {
    sendMessage(conversationId: $conversationId, content: $content) {
      id
      conversationId
      role
      content
      timestamp
    }
  }
`

export const UPDATE_CONVERSATION_STATUS = gql`
  mutation UpdateConversationStatus($id: ID!, $status: ConversationStatus!) {
    updateConversationStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`

// ==================== USERS ====================

export const CREATE_USER = gql`
  mutation CreateUser($orgId: ID!, $input: CreateUserInput!) {
    createUser(orgId: $orgId, input: $input) {
      id
      orgId
      email
      name
      role
      status
      createdAt
    }
  }
`

export const UPDATE_USER = gql`
  mutation UpdateUser($orgId: ID!, $id: ID!, $input: UpdateUserInput!) {
    updateUser(orgId: $orgId, id: $id, input: $input) {
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
      updatedAt
    }
  }
`

export const DELETE_USER = gql`
  mutation DeleteUser($orgId: ID!, $id: ID!) {
    deleteUser(orgId: $orgId, id: $id)
  }
`

// ==================== REPRESENTATIVES ====================

export const CREATE_REPRESENTATIVE = gql`
  mutation CreateRepresentative(
    $orgId: ID!
    $userId: ID!
    $name: String!
    $email: String!
    $department: String
    $availability: AvailabilityInput
  ) {
    createRepresentative(
      orgId: $orgId
      userId: $userId
      name: $name
      email: $email
      department: $department
      availability: $availability
    ) {
      id
      orgId
      userId
      name
      email
      department
      status
      createdAt
    }
  }
`

export const UPDATE_REPRESENTATIVE = gql`
  mutation UpdateRepresentative(
    $orgId: ID!
    $id: ID!
    $name: String
    $email: String
    $department: String
    $status: RepresentativeStatus
    $availability: AvailabilityInput
  ) {
    updateRepresentative(
      orgId: $orgId
      id: $id
      name: $name
      email: $email
      department: $department
      status: $status
      availability: $availability
    ) {
      id
      name
      email
      department
      status
      availability {
        isAvailable
      }
      updatedAt
    }
  }
`

export const DELETE_REPRESENTATIVE = gql`
  mutation DeleteRepresentative($orgId: ID!, $id: ID!) {
    deleteRepresentative(orgId: $orgId, id: $id)
  }
`

// ==================== CUSTOMERS ====================

export const CREATE_CUSTOMER = gql`
  mutation CreateCustomer(
    $orgId: ID!
    $userId: ID
    $name: String!
    $email: String!
    $phone: String
    $address: AddressInput
    $metadata: CustomerMetadataInput
  ) {
    createCustomer(
      orgId: $orgId
      userId: $userId
      name: $name
      email: $email
      phone: $phone
      address: $address
      metadata: $metadata
    ) {
      id
      orgId
      name
      email
      phone
      status
      createdAt
    }
  }
`

export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer(
    $orgId: ID!
    $id: ID!
    $name: String
    $email: String
    $phone: String
    $address: AddressInput
    $status: CustomerStatus
    $metadata: CustomerMetadataInput
  ) {
    updateCustomer(
      orgId: $orgId
      id: $id
      name: $name
      email: $email
      phone: $phone
      address: $address
      status: $status
      metadata: $metadata
    ) {
      id
      name
      email
      phone
      status
      updatedAt
    }
  }
`

export const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($orgId: ID!, $id: ID!) {
    deleteCustomer(orgId: $orgId, id: $id)
  }
`

// ==================== TICKETS ====================

export const CREATE_TICKET = gql`
  mutation CreateTicket(
    $orgId: ID!
    $customerId: ID!
    $conversationId: ID
    $subject: String!
    $description: String!
    $priority: TicketPriority
    $category: String
    $tags: [String!]
  ) {
    createTicket(
      orgId: $orgId
      customerId: $customerId
      conversationId: $conversationId
      subject: $subject
      description: $description
      priority: $priority
      category: $category
      tags: $tags
    ) {
      id
      orgId
      customerId
      subject
      status
      priority
      createdAt
    }
  }
`

export const UPDATE_TICKET = gql`
  mutation UpdateTicket(
    $orgId: ID!
    $id: ID!
    $subject: String
    $description: String
    $status: TicketStatus
    $priority: TicketPriority
    $category: String
    $assignedTo: ID
    $tags: [String!]
  ) {
    updateTicket(
      orgId: $orgId
      id: $id
      subject: $subject
      description: $description
      status: $status
      priority: $priority
      category: $category
      assignedTo: $assignedTo
      tags: $tags
    ) {
      id
      subject
      status
      priority
      assignedTo
      updatedAt
    }
  }
`

export const RESOLVE_TICKET = gql`
  mutation ResolveTicket($orgId: ID!, $id: ID!, $resolution: String!) {
    resolveTicket(orgId: $orgId, id: $id, resolution: $resolution) {
      id
      status
      resolvedAt
    }
  }
`

export const DELETE_TICKET = gql`
  mutation DeleteTicket($orgId: ID!, $id: ID!) {
    deleteTicket(orgId: $orgId, id: $id)
  }
`

// ==================== ESCALATIONS ====================

export const CREATE_ESCALATION = gql`
  mutation CreateEscalation(
    $orgId: ID!
    $ticketId: ID!
    $conversationId: ID
    $reason: String!
    $escalatedTo: ID!
    $notes: String
  ) {
    createEscalation(
      orgId: $orgId
      ticketId: $ticketId
      conversationId: $conversationId
      reason: $reason
      escalatedTo: $escalatedTo
      notes: $notes
    ) {
      id
      orgId
      ticketId
      reason
      status
      escalatedTo
      createdAt
    }
  }
`

export const RESOLVE_ESCALATION = gql`
  mutation ResolveEscalation($orgId: ID!, $id: ID!, $resolution: String!) {
    resolveEscalation(orgId: $orgId, id: $id, resolution: $resolution) {
      id
      status
      resolvedAt
    }
  }
`

// ==================== REFUNDS ====================

export const CREATE_REFUND = gql`
  mutation CreateRefund(
    $orgId: ID!
    $customerId: ID!
    $orderId: String!
    $amount: Float!
    $currency: String!
    $reason: String!
    $method: String
    $notes: String
  ) {
    createRefund(
      orgId: $orgId
      customerId: $customerId
      orderId: $orderId
      amount: $amount
      currency: $currency
      reason: $reason
      method: $method
      notes: $notes
    ) {
      id
      orgId
      customerId
      orderId
      amount
      currency
      reason
      status
      createdAt
    }
  }
`

export const PROCESS_REFUND = gql`
  mutation ProcessRefund($orgId: ID!, $id: ID!, $notes: String) {
    processRefund(orgId: $orgId, id: $id, notes: $notes) {
      id
      status
      processedAt
      processedBy
    }
  }
`

// ==================== BUDGETS ====================

export const CREATE_BUDGET = gql`
  mutation CreateBudget(
    $orgId: ID!
    $name: String!
    $type: BudgetType!
    $amount: Float!
    $currency: String!
    $period: BudgetPeriod!
    $startDate: String!
    $endDate: String!
  ) {
    createBudget(
      orgId: $orgId
      name: $name
      type: $type
      amount: $amount
      currency: $currency
      period: $period
      startDate: $startDate
      endDate: $endDate
    ) {
      id
      orgId
      name
      type
      amount
      currency
      period
      status
      createdAt
    }
  }
`

export const UPDATE_BUDGET = gql`
  mutation UpdateBudget(
    $orgId: ID!
    $id: ID!
    $name: String
    $amount: Float
    $status: BudgetStatus
  ) {
    updateBudget(orgId: $orgId, id: $id, name: $name, amount: $amount, status: $status) {
      id
      name
      amount
      status
      updatedAt
    }
  }
`

// ==================== AGENTS ====================

export const CREATE_AGENT = gql`
  mutation CreateAgent(
    $orgId: ID!
    $name: String!
    $type: AgentType!
    $description: String!
    $config: AgentConfigInput!
  ) {
    createAgent(
      orgId: $orgId
      name: $name
      type: $type
      description: $description
      config: $config
    ) {
      id
      orgId
      name
      type
      description
      status
      createdAt
    }
  }
`

export const UPDATE_AGENT = gql`
  mutation UpdateAgent(
    $orgId: ID!
    $id: ID!
    $name: String
    $description: String
    $status: AgentStatus
    $config: AgentConfigInput
  ) {
    updateAgent(
      orgId: $orgId
      id: $id
      name: $name
      description: $description
      status: $status
      config: $config
    ) {
      id
      name
      description
      status
      config {
        model
        temperature
        maxTokens
      }
      updatedAt
    }
  }
`

export const DELETE_AGENT = gql`
  mutation DeleteAgent($orgId: ID!, $id: ID!) {
    deleteAgent(orgId: $orgId, id: $id)
  }
`

// ==================== DECISION RULES ====================

export const CREATE_DECISION_RULE = gql`
  mutation CreateDecisionRule(
    $orgId: ID!
    $name: String!
    $description: String!
    $conditions: [RuleConditionInput!]!
    $actions: [RuleActionInput!]!
    $priority: Int!
  ) {
    createDecisionRule(
      orgId: $orgId
      name: $name
      description: $description
      conditions: $conditions
      actions: $actions
      priority: $priority
    ) {
      id
      orgId
      name
      description
      status
      priority
      createdAt
    }
  }
`

export const UPDATE_DECISION_RULE = gql`
  mutation UpdateDecisionRule(
    $orgId: ID!
    $id: ID!
    $name: String
    $description: String
    $status: DecisionRuleStatus
    $conditions: [RuleConditionInput!]
    $actions: [RuleActionInput!]
    $priority: Int
  ) {
    updateDecisionRule(
      orgId: $orgId
      id: $id
      name: $name
      description: $description
      status: $status
      conditions: $conditions
      actions: $actions
      priority: $priority
    ) {
      id
      name
      description
      status
      priority
      updatedAt
    }
  }
`

export const DELETE_DECISION_RULE = gql`
  mutation DeleteDecisionRule($orgId: ID!, $id: ID!) {
    deleteDecisionRule(orgId: $orgId, id: $id)
  }
`
