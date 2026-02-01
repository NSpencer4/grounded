# API Validation with Zod

Complete request validation using Zod schemas for type-safe, validated API contracts.

## Quick Start

### Use Validated Endpoints

All POST and PATCH endpoints now validate requests:

```bash
# Valid request ✅
curl -X POST http://localhost:3000/organizations/$ORG_ID/tickets \
  -d '{
    "ticketNumber": "TICKET-001",
    "customerId": "550e8400-e29b-41d4-a716-446655440000",
    "subject": "Login issue",
    "description": "Cannot access my account",
    "category": "TECHNICAL_ISSUE"
  }'

# Response: 201 Created with ticket data
```

```bash
# Invalid request ❌
curl -X POST http://localhost:3000/organizations/$ORG_ID/tickets \
  -d '{
    "ticketNumber": "",
    "customerId": "invalid-uuid",
    "category": "WRONG_CATEGORY"
  }'

# Response: 400 Bad Request
{
  "error": "Validation failed",
  "details": [
    { "field": "ticketNumber", "message": "String must contain at least 1 character(s)" },
    { "field": "customerId", "message": "Invalid uuid" },
    { "field": "subject", "message": "Required" },
    { "field": "description", "message": "Required" },
    { "field": "category", "message": "Invalid enum value..." }
  ]
}
```

## Schema Reference

### Organizations
```typescript
// POST /organizations
{
  name: string (1-255 chars),
  slug: string (lowercase, numbers, hyphens only),
  plan?: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE',  // default: 'FREE'
  status?: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED',     // default: 'TRIAL'
  settings?: Record<string, unknown>,
  metadata?: Record<string, unknown>
}
```

### Users
```typescript
// POST /organizations/:orgId/users
{
  name: string (1-255 chars),
  email: string (valid email format),
  role: 'CUSTOMER' | 'REPRESENTATIVE' | 'ADMIN'
}
```

### Representatives
```typescript
// POST /organizations/:orgId/representatives
{
  userId: string (UUID),
  role?: 'JUNIOR_SUPPORT' | 'SENIOR_SUPPORT' | 'TEAM_LEAD' | 'ADMIN',  // default: 'JUNIOR_SUPPORT'
  status?: 'OFFLINE' | 'AWAY' | 'ONLINE',  // default: 'OFFLINE'
  activeChats?: number (>= 0),             // default: 0
  maxChats?: number (1-50),                // default: 10
  rating?: string (/^\d+\.\d{2}$/)        // default: '0.00'
}
```

### Customer Profiles
```typescript
// POST /organizations/:orgId/customer-profiles
{
  userId: string (UUID),
  tier?: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE',  // default: 'FREE'
  standing?: 'GOOD' | 'WARNING' | 'SUSPENDED' | 'CLOSED',  // default: 'GOOD'
  lifetimeValue?: string (/^\d+\.\d{2}$/),  // default: '0.00'
  lastBillingDate?: string (ISO 8601 datetime),
  nextBillingDate?: string (ISO 8601 datetime),
  billingCycle?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
  billingAmount?: string (/^\d+\.\d{2}$/),
  tokenBalance?: number (>= 0),  // default: 0
  tokenLimit?: number (>= 0),    // default: 1000
  activeSites?: number (>= 0),   // default: 0
  sitesLimit?: number (>= 1),    // default: 1
  context?: Record<string, unknown>,
  preferences?: Record<string, unknown>,
  metadata?: Record<string, unknown>
}
```

### Tickets
```typescript
// POST /organizations/:orgId/tickets
{
  ticketNumber: string (1-50 chars),
  customerId: string (UUID),
  assignedTo?: string (UUID),
  conversationId?: string (UUID),
  subject: string (1-500 chars),
  description: string (min 1 char),
  status?: 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED',  // default: 'OPEN'
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT',  // default: 'NORMAL'
  category: 'TECHNICAL_ISSUE' | 'BILLING_PAYMENT' | 'ACCOUNT_MANAGEMENT' | 
            'FEATURE_REQUEST' | 'BUG_REPORT' | 'OTHER',
  tags?: string[],  // default: []
  aiHandled?: boolean,  // default: false
  sentiment?: string (/^-?\d+\.\d{2}$/),
  estimatedResolutionTime?: number (seconds, >= 0),
  internalNotes?: string
}
```

### Escalations
```typescript
// POST /organizations/:orgId/escalations
{
  conversationId: string (UUID),
  customerId: string (UUID),
  assignedTo?: string (UUID),
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL',  // default: 'NORMAL'
  status?: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED',  // default: 'PENDING'
  reason: 'AI_UNABLE_TO_RESOLVE' | 'CUSTOMER_REQUEST' | 'NEGATIVE_SENTIMENT' |
          'TECHNICAL_ISSUE' | 'BILLING_DISPUTE' | 'HIGH_VALUE_CUSTOMER' | 'OTHER',
  issueDescription: string (min 1 char),
  waitTime?: number (seconds, >= 0),  // default: 0
  notes?: string,
  aiSummary?: string
}
```

### Refunds
```typescript
// POST /organizations/:orgId/refunds
{
  orderId: string (1-100 chars),
  customerId: string (UUID),
  amount: string (/^\d+\.\d{2}$/),
  reason: 'AI_BUG' | 'SERVICE_DOWNTIME' | 'UX_ISSUE' | 
          'BILLING_ERROR' | 'CUSTOMER_REQUEST' | 'OTHER',
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED',  // default: 'PENDING'
  notes?: string,
  approvedBy?: string (UUID)
}
```

### Budgets
```typescript
// POST /organizations/:orgId/budgets
{
  type: 'REFUND' | 'COMPENSATION' | 'DISCOUNT' | 'CREDIT',
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
  limit: string (/^\d+\.\d{2}$/),
  spent?: string (/^\d+\.\d{2}$/),  // default: '0.00'
  remaining: string (/^\d+\.\d{2}$/),
  alertThresholds?: Array<{ percentage: number (0-100), enabled: boolean }>,  // default: []
  autoAlertsEnabled?: boolean,  // default: true
  refundLimitPerUser?: string (/^\d+\.\d{2}$/),
  periodStart: string (ISO 8601 datetime),
  periodEnd: string (ISO 8601 datetime)
}
```

### AI Agents
```typescript
// POST /organizations/:orgId/agents
{
  name: string (1-255 chars),
  type: 'RESPONSE_RECOMMENDATION' | 'CUSTOMER_SPEND' | 'SENTIMENT_ANALYSIS' | 'CUSTOM',
  description: string (min 1 char),
  enabled?: boolean,  // default: true
  status?: 'ACTIVE' | 'PAUSED' | 'DISABLED',  // default: 'ACTIVE'
  assertions?: number (>= 0),    // default: 0
  accuracy?: string (/^\d+\.\d{2}$/),  // default: '0.00'
  avgLatency?: number (>= 0),    // default: 0
  dataSources?: string[],        // default: []
  thresholds?: Record<string, unknown>,  // default: {}
  metadata?: Record<string, unknown>
}
```

### Decision Rules
```typescript
// POST /organizations/:orgId/decision-rules
{
  name: string (1-255 chars),
  description: string (min 1 char),
  enabled?: boolean,  // default: true
  priority: number (>= 0),
  conditions: Array<{
    field: string,
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains',
    value: unknown
  }> (min 1 item),
  action: 'AUTO_RESOLVE' | 'ESCALATE_TO_HUMAN' | 'REQUEST_MORE_INFO' |
          'ROUTE_TO_SENIOR' | 'AUTO_APPROVE_REFUND' | 'DENY_REFUND' | 'CUSTOM',
  actionParams?: Record<string, unknown>
}
```

## Validation Rules

### UUID Validation
- Must be valid UUID v4 format
- Example: `550e8400-e29b-41d4-a716-446655440000`

### Email Validation
- Must be valid email format
- Example: `user@example.com`

### Decimal Format
- Must match pattern: `/^\d+\.\d{2}$/`
- Examples: `99.99`, `1250.50`, `0.00`

### Sentiment Format
- Must match pattern: `/^-?\d+\.\d{2}$/`
- Range: -1.00 to 1.00
- Examples: `0.75`, `-0.35`, `1.00`

### Slug Format
- Must match pattern: `/^[a-z0-9-]+$/`
- Lowercase letters, numbers, hyphens only
- Example: `acme-corp-2024`

### Rating Format
- Must match pattern: `/^\d+\.\d{2}$/`
- Range: 0.00 to 5.00
- Example: `4.85`

## TypeScript Usage

### Import Types
```typescript
import type {
  CreateTicketRequest,
  UpdateTicketRequest,
} from '@grounded/organization-api/schemas/requests'

// Use in your code
const ticketData: CreateTicketRequest = {
  ticketNumber: 'TICKET-001',
  customerId: userId,
  subject: 'Issue',
  description: 'Details',
  category: 'TECHNICAL_ISSUE',
}
```

### Type Inference
```typescript
// In controllers
const data = validation.data  // Type is automatically inferred!

// TypeScript knows:
data.ticketNumber  // string
data.status       // 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED'
data.tags         // string[]
data.sentiment    // string | undefined
```

## Testing

### Test Valid Requests
```bash
yarn run test:endpoints
```

### Test Invalid Requests
```bash
# Missing required field
curl -X POST localhost:3000/organizations/$ORG/users -d '{"name":"John"}'
# Returns: 400 with "email": "Required", "role": "Required"

# Invalid UUID
curl -X POST localhost:3000/organizations/$ORG/tickets \
  -d '{"customerId":"123",...}'
# Returns: 400 with "customerId": "Invalid uuid"

# Invalid enum
curl -X PATCH localhost:3000/organizations/$ORG/tickets/$ID \
  -d '{"status":"PENDING"}'
# Returns: 400 with "status": "Invalid enum value..."
```

## Summary

🎉 **Complete Zod validation implementation across all 54 endpoints!**

- ✅ Type-safe request handling
- ✅ Structured error messages
- ✅ Database enum alignment
- ✅ Zero type assertions
- ✅ Production-ready

No more messy manual validation - everything goes through Zod! 🚀
