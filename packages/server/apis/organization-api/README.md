# Organization API

Node.js Lambda serving organizational data via PostgreSQL. Provides REST endpoints for organizations, users, customers, tickets, refunds, budgets, AI agents, and more.

## Quick Start

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Seed database with mock data
npm run db:seed-comprehensive

# Start development server
npm run dev

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
   npm run db:migrate
   ```

4. **Seed with mock data:**
   ```bash
   npm run db:seed-comprehensive
   ```

5. **Generate a test JWT token:**
   ```bash
   npm run jwt:generate
   ```
   Copy the generated token for API requests.

6. **Start the API:**
   ```bash
   npm run dev
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
npm run db:seed-comprehensive

# Clear all data from database
npm run db:clear

# Complete reset: clear + seed
npm run db:reset
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
npm run db:generate

# Run pending migrations
npm run db:migrate

# Push schema changes (dev only)
npm run db:push

# Open Drizzle Studio (visual database browser)
npm run db:studio
```

### Basic Seed

Simple seed with minimal data:

```bash
npm run db:seed
```

## Development

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Format
npm run format

# Test endpoints (requires DB)
npm run test:endpoints

# Watch mode for development
npm run dev
```

## Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| **Development** | | |
| Build | `npm run build` | Compile with esbuild |
| Build ZIP | `npm run build:zip` | Create Lambda deployment package |
| Dev Server | `npm run dev` | Start with hot reload |
| Type Check | `npm run typecheck` | Run TypeScript compiler |
| Lint | `npm run lint` | Run ESLint |
| Lint Fix | `npm run lint:fix` | Auto-fix linting issues |
| **Database** | | |
| Generate Migration | `npm run db:generate` | Generate migration from schema |
| Run Migrations | `npm run db:migrate` | Apply pending migrations |
| Push Schema | `npm run db:push` | Push schema changes (dev) |
| Drizzle Studio | `npm run db:studio` | Open visual database browser |
| **Seeding** | | |
| Basic Seed | `npm run db:seed` | Minimal seed data |
| Full Seed | `npm run db:seed-comprehensive` | 60+ realistic records |
| Clear Data | `npm run db:clear` | Remove all data |
| Reset | `npm run db:reset` | Clear + comprehensive seed |
| **Authentication** | | |
| Generate JWT | `npm run jwt:generate` | Create test JWT token |
| **Testing** | | |
| Test Endpoints | `npm run test:endpoints` | Test API endpoints |

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
