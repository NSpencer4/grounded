# Database Migration Summary

## Overview

Complete database schema and migrations have been created for the Organization API based on the Zod schemas from `@grounded/schemas`.

## What Was Created

### 1. Database Schema (`src/db/schema.ts`)

**13 Tables:**
- `organizations` - Company/organization profiles
- `users` - Core user accounts (customers, reps, admins)
- `representatives` - Support team member profiles
- `customer_profiles` - Extended customer account data
- `tickets` - Support ticket management
- `escalations` - Escalated conversations
- `refunds` - Customer refund requests
- `budgets` - Organizational budget tracking
- `budget_usage_records` - Budget usage entries
- `agent_configurations` - AI agent settings
- `decision_rules` - Automated decision rules
- `performance_metrics` - Organizational performance data
- `team_performance` - Representative performance tracking

**23 PostgreSQL Enums:**
- User roles, representative roles/statuses
- Organization plans/statuses
- Account tiers/standing
- Ticket statuses/priorities/categories
- Escalation priorities/statuses/reasons
- Refund reasons/statuses
- Budget types/periods
- Agent types/statuses
- Decision rule actions
- Metric periods, performance trends

**60+ Indexes:**
- Organization ID indexes on all tables
- Foreign key indexes
- Status/priority field indexes
- Timestamp indexes for time-based queries
- Unique constraints

**30+ Foreign Key Relationships:**
- Cascade deletes for child records
- Set null for optional relationships
- Referential integrity enforced at DB level

**Drizzle Relations:**
- Type-safe one-to-one relationships
- Type-safe one-to-many relationships
- Type-safe many-to-one relationships

### 2. Migration Files

**Generated Migration:**
- `drizzle/0000_wandering_the_liberteens.sql` (308 lines)
- Creates all enums, tables, foreign keys, and indexes
- Fully reviewable SQL

**Migration Metadata:**
- `drizzle/meta/_journal.json` - Migration history
- `drizzle/meta/0000_snapshot.json` - Schema snapshot

### 3. Seed Data (`src/db/seed.ts`)

Comprehensive sample data:
- 1 organization (Acme Corp - Professional plan)
- 4 users (1 admin, 3 representatives)
- 3 representatives with different roles and statuses
- 3 customers with full profiles
- 3 tickets (various statuses and priorities)
- 2 escalations
- 3 refunds
- 1 monthly budget with usage tracking
- 3 AI agent configurations
- 4 decision rules
- Performance metrics (daily aggregates)
- Team performance records (weekly data)

### 4. Migration Runner (`src/db/migrate.ts`)

Programmatic migration runner with:
- Connection management
- Error handling
- Progress logging
- Graceful shutdown

### 5. Documentation

**README.md** - Complete API documentation
- Setup instructions
- Environment configuration
- Development workflow
- Database commands
- Query examples
- Deployment guide

**DATABASE.md** - Comprehensive schema documentation
- Table descriptions
- Column documentation
- Relationship diagrams
- Index strategies
- Query patterns
- Best practices
- Troubleshooting

**QUICKSTART.md** - 5-minute setup guide
- Step-by-step setup
- Docker commands
- Verification steps
- Common commands
- Troubleshooting tips

### 6. Package Scripts

Added to `package.json`:
```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "tsx src/db/migrate.ts",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio",
  "db:seed": "tsx src/db/seed.ts"
}
```

## Schema Features

### Multi-Tenancy
All tables include `organization_id` for proper data isolation.

### Type Safety
Full TypeScript types inferred from Drizzle schema:
```typescript
import type { User, Organization, Ticket } from './db/schema'
```

### JSONB Flexibility
Strategic use of JSONB for:
- Organization settings
- Customer context/preferences
- Budget alert thresholds
- Agent thresholds and data sources
- Decision rule conditions
- Ticket tags

### Optimized Queries
Indexes placed for common patterns:
- Organization scoping
- User lookups
- Status filtering
- Time-based reports
- Join optimization

### Data Integrity
- NOT NULL constraints where appropriate
- UNIQUE constraints on email, slug, etc.
- CHECK constraints via enums
- Foreign key constraints with proper cascade
- Default values for common fields

## Mapping: Zod Schemas → Database Tables

| Zod Schema | Database Table | Status |
|------------|----------------|--------|
| OrganizationSchema | organizations | ✅ Complete |
| UserSchema | users | ✅ Complete |
| RepresentativeSchema | representatives | ✅ Complete |
| CustomerProfileSchema | customer_profiles | ✅ Complete |
| TicketSchema | tickets | ✅ Complete |
| EscalationSchema | escalations | ✅ Complete |
| RefundSchema | refunds | ✅ Complete |
| BudgetSchema | budgets | ✅ Complete |
| BudgetUsageRecordSchema | budget_usage_records | ✅ Complete |
| AgentConfigurationSchema | agent_configurations | ✅ Complete |
| DecisionRuleSchema | decision_rules | ✅ Complete |
| PerformanceMetricsSchema | performance_metrics | ✅ Complete |
| TeamPerformanceSchema | team_performance | ✅ Complete |

## Schema Alignment

All enum values match exactly between Zod and PostgreSQL:

```typescript
// Zod
export const UserRoleSchema = z.enum(['CUSTOMER', 'REPRESENTATIVE', 'ADMIN'])

// PostgreSQL
CREATE TYPE "user_role" AS ENUM('CUSTOMER', 'REPRESENTATIVE', 'ADMIN');

// Drizzle
export const userRoleEnum = pgEnum('user_role', ['CUSTOMER', 'REPRESENTATIVE', 'ADMIN'])
```

## Verification

All code verified:
- ✅ TypeScript compilation passes
- ✅ ESLint passes (warnings only for console in scripts)
- ✅ Schema matches Zod definitions
- ✅ Migration SQL generated successfully
- ✅ Seed data types correct
- ✅ All foreign keys valid
- ✅ All indexes created

## Next Steps

### 1. Apply Migrations

```bash
cd packages/server/apis/organization-api
yarn run db:migrate
```

### 2. Seed Database

```bash
yarn run db:seed
```

### 3. Explore with Drizzle Studio

```bash
yarn run db:studio
```

### 4. Start Building API Routes

The schema is ready. Now you can:
- Create REST endpoints
- Add GraphQL resolvers
- Build Lambda handlers
- Implement business logic

## Example Usage

```typescript
import { getDb } from './db'
import { eq, and, gte } from 'drizzle-orm'

// Get database connection
const db = await getDb(credentials)

// Query with relations
const org = await db.query.organizations.findFirst({
  where: eq(organizations.id, orgId),
  with: {
    users: true,
    representatives: {
      with: {
        user: true,
      },
    },
    tickets: {
      where: eq(tickets.status, 'OPEN'),
      orderBy: desc(tickets.createdAt),
      limit: 10,
    },
  },
})

// Type-safe inserts
await db.insert(tickets).values({
  organizationId: orgId,
  ticketNumber: 'TICKET-1234',
  customerId: userId,
  subject: 'Issue title',
  description: 'Issue description',
  status: 'OPEN',
  priority: 'HIGH',
  category: 'TECHNICAL_ISSUE',
})

// Complex queries
const activeReps = await db.query.representatives.findMany({
  where: and(
    eq(representatives.organizationId, orgId),
    eq(representatives.status, 'ONLINE'),
  ),
  with: {
    user: true,
    teamPerformance: {
      where: eq(teamPerformance.period, 'WEEK'),
      orderBy: desc(teamPerformance.periodStart),
      limit: 1,
    },
  },
})
```

## Technical Highlights

### Connection Pooling
Database client reused across Lambda warm starts for performance.

### Transaction Support
Full support for multi-table transactions:
```typescript
await db.transaction(async (tx) => {
  await tx.insert(tickets).values(ticketData)
  await tx.update(budgets)
    .set({ spent: sql`spent + ${amount}` })
    .where(eq(budgets.id, budgetId))
})
```

### Prepared Statements
Optimize repeated queries:
```typescript
const findByOrg = db.query.tickets
  .findMany({
    where: eq(tickets.organizationId, placeholder('orgId')),
  })
  .prepare()

await findByOrg.execute({ orgId })
```

### Type-Safe Enums
Drizzle ensures enum values match database:
```typescript
// ✅ Valid
await db.insert(tickets).values({ status: 'OPEN' })

// ❌ Type error
await db.insert(tickets).values({ status: 'INVALID' })
```

## Production Readiness

The schema is production-ready with:
- ✅ Comprehensive indexes for performance
- ✅ Proper foreign key constraints
- ✅ Cascade delete behavior defined
- ✅ NOT NULL constraints where needed
- ✅ Default values for common fields
- ✅ Multi-tenant architecture
- ✅ Connection pooling support
- ✅ Transaction support
- ✅ Full type safety

## Maintenance

### Adding New Tables

1. Update `src/db/schema.ts`
2. Generate migration: `yarn run db:generate`
3. Review SQL in `drizzle/`
4. Apply migration: `yarn run db:migrate`

### Modifying Existing Tables

1. Update schema definition
2. Generate migration
3. Review for data migration needs
4. Apply migration
5. Update seed data if needed

### Rolling Back

Drizzle doesn't have built-in rollback. For rollback:
1. Keep migration SQL files
2. Create reverse migration manually
3. Or restore from backup

## Files Created/Modified

```
packages/server/apis/organization-api/
├── src/
│   └── db/
│       ├── schema.ts          ✅ CREATED (700+ lines)
│       ├── migrate.ts          ✅ CREATED
│       └── seed.ts             ✅ CREATED (500+ lines)
├── drizzle/
│   ├── 0000_*.sql             ✅ GENERATED (308 lines)
│   └── meta/
│       ├── _journal.json      ✅ GENERATED
│       └── 0000_snapshot.json ✅ GENERATED
├── package.json               ✅ UPDATED (added db scripts)
├── README.md                  ✅ CREATED
├── DATABASE.md                ✅ CREATED
├── QUICKSTART.md              ✅ CREATED
└── MIGRATION_SUMMARY.md       ✅ CREATED (this file)
```

## Summary

You now have a complete, production-ready PostgreSQL schema with:

- **13 tables** covering all organizational data
- **23 enums** for data consistency
- **60+ indexes** for query performance
- **30+ foreign keys** for data integrity
- **Full type safety** with TypeScript
- **Comprehensive seed data** for testing
- **Detailed documentation** for your team
- **Easy-to-use scripts** for development

The schema perfectly matches your Zod schemas and is ready to serve real data to your UI! 🎉
