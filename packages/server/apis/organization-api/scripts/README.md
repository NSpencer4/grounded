# Organization API Scripts

Utility scripts for database management and testing.

## Available Scripts

### `seed-data.ts` - Comprehensive Database Seeding

Populates the PostgreSQL database with realistic mock data for all resources.

**Usage:**

```bash
npm run db:seed-comprehensive
```

Or directly:

```bash
npx tsx scripts/seed-data.ts
```

**What it creates:**

| Resource | Count | Details |
|----------|-------|---------|
| Organizations | 2 | Acme Corp (Enterprise), TechStart Inc (Professional) |
| Users | 12 | Mix of customers, representatives, and admins |
| Representatives | 4 | Various roles and statuses (online, away, offline) |
| Customer Profiles | 5 | Different tiers (FREE, STARTER, PRO, ENTERPRISE) |
| Tickets | 6 | Various statuses, priorities, and categories |
| Escalations | 3 | Different priorities and resolution states |
| Refunds | 4 | Various amounts and statuses |
| Budgets | 4 | Different types and periods |
| Agent Configurations | 5 | All agent types with realistic metrics |
| Decision Rules | 5 | Various automation rules |
| Performance Metrics | 5 | Daily, weekly, monthly metrics |
| Team Performance | 7 | Individual rep performance over time |

**Total:** 60+ database records with realistic relationships and data

**Sample Organizations:**

1. **Acme Corporation** (`acme-corp`)
   - Plan: Enterprise
   - 9 users (5 customers, 3 reps, 1 admin)
   - Full set of tickets, escalations, refunds
   - Active AI agents and decision rules

2. **TechStart Inc** (`techstart-inc`)
   - Plan: Professional
   - 3 users (2 customers, 1 rep)
   - Basic setup for testing

**Environment Variables:**

```bash
DB_HOST=localhost        # Default: localhost
DB_PORT=5432            # Default: 5432
DB_USER=postgres        # Default: postgres
DB_PASSWORD=postgres    # Default: postgres
DB_NAME=grounded        # Default: grounded
```

**Prerequisites:**

1. PostgreSQL must be running
2. Database migrations must be applied:
   ```bash
   npm run db:migrate
   ```

### `clear-data.ts` - Clear Database

Removes all data from the database while preserving the schema structure.

**Usage:**

```bash
npm run db:clear
```

Or directly:

```bash
npx tsx scripts/clear-data.ts
```

**What it does:**

- Deletes all records from all tables
- Preserves table structure and schema
- Respects foreign key constraints (deletes in correct order)
- Useful for resetting to a clean state before re-seeding

**⚠️ WARNING:** This will delete ALL data. Use with caution!

### Complete Reset Workflow

To completely reset and re-seed the database:

```bash
# Clear existing data
npm run db:clear

# Seed with fresh data
npm run db:seed-comprehensive
```

Or as a one-liner:

```bash
npm run db:clear && npm run db:seed-comprehensive
```

## Testing the API

After seeding, test the API endpoints with:

### Using Postman

1. Import `postman/collections/organization-api.json`
2. Select "Local" environment
3. Start making requests with the seeded data

Example IDs to test:
- Organization: Use slugs `acme-corp` or `techstart-inc`
- Users: Check the console output for generated UUIDs
- Tickets: `ACME-1001`, `ACME-1002`, etc.

### Using cURL

```bash
# Health check
curl http://localhost:9005/2015-03-31/functions/function/invocations/health

# Get organization (replace {id} with actual UUID from seed output)
curl http://localhost:9005/2015-03-31/functions/function/invocations/organizations/{id}

# List users
curl "http://localhost:9005/2015-03-31/functions/function/invocations/organizations/{orgId}/users?limit=10"
```

### Using GraphQL Gateway

If using the GraphQL Gateway API:

```bash
# Start the gateway
cd packages/server/apis/gateway-api
npm run dev

# Then use GraphQL queries
curl -X POST http://localhost:8787/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ organization(id: \"org_123\") { name slug } }"}'
```

## Database Management

### View Data in Drizzle Studio

Drizzle Studio provides a web UI for browsing database content:

```bash
npm run db:studio
```

Then open https://local.drizzle.studio in your browser.

### Run Migrations

Apply pending migrations:

```bash
npm run db:migrate
```

### Generate New Migrations

After schema changes:

```bash
npm run db:generate
```

### Push Schema Changes (Development)

For quick schema updates in development:

```bash
npm run db:push
```

## Troubleshooting

### Database Connection Failed

**Error:** `ECONNREFUSED` or `Connection refused`

**Solution:**
1. Check PostgreSQL is running: `pg_isready`
2. Verify connection details in environment variables
3. Check docker-compose is running: `docker-compose ps`

### Migration Errors

**Error:** `relation "..." does not exist`

**Solution:**
1. Run migrations: `npm run db:migrate`
2. If issues persist, drop and recreate database:
   ```bash
   dropdb grounded
   createdb grounded
   npm run db:migrate
   npm run db:seed-comprehensive
   ```

### Foreign Key Violations

**Error:** `violates foreign key constraint`

**Solution:**
- Ensure you run `db:clear` before `db:seed-comprehensive`
- The clear script deletes in the correct order to respect FK constraints

### UUID Issues

If you see UUIDs in error messages, the seeded data uses randomly generated UUIDs. Check the console output from the seed script to find the actual IDs created.

## Development Tips

1. **Use Drizzle Studio** for quick data inspection
2. **Re-seed frequently** during development to test with fresh data
3. **Check console output** after seeding for the generated IDs
4. **Use realistic data** - the seed script creates interconnected records
5. **Test pagination** - the seed creates enough data for pagination testing

## Extending the Seed Script

To add more data to `scripts/seed-data.ts`:

1. Import the relevant schema tables
2. Add your insert statements in the appropriate section
3. Use the helper functions for random data generation
4. Ensure foreign key relationships are satisfied
5. Update the console output summary

Example:

```typescript
// Add more tickets
const moreTickets = await db
  .insert(schema.tickets)
  .values([
    {
      organizationId: acme.id,
      ticketNumber: 'ACME-1007',
      customerId: acmeCustomers[0].id,
      // ... rest of the ticket data
    }
  ])
  .returning()
```

## Related Documentation

- [Organization API README](../README.md)
- [Database Schema](../src/db/schema.ts)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
