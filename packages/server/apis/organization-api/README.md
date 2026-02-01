# Organization API

Node.js Lambda serving organizational data via PostgreSQL. Provides REST endpoints for organizations, users, customers, tickets, refunds, budgets, AI agents, and more.

## Quick Start

```bash
# Install dependencies
npm install

# Run database migrations
yarn run db:migrate

# Seed database with mock data
yarn run db:seed-comprehensive

# Start development server
yarn run dev

# The API will be available at:
# http://localhost:9005/2015-03-31/functions/function/invocations
```

### First Time Setup

1. **Ensure PostgreSQL is running:**
   ```bash
   # Via docker-compose (recommended)
   docker-compose up postgres -d
   
   # Or check if running locally
   pg_isready
   ```

2. **Set environment variables:**
   ```bash
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_USER=postgres
   export DB_PASSWORD=postgres
   export DB_NAME=grounded
   export JWT_SECRET=dev-secret-key-change-in-production
   ```

3. **Run migrations:**
   ```bash
   yarn run db:migrate
   ```

4. **Seed with mock data:**
   ```bash
   yarn run db:seed-comprehensive
   ```

5. **Generate a test JWT token:**
   ```bash
   yarn run jwt:generate
   ```
   Copy the generated token for API requests.

6. **Start the API:**
   ```bash
   yarn run dev
   ```

You're ready! Test with Postman collection at `postman/collections/organization-api.json`

## API Endpoints

- **Organizations:** `/organizations`
- **Users:** `/organizations/:orgId/users`
- **Representatives:** `/organizations/:orgId/representatives`
- **Customer Profiles:** `/organizations/:orgId/customer-profiles`
- **Tickets:** `/organizations/:orgId/tickets`
- **Escalations:** `/organizations/:orgId/escalations`
- **Refunds:** `/organizations/:orgId/refunds`
- **Budgets:** `/organizations/:orgId/budgets`
- **AI Agents:** `/organizations/:orgId/agents`
- **Decision Rules:** `/organizations/:orgId/decision-rules`
- **Performance Metrics:** `/organizations/:orgId/performance`

## Features

- ✅ **Type-safe** - Zod validation + TypeScript
- ✅ **Multi-tenant** - Organization-scoped data
- ✅ **Validated** - Request/response validation
- ✅ **Authenticated** - JWT-based authentication
- ✅ **Authorized** - Organization-level access control
- ✅ **Relations** - Drizzle ORM with foreign keys
- ✅ **Production-ready** - AWS Lambda optimized

## Documentation

See the [`docs/`](./docs/) folder for detailed documentation:

- **[JWT-AUTHENTICATION.md](./docs/JWT-AUTHENTICATION.md)** - Authentication & authorization
- **[QUICKSTART.md](./docs/QUICKSTART.md)** - Get started quickly
- **[API.md](./docs/API.md)** - Complete API reference
- **[VALIDATION.md](./docs/VALIDATION.md)** - Request validation guide
- **[DATABASE.md](./docs/DATABASE.md)** - Database schema & access patterns
- **[COMPLETE_SETUP.md](./docs/COMPLETE_SETUP.md)** - Full implementation overview

## Tech Stack

- **Runtime:** AWS Lambda (Node.js 20)
- **Database:** PostgreSQL via RDS
- **ORM:** Drizzle ORM
- **Validation:** Zod schemas
- **Build:** esbuild

## Database Management

### Seed Scripts

Comprehensive mock data for testing and development:

```bash
# Seed database with realistic mock data (60+ records)
yarn run db:seed-comprehensive

# Clear all data from database
yarn run db:clear

# Complete reset: clear + seed
yarn run db:reset
```

**What gets seeded:**
- 2 Organizations (Acme Corp, TechStart Inc)
- 12 Users (customers, representatives, admins)
- 4 Representatives (with availability and ratings)
- 5 Customer Profiles (various tiers: FREE, STARTER, PRO, ENTERPRISE)
- 6 Tickets (different statuses and priorities)
- 3 Escalations (pending, in-progress, resolved)
- 4 Refunds (various amounts and statuses)
- 4 Budgets (different types and periods)
- 5 Agent Configurations (all agent types)
- 5 Decision Rules (automation rules)
- 5 Performance Metrics (daily, weekly, monthly)
- 7 Team Performance Records (individual rep metrics)

See `scripts/README.md` for detailed documentation.

### Database Tools

```bash
# Generate migrations from schema changes
yarn run db:generate

# Run pending migrations
yarn run db:migrate

# Push schema changes (dev only)
yarn run db:push

# Open Drizzle Studio (visual database browser)
yarn run db:studio
```

### Basic Seed

Simple seed with minimal data:

```bash
yarn run db:seed
```

## Development

```bash
# Type check
yarn run typecheck

# Lint
yarn run lint

# Format
yarn run format

# Test endpoints (requires DB)
yarn run test:endpoints

# Watch mode for development
yarn run dev
```

## Scripts Reference

| Script             | Command                          | Description                      |
|--------------------|----------------------------------|----------------------------------|
| **Development**    |                                  |                                  |
| Build              | `yarn run build`                 | Compile with esbuild             |
| Build ZIP          | `yarn run build:zip`             | Create Lambda deployment package |
| Dev Server         | `yarn run dev`                   | Start with hot reload            |
| Type Check         | `yarn run typecheck`             | Run TypeScript compiler          |
| Lint               | `yarn run lint`                  | Run ESLint                       |
| Lint Fix           | `yarn run lint:fix`              | Auto-fix linting issues          |
| **Database**       |                                  |                                  |
| Generate Migration | `yarn run db:generate`           | Generate migration from schema   |
| Run Migrations     | `yarn run db:migrate`            | Apply pending migrations         |
| Push Schema        | `yarn run db:push`               | Push schema changes (dev)        |
| Drizzle Studio     | `yarn run db:studio`             | Open visual database browser     |
| **Seeding**        |                                  |                                  |
| Basic Seed         | `yarn run db:seed`               | Minimal seed data                |
| Full Seed          | `yarn run db:seed-comprehensive` | 60+ realistic records            |
| Clear Data         | `yarn run db:clear`              | Remove all data                  |
| Reset              | `yarn run db:reset`              | Clear + comprehensive seed       |
| **Authentication** |                                  |                                  |
| Generate JWT       | `yarn run jwt:generate`          | Create test JWT token            |
| **Testing**        |                                  |                                  |
| Test Endpoints     | `yarn run test:endpoints`        | Test API endpoints               |

## Environment Variables

**Local Development:**

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=grounded

# JWT Authentication (required)
JWT_SECRET=your-secret-key-here
JWT_ISSUER=grounded-api
JWT_AUDIENCE=grounded-services
```

**Generate a secure JWT secret:**

```bash
openssl rand -base64 32
```

**Production (AWS Lambda):**

```bash
# Database
DATABASE_HOST=your-rds-endpoint.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_NAME=grounded
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password

# JWT Authentication
JWT_SECRET=your-production-secret
JWT_ISSUER=grounded-api
JWT_AUDIENCE=grounded-services
```

Or use AWS Secrets Manager:
```bash
DATABASE_SECRET_ARN=arn:aws:secretsmanager:...
JWT_SECRET_ARN=arn:aws:secretsmanager:...
```

## Architecture

```
Client Request
    ↓
Lambda Handler (src/index.ts)
    ↓
Router (src/router.ts)
    ↓
Validation Middleware (Zod schemas)
    ↓
Controller (src/controllers/*.ts)
    ↓
Database (Drizzle ORM)
    ↓
PostgreSQL (RDS)
```

## Project Structure

```
src/
├── index.ts              # Lambda handler
├── router.ts             # Route matching & execution
├── types.ts              # Shared TypeScript types
├── db/
│   ├── index.ts          # Database connection
│   └── schema.ts         # Drizzle schema definitions
├── schemas/
│   └── requests.ts       # Zod validation schemas
├── controllers/          # Business logic per resource
│   ├── organizations.ts
│   ├── users.ts
│   ├── representatives.ts
│   ├── customer-profiles.ts
│   ├── tickets.ts
│   ├── escalations.ts
│   ├── refunds.ts
│   ├── budgets.ts
│   ├── agents.ts
│   ├── decision-rules.ts
│   └── performance.ts
└── middleware/
    └── validation.ts     # Validation utilities

drizzle/                  # Database migrations
docs/                     # Documentation
```

## License

Proprietary - Grounded POC
