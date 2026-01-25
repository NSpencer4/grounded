# Organization API

Node.js Lambda serving organizational data via PostgreSQL. Provides REST endpoints for organizations, users, customers, tickets, refunds, budgets, AI agents, and more.

## Quick Start

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:generate
npm run db:migrate

# Build
npm run build

# Deploy (via Terraform)
cd ../../../terraform
terraform apply
```

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
- ✅ **Relations** - Drizzle ORM with foreign keys
- ✅ **Production-ready** - AWS Lambda optimized

## Documentation

See the [`docs/`](./docs/) folder for detailed documentation:

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
```

## Environment Variables

```bash
DATABASE_HOST=your-rds-endpoint.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_NAME=grounded
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password
```

Or use AWS Secrets Manager (production):
```bash
DATABASE_SECRET_ARN=arn:aws:secretsmanager:...
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
