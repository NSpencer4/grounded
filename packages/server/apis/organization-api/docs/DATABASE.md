# Database Schema Documentation

## Overview

This document describes the PostgreSQL database schema for the Grounded Organization API. The schema is managed using Drizzle ORM and supports all organizational data for the customer service platform.

## Schema Generation

Based on the Zod schemas in `@grounded/schemas`, comprehensive Drizzle schemas were created with:

- **13 tables** with full type safety
- **23 enums** for consistent status and type values
- **60+ indexes** for optimized queries
- **30+ foreign key** relationships with proper cascade behavior
- **Multi-tenant architecture** (all tables scoped to `organization_id`)

## Tables

### Core Tables

#### `organizations`
Main organization/company entity.

**Key Fields:**
- `plan`: FREE, STARTER, PROFESSIONAL, ENTERPRISE
- `status`: ACTIVE, SUSPENDED, TRIAL, CANCELLED
- `settings`: JSONB with organization-wide configuration

**Relationships:**
- One-to-many: users, representatives, tickets, escalations, etc.

#### `users`
Core user accounts for customers, representatives, and admins.

**Key Fields:**
- `role`: CUSTOMER, REPRESENTATIVE, ADMIN
- `organizationId`: Foreign key to organizations

**Relationships:**
- Many-to-one: organization
- One-to-one: representative, customerProfile
- One-to-many: tickets, escalations, refunds

#### `representatives`
Support team member profiles extending user accounts.

**Key Fields:**
- `role`: JUNIOR_SUPPORT, SENIOR_SUPPORT, TEAM_LEAD, ADMIN
- `status`: ONLINE, AWAY, OFFLINE
- `activeChats` / `maxChats`: Workload tracking
- `rating`: Performance rating (0-5)

**Relationships:**
- One-to-one: user
- One-to-many: assignedTickets, assignedEscalations, teamPerformance

#### `customer_profiles`
Extended customer account data.

**Key Fields:**
- `tier`: FREE, STARTER, PRO, ENTERPRISE
- `standing`: GOOD, WARNING, SUSPENDED, CLOSED
- `lifetimeValue`: Total revenue from customer
- `billingCycle`: MONTHLY, QUARTERLY, YEARLY
- `tokenBalance` / `tokenLimit`: Usage tracking
- `activeSites` / `sitesLimit`: Site usage
- `context`: JSONB with browser, OS, location data
- `preferences`: JSONB with customer preferences

**Relationships:**
- One-to-one: user

### Support & Ticketing

#### `tickets`
Support ticket management.

**Key Fields:**
- `status`: OPEN, IN_PROGRESS, WAITING, RESOLVED, CLOSED
- `priority`: LOW, NORMAL, HIGH, URGENT
- `category`: TECHNICAL_ISSUE, BILLING_PAYMENT, ACCOUNT_MANAGEMENT, etc.
- `aiHandled`: Boolean flag for AI resolution
- `sentiment`: Numeric sentiment score (-1 to 1)
- `customerSatisfactionScore`: CSAT rating (1-5)

**Indexes:**
- `ticket_number`, `customer_id`, `assigned_to`
- `status`, `priority`, `organization_id`
- `created_at` for time-based queries

#### `escalations`
Escalated conversations requiring human intervention.

**Key Fields:**
- `priority`: LOW, NORMAL, HIGH, URGENT, CRITICAL
- `status`: PENDING, ASSIGNED, IN_PROGRESS, RESOLVED
- `reason`: AI_UNABLE_TO_RESOLVE, CUSTOMER_REQUEST, etc.
- `conversationId`: Reference to DynamoDB conversation
- `waitTime`: Seconds waiting for assignment
- `aiSummary`: AI-generated issue summary

**Indexes:**
- `conversation_id`, `customer_id`, `assigned_to`
- `status`, `priority`

### Financial

#### `refunds`
Customer refund requests and processing.

**Key Fields:**
- `reason`: AI_BUG, SERVICE_DOWNTIME, UX_ISSUE, etc.
- `status`: PENDING, APPROVED, REJECTED, COMPLETED
- `amount`: Refund amount (decimal)
- `approvedBy`: Representative who approved

**Indexes:**
- `order_id`, `customer_id`, `status`
- `created_at` for reporting

#### `budgets`
Organizational budget tracking and limits.

**Key Fields:**
- `type`: REFUND, COMPENSATION, DISCOUNT, CREDIT
- `period`: DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
- `limit` / `spent` / `remaining`: Budget tracking
- `alertThresholds`: JSONB array of alert configurations
- `refundLimitPerUser`: Per-user refund limit

**Indexes:**
- `organization_id`, `type`, `period`
- `period_start` for time-based queries

#### `budget_usage_records`
Individual budget usage entries.

**Key Fields:**
- `budgetId`: Foreign key to budgets
- `refundId`: Optional link to refund
- `amount`: Usage amount
- `approvedBy`: Representative who approved

**Relationships:**
- Many-to-one: budget, refund, approver (representative)

### AI & Automation

#### `agent_configurations`
AI agent settings and performance tracking.

**Key Fields:**
- `type`: RESPONSE_RECOMMENDATION, CUSTOMER_SPEND, SENTIMENT_ANALYSIS, etc.
- `status`: ACTIVE, PAUSED, DISABLED
- `assertions`: Count of assertions made
- `accuracy`: Percentage accuracy (0-100)
- `avgLatency`: Average latency in milliseconds
- `dataSources`: JSONB array of data sources
- `thresholds`: JSONB object with agent-specific thresholds

**Indexes:**
- `organization_id`, `type`, `status`

#### `decision_rules`
Automated decision orchestration rules.

**Key Fields:**
- `priority`: Integer priority (lower = higher priority)
- `conditions`: JSONB array of rule conditions
- `action`: AUTO_RESOLVE, ESCALATE_TO_HUMAN, AUTO_APPROVE_REFUND, etc.
- `actionParams`: JSONB with action-specific parameters
- `lastTriggeredAt`: Last time rule was triggered

**Indexes:**
- `organization_id`, `priority`, `enabled`

### Analytics

#### `performance_metrics`
Organizational performance metrics.

**Key Fields:**
- `period`: HOUR, DAY, WEEK, MONTH, QUARTER, YEAR
- `periodStart` / `periodEnd`: Time period boundaries
- `totalChats` / `activeChats`: Chat volume
- `avgResponseTime`: Average response time (seconds)
- `firstContactResolution`: FCR percentage
- `customerSatisfaction`: CSAT score (0-5)
- `escalationRate` / `aiResolutionRate`: Percentages
- `ticketsResolved`: Count of resolved tickets

**Indexes:**
- `organization_id`, `period`, `period_start`

#### `team_performance`
Individual representative performance tracking.

**Key Fields:**
- `representativeId`: Foreign key to representatives
- `period`: Time period
- `ticketsHandled`: Count of tickets
- `avgResponseTime`: Average response time (seconds)
- `resolutionRate`: Percentage of resolved tickets
- `customerSatisfaction`: CSAT score (0-5)
- `trend`: UP, DOWN, STABLE

**Indexes:**
- `organization_id`, `representative_id`
- `period`, `period_start`

## Data Types

### Enums

All enum types are defined as PostgreSQL enums for data integrity:

- `user_role`
- `representative_role`
- `representative_status`
- `organization_plan`
- `organization_status`
- `account_tier`
- `account_standing`
- `billing_cycle`
- `ticket_status`
- `ticket_priority`
- `ticket_category`
- `escalation_priority`
- `escalation_status`
- `escalation_reason`
- `refund_reason`
- `refund_status`
- `budget_type`
- `budget_period`
- `agent_type`
- `agent_status`
- `decision_rule_action`
- `metric_period`
- `performance_trend`

### JSON Fields

JSONB is used for flexible, structured data:

- **organization.settings**: Organization configuration
- **customer_profiles.context**: Browser, OS, location
- **customer_profiles.preferences**: Customer preferences
- **tickets.tags**: Ticket tags array
- **budgets.alert_thresholds**: Alert configuration array
- **agent_configurations.data_sources**: Data source names
- **agent_configurations.thresholds**: Agent thresholds object
- **decision_rules.conditions**: Rule conditions array
- **decision_rules.action_params**: Action parameters object

## Indexes

### Purpose

Indexes are strategically placed for:

1. **Foreign Keys**: All FK columns indexed for join performance
2. **Organization Scoping**: All `organization_id` columns indexed
3. **Status Fields**: Status/priority fields for filtering
4. **Time-Based Queries**: Timestamp columns for reports
5. **Lookup Fields**: Email, ticket numbers, order IDs

### Index Naming

Format: `{table}_{column}_idx`

Example: `tickets_status_idx`

## Foreign Key Constraints

### Cascade Behavior

- **CASCADE**: Delete children when parent deleted
  - Used for: organization → users, users → profiles, etc.
  
- **SET NULL**: Set FK to null when parent deleted
  - Used for: ticket.assignedTo, refund.approvedBy
  - Preserves records but removes relationship

### Referential Integrity

All relationships enforced at database level:

```sql
CONSTRAINT tickets_customer_id_users_id_fk 
FOREIGN KEY (customer_id) 
REFERENCES users(id) 
ON DELETE cascade
```

## Query Patterns

### Organization Scoping

Always filter by organization ID:

```typescript
const tickets = await db.query.tickets.findMany({
  where: eq(tickets.organizationId, orgId),
})
```

### Joins with Relations

Use Drizzle relations for type-safe joins:

```typescript
const ticket = await db.query.tickets.findFirst({
  where: eq(tickets.id, ticketId),
  with: {
    customer: true,
    assignee: {
      with: {
        user: true,
      },
    },
  },
})
```

### Time-Based Queries

Use indexed timestamp columns:

```typescript
const recentTickets = await db.query.tickets.findMany({
  where: and(
    eq(tickets.organizationId, orgId),
    gte(tickets.createdAt, startDate),
  ),
  orderBy: desc(tickets.createdAt),
})
```

## Migration History

### Initial Migration (0000)

Created complete schema with:
- 13 tables
- 23 enums
- All indexes
- All foreign keys
- All constraints

File: `drizzle/0000_wandering_the_liberteens.sql`

## Seed Data

Sample data includes:

- 1 organization (Acme Corp - Professional plan)
- 1 admin user
- 3 representatives (online, different roles)
- 3 customers (Enterprise, Pro, Free tiers)
- 3 customer profiles with full data
- 3 tickets (various statuses)
- 2 escalations
- 3 refunds
- 1 monthly budget
- 3 AI agent configurations
- 4 decision rules
- Performance metrics
- Team performance records

Run: `yarn run db:seed`

## Best Practices

### 1. Always Scope by Organization

```typescript
// ✅ Good
where: and(
  eq(table.organizationId, orgId),
  eq(table.status, 'ACTIVE')
)

// ❌ Bad - missing org scope
where: eq(table.status, 'ACTIVE')
```

### 2. Use Transactions for Multi-Table Updates

```typescript
await db.transaction(async (tx) => {
  await tx.insert(tickets).values(ticketData)
  await tx.update(budgets)
    .set({ spent: budget.spent + amount })
    .where(eq(budgets.id, budgetId))
})
```

### 3. Leverage Indexes

Design queries to use existing indexes:

```typescript
// Uses tickets_status_idx
where: eq(tickets.status, 'OPEN')

// Uses tickets_created_at_idx
orderBy: desc(tickets.createdAt)
```

### 4. Use Prepared Statements for Repeated Queries

```typescript
const findTicketById = db.query.tickets
  .findFirst({
    where: eq(tickets.id, placeholder('id')),
  })
  .prepare()

await findTicketById.execute({ id: ticketId })
```

### 5. Batch Inserts for Performance

```typescript
// ✅ Single query
await db.insert(records).values([record1, record2, record3])

// ❌ Multiple queries
await db.insert(records).values(record1)
await db.insert(records).values(record2)
await db.insert(records).values(record3)
```

## Maintenance

### Backup

Regular PostgreSQL backups recommended:

```bash
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup.sql
```

### Monitoring

Monitor these metrics:

- Query performance (slow query log)
- Index usage (pg_stat_user_indexes)
- Table size (pg_total_relation_size)
- Connection pool usage

### Optimization

Consider these optimizations:

- **Partitioning**: For time-series tables (metrics, performance)
- **Materialized Views**: For complex analytics queries
- **Additional Indexes**: Based on query patterns
- **Connection Pooling**: Use PgBouncer or similar

## Troubleshooting

### Common Issues

1. **Slow Queries**: Check `EXPLAIN ANALYZE` output
2. **Lock Contention**: Review transaction duration
3. **Connection Exhaustion**: Implement connection pooling
4. **Disk Space**: Monitor table/index sizes

### Useful Queries

```sql
-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT 
  indexrelname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Slow queries
SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

## Future Enhancements

Planned improvements:

1. **Audit Logging**: Track all data changes
2. **Soft Deletes**: Maintain deleted records
3. **Full-Text Search**: PostgreSQL FTS for tickets
4. **Time-Series Optimization**: Partitioning for metrics
5. **Read Replicas**: For analytics queries
6. **Caching Layer**: Redis for frequent queries
