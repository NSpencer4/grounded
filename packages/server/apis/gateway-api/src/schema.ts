export const typeDefs = /* GraphQL */ `
  # ===== QUERIES =====
  type Query {
    # Health check
    health: HealthCheck!

    # Conversations (Conversation Updates API)
    conversation(id: ID!): Conversation
    conversations(orgId: ID!, limit: Int, cursor: String): ConversationConnection!
    conversationMessages(conversationId: ID!): [Message!]!

    # Organizations (Organization API)
    organization(id: ID!): Organization

    # Users (Organization API)
    users(orgId: ID!, limit: Int, offset: Int): [User!]!
    user(orgId: ID!, id: ID!): User

    # Representatives (Organization API)
    representatives(orgId: ID!, limit: Int, offset: Int): [Representative!]!
    representative(orgId: ID!, id: ID!): Representative
    representativePerformance(
      orgId: ID!
      repId: ID!
      startDate: String
      endDate: String
    ): PerformanceMetrics

    # Customer Profiles (Organization API)
    customerProfiles(orgId: ID!, limit: Int, offset: Int): [CustomerProfile!]!
    customerProfile(orgId: ID!, id: ID!): CustomerProfile

    # Tickets (Organization API)
    tickets(orgId: ID!, status: String, limit: Int, offset: Int): [Ticket!]!
    ticket(orgId: ID!, id: ID!): Ticket

    # Escalations (Organization API)
    escalations(orgId: ID!, status: String, limit: Int, offset: Int): [Escalation!]!
    escalation(orgId: ID!, id: ID!): Escalation

    # Refunds (Organization API)
    refunds(orgId: ID!, status: String, limit: Int, offset: Int): [Refund!]!
    refund(orgId: ID!, id: ID!): Refund

    # Budgets (Organization API)
    budgets(orgId: ID!, limit: Int, offset: Int): [Budget!]!
    budget(orgId: ID!, id: ID!): Budget

    # Agent Configurations (Organization API)
    agentConfigurations(orgId: ID!, limit: Int, offset: Int): [AgentConfiguration!]!
    agentConfiguration(orgId: ID!, id: ID!): AgentConfiguration

    # Decision Rules (Organization API)
    decisionRules(orgId: ID!, limit: Int, offset: Int): [DecisionRule!]!
    decisionRule(orgId: ID!, id: ID!): DecisionRule

    # Performance Metrics (Organization API)
    performanceMetrics(orgId: ID!, startDate: String, endDate: String): [PerformanceMetrics!]!
    teamPerformance(orgId: ID!, startDate: String, endDate: String): [TeamPerformance!]!
  }

  # ===== MUTATIONS =====
  type Mutation {
    # Conversations (Conversation Commands API)
    sendMessage(conversationId: ID!, content: String!): Message!
    createConversation(orgId: ID!, userId: ID!, initialMessage: String!): Conversation!

    # Organizations (Organization API)
    createOrganization(input: CreateOrganizationInput!): Organization!
    updateOrganization(id: ID!, input: UpdateOrganizationInput!): Organization!
    deleteOrganization(id: ID!): DeleteResult!

    # Users (Organization API)
    createUser(orgId: ID!, input: CreateUserInput!): User!
    updateUser(orgId: ID!, id: ID!, input: UpdateUserInput!): User!
    deleteUser(orgId: ID!, id: ID!): DeleteResult!

    # Representatives (Organization API)
    createRepresentative(orgId: ID!, input: CreateRepresentativeInput!): Representative!
    updateRepresentative(orgId: ID!, id: ID!, input: UpdateRepresentativeInput!): Representative!
    deleteRepresentative(orgId: ID!, id: ID!): DeleteResult!

    # Customer Profiles (Organization API)
    createCustomerProfile(orgId: ID!, input: CreateCustomerProfileInput!): CustomerProfile!
    updateCustomerProfile(orgId: ID!, id: ID!, input: UpdateCustomerProfileInput!): CustomerProfile!
    deleteCustomerProfile(orgId: ID!, id: ID!): DeleteResult!

    # Tickets (Organization API)
    createTicket(orgId: ID!, input: CreateTicketInput!): Ticket!
    updateTicket(orgId: ID!, id: ID!, input: UpdateTicketInput!): Ticket!
    deleteTicket(orgId: ID!, id: ID!): DeleteResult!

    # Escalations (Organization API)
    createEscalation(orgId: ID!, input: CreateEscalationInput!): Escalation!
    updateEscalation(orgId: ID!, id: ID!, input: UpdateEscalationInput!): Escalation!
    deleteEscalation(orgId: ID!, id: ID!): DeleteResult!

    # Refunds (Organization API)
    createRefund(orgId: ID!, input: CreateRefundInput!): Refund!
    updateRefund(orgId: ID!, id: ID!, input: UpdateRefundInput!): Refund!
    deleteRefund(orgId: ID!, id: ID!): DeleteResult!

    # Budgets (Organization API)
    createBudget(orgId: ID!, input: CreateBudgetInput!): Budget!
    updateBudget(orgId: ID!, id: ID!, input: UpdateBudgetInput!): Budget!
    deleteBudget(orgId: ID!, id: ID!): DeleteResult!

    # Agent Configurations (Organization API)
    createAgentConfiguration(orgId: ID!, input: CreateAgentConfigurationInput!): AgentConfiguration!
    updateAgentConfiguration(
      orgId: ID!
      id: ID!
      input: UpdateAgentConfigurationInput!
    ): AgentConfiguration!
    deleteAgentConfiguration(orgId: ID!, id: ID!): DeleteResult!

    # Decision Rules (Organization API)
    createDecisionRule(orgId: ID!, input: CreateDecisionRuleInput!): DecisionRule!
    updateDecisionRule(orgId: ID!, id: ID!, input: UpdateDecisionRuleInput!): DecisionRule!
    deleteDecisionRule(orgId: ID!, id: ID!): DeleteResult!
  }

  # ===== COMMON TYPES =====
  type HealthCheck {
    status: String!
    timestamp: String!
  }

  type DeleteResult {
    success: Boolean!
    message: String
  }

  # ===== CONVERSATION TYPES =====
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

  # ===== ORGANIZATION TYPES =====
  type Organization {
    id: ID!
    name: String!
    slug: String!
    settings: OrganizationSettings
    createdAt: String!
    updatedAt: String!
  }

  type OrganizationSettings {
    timezone: String
    locale: String
    features: [String!]
  }

  input CreateOrganizationInput {
    name: String!
    slug: String!
    settings: OrganizationSettingsInput
  }

  input UpdateOrganizationInput {
    name: String
    slug: String
    settings: OrganizationSettingsInput
  }

  input OrganizationSettingsInput {
    timezone: String
    locale: String
    features: [String!]
  }

  # ===== USER TYPES =====
  type User {
    id: ID!
    orgId: ID!
    email: String!
    name: String!
    role: UserRole!
    status: UserStatus!
    metadata: UserMetadata
    createdAt: String!
    updatedAt: String!
  }

  type UserMetadata {
    phone: String
    department: String
    title: String
  }

  enum UserRole {
    ADMIN
    AGENT
    CUSTOMER
  }

  enum UserStatus {
    ACTIVE
    INACTIVE
    SUSPENDED
  }

  input CreateUserInput {
    email: String!
    name: String!
    role: UserRole!
    status: UserStatus
    metadata: UserMetadataInput
  }

  input UpdateUserInput {
    email: String
    name: String
    role: UserRole
    status: UserStatus
    metadata: UserMetadataInput
  }

  input UserMetadataInput {
    phone: String
    department: String
    title: String
  }

  # ===== REPRESENTATIVE TYPES =====
  type Representative {
    id: ID!
    orgId: ID!
    userId: ID!
    name: String!
    email: String!
    department: String
    status: RepresentativeStatus!
    availability: Availability
    skills: [String!]
    createdAt: String!
    updatedAt: String!
  }

  type Availability {
    isOnline: Boolean!
    lastActive: String
    schedule: Schedule
  }

  type Schedule {
    monday: [TimeSlot!]
    tuesday: [TimeSlot!]
    wednesday: [TimeSlot!]
    thursday: [TimeSlot!]
    friday: [TimeSlot!]
    saturday: [TimeSlot!]
    sunday: [TimeSlot!]
  }

  type TimeSlot {
    start: String!
    end: String!
  }

  enum RepresentativeStatus {
    ACTIVE
    INACTIVE
    ON_BREAK
  }

  input CreateRepresentativeInput {
    userId: ID!
    name: String!
    email: String!
    department: String
    status: RepresentativeStatus
    availability: AvailabilityInput
    skills: [String!]
  }

  input UpdateRepresentativeInput {
    name: String
    email: String
    department: String
    status: RepresentativeStatus
    availability: AvailabilityInput
    skills: [String!]
  }

  input AvailabilityInput {
    isOnline: Boolean
    schedule: ScheduleInput
  }

  input ScheduleInput {
    monday: [TimeSlotInput!]
    tuesday: [TimeSlotInput!]
    wednesday: [TimeSlotInput!]
    thursday: [TimeSlotInput!]
    friday: [TimeSlotInput!]
    saturday: [TimeSlotInput!]
    sunday: [TimeSlotInput!]
  }

  input TimeSlotInput {
    start: String!
    end: String!
  }

  # ===== CUSTOMER PROFILE TYPES =====
  type CustomerProfile {
    id: ID!
    orgId: ID!
    userId: ID!
    name: String!
    email: String!
    phone: String
    segment: String
    lifetimeValue: Float
    totalSpend: Float
    orderCount: Int
    metadata: CustomerMetadata
    createdAt: String!
    updatedAt: String!
  }

  type CustomerMetadata {
    accountAge: Int
    lastPurchaseDate: String
    averageOrderValue: Float
    preferredContactMethod: String
    tags: [String!]
  }

  input CreateCustomerProfileInput {
    userId: ID!
    name: String!
    email: String!
    phone: String
    segment: String
    lifetimeValue: Float
    totalSpend: Float
    orderCount: Int
    metadata: CustomerMetadataInput
  }

  input UpdateCustomerProfileInput {
    name: String
    email: String
    phone: String
    segment: String
    lifetimeValue: Float
    totalSpend: Float
    orderCount: Int
    metadata: CustomerMetadataInput
  }

  input CustomerMetadataInput {
    accountAge: Int
    lastPurchaseDate: String
    averageOrderValue: Float
    preferredContactMethod: String
    tags: [String!]
  }

  # ===== TICKET TYPES =====
  type Ticket {
    id: ID!
    orgId: ID!
    conversationId: ID
    customerId: ID!
    assignedTo: ID
    subject: String!
    description: String
    status: TicketStatus!
    priority: TicketPriority!
    category: String
    tags: [String!]
    createdAt: String!
    updatedAt: String!
    resolvedAt: String
  }

  enum TicketStatus {
    OPEN
    IN_PROGRESS
    WAITING_ON_CUSTOMER
    RESOLVED
    CLOSED
  }

  enum TicketPriority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  input CreateTicketInput {
    conversationId: ID
    customerId: ID!
    assignedTo: ID
    subject: String!
    description: String
    status: TicketStatus
    priority: TicketPriority!
    category: String
    tags: [String!]
  }

  input UpdateTicketInput {
    assignedTo: ID
    subject: String
    description: String
    status: TicketStatus
    priority: TicketPriority
    category: String
    tags: [String!]
  }

  # ===== ESCALATION TYPES =====
  type Escalation {
    id: ID!
    orgId: ID!
    ticketId: ID!
    conversationId: ID
    escalatedBy: ID!
    escalatedTo: ID!
    reason: String!
    status: EscalationStatus!
    resolvedAt: String
    resolution: String
    createdAt: String!
    updatedAt: String!
  }

  enum EscalationStatus {
    PENDING
    IN_PROGRESS
    RESOLVED
    CANCELLED
  }

  input CreateEscalationInput {
    ticketId: ID!
    conversationId: ID
    escalatedBy: ID!
    escalatedTo: ID!
    reason: String!
    status: EscalationStatus
  }

  input UpdateEscalationInput {
    escalatedTo: ID
    reason: String
    status: EscalationStatus
    resolution: String
  }

  # ===== REFUND TYPES =====
  type Refund {
    id: ID!
    orgId: ID!
    ticketId: ID
    customerId: ID!
    orderId: String!
    amount: Float!
    reason: String!
    status: RefundStatus!
    approvedBy: ID
    processedAt: String
    metadata: RefundMetadata
    createdAt: String!
    updatedAt: String!
  }

  type RefundMetadata {
    paymentMethod: String
    transactionId: String
    notes: String
  }

  enum RefundStatus {
    PENDING
    APPROVED
    DENIED
    PROCESSED
    FAILED
  }

  input CreateRefundInput {
    ticketId: ID
    customerId: ID!
    orderId: String!
    amount: Float!
    reason: String!
    status: RefundStatus
    metadata: RefundMetadataInput
  }

  input UpdateRefundInput {
    amount: Float
    reason: String
    status: RefundStatus
    approvedBy: ID
    metadata: RefundMetadataInput
  }

  input RefundMetadataInput {
    paymentMethod: String
    transactionId: String
    notes: String
  }

  # ===== BUDGET TYPES =====
  type Budget {
    id: ID!
    orgId: ID!
    name: String!
    category: BudgetCategory!
    amount: Float!
    period: BudgetPeriod!
    spent: Float!
    remaining: Float!
    startDate: String!
    endDate: String!
    alerts: BudgetAlerts
    createdAt: String!
    updatedAt: String!
  }

  type BudgetAlerts {
    enabled: Boolean!
    thresholds: [Int!]
    recipients: [String!]
  }

  enum BudgetCategory {
    REFUNDS
    DISCOUNTS
    CREDITS
    SHIPPING
    OTHER
  }

  enum BudgetPeriod {
    DAILY
    WEEKLY
    MONTHLY
    QUARTERLY
    YEARLY
  }

  input CreateBudgetInput {
    name: String!
    category: BudgetCategory!
    amount: Float!
    period: BudgetPeriod!
    startDate: String!
    endDate: String!
    alerts: BudgetAlertsInput
  }

  input UpdateBudgetInput {
    name: String
    category: BudgetCategory
    amount: Float
    period: BudgetPeriod
    spent: Float
    startDate: String
    endDate: String
    alerts: BudgetAlertsInput
  }

  input BudgetAlertsInput {
    enabled: Boolean!
    thresholds: [Int!]
    recipients: [String!]
  }

  # ===== AGENT CONFIGURATION TYPES =====
  type AgentConfiguration {
    id: ID!
    orgId: ID!
    name: String!
    type: AgentType!
    status: AgentStatus!
    config: AgentConfig!
    capabilities: [String!]
    constraints: AgentConstraints
    createdAt: String!
    updatedAt: String!
  }

  type AgentConfig {
    model: String!
    temperature: Float
    maxTokens: Int
    systemPrompt: String
    tools: [String!]
  }

  type AgentConstraints {
    maxRefundAmount: Float
    maxDiscountPercent: Float
    requiresApprovalAbove: Float
    allowedActions: [String!]
  }

  enum AgentType {
    CUSTOMER_SERVICE
    SALES
    TECHNICAL_SUPPORT
    BILLING
    GENERAL
  }

  enum AgentStatus {
    ACTIVE
    INACTIVE
    TRAINING
    MAINTENANCE
  }

  input CreateAgentConfigurationInput {
    name: String!
    type: AgentType!
    status: AgentStatus
    config: AgentConfigInput!
    capabilities: [String!]
    constraints: AgentConstraintsInput
  }

  input UpdateAgentConfigurationInput {
    name: String
    type: AgentType
    status: AgentStatus
    config: AgentConfigInput
    capabilities: [String!]
    constraints: AgentConstraintsInput
  }

  input AgentConfigInput {
    model: String!
    temperature: Float
    maxTokens: Int
    systemPrompt: String
    tools: [String!]
  }

  input AgentConstraintsInput {
    maxRefundAmount: Float
    maxDiscountPercent: Float
    requiresApprovalAbove: Float
    allowedActions: [String!]
  }

  # ===== DECISION RULE TYPES =====
  type DecisionRule {
    id: ID!
    orgId: ID!
    name: String!
    description: String
    conditions: [RuleCondition!]!
    actions: [RuleAction!]!
    priority: Int!
    status: RuleStatus!
    metadata: RuleMetadata
    createdAt: String!
    updatedAt: String!
  }

  type RuleCondition {
    field: String!
    operator: RuleOperator!
    value: String!
  }

  type RuleAction {
    type: RuleActionType!
    params: ActionParams!
  }

  type ActionParams {
    template: String
    amount: Float
    assignTo: String
    escalateTo: String
    priority: String
  }

  type RuleMetadata {
    tags: [String!]
    category: String
    author: String
    lastModifiedBy: String
  }

  enum RuleOperator {
    EQUALS
    NOT_EQUALS
    GREATER_THAN
    LESS_THAN
    CONTAINS
    NOT_CONTAINS
    IN
    NOT_IN
  }

  enum RuleActionType {
    AUTO_RESPOND
    ASSIGN_TO
    ESCALATE
    SET_PRIORITY
    ADD_TAG
    TRIGGER_WORKFLOW
  }

  enum RuleStatus {
    ACTIVE
    INACTIVE
    DRAFT
  }

  input CreateDecisionRuleInput {
    name: String!
    description: String
    conditions: [RuleConditionInput!]!
    actions: [RuleActionInput!]!
    priority: Int!
    status: RuleStatus
    metadata: RuleMetadataInput
  }

  input UpdateDecisionRuleInput {
    name: String
    description: String
    conditions: [RuleConditionInput!]
    actions: [RuleActionInput!]
    priority: Int
    status: RuleStatus
    metadata: RuleMetadataInput
  }

  input RuleConditionInput {
    field: String!
    operator: RuleOperator!
    value: String!
  }

  input RuleActionInput {
    type: RuleActionType!
    params: ActionParamsInput!
  }

  input ActionParamsInput {
    template: String
    amount: Float
    assignTo: String
    escalateTo: String
    priority: String
  }

  input RuleMetadataInput {
    tags: [String!]
    category: String
  }

  # ===== PERFORMANCE METRICS TYPES =====
  type PerformanceMetrics {
    id: ID!
    orgId: ID!
    representativeId: ID
    period: String!
    metrics: Metrics!
    createdAt: String!
    updatedAt: String!
  }

  type Metrics {
    totalConversations: Int!
    resolvedConversations: Int!
    averageResponseTime: Float!
    averageResolutionTime: Float!
    customerSatisfactionScore: Float
    firstContactResolutionRate: Float
    escalationRate: Float
  }

  type TeamPerformance {
    period: String!
    totalMembers: Int!
    activeMembers: Int!
    metrics: Metrics!
    topPerformers: [Representative!]
  }
`
