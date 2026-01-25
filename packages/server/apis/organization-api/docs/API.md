# Organization API Documentation

Complete REST API for managing organizational data in the Grounded platform.

## Base URL

```
https://your-lambda-url.amazonaws.com
```

## Authentication

All requests (except `/health`) should include:

```
Authorization: Bearer <token>
```

(Authentication implementation pending)

## Response Format

### Success Response

```json
{
  "data": { ... },
  "meta": {
    "limit": 50,
    "offset": 0
  }
}
```

### Error Response

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Common Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Maximum number of items (max: 100) |
| `offset` | number | 0 | Number of items to skip |

## Endpoints

### Health Check

#### `GET /health`

Check API health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-24T12:00:00Z",
  "service": "organization-api",
  "version": "1.0.0"
}
```

---

## Organizations

### `GET /organizations/:id`

Get organization by ID.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "plan": "PROFESSIONAL",
    "status": "ACTIVE",
    "settings": { ... },
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-01T00:00:00Z"
  }
}
```

### `POST /organizations`

Create new organization.

**Request Body:**
```json
{
  "name": "Acme Corp",
  "slug": "acme-corp",
  "plan": "FREE|STARTER|PROFESSIONAL|ENTERPRISE",
  "status": "TRIAL|ACTIVE|SUSPENDED|CANCELLED",
  "settings": { ... }
}
```

### `PATCH /organizations/:id`

Update organization.

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "plan": "ENTERPRISE",
  "status": "ACTIVE",
  "settings": { ... }
}
```

### `DELETE /organizations/:id`

Delete organization (cascades to all related data).

---

## Users

### `GET /organizations/:orgId/users`

List all users in organization.

**Query Params:** `limit`, `offset`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "organizationId": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "CUSTOMER|REPRESENTATIVE|ADMIN",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ],
  "meta": { "limit": 50, "offset": 0 }
}
```

### `GET /organizations/:orgId/users/:id`

Get user by ID.

### `POST /organizations/:orgId/users`

Create new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "CUSTOMER|REPRESENTATIVE|ADMIN"
}
```

### `PATCH /organizations/:orgId/users/:id`

Update user.

### `DELETE /organizations/:orgId/users/:id`

Delete user.

---

## Representatives

### `GET /organizations/:orgId/representatives`

List all representatives.

**Response includes:** Representative data with related user info

### `GET /organizations/:orgId/representatives/:id`

Get representative with performance history.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "role": "JUNIOR_SUPPORT|SENIOR_SUPPORT|TEAM_LEAD|ADMIN",
    "status": "ONLINE|AWAY|OFFLINE",
    "activeChats": 7,
    "maxChats": 10,
    "rating": "4.90",
    "user": { ... },
    "teamPerformance": [ ... ]
  }
}
```

### `POST /organizations/:orgId/representatives`

Create representative.

**Request Body:**
```json
{
  "userId": "uuid",
  "role": "JUNIOR_SUPPORT|SENIOR_SUPPORT|TEAM_LEAD|ADMIN",
  "status": "OFFLINE|AWAY|ONLINE",
  "maxChats": 10
}
```

### `PATCH /organizations/:orgId/representatives/:id`

Update representative (auto-updates `lastActiveAt` when status changes to ONLINE/AWAY).

### `DELETE /organizations/:orgId/representatives/:id`

Delete representative.

---

## Customer Profiles

### `GET /organizations/:orgId/customer-profiles`

List customer profiles.

### `GET /organizations/:orgId/customer-profiles/:id`

Get customer profile with user data.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "tier": "FREE|STARTER|PRO|ENTERPRISE",
    "standing": "GOOD|WARNING|SUSPENDED|CLOSED",
    "lifetimeValue": "5000.00",
    "tokenBalance": 8400,
    "tokenLimit": 10000,
    "activeSites": 3,
    "sitesLimit": 10,
    "billingCycle": "MONTHLY|QUARTERLY|YEARLY",
    "context": {
      "browser": "Chrome 122",
      "os": "macOS 14.3",
      "location": "New York, USA"
    },
    "user": { ... }
  }
}
```

### `POST /organizations/:orgId/customer-profiles`

Create customer profile.

**Request Body:**
```json
{
  "userId": "uuid",
  "tier": "FREE|STARTER|PRO|ENTERPRISE",
  "tokenLimit": 1000,
  "sitesLimit": 1,
  "billingCycle": "MONTHLY",
  "billingAmount": "99.00"
}
```

### `PATCH /organizations/:orgId/customer-profiles/:id`

Update customer profile.

### `DELETE /organizations/:orgId/customer-profiles/:id`

Delete customer profile.

---

## Tickets

### `GET /organizations/:orgId/tickets`

List tickets (includes customer and assignee data).

### `GET /organizations/:orgId/tickets/:id`

Get ticket with full context.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "ticketNumber": "TICKET-1001",
    "subject": "SSO integration failure",
    "status": "OPEN|IN_PROGRESS|WAITING|RESOLVED|CLOSED",
    "priority": "LOW|NORMAL|HIGH|URGENT",
    "category": "TECHNICAL_ISSUE|BILLING_PAYMENT|...",
    "aiHandled": false,
    "sentiment": "0.20",
    "customer": { ... },
    "assignee": { ... }
  }
}
```

### `POST /organizations/:orgId/tickets`

Create ticket.

**Request Body:**
```json
{
  "ticketNumber": "TICKET-1001",
  "customerId": "uuid",
  "subject": "Issue title",
  "description": "Detailed description",
  "category": "TECHNICAL_ISSUE|BILLING_PAYMENT|...",
  "priority": "NORMAL|HIGH|URGENT",
  "assignedTo": "uuid",
  "conversationId": "uuid"
}
```

### `PATCH /organizations/:orgId/tickets/:id`

Update ticket (auto-sets `resolvedAt`/`closedAt` based on status).

### `DELETE /organizations/:orgId/tickets/:id`

Delete ticket.

---

## Escalations

### `GET /organizations/:orgId/escalations`

List escalations.

### `GET /organizations/:orgId/escalations/:id`

Get escalation with customer and assignee data.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "conversationId": "uuid",
    "priority": "LOW|NORMAL|HIGH|URGENT|CRITICAL",
    "status": "PENDING|ASSIGNED|IN_PROGRESS|RESOLVED",
    "reason": "AI_UNABLE_TO_RESOLVE|CUSTOMER_REQUEST|...",
    "issueDescription": "...",
    "waitTime": 720,
    "aiSummary": "...",
    "customer": { ... },
    "assignee": { ... }
  }
}
```

### `POST /organizations/:orgId/escalations`

Create escalation.

**Request Body:**
```json
{
  "conversationId": "uuid",
  "customerId": "uuid",
  "reason": "AI_UNABLE_TO_RESOLVE|CUSTOMER_REQUEST|...",
  "issueDescription": "Detailed issue",
  "priority": "HIGH|URGENT|CRITICAL",
  "aiSummary": "AI-generated summary"
}
```

### `PATCH /organizations/:orgId/escalations/:id`

Update escalation (auto-sets `assignedAt`/`resolvedAt`).

### `DELETE /organizations/:orgId/escalations/:id`

Delete escalation.

---

## Refunds

### `GET /organizations/:orgId/refunds`

List refunds.

### `GET /organizations/:orgId/refunds/:id`

Get refund with customer and approver data.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "orderId": "48292",
    "amount": "50.00",
    "reason": "AI_BUG|SERVICE_DOWNTIME|UX_ISSUE|...",
    "status": "PENDING|APPROVED|REJECTED|COMPLETED",
    "approvedBy": "uuid",
    "customer": { ... },
    "approver": { ... }
  }
}
```

### `POST /organizations/:orgId/refunds`

Create refund request.

**Request Body:**
```json
{
  "orderId": "48292",
  "customerId": "uuid",
  "amount": "50.00",
  "reason": "AI_BUG|SERVICE_DOWNTIME|...",
  "notes": "Optional notes"
}
```

### `PATCH /organizations/:orgId/refunds/:id`

Update refund (auto-sets `processedAt` when status becomes COMPLETED/APPROVED).

### `DELETE /organizations/:orgId/refunds/:id`

Delete refund.

---

## Budgets

### `GET /organizations/:orgId/budgets`

List budgets.

### `GET /organizations/:orgId/budgets/:id`

Get budget with usage records.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "type": "REFUND|COMPENSATION|DISCOUNT|CREDIT",
    "period": "MONTHLY|QUARTERLY|YEARLY",
    "limit": "10000.00",
    "spent": "4200.00",
    "remaining": "5800.00",
    "alertThresholds": [
      { "percentage": 80, "enabled": true }
    ],
    "refundLimitPerUser": "500.00",
    "periodStart": "2026-01-01T00:00:00Z",
    "periodEnd": "2026-01-31T23:59:59Z",
    "usageRecords": [ ... ]
  }
}
```

### `POST /organizations/:orgId/budgets`

Create budget.

**Request Body:**
```json
{
  "type": "REFUND|COMPENSATION|DISCOUNT|CREDIT",
  "period": "MONTHLY|QUARTERLY|YEARLY",
  "limit": "10000.00",
  "periodStart": "2026-01-01T00:00:00Z",
  "periodEnd": "2026-01-31T23:59:59Z",
  "refundLimitPerUser": "500.00",
  "alertThresholds": [
    { "percentage": 80, "enabled": true }
  ]
}
```

### `PATCH /organizations/:orgId/budgets/:id`

Update budget.

### `DELETE /organizations/:orgId/budgets/:id`

Delete budget.

---

## AI Agents

### `GET /organizations/:orgId/agents`

List AI agent configurations.

### `GET /organizations/:orgId/agents/:id`

Get agent configuration.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Response Recommendation Agent",
    "type": "RESPONSE_RECOMMENDATION|CUSTOMER_SPEND|...",
    "description": "...",
    "enabled": true,
    "status": "ACTIVE|PAUSED|DISABLED",
    "assertions": 142,
    "accuracy": "94.20",
    "avgLatency": 1200,
    "dataSources": ["Conversation History", "Customer Profile"],
    "thresholds": {
      "confidence": 0.85,
      "maxTokens": 500
    }
  }
}
```

### `POST /organizations/:orgId/agents`

Create agent configuration.

**Request Body:**
```json
{
  "name": "Custom Agent",
  "type": "CUSTOM",
  "description": "Agent description",
  "enabled": true,
  "dataSources": ["Source 1", "Source 2"],
  "thresholds": { ... }
}
```

### `PATCH /organizations/:orgId/agents/:id`

Update agent configuration.

### `DELETE /organizations/:orgId/agents/:id`

Delete agent configuration.

---

## Decision Rules

### `GET /organizations/:orgId/decision-rules`

List decision rules.

### `GET /organizations/:orgId/decision-rules/:id`

Get decision rule.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Auto-resolve Simple Queries",
    "description": "...",
    "enabled": true,
    "priority": 1,
    "conditions": [
      {
        "field": "confidence",
        "operator": "gt",
        "value": 0.95
      }
    ],
    "action": "AUTO_RESOLVE|ESCALATE_TO_HUMAN|...",
    "actionParams": { ... }
  }
}
```

### `POST /organizations/:orgId/decision-rules`

Create decision rule.

**Request Body:**
```json
{
  "name": "Rule Name",
  "description": "Rule description",
  "priority": 1,
  "conditions": [
    {
      "field": "confidence",
      "operator": "gt",
      "value": 0.95
    }
  ],
  "action": "AUTO_RESOLVE|ESCALATE_TO_HUMAN|...",
  "actionParams": { ... }
}
```

### `PATCH /organizations/:orgId/decision-rules/:id`

Update decision rule.

### `DELETE /organizations/:orgId/decision-rules/:id`

Delete decision rule.

---

## Performance Metrics

### `GET /organizations/:orgId/performance-metrics`

Get organizational performance metrics.

**Query Params:** `limit`, `offset`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "period": "DAY|WEEK|MONTH|QUARTER|YEAR",
      "periodStart": "2026-01-24T00:00:00Z",
      "periodEnd": "2026-01-24T23:59:59Z",
      "totalChats": 5240,
      "activeChats": 142,
      "avgResponseTime": 84,
      "firstContactResolution": "78.00",
      "customerSatisfaction": "4.60",
      "escalationRate": "8.20",
      "aiResolutionRate": "64.00",
      "ticketsResolved": 1247
    }
  ]
}
```

### `GET /organizations/:orgId/team-performance`

Get team performance metrics.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "representativeId": "uuid",
      "period": "WEEK",
      "ticketsHandled": 187,
      "avgResponseTime": 48,
      "resolutionRate": "94.00",
      "customerSatisfaction": "4.90",
      "trend": "UP|DOWN|STABLE",
      "representative": {
        "id": "uuid",
        "user": {
          "name": "Alex Rivera",
          "email": "alex@company.com"
        }
      }
    }
  ]
}
```

### `GET /organizations/:orgId/representatives/:repId/performance`

Get performance history for specific representative.

**Query Params:** `limit`, `offset`

---

## Complete Endpoint List

### Organizations
- `GET /organizations/:id`
- `POST /organizations`
- `PATCH /organizations/:id`
- `DELETE /organizations/:id`

### Users
- `GET /organizations/:orgId/users`
- `GET /organizations/:orgId/users/:id`
- `POST /organizations/:orgId/users`
- `PATCH /organizations/:orgId/users/:id`
- `DELETE /organizations/:orgId/users/:id`

### Representatives
- `GET /organizations/:orgId/representatives`
- `GET /organizations/:orgId/representatives/:id`
- `POST /organizations/:orgId/representatives`
- `PATCH /organizations/:orgId/representatives/:id`
- `DELETE /organizations/:orgId/representatives/:id`

### Customer Profiles
- `GET /organizations/:orgId/customer-profiles`
- `GET /organizations/:orgId/customer-profiles/:id`
- `POST /organizations/:orgId/customer-profiles`
- `PATCH /organizations/:orgId/customer-profiles/:id`
- `DELETE /organizations/:orgId/customer-profiles/:id`

### Tickets
- `GET /organizations/:orgId/tickets`
- `GET /organizations/:orgId/tickets/:id`
- `POST /organizations/:orgId/tickets`
- `PATCH /organizations/:orgId/tickets/:id`
- `DELETE /organizations/:orgId/tickets/:id`

### Escalations
- `GET /organizations/:orgId/escalations`
- `GET /organizations/:orgId/escalations/:id`
- `POST /organizations/:orgId/escalations`
- `PATCH /organizations/:orgId/escalations/:id`
- `DELETE /organizations/:orgId/escalations/:id`

### Refunds
- `GET /organizations/:orgId/refunds`
- `GET /organizations/:orgId/refunds/:id`
- `POST /organizations/:orgId/refunds`
- `PATCH /organizations/:orgId/refunds/:id`
- `DELETE /organizations/:orgId/refunds/:id`

### Budgets
- `GET /organizations/:orgId/budgets`
- `GET /organizations/:orgId/budgets/:id`
- `POST /organizations/:orgId/budgets`
- `PATCH /organizations/:orgId/budgets/:id`
- `DELETE /organizations/:orgId/budgets/:id`

### AI Agents
- `GET /organizations/:orgId/agents`
- `GET /organizations/:orgId/agents/:id`
- `POST /organizations/:orgId/agents`
- `PATCH /organizations/:orgId/agents/:id`
- `DELETE /organizations/:orgId/agents/:id`

### Decision Rules
- `GET /organizations/:orgId/decision-rules`
- `GET /organizations/:orgId/decision-rules/:id`
- `POST /organizations/:orgId/decision-rules`
- `PATCH /organizations/:orgId/decision-rules/:id`
- `DELETE /organizations/:orgId/decision-rules/:id`

### Performance
- `GET /organizations/:orgId/performance-metrics`
- `GET /organizations/:orgId/team-performance`
- `GET /organizations/:orgId/representatives/:repId/performance`

**Total: 54 endpoints across 11 resources**

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (CORS) |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 500 | Internal Server Error |

## Rate Limiting

(Not yet implemented)

## Webhooks

(Not yet implemented)

## Examples

### Create Complete Customer Setup

```bash
# 1. Create user
curl -X POST https://api.example.com/organizations/ORG_ID/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER"
  }'

# 2. Create customer profile
curl -X POST https://api.example.com/organizations/ORG_ID/customer-profiles \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "tier": "PRO",
    "tokenLimit": 5000,
    "sitesLimit": 5
  }'
```

### Handle Ticket Workflow

```bash
# 1. Create ticket
curl -X POST https://api.example.com/organizations/ORG_ID/tickets \
  -d '{
    "ticketNumber": "TICKET-1234",
    "customerId": "USER_ID",
    "subject": "Billing issue",
    "description": "...",
    "category": "BILLING_PAYMENT"
  }'

# 2. Assign to representative
curl -X PATCH https://api.example.com/organizations/ORG_ID/tickets/TICKET_ID \
  -d '{
    "assignedTo": "REP_ID",
    "status": "IN_PROGRESS"
  }'

# 3. Resolve ticket
curl -X PATCH https://api.example.com/organizations/ORG_ID/tickets/TICKET_ID \
  -d '{
    "status": "RESOLVED",
    "customerSatisfactionScore": 4.5
  }'
```

### Query Performance Data

```bash
# Get weekly team performance
curl https://api.example.com/organizations/ORG_ID/team-performance

# Get specific rep performance
curl https://api.example.com/organizations/ORG_ID/representatives/REP_ID/performance?limit=10
```

## Testing

Use the included seed data to test all endpoints:

```bash
# Setup database
npm run db:migrate
npm run db:seed

# Start API
npm run dev

# Test health
curl http://localhost:3000/health

# Test endpoints
curl http://localhost:3000/organizations/ORG_ID/users
curl http://localhost:3000/organizations/ORG_ID/tickets
```

## SDK Generation

Consider generating TypeScript SDK from OpenAPI spec (future enhancement).

## Notes

- All timestamps are in ISO 8601 format
- All monetary values are strings (decimal precision)
- All IDs are UUIDs
- All endpoints require organization scoping (except organizations CRUD)
- Related data is eager-loaded in GET single endpoints
- List endpoints support pagination
- Updates automatically set `updatedAt` timestamp
- Status transitions may auto-set related timestamps
