# GraphQL Gateway API Reference

This GraphQL API serves as the unified gateway for all Grounded services, providing a single endpoint to interact with:

- **Conversation Commands API** (Ruby on Rails - Write Operations)
- **Conversation Updates API** (Ruby on Rails - Read Operations)
- **Organization API** (Node.js Lambda - Organization Data)

## Endpoints

- **GraphQL**: `/graphql`
- **GraphiQL Playground**: `/graphql` (in development)
- **Health Check**: `/health`
- **SSE Streaming**: `/sse/:conversationId`

## Environment Variables

Configure these in `wrangler.jsonc` or your deployment environment:

```jsonc
{
  "vars": {
    "CONVERSATION_COMMANDS_API_URL": "https://commands-api.example.com",
    "CONVERSATION_UPDATES_API_URL": "https://updates-api.example.com",
    "ORGANIZATION_API_URL": "https://organization-api.example.com"
  }
}
```

## Queries

### Health & System

#### `health`
Health check query.

```graphql
query {
  health {
    status
    timestamp
  }
}
```

---

### Conversations

#### `conversation`
Fetch a single conversation by ID.

```graphql
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
```

#### `conversations`
List conversations for an organization with pagination.

```graphql
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
```

#### `conversationMessages`
Fetch all messages for a conversation.

```graphql
query GetMessages($conversationId: ID!) {
  conversationMessages(conversationId: $conversationId) {
    id
    conversationId
    role
    content
    timestamp
  }
}
```

---

### Organizations

#### `organization`
Fetch a single organization.

```graphql
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
```

---

### Users

#### `users`
List users in an organization.

```graphql
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
```

#### `user`
Fetch a single user.

```graphql
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
  }
}
```

---

### Representatives

#### `representatives`
List customer service representatives.

```graphql
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
      isOnline
      lastActive
    }
    skills
    createdAt
    updatedAt
  }
}
```

#### `representative`
Fetch a single representative.

```graphql
query GetRepresentative($orgId: ID!, $id: ID!) {
  representative(orgId: $orgId, id: $id) {
    id
    name
    email
    department
    status
    availability {
      isOnline
      lastActive
      schedule {
        monday {
          start
          end
        }
        # ... other days
      }
    }
    skills
  }
}
```

#### `representativePerformance`
Get performance metrics for a representative.

```graphql
query GetRepPerformance($orgId: ID!, $repId: ID!, $startDate: String, $endDate: String) {
  representativePerformance(
    orgId: $orgId
    repId: $repId
    startDate: $startDate
    endDate: $endDate
  ) {
    id
    period
    metrics {
      totalConversations
      resolvedConversations
      averageResponseTime
      averageResolutionTime
      customerSatisfactionScore
      firstContactResolutionRate
      escalationRate
    }
  }
}
```

---

### Customer Profiles

#### `customerProfiles`
List customer profiles.

```graphql
query ListCustomerProfiles($orgId: ID!, $limit: Int, $offset: Int) {
  customerProfiles(orgId: $orgId, limit: $limit, offset: $offset) {
    id
    orgId
    userId
    name
    email
    phone
    segment
    lifetimeValue
    totalSpend
    orderCount
    metadata {
      accountAge
      lastPurchaseDate
      averageOrderValue
      preferredContactMethod
      tags
    }
    createdAt
    updatedAt
  }
}
```

#### `customerProfile`
Fetch a single customer profile.

```graphql
query GetCustomerProfile($orgId: ID!, $id: ID!) {
  customerProfile(orgId: $orgId, id: $id) {
    id
    name
    email
    phone
    segment
    lifetimeValue
    totalSpend
    orderCount
    metadata {
      accountAge
      lastPurchaseDate
      averageOrderValue
      tags
    }
  }
}
```

---

### Tickets

#### `tickets`
List support tickets with optional status filter.

```graphql
query ListTickets($orgId: ID!, $status: String, $limit: Int, $offset: Int) {
  tickets(orgId: $orgId, status: $status, limit: $limit, offset: $offset) {
    id
    orgId
    conversationId
    customerId
    assignedTo
    subject
    description
    status
    priority
    category
    tags
    createdAt
    updatedAt
    resolvedAt
  }
}
```

#### `ticket`
Fetch a single ticket.

```graphql
query GetTicket($orgId: ID!, $id: ID!) {
  ticket(orgId: $orgId, id: $id) {
    id
    subject
    description
    status
    priority
    category
    tags
    createdAt
    resolvedAt
  }
}
```

---

### Escalations

#### `escalations`
List escalations with optional status filter.

```graphql
query ListEscalations($orgId: ID!, $status: String, $limit: Int, $offset: Int) {
  escalations(orgId: $orgId, status: $status, limit: $limit, offset: $offset) {
    id
    orgId
    ticketId
    conversationId
    escalatedBy
    escalatedTo
    reason
    status
    resolvedAt
    resolution
    createdAt
    updatedAt
  }
}
```

#### `escalation`
Fetch a single escalation.

```graphql
query GetEscalation($orgId: ID!, $id: ID!) {
  escalation(orgId: $orgId, id: $id) {
    id
    ticketId
    reason
    status
    resolution
    createdAt
  }
}
```

---

### Refunds

#### `refunds`
List refunds with optional status filter.

```graphql
query ListRefunds($orgId: ID!, $status: String, $limit: Int, $offset: Int) {
  refunds(orgId: $orgId, status: $status, limit: $limit, offset: $offset) {
    id
    orgId
    ticketId
    customerId
    orderId
    amount
    reason
    status
    approvedBy
    processedAt
    metadata {
      paymentMethod
      transactionId
      notes
    }
    createdAt
    updatedAt
  }
}
```

#### `refund`
Fetch a single refund.

```graphql
query GetRefund($orgId: ID!, $id: ID!) {
  refund(orgId: $orgId, id: $id) {
    id
    orderId
    amount
    reason
    status
    approvedBy
    processedAt
    metadata {
      paymentMethod
      transactionId
      notes
    }
  }
}
```

---

### Budgets

#### `budgets`
List budgets for an organization.

```graphql
query ListBudgets($orgId: ID!, $limit: Int, $offset: Int) {
  budgets(orgId: $orgId, limit: $limit, offset: $offset) {
    id
    orgId
    name
    category
    amount
    period
    spent
    remaining
    startDate
    endDate
    alerts {
      enabled
      thresholds
      recipients
    }
    createdAt
    updatedAt
  }
}
```

#### `budget`
Fetch a single budget.

```graphql
query GetBudget($orgId: ID!, $id: ID!) {
  budget(orgId: $orgId, id: $id) {
    id
    name
    category
    amount
    spent
    remaining
    period
    startDate
    endDate
  }
}
```

---

### Agent Configurations

#### `agentConfigurations`
List AI agent configurations.

```graphql
query ListAgentConfigs($orgId: ID!, $limit: Int, $offset: Int) {
  agentConfigurations(orgId: $orgId, limit: $limit, offset: $offset) {
    id
    orgId
    name
    type
    status
    config {
      model
      temperature
      maxTokens
      systemPrompt
      tools
    }
    capabilities
    constraints {
      maxRefundAmount
      maxDiscountPercent
      requiresApprovalAbove
      allowedActions
    }
    createdAt
    updatedAt
  }
}
```

#### `agentConfiguration`
Fetch a single agent configuration.

```graphql
query GetAgentConfig($orgId: ID!, $id: ID!) {
  agentConfiguration(orgId: $orgId, id: $id) {
    id
    name
    type
    status
    config {
      model
      temperature
      maxTokens
      systemPrompt
      tools
    }
    capabilities
    constraints {
      maxRefundAmount
      maxDiscountPercent
      requiresApprovalAbove
      allowedActions
    }
  }
}
```

---

### Decision Rules

#### `decisionRules`
List decision rules for automated workflows.

```graphql
query ListDecisionRules($orgId: ID!, $limit: Int, $offset: Int) {
  decisionRules(orgId: $orgId, limit: $limit, offset: $offset) {
    id
    orgId
    name
    description
    conditions {
      field
      operator
      value
    }
    actions {
      type
      params {
        template
        amount
        assignTo
        escalateTo
        priority
      }
    }
    priority
    status
    metadata {
      tags
      category
      author
      lastModifiedBy
    }
    createdAt
    updatedAt
  }
}
```

#### `decisionRule`
Fetch a single decision rule.

```graphql
query GetDecisionRule($orgId: ID!, $id: ID!) {
  decisionRule(orgId: $orgId, id: $id) {
    id
    name
    description
    conditions {
      field
      operator
      value
    }
    actions {
      type
      params {
        template
        amount
      }
    }
    priority
    status
  }
}
```

---

### Performance Metrics

#### `performanceMetrics`
Get organization-wide performance metrics.

```graphql
query GetPerformanceMetrics($orgId: ID!, $startDate: String, $endDate: String) {
  performanceMetrics(orgId: $orgId, startDate: $startDate, endDate: $endDate) {
    id
    orgId
    period
    metrics {
      totalConversations
      resolvedConversations
      averageResponseTime
      averageResolutionTime
      customerSatisfactionScore
      firstContactResolutionRate
      escalationRate
    }
    createdAt
    updatedAt
  }
}
```

#### `teamPerformance`
Get team performance metrics.

```graphql
query GetTeamPerformance($orgId: ID!, $startDate: String, $endDate: String) {
  teamPerformance(orgId: $orgId, startDate: $startDate, endDate: $endDate) {
    period
    totalMembers
    activeMembers
    metrics {
      totalConversations
      resolvedConversations
      averageResponseTime
      averageResolutionTime
      customerSatisfactionScore
    }
    topPerformers {
      id
      name
      email
    }
  }
}
```

---

## Mutations

### Conversations

#### `createConversation`
Create a new conversation.

```graphql
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
```

#### `sendMessage`
Send a message in a conversation.

```graphql
mutation SendMessage($conversationId: ID!, $content: String!) {
  sendMessage(conversationId: $conversationId, content: $content) {
    id
    conversationId
    role
    content
    timestamp
  }
}
```

---

### Organizations

#### `createOrganization`
Create a new organization.

```graphql
mutation CreateOrganization($input: CreateOrganizationInput!) {
  createOrganization(input: $input) {
    id
    name
    slug
    createdAt
  }
}
```

**Input:**
```json
{
  "input": {
    "name": "Acme Corp",
    "slug": "acme-corp",
    "settings": {
      "timezone": "America/New_York",
      "locale": "en-US",
      "features": ["ai-agents", "analytics"]
    }
  }
}
```

#### `updateOrganization`
Update an organization.

```graphql
mutation UpdateOrganization($id: ID!, $input: UpdateOrganizationInput!) {
  updateOrganization(id: $id, input: $input) {
    id
    name
    slug
    updatedAt
  }
}
```

#### `deleteOrganization`
Delete an organization.

```graphql
mutation DeleteOrganization($id: ID!) {
  deleteOrganization(id: $id) {
    success
    message
  }
}
```

---

### Users

#### `createUser`
Create a new user.

```graphql
mutation CreateUser($orgId: ID!, $input: CreateUserInput!) {
  createUser(orgId: $orgId, input: $input) {
    id
    email
    name
    role
    status
    createdAt
  }
}
```

**Input:**
```json
{
  "orgId": "5d18b2ef-f9a0-4ba7-97c9-c7d61b5ed4f0",
  "input": {
    "email": "john@example.com",
    "name": "John Doe",
    "role": "AGENT",
    "status": "ACTIVE",
    "metadata": {
      "phone": "+1234567890",
      "department": "Customer Support",
      "title": "Support Specialist"
    }
  }
}
```

#### `updateUser`
Update a user.

```graphql
mutation UpdateUser($orgId: ID!, $id: ID!, $input: UpdateUserInput!) {
  updateUser(orgId: $orgId, id: $id, input: $input) {
    id
    email
    name
    role
    status
    updatedAt
  }
}
```

#### `deleteUser`
Delete a user.

```graphql
mutation DeleteUser($orgId: ID!, $id: ID!) {
  deleteUser(orgId: $orgId, id: $id) {
    success
    message
  }
}
```

---

### Representatives

#### `createRepresentative`
Create a new customer service representative.

```graphql
mutation CreateRepresentative($orgId: ID!, $input: CreateRepresentativeInput!) {
  createRepresentative(orgId: $orgId, input: $input) {
    id
    name
    email
    department
    status
    createdAt
  }
}
```

**Input:**
```json
{
  "orgId": "5d18b2ef-f9a0-4ba7-97c9-c7d61b5ed4f0",
  "input": {
    "userId": "user_456",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "department": "Customer Support",
    "status": "ACTIVE",
    "availability": {
      "isOnline": true,
      "schedule": {
        "monday": [
          { "start": "09:00", "end": "17:00" }
        ]
      }
    },
    "skills": ["billing", "technical-support", "refunds"]
  }
}
```

#### `updateRepresentative`
Update a representative.

```graphql
mutation UpdateRepresentative($orgId: ID!, $id: ID!, $input: UpdateRepresentativeInput!) {
  updateRepresentative(orgId: $orgId, id: $id, input: $input) {
    id
    name
    status
    updatedAt
  }
}
```

#### `deleteRepresentative`
Delete a representative.

```graphql
mutation DeleteRepresentative($orgId: ID!, $id: ID!) {
  deleteRepresentative(orgId: $orgId, id: $id) {
    success
    message
  }
}
```

---

### Customer Profiles

#### `createCustomerProfile`
Create a customer profile.

```graphql
mutation CreateCustomerProfile($orgId: ID!, $input: CreateCustomerProfileInput!) {
  createCustomerProfile(orgId: $orgId, input: $input) {
    id
    name
    email
    segment
    createdAt
  }
}
```

**Input:**
```json
{
  "orgId": "5d18b2ef-f9a0-4ba7-97c9-c7d61b5ed4f0",
  "input": {
    "userId": "user_789",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "+1234567890",
    "segment": "VIP",
    "lifetimeValue": 5000.00,
    "totalSpend": 4500.00,
    "orderCount": 25,
    "metadata": {
      "accountAge": 365,
      "lastPurchaseDate": "2026-01-20",
      "averageOrderValue": 180.00,
      "preferredContactMethod": "email",
      "tags": ["loyal", "high-value"]
    }
  }
}
```

#### `updateCustomerProfile`
Update a customer profile.

```graphql
mutation UpdateCustomerProfile($orgId: ID!, $id: ID!, $input: UpdateCustomerProfileInput!) {
  updateCustomerProfile(orgId: $orgId, id: $id, input: $input) {
    id
    name
    segment
    lifetimeValue
    updatedAt
  }
}
```

#### `deleteCustomerProfile`
Delete a customer profile.

```graphql
mutation DeleteCustomerProfile($orgId: ID!, $id: ID!) {
  deleteCustomerProfile(orgId: $orgId, id: $id) {
    success
    message
  }
}
```

---

### Tickets

#### `createTicket`
Create a support ticket.

```graphql
mutation CreateTicket($orgId: ID!, $input: CreateTicketInput!) {
  createTicket(orgId: $orgId, input: $input) {
    id
    subject
    status
    priority
    createdAt
  }
}
```

**Input:**
```json
{
  "orgId": "5d18b2ef-f9a0-4ba7-97c9-c7d61b5ed4f0",
  "input": {
    "conversationId": "conv_123",
    "customerId": "cust_456",
    "assignedTo": "rep_789",
    "subject": "Issue with order #12345",
    "description": "Customer reports item not received",
    "priority": "HIGH",
    "category": "shipping",
    "tags": ["order-issue", "shipping-delay"]
  }
}
```

#### `updateTicket`
Update a ticket.

```graphql
mutation UpdateTicket($orgId: ID!, $id: ID!, $input: UpdateTicketInput!) {
  updateTicket(orgId: $orgId, id: $id, input: $input) {
    id
    status
    priority
    updatedAt
  }
}
```

#### `deleteTicket`
Delete a ticket.

```graphql
mutation DeleteTicket($orgId: ID!, $id: ID!) {
  deleteTicket(orgId: $orgId, id: $id) {
    success
    message
  }
}
```

---

### Escalations

#### `createEscalation`
Create an escalation.

```graphql
mutation CreateEscalation($orgId: ID!, $input: CreateEscalationInput!) {
  createEscalation(orgId: $orgId, input: $input) {
    id
    ticketId
    reason
    status
    createdAt
  }
}
```

**Input:**
```json
{
  "orgId": "5d18b2ef-f9a0-4ba7-97c9-c7d61b5ed4f0",
  "input": {
    "ticketId": "ticket_456",
    "conversationId": "conv_789",
    "escalatedBy": "rep_111",
    "escalatedTo": "manager_222",
    "reason": "Customer requesting manager intervention for refund approval",
    "status": "PENDING"
  }
}
```

#### `updateEscalation`
Update an escalation.

```graphql
mutation UpdateEscalation($orgId: ID!, $id: ID!, $input: UpdateEscalationInput!) {
  updateEscalation(orgId: $orgId, id: $id, input: $input) {
    id
    status
    resolution
    updatedAt
  }
}
```

#### `deleteEscalation`
Delete an escalation.

```graphql
mutation DeleteEscalation($orgId: ID!, $id: ID!) {
  deleteEscalation(orgId: $orgId, id: $id) {
    success
    message
  }
}
```

---

### Refunds

#### `createRefund`
Create a refund.

```graphql
mutation CreateRefund($orgId: ID!, $input: CreateRefundInput!) {
  createRefund(orgId: $orgId, input: $input) {
    id
    orderId
    amount
    status
    createdAt
  }
}
```

**Input:**
```json
{
  "orgId": "5d18b2ef-f9a0-4ba7-97c9-c7d61b5ed4f0",
  "input": {
    "ticketId": "ticket_456",
    "customerId": "cust_789",
    "orderId": "order_12345",
    "amount": 49.99,
    "reason": "Product damaged during shipping",
    "status": "PENDING",
    "metadata": {
      "paymentMethod": "credit_card",
      "transactionId": "txn_98765",
      "notes": "Customer provided photos of damage"
    }
  }
}
```

#### `updateRefund`
Update a refund.

```graphql
mutation UpdateRefund($orgId: ID!, $id: ID!, $input: UpdateRefundInput!) {
  updateRefund(orgId: $orgId, id: $id, input: $input) {
    id
    status
    approvedBy
    updatedAt
  }
}
```

#### `deleteRefund`
Delete a refund.

```graphql
mutation DeleteRefund($orgId: ID!, $id: ID!) {
  deleteRefund(orgId: $orgId, id: $id) {
    success
    message
  }
}
```

---

### Budgets

#### `createBudget`
Create a budget.

```graphql
mutation CreateBudget($orgId: ID!, $input: CreateBudgetInput!) {
  createBudget(orgId: $orgId, input: $input) {
    id
    name
    category
    amount
    period
    createdAt
  }
}
```

**Input:**
```json
{
  "orgId": "5d18b2ef-f9a0-4ba7-97c9-c7d61b5ed4f0",
  "input": {
    "name": "Q1 2026 Refunds Budget",
    "category": "REFUNDS",
    "amount": 50000.00,
    "period": "QUARTERLY",
    "startDate": "2026-01-01",
    "endDate": "2026-03-31",
    "alerts": {
      "enabled": true,
      "thresholds": [50, 75, 90],
      "recipients": ["finance@example.com", "support-manager@example.com"]
    }
  }
}
```

#### `updateBudget`
Update a budget.

```graphql
mutation UpdateBudget($orgId: ID!, $id: ID!, $input: UpdateBudgetInput!) {
  updateBudget(orgId: $orgId, id: $id, input: $input) {
    id
    amount
    spent
    remaining
    updatedAt
  }
}
```

#### `deleteBudget`
Delete a budget.

```graphql
mutation DeleteBudget($orgId: ID!, $id: ID!) {
  deleteBudget(orgId: $orgId, id: $id) {
    success
    message
  }
}
```

---

### Agent Configurations

#### `createAgentConfiguration`
Create an AI agent configuration.

```graphql
mutation CreateAgentConfiguration($orgId: ID!, $input: CreateAgentConfigurationInput!) {
  createAgentConfiguration(orgId: $orgId, input: $input) {
    id
    name
    type
    status
    createdAt
  }
}
```

**Input:**
```json
{
  "orgId": "5d18b2ef-f9a0-4ba7-97c9-c7d61b5ed4f0",
  "input": {
    "name": "Customer Service Agent",
    "type": "CUSTOMER_SERVICE",
    "status": "ACTIVE",
    "config": {
      "model": "claude-sonnet-4.5",
      "temperature": 0.7,
      "maxTokens": 4096,
      "systemPrompt": "You are a helpful customer service agent...",
      "tools": ["customer-lookup", "order-search", "refund-approval"]
    },
    "capabilities": [
      "answer-questions",
      "process-refunds",
      "escalate-issues"
    ],
    "constraints": {
      "maxRefundAmount": 500.00,
      "maxDiscountPercent": 20,
      "requiresApprovalAbove": 500.00,
      "allowedActions": ["view", "create-ticket", "process-refund"]
    }
  }
}
```

#### `updateAgentConfiguration`
Update an agent configuration.

```graphql
mutation UpdateAgentConfiguration($orgId: ID!, $id: ID!, $input: UpdateAgentConfigurationInput!) {
  updateAgentConfiguration(orgId: $orgId, id: $id, input: $input) {
    id
    name
    status
    updatedAt
  }
}
```

#### `deleteAgentConfiguration`
Delete an agent configuration.

```graphql
mutation DeleteAgentConfiguration($orgId: ID!, $id: ID!) {
  deleteAgentConfiguration(orgId: $orgId, id: $id) {
    success
    message
  }
}
```

---

### Decision Rules

#### `createDecisionRule`
Create a decision rule for automation.

```graphql
mutation CreateDecisionRule($orgId: ID!, $input: CreateDecisionRuleInput!) {
  createDecisionRule(orgId: $orgId, input: $input) {
    id
    name
    priority
    status
    createdAt
  }
}
```

**Input:**
```json
{
  "orgId": "5d18b2ef-f9a0-4ba7-97c9-c7d61b5ed4f0",
  "input": {
    "name": "Auto-escalate VIP customers",
    "description": "Automatically escalate issues from VIP customers",
    "conditions": [
      {
        "field": "customer.segment",
        "operator": "EQUALS",
        "value": "VIP"
      },
      {
        "field": "ticket.priority",
        "operator": "IN",
        "value": "HIGH,URGENT"
      }
    ],
    "actions": [
      {
        "type": "ESCALATE",
        "params": {
          "escalateTo": "manager_123"
        }
      },
      {
        "type": "SET_PRIORITY",
        "params": {
          "priority": "URGENT"
        }
      }
    ],
    "priority": 10,
    "status": "ACTIVE",
    "metadata": {
      "tags": ["vip", "auto-escalation"],
      "category": "customer-service"
    }
  }
}
```

#### `updateDecisionRule`
Update a decision rule.

```graphql
mutation UpdateDecisionRule($orgId: ID!, $id: ID!, $input: UpdateDecisionRuleInput!) {
  updateDecisionRule(orgId: $orgId, id: $id, input: $input) {
    id
    name
    priority
    status
    updatedAt
  }
}
```

#### `deleteDecisionRule`
Delete a decision rule.

```graphql
mutation DeleteDecisionRule($orgId: ID!, $id: ID!) {
  deleteDecisionRule(orgId: $orgId, id: $id) {
    success
    message
  }
}
```

---

## Enums

### ConversationStatus
- `ACTIVE` - Conversation is ongoing
- `RESOLVED` - Conversation has been resolved
- `PENDING_REVIEW` - Awaiting review

### MessageRole
- `USER` - Message from user
- `ASSISTANT` - Message from AI assistant
- `SYSTEM` - System message

### UserRole
- `ADMIN` - Administrator
- `AGENT` - Customer service agent
- `CUSTOMER` - Customer user

### UserStatus
- `ACTIVE` - Active user
- `INACTIVE` - Inactive user
- `SUSPENDED` - Suspended user

### RepresentativeStatus
- `ACTIVE` - Available for work
- `INACTIVE` - Not available
- `ON_BREAK` - On break

### TicketStatus
- `OPEN` - Newly created
- `IN_PROGRESS` - Being worked on
- `WAITING_ON_CUSTOMER` - Awaiting customer response
- `RESOLVED` - Issue resolved
- `CLOSED` - Ticket closed

### TicketPriority
- `LOW` - Low priority
- `MEDIUM` - Medium priority
- `HIGH` - High priority
- `URGENT` - Urgent priority

### EscalationStatus
- `PENDING` - Awaiting action
- `IN_PROGRESS` - Being handled
- `RESOLVED` - Resolved
- `CANCELLED` - Cancelled

### RefundStatus
- `PENDING` - Awaiting approval
- `APPROVED` - Approved
- `DENIED` - Denied
- `PROCESSED` - Refund processed
- `FAILED` - Processing failed

### BudgetCategory
- `REFUNDS` - Refund budget
- `DISCOUNTS` - Discount budget
- `CREDITS` - Credit budget
- `SHIPPING` - Shipping budget
- `OTHER` - Other budget

### BudgetPeriod
- `DAILY` - Daily budget
- `WEEKLY` - Weekly budget
- `MONTHLY` - Monthly budget
- `QUARTERLY` - Quarterly budget
- `YEARLY` - Yearly budget

### AgentType
- `CUSTOMER_SERVICE` - Customer service agent
- `SALES` - Sales agent
- `TECHNICAL_SUPPORT` - Technical support agent
- `BILLING` - Billing agent
- `GENERAL` - General purpose agent

### AgentStatus
- `ACTIVE` - Agent is active
- `INACTIVE` - Agent is inactive
- `TRAINING` - Agent is being trained
- `MAINTENANCE` - Agent is in maintenance mode

### RuleOperator
- `EQUALS` - Equal to
- `NOT_EQUALS` - Not equal to
- `GREATER_THAN` - Greater than
- `LESS_THAN` - Less than
- `CONTAINS` - Contains
- `NOT_CONTAINS` - Does not contain
- `IN` - In list
- `NOT_IN` - Not in list

### RuleActionType
- `AUTO_RESPOND` - Automatically respond
- `ASSIGN_TO` - Assign to representative
- `ESCALATE` - Escalate issue
- `SET_PRIORITY` - Set priority
- `ADD_TAG` - Add tag
- `TRIGGER_WORKFLOW` - Trigger workflow

### RuleStatus
- `ACTIVE` - Rule is active
- `INACTIVE` - Rule is inactive
- `DRAFT` - Rule is in draft

---

## Error Handling

All mutations and queries follow a consistent error pattern. Errors are returned in the GraphQL `errors` array:

```json
{
  "errors": [
    {
      "message": "API request failed: 404 Not Found",
      "path": ["organization"],
      "extensions": {
        "code": "INTERNAL_SERVER_ERROR"
      }
    }
  ],
  "data": {
    "organization": null
  }
}
```

---

## Development

### Running Locally

```bash
cd packages/server/apis/gateway-api
yarn run dev
```

This starts the Wrangler dev server with hot reload.

### Type Checking

```bash
yarn run typecheck
```

### Linting

```bash
yarn run lint
yarn run lint:fix
```

### Deployment

```bash
yarn run deploy
```

---

## Architecture

The GraphQL Gateway acts as a unified API layer that:

1. **Federates** requests across multiple backend services
2. **Transforms** REST API responses into GraphQL types
3. **Handles** error normalization and logging
4. **Provides** a single endpoint for frontend applications

### Request Flow

```
Client → GraphQL Gateway → Backend APIs
  ↓           ↓                 ↓
Query    Resolver Fn      REST API
```

### Backend Services

| Service | Purpose | Technology |
|---------|---------|------------|
| Conversation Commands API | Write operations for conversations | Ruby on Rails |
| Conversation Updates API | Read operations for conversations | Ruby on Rails |
| Organization API | Organization data management | Node.js Lambda |

---

## Best Practices

1. **Always specify required fields** in queries to reduce payload size
2. **Use pagination** for list queries (limit/offset or cursor-based)
3. **Filter server-side** when possible (e.g., status filters on tickets)
4. **Batch related queries** in a single GraphQL request
5. **Handle errors gracefully** - all resolvers return null/empty arrays on error

---

## Support

For questions or issues with the GraphQL API:

1. Check this documentation
2. Review the source code in `packages/server/apis/gateway-api/src/`
3. Check backend API documentation for endpoint details
