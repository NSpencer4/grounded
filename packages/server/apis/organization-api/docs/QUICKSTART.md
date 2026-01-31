# Quick Start Guide

Get up and running with the Organization API in 5 minutes.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (or Docker)

## 1. Start PostgreSQL

### Option A: Docker (Recommended for Development)

```bash
docker run --name grounded-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=grounded \
  -p 5432:5432 \
  -d postgres:14-alpine

# Verify it's running
docker ps | grep grounded-postgres
```

### Option B: Local PostgreSQL

Create a database named `grounded` in your local PostgreSQL instance.

## 2. Configure Environment

```bash
cd packages/server/apis/organization-api

# Copy and edit environment file
cp local.env.example local.env
```

Edit `local.env`:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=grounded
```

## 3. Install Dependencies

```bash
# From repository root
npm install
```

## 4. Run Migrations

```bash
yarn run db:migrate
```

Expected output:
```
🔌 Connecting to database...
🚀 Running migrations...
✅ Migrations completed successfully!
👋 Database connection closed
```

## 5. Seed Database

```bash
yarn run db:seed
```

Expected output:
```
🌱 Seeding database...
✅ Created organization: Acme Corp
✅ Created representatives
✅ Created customer profiles
✅ Created tickets
✅ Created escalations
✅ Created refunds
✅ Created budget
✅ Created agent configurations
✅ Created decision rules
✅ Created performance metrics
✅ Created team performance records
🎉 Seeding complete!
```

## 6. Explore the Database

### Option A: Drizzle Studio (Web UI)

```bash
yarn run db:studio
```

Open `https://local.drizzle.studio` in your browser to explore tables and data.

### Option B: psql

```bash
docker exec -it grounded-postgres psql -U postgres -d grounded

# List tables
\dt

# View organizations
SELECT * FROM organizations;

# View users with their roles
SELECT id, name, email, role FROM users;

# Exit
\q
```

## 7. Start Development Server

```bash
yarn run dev
```

The API will be available at `http://localhost:3000` (or your configured port).

## What's Been Created?

After seeding, your database contains:

### Organization
- **Acme Corp** (Professional plan, Active status)

### Users
- 1 Admin user
- 3 Representatives (Alex Rivera, Jordan Smith, Sarah Chen)
- 3 Customers (John Doe, Jane Smith, Robert Johnson)

### Data
- 3 Tickets (various statuses and priorities)
- 2 Escalations (pending and in-progress)
- 3 Refunds (different statuses)
- 1 Monthly Budget ($10,000 limit, $4,200 spent)
- 3 AI Agent Configurations (Response, Spend, Sentiment)
- 4 Decision Rules (Auto-resolve, Priority routing, Auto-approval, Escalation)
- Performance Metrics (daily aggregates)
- Team Performance Records (weekly data for each rep)

## Next Steps

### Explore the Schema

```bash
# View the comprehensive schema documentation
cat DATABASE.md

# Or the schema code
cat src/db/schema.ts
```

### Query Examples

Create a file `test-query.ts`:

```typescript
import { getDb } from './src/db'
import { eq } from 'drizzle-orm'

async function test() {
  const db = await getDb({
    host: 'localhost',
    username: 'postgres',
    password: 'postgres',
    database: 'grounded',
  })

  // Get all representatives
  const reps = await db.query.representatives.findMany({
    with: {
      user: true,
    },
  })

  console.log('Representatives:', reps)
}

test()
```

Run it:
```bash
tsx test-query.ts
```

### Add Routes

Create new API routes in `src/routes/`:

```typescript
// src/routes/tickets.ts
import { Router } from 'express'
import { getDb } from '../db'

const router = Router()

router.get('/:orgId/tickets', async (req, res) => {
  const db = await getDb(/* credentials */)
  const tickets = await db.query.tickets.findMany({
    where: eq(tickets.organizationId, req.params.orgId),
  })
  res.json(tickets)
})

export default router
```

### Create New Migrations

When you need to update the schema:

1. Edit `src/db/schema.ts`
2. Generate migration: `yarn run db:generate`
3. Review the SQL in `drizzle/`
4. Apply migration: `yarn run db:migrate`

## Common Commands

```bash
# Development
yarn run dev              # Start dev server
yarn run typecheck        # Type check
yarn run lint             # Lint code
yarn run lint:fix         # Auto-fix lint issues

# Database
yarn run db:generate      # Generate migration from schema changes
yarn run db:migrate       # Run migrations
yarn run db:push          # Push schema directly (dev only)
yarn run db:studio        # Open Drizzle Studio
yarn run db:seed          # Seed database with sample data

# Production
yarn run build            # Build for deployment
yarn run build:zip        # Create Lambda deployment package
```

## Troubleshooting

### Can't connect to database

```bash
# Check if PostgreSQL is running
docker ps

# Check logs
docker logs grounded-postgres

# Restart if needed
docker restart grounded-postgres
```

### Migration fails

```bash
# Drop and recreate database
docker exec -it grounded-postgres psql -U postgres -c "DROP DATABASE grounded;"
docker exec -it grounded-postgres psql -U postgres -c "CREATE DATABASE grounded;"

# Re-run migrations
yarn run db:migrate
yarn run db:seed
```

### Port 5432 already in use

```bash
# Stop conflicting PostgreSQL
brew services stop postgresql  # macOS
sudo systemctl stop postgresql # Linux

# Or change port in local.env
DB_PORT=5433
```

## Resources

- [README.md](./README.md) - Full API documentation
- [DATABASE.md](./DATABASE.md) - Complete schema documentation
- [Drizzle Docs](https://orm.drizzle.team/docs/overview) - Drizzle ORM documentation
- [PostgreSQL Docs](https://www.postgresql.org/docs/) - PostgreSQL documentation

## Support

For issues or questions:
1. Check the documentation files
2. Review the schema code
3. Explore with Drizzle Studio
4. Check migration SQL files

Happy coding! 🚀
