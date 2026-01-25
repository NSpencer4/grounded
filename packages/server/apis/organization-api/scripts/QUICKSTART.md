# Organization API - Quick Start Guide

Get up and running with the Organization API in 5 minutes.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (running locally or via Docker)
- npm or yarn

## Step-by-Step Setup

### 1. Start PostgreSQL

**Option A: Using Docker Compose (Recommended)**

From the repository root:

```bash
docker-compose up postgres -d
```

**Option B: Local PostgreSQL**

Ensure PostgreSQL is running:

```bash
pg_isready
```

### 2. Set Environment Variables

Create a `.env` file or export variables:

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_NAME=grounded
```

### 3. Install Dependencies

From the repository root:

```bash
npm install
```

Or from the organization-api directory:

```bash
cd packages/server/apis/organization-api
npm install
```

### 4. Run Database Migrations

Apply the schema to your database:

```bash
npm run db:migrate
```

Expected output:
```
🚀 Running migrations...
✅ Migrations complete!
```

### 5. Seed Mock Data

Populate with realistic test data:

```bash
npm run db:seed-comprehensive
```

Expected output:
```
🌱 Starting database seed...

📦 Creating organizations...
✅ Created 2 organizations

👥 Creating users...
✅ Created 12 users

🎧 Creating representatives...
✅ Created 4 representatives

💳 Creating customer profiles...
✅ Created 5 customer profiles

🎫 Creating tickets...
✅ Created 6 tickets

🚨 Creating escalations...
✅ Created 3 escalations

💰 Creating refunds...
✅ Created 4 refunds

📊 Creating budgets...
✅ Created 4 budgets

🤖 Creating agent configurations...
✅ Created 5 agent configurations

📋 Creating decision rules...
✅ Created 5 decision rules

📈 Creating performance metrics...
✅ Created 5 performance metrics

👥 Creating team performance records...
✅ Created 7 team performance records

✨ Database seeding completed successfully!

📊 Summary:
   Organizations: 2
   Users: 12
   Representatives: 4
   Customer Profiles: 5
   Tickets: 6
   Escalations: 3
   Refunds: 4
   Budgets: 4
   Agent Configurations: 5
   Decision Rules: 5
   Performance Metrics: 5
   Team Performance: 7

🎉 You can now test the API with realistic data!
```

### 6. Start the API

Development mode with hot reload:

```bash
npm run dev
```

The API will be available at:
```
http://localhost:9005/2015-03-31/functions/function/invocations
```

### 7. Test with Postman

1. Open Postman
2. Import `postman/collections/organization-api.json`
3. Select "Local" environment
4. Try the "Health Check" request

**First Request Example:**

```
GET http://localhost:9005/2015-03-31/functions/function/invocations/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-25T...",
  "service": "organization-api",
  "version": "1.0.0"
}
```

### 8. Browse Data in Drizzle Studio

Visual database browser:

```bash
npm run db:studio
```

Opens https://local.drizzle.studio in your browser.

## Test Organizations Created

The seed script creates two organizations you can test with:

### Acme Corporation
- **Slug:** `acme-corp`
- **Plan:** Enterprise
- **Status:** Active
- **Users:** 9 (5 customers, 3 reps, 1 admin)
- **Features:** Full feature set enabled

### TechStart Inc
- **Slug:** `techstart-inc`
- **Plan:** Professional
- **Status:** Active
- **Users:** 3 (2 customers, 1 rep)
- **Features:** Basic features

## Common Operations

### List all users in Acme Corp

Using Postman:
1. Open "List Users" request
2. Set `orgId` path variable to the Acme Corp UUID (check seed output)
3. Send request

Using cURL:
```bash
curl "http://localhost:9005/2015-03-31/functions/function/invocations/organizations/{orgId}/users?limit=10"
```

### Get a customer profile

Using GraphQL Gateway (recommended):
```graphql
query {
  customerProfiles(orgId: "org_123", limit: 10) {
    id
    name
    email
    tier
    lifetimeValue
    totalSpend
  }
}
```

### Create a new ticket

```bash
curl -X POST \
  http://localhost:9005/2015-03-31/functions/function/invocations/organizations/{orgId}/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "user_uuid",
    "subject": "Test ticket",
    "description": "Testing the API",
    "priority": "NORMAL",
    "category": "TECHNICAL_ISSUE"
  }'
```

## Resetting Data

To start fresh:

```bash
# Clear all data and re-seed
npm run db:reset
```

Or manually:

```bash
# Clear data
npm run db:clear

# Seed fresh data
npm run db:seed-comprehensive
```

## Troubleshooting

### "Database connection failed"

**Check PostgreSQL is running:**
```bash
docker-compose ps postgres
# or
pg_isready -h localhost -p 5432
```

**Check credentials:**
```bash
echo $DB_HOST $DB_PORT $DB_USER $DB_NAME
```

### "relation does not exist"

**Run migrations:**
```bash
npm run db:migrate
```

### "Foreign key violation"

**Clear data before seeding:**
```bash
npm run db:clear
npm run db:seed-comprehensive
```

### Can't find seeded organization IDs

The seed script outputs UUIDs to the console. Copy them from there, or query the database:

```bash
npm run db:studio
```

Then browse the organizations table.

## Next Steps

1. ✅ Database is seeded
2. ✅ API is running
3. 📝 Test with Postman collection
4. 🚀 Integrate with GraphQL Gateway
5. 💻 Connect your UI to the API

## Integration with GraphQL Gateway

The GraphQL Gateway provides a unified interface to this API:

```bash
# In a separate terminal, start the GraphQL Gateway
cd packages/server/apis/gateway-api
npm run dev

# Access at http://localhost:8787/graphql
```

Now you can query all organization data through GraphQL!

## API Postman Collection

Import the collection for easy testing:

**File:** `postman/collections/organization-api.json`

**Includes:**
- 60+ REST endpoints
- Sample requests for all resources
- Pre-filled example data
- Path variables configured

## Need Help?

- See `scripts/README.md` for detailed script documentation
- Check `docs/` folder for API reference and guides
- Review `src/db/schema.ts` for database structure
- Use Drizzle Studio for visual data inspection

## Summary

You now have a fully functional Organization API with:
- ✅ Database schema applied
- ✅ 60+ mock records across 12 tables
- ✅ API server running locally
- ✅ Postman collection ready to use
- ✅ GraphQL Gateway integration available

Happy testing! 🎉
