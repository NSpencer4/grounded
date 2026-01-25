# Test Scenarios with Seeded Data

This guide provides test scenarios using the mock data created by `seed-data.ts`.

## Overview

The seed script creates two organizations with complete data:

1. **Acme Corporation** - Enterprise customer with full feature set
2. **TechStart Inc** - Small business with basic setup

## Test Scenarios

### Scenario 1: View Customer Support Dashboard

**Goal:** Display active tickets and representative availability

**GraphQL Query:**

```graphql
query SupportDashboard($orgId: ID!) {
  # Get active tickets
  tickets(orgId: $orgId, status: "OPEN", limit: 10) {
    id
    subject
    priority
    status
    assignedTo
    createdAt
  }
  
  # Get online representatives
  representatives(orgId: $orgId, limit: 10) {
    id
    name
    status
    activeChats
    maxChats
    availability {
      isOnline
    }
  }
  
  # Get pending escalations
  escalations(orgId: $orgId, status: "PENDING", limit: 5) {
    id
    reason
    priority
    createdAt
  }
}
```

**Expected Data:**
- 2-3 open/in-progress tickets
- 3 representatives (2 online, 1 away)
- 1-2 pending escalations

### Scenario 2: Customer Profile Management

**Goal:** View and update high-value customer profile

**Test Customer:** Alice Johnson (Enterprise tier, $15,420 lifetime value)

**Query:**

```graphql
query GetCustomerProfile($orgId: ID!, $id: ID!) {
  customerProfile(orgId: $orgId, id: $id) {
    id
    name
    email
    tier
    lifetimeValue
    totalSpend
    tokenBalance
    tokenLimit
    activeSites
    sitesLimit
    metadata {
      accountAge
      preferredContactMethod
      tags
    }
  }
}
```

**Update:**

```graphql
mutation UpdateCustomerTier($orgId: ID!, $id: ID!, $input: UpdateCustomerProfileInput!) {
  updateCustomerProfile(orgId: $orgId, id: $id, input: $input) {
    id
    tier
    lifetimeValue
  }
}
```

**Test Cases:**
1. View customer profile with all details
2. Upgrade tier from PRO to ENTERPRISE
3. Update preferences and metadata
4. Check token balance and usage

### Scenario 3: Refund Approval Workflow

**Goal:** Process pending refund requests

**Pending Refunds in Seed Data:**
- Service downtime refund: $49.00
- AI bug compensation: $75.00

**Query Pending Refunds:**

```graphql
query PendingRefunds($orgId: ID!) {
  refunds(orgId: $orgId, status: "PENDING") {
    id
    orderId
    amount
    reason
    customerId
    status
    metadata {
      notes
    }
  }
}
```

**Approve Refund:**

```graphql
mutation ApproveRefund($orgId: ID!, $id: ID!, $input: UpdateRefundInput!) {
  updateRefund(orgId: $orgId, id: $id, input: $input) {
    id
    status
    approvedBy
  }
}
```

**Variables:**
```json
{
  "input": {
    "status": "APPROVED",
    "approvedBy": "rep_uuid_here"
  }
}
```

### Scenario 4: Budget Monitoring

**Goal:** Monitor budget usage and remaining balance

**Query:**

```graphql
query BudgetOverview($orgId: ID!) {
  budgets(orgId: $orgId) {
    id
    name
    category
    period
    amount
    spent
    remaining
    alerts {
      enabled
      thresholds
      recipients
    }
  }
}
```

**Expected Data:**
- Monthly refund budget: $5,000 total, $324 spent, $4,676 remaining (6.5% used)
- Quarterly compensation budget: $10,000 total, $1,250 spent (12.5% used)
- Yearly discount budget: $25,000 total, $8,420 spent (33.7% used)

**Test Cases:**
1. Display budget utilization charts
2. Show alert thresholds
3. Calculate percentage used
4. Display trend over time

### Scenario 5: AI Agent Performance

**Goal:** View AI agent performance and accuracy metrics

**Query:**

```graphql
query AgentPerformance($orgId: ID!) {
  agentConfigurations(orgId: $orgId) {
    id
    name
    type
    status
    assertions
    accuracy
    avgLatency
    config {
      model
      temperature
    }
    constraints {
      maxRefundAmount
      requiresApprovalAbove
    }
  }
}
```

**Expected Agents:**
- Response Recommendation: 1,247 assertions, 94.5% accuracy, 850ms latency
- Customer Spend Analyzer: 892 assertions, 91.2% accuracy, 620ms latency
- Sentiment Analysis: 3,421 assertions, 88.75% accuracy, 320ms latency
- Escalation Predictor: 645 assertions, 86.3% accuracy, 540ms latency

**Test Cases:**
1. Display agent performance dashboard
2. Compare accuracy across agents
3. Show latency trends
4. Enable/disable agents

### Scenario 6: Decision Rule Management

**Goal:** View and manage automation rules

**Query:**

```graphql
query DecisionRules($orgId: ID!) {
  decisionRules(orgId: $orgId) {
    id
    name
    description
    priority
    status
    conditions {
      field
      operator
      value
    }
    actions {
      type
      params {
        template
      }
    }
  }
}
```

**Seeded Rules:**
1. **Auto-resolve simple billing questions** (priority: 10)
   - Conditions: billing category + positive sentiment + low-value customer
   - Action: Auto-resolve with FAQ template

2. **Escalate VIP customers** (priority: 100)
   - Condition: Enterprise tier customer
   - Action: Route to team lead

3. **Auto-approve small refunds** (priority: 50)
   - Conditions: Amount < $50 + good standing + LTV > $500
   - Action: Auto-approve refund

4. **Request more info for vague issues** (priority: 20)
   - Condition: Description < 50 characters
   - Action: Send clarification request

5. **Escalate negative sentiment** (priority: 80)
   - Conditions: Sentiment < 0.3 + AI handled
   - Action: Escalate to human

**Test Cases:**
1. Display rule priorities in order
2. Enable/disable rules
3. Test rule conditions
4. View rule execution history

### Scenario 7: Team Performance Analytics

**Goal:** Display team performance metrics and leaderboards

**Query:**

```graphql
query TeamAnalytics($orgId: ID!, $startDate: String!, $endDate: String!) {
  teamPerformance(orgId: $orgId, startDate: $startDate, endDate: $endDate) {
    period
    totalMembers
    activeMembers
    metrics {
      totalConversations
      resolvedConversations
      averageResponseTime
      customerSatisfactionScore
    }
    topPerformers {
      id
      name
      email
    }
  }
  
  # Individual rep performance
  representativePerformance(
    orgId: $orgId
    repId: "rep_uuid"
    startDate: $startDate
    endDate: $endDate
  ) {
    metrics {
      totalConversations
      averageResponseTime
      customerSatisfactionScore
    }
  }
}
```

**Expected Data:**
- Jane Representative: 124 tickets/week, 38s avg response, 4.85 CSAT
- John Senior: 87 tickets/week, 42s avg response, 4.50 CSAT
- Sarah Lead: 101 tickets/week, 35s avg response, 4.92 CSAT

**Test Cases:**
1. Display performance leaderboard
2. Show individual rep metrics
3. Compare week-over-week trends
4. Filter by time period (day, week, month)

### Scenario 8: Escalation Management

**Goal:** View and resolve escalated issues

**Query Escalations:**

```graphql
query ActiveEscalations($orgId: ID!) {
  escalations(orgId: $orgId, status: "IN_PROGRESS") {
    id
    reason
    priority
    issueDescription
    waitTime
    assignedTo
    createdAt
  }
}
```

**Seeded Escalations:**
1. **API Integration Issue** - High priority, technical issue, assigned to team lead
2. **Mobile Safari Bug** - Urgent priority, AI unable to resolve
3. **Billing Dispute** - Resolved, refund processed

**Test Cases:**
1. Display escalation queue ordered by priority
2. Show wait times
3. Assign escalations to reps
4. Mark as resolved with resolution notes

### Scenario 9: Multi-Org Testing

**Goal:** Test data isolation between organizations

**Test:**
1. Query users for Acme Corp - should return 9 users
2. Query users for TechStart Inc - should return 3 users
3. Verify no data leakage between orgs

**GraphQL:**

```graphql
query CompareOrgs {
  acmeUsers: users(orgId: "acme_id") {
    id
    name
    role
  }
  
  techstartUsers: users(orgId: "techstart_id") {
    id
    name
    role
  }
}
```

### Scenario 10: Create New Conversation → Ticket → Escalation Flow

**Goal:** Test complete support workflow

**Steps:**

1. **Create Conversation** (via Conversation Commands API):
```graphql
mutation {
  createConversation(
    orgId: "acme_id"
    userId: "customer_id"
    initialMessage: "My chat widget is broken!"
  ) {
    id
    status
  }
}
```

2. **Create Ticket** (via Organization API):
```graphql
mutation {
  createTicket(orgId: "acme_id", input: {
    conversationId: "conv_id_from_step_1"
    customerId: "customer_id"
    subject: "Chat widget not loading"
    priority: "HIGH"
    category: "TECHNICAL_ISSUE"
  }) {
    id
    ticketNumber
  }
}
```

3. **Create Escalation** (if AI can't resolve):
```graphql
mutation {
  createEscalation(orgId: "acme_id", input: {
    ticketId: "ticket_id_from_step_2"
    conversationId: "conv_id_from_step_1"
    escalatedBy: "ai_agent_id"
    escalatedTo: "senior_rep_id"
    reason: "AI_UNABLE_TO_RESOLVE"
    status: "PENDING"
  }) {
    id
    status
  }
}
```

4. **Update Ticket Status**:
```graphql
mutation {
  updateTicket(orgId: "acme_id", id: "ticket_id", input: {
    status: "RESOLVED"
  }) {
    id
    status
    resolvedAt
  }
}
```

## REST API Examples

If testing directly with the REST API:

### List All Resources for Organization

```bash
ORG_ID="your_org_uuid"
BASE_URL="http://localhost:9005/2015-03-31/functions/function/invocations"

# Users
curl "${BASE_URL}/organizations/${ORG_ID}/users?limit=10"

# Representatives
curl "${BASE_URL}/organizations/${ORG_ID}/representatives?limit=10"

# Tickets
curl "${BASE_URL}/organizations/${ORG_ID}/tickets?status=OPEN&limit=10"

# Escalations
curl "${BASE_URL}/organizations/${ORG_ID}/escalations?status=PENDING"

# Refunds
curl "${BASE_URL}/organizations/${ORG_ID}/refunds?status=PENDING"

# Budgets
curl "${BASE_URL}/organizations/${ORG_ID}/budgets"

# Agent Configurations
curl "${BASE_URL}/organizations/${ORG_ID}/agents"

# Decision Rules
curl "${BASE_URL}/organizations/${ORG_ID}/decision-rules"

# Performance Metrics
curl "${BASE_URL}/organizations/${ORG_ID}/performance-metrics?startDate=2026-01-01&endDate=2026-01-31"
```

## UI Integration Testing

### Customer Support Dashboard

Display real-time support metrics:

```typescript
// Fetch dashboard data
const { data } = await graphql({
  query: `
    query Dashboard($orgId: ID!) {
      tickets(orgId: $orgId, limit: 20) {
        id
        subject
        status
        priority
        assignedTo
      }
      representatives(orgId: $orgId) {
        id
        name
        status
        activeChats
        maxChats
      }
      performanceMetrics(orgId: $orgId, startDate: "2026-01-01", endDate: "2026-01-31") {
        metrics {
          totalConversations
          customerSatisfactionScore
          escalationRate
        }
      }
    }
  `,
  variables: { orgId }
})
```

### Customer Profile Page

Show customer details with history:

```typescript
const { data } = await graphql({
  query: `
    query CustomerDetails($orgId: ID!, $customerId: ID!) {
      customerProfile(orgId: $orgId, id: $customerId) {
        name
        email
        tier
        lifetimeValue
        totalSpend
        orderCount
        metadata {
          accountAge
          lastPurchaseDate
          tags
        }
      }
      
      # Customer's tickets
      tickets(orgId: $orgId, customerId: $customerId) {
        id
        subject
        status
        createdAt
      }
      
      # Customer's refunds
      refunds(orgId: $orgId, customerId: $customerId) {
        id
        amount
        reason
        status
      }
    }
  `
})
```

### Budget Management Page

Display budget utilization:

```typescript
const { data } = await graphql({
  query: `
    query BudgetDashboard($orgId: ID!) {
      budgets(orgId: $orgId) {
        id
        name
        category
        amount
        spent
        remaining
        period
        alerts {
          enabled
          thresholds
        }
      }
    }
  `
})

// Calculate percentage used
budgets.forEach(budget => {
  const percentUsed = (budget.spent / budget.amount) * 100
  const alertTriggered = budget.alerts.thresholds.some(t => percentUsed >= t)
  
  console.log(`${budget.name}: ${percentUsed.toFixed(1)}% used`)
  if (alertTriggered) console.log('⚠️ Alert threshold reached!')
})
```

### AI Agent Monitoring

Track agent performance:

```typescript
const { data } = await graphql({
  query: `
    query AgentMonitoring($orgId: ID!) {
      agentConfigurations(orgId: $orgId) {
        id
        name
        type
        status
        assertions
        accuracy
        avgLatency
      }
    }
  `
})

// Display agent health
data.agentConfigurations.forEach(agent => {
  const health = 
    agent.accuracy > 90 ? '🟢 Excellent' :
    agent.accuracy > 80 ? '🟡 Good' : '🔴 Needs improvement'
  
  console.log(`${agent.name}: ${health} (${agent.accuracy}% accurate)`)
})
```

## Sample User IDs (from seed)

**Note:** UUIDs are randomly generated. Check console output from seed script for actual IDs.

### Acme Corporation Users

**Customers:**
- Alice Johnson - alice.johnson@customer.com (Enterprise tier, high value)
- Bob Smith - bob.smith@customer.com (Pro tier)
- Charlie Brown - charlie.brown@customer.com (Starter tier, payment warning)
- Diana Prince - diana.prince@customer.com (Free tier)
- Evan Williams - evan.williams@customer.com (Pro tier)

**Representatives:**
- Jane Representative - jane.rep@acme.com (Junior Support, online)
- John Senior - john.senior@acme.com (Senior Support, online)
- Sarah Lead - sarah.lead@acme.com (Team Lead, away)

**Admin:**
- Admin User - admin@acme.com

### TechStart Inc Users

**Customers:**
- Frank Customer - frank.customer@techstart.com
- Grace Customer - grace.customer@techstart.com

**Representative:**
- Support Rep - support@techstart.com

## Sample Tickets (from seed)

**ACME-1001** - API integration not working
- Status: IN_PROGRESS
- Priority: HIGH
- Assigned to: Jane Representative
- Customer: Alice Johnson (Enterprise)

**ACME-1002** - Billing discrepancy on last invoice
- Status: RESOLVED
- Priority: NORMAL
- Assigned to: John Senior
- Customer: Bob Smith (Pro)

**ACME-1003** - Account suspended - payment overdue
- Status: WAITING
- Priority: HIGH
- Assigned to: Jane Representative
- Customer: Charlie Brown (Starter)

**ACME-1004** - Feature request: Custom branding
- Status: OPEN
- Priority: LOW
- Unassigned
- Customer: Diana Prince (Free)

**ACME-1005** - Chat widget not loading on mobile
- Status: IN_PROGRESS
- Priority: URGENT
- Assigned to: Sarah Lead
- Customer: Evan Williams (Pro)

**ACME-1006** - Token usage exceeds quota
- Status: RESOLVED
- Priority: NORMAL
- Assigned to: John Senior
- Customer: Alice Johnson (Enterprise)

## Advanced Test Scenarios

### Test Decision Rule Triggers

1. **Create low-priority ticket from Free tier customer**
   - Should trigger "Auto-resolve simple queries" rule
   - Expected: Automatic resolution

2. **Create ticket from Enterprise customer**
   - Should trigger "Escalate VIP customers" rule
   - Expected: Routed to team lead immediately

3. **Submit refund < $50 from customer with good standing**
   - Should trigger "Auto-approve small refunds" rule
   - Expected: Automatic approval

### Test Representative Load Balancing

1. Query representative availability
2. Identify rep with fewest active chats
3. Assign new ticket to that rep
4. Verify activeChats count increases

### Test Budget Alerts

1. Query current budget spent amount
2. Calculate if any alert thresholds are crossed
3. Display alerts in UI
4. Test updating budget when threshold reached

### Test Performance Trends

1. Query performance metrics for different periods (day, week, month)
2. Calculate trend (up, down, stable)
3. Display charts showing:
   - Response time over time
   - Customer satisfaction trends
   - Escalation rate changes
   - AI resolution rate improvements

## Data Relationships to Test

### Foreign Key Relationships

1. **User → Representative** (one-to-one)
   - Each representative must have a user
   - Deleting user should cascade delete representative

2. **Organization → Users** (one-to-many)
   - Users belong to organizations
   - Deleting org should cascade delete users

3. **Ticket → Customer** (many-to-one)
   - Tickets reference customer users
   - Customer can have multiple tickets

4. **Ticket → Representative** (many-to-one, nullable)
   - Tickets can be assigned to reps
   - Deleting rep should set ticket.assignedTo to null

5. **Refund → Customer + Representative** (many-to-one)
   - Refunds reference customers and approvers
   - Track who approved each refund

### Data Integrity Tests

1. **Cannot create ticket without valid customer**
2. **Cannot assign ticket to non-existent representative**
3. **Cannot create user without valid organization**
4. **Budget calculations are accurate** (spent + remaining = amount)
5. **Representative activeChats doesn't exceed maxChats**

## Performance Testing

### Load Test Queries

Test with pagination:

```bash
# Page through all users
for i in {0..100..20}; do
  curl "${BASE_URL}/organizations/${ORG_ID}/users?limit=20&offset=$i"
done

# Page through tickets by status
for status in OPEN IN_PROGRESS RESOLVED; do
  curl "${BASE_URL}/organizations/${ORG_ID}/tickets?status=$status&limit=50"
done
```

### Concurrent Requests

Test multiple queries simultaneously:

```bash
# Run in parallel
curl "${BASE_URL}/organizations/${ORG_ID}/users" &
curl "${BASE_URL}/organizations/${ORG_ID}/tickets" &
curl "${BASE_URL}/organizations/${ORG_ID}/budgets" &
wait
```

## Cleanup After Testing

Reset to fresh state:

```bash
npm run db:reset
```

Or just clear without re-seeding:

```bash
npm run db:clear
```

## Tips for Testing

1. **Use Drizzle Studio** to inspect data visually: `npm run db:studio`
2. **Check foreign key relationships** by deleting parent records
3. **Test pagination** with different limit/offset values
4. **Verify filters work** by checking returned results
5. **Monitor performance** with the performance metrics endpoints
6. **Test multi-tenancy** by querying different organizations
7. **Validate input** by sending invalid data to mutations

## Common Test Queries

Copy-paste ready GraphQL queries for quick testing:

```graphql
# Quick overview of everything
query Everything($orgId: ID!) {
  organization(id: $orgId) { name }
  users(orgId: $orgId, limit: 5) { id name email }
  tickets(orgId: $orgId, limit: 5) { id subject status }
  budgets(orgId: $orgId) { id name spent remaining }
  agentConfigurations(orgId: $orgId) { id name accuracy }
  representatives(orgId: $orgId) { id name status activeChats }
}
```

Happy testing! 🚀
