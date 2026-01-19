# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Grounded** is a POC for AI-grounded customer service features. The name comes from an electrical engineering metaphor: like a ground wire protects systems from voltage surges, this architecture "grounds" AI agents with organizational data to prevent hallucinations.

**Status:** Proof of Concept
**Stack:** Remix + React + TypeScript + Supabase + Tailwind CSS (Frontend) | AWS Lambda + DynamoDB + PostgreSQL + MSK Kafka (Backend)

## Build & Development Commands

```bash
# Install dependencies (from root)
npm install

# Root-level commands
npm run build        # Build all packages
npm run lint         # Lint all packages
npm run typecheck    # TypeScript check all packages
npm run format       # Prettier format

# Development (from packages/ui/customer-ui)
npm run dev          # Start Remix dev server with Vite

# Production (from packages/ui/customer-ui)
npm run build        # Build for production
npm run serve        # Run production build

# GraphQL API (from packages/server/apis/gateway-api)
npm run dev          # Start dev server with hot reload (port 4000)
npm run build        # Compile TypeScript
npm run start        # Run compiled output
npm run typecheck    # Type check without emitting
```

## Monorepo Structure

Managed by Lerna with npm workspaces (`packages/**/*`):

```
packages/
├── server/                        # Backend infrastructure layer
│   ├── shared/                    # Shared utilities
│   │   ├── dynamo/                # DynamoDB client wrapper
│   │   ├── postgres/              # PostgreSQL connection manager
│   │   ├── event-producer/        # Kafka producer with connection pooling
│   │   └── secrets-manager/       # AWS Secrets Manager client
│   ├── agents/                    # AI agents (placeholder)
│   │   ├── customer-spend-agent/
│   │   └── response-recommendation-agent/
│   ├── orchestrators/             # State machine orchestrators
│   │   ├── actions-orchestrator/  # Main orchestration Lambda
│   │   ├── assertions-orchestrator/
│   │   └── conversation-responder/
│   └── apis/                      # API implementations
│       ├── gateway-api/           # GraphQL API (Apollo Server v5)
│       └── organization-data-api/
├── ui/
│   └── customer-ui/               # Remix + React frontend (Cloudflare Workers)
│       ├── app/                   # Application source
│       │   ├── components/        # React components
│       │   ├── lib/               # Utilities (supabase, types)
│       │   └── routes/            # Remix routing
│       └── workers/               # Cloudflare Workers edge functions
└── schemas/                       # Shared data schemas (placeholder)

terraform/                         # AWS infrastructure-as-code
docs/                              # Architecture diagrams
```

## Architecture

### Event-Driven Pattern
User messages flow through an event-driven state machine:
1. User message → Kafka topic → Actions Orchestrator (Lambda)
2. Orchestrator → Specialized agents → Assertions Orchestrator
3. Decision/Response → User

### Data Model
**Supabase (Frontend):**
- **profiles**: id, email, name, role, created_at
- **conversations**: id, customer_id, rep_id, status (waiting|active|closed), timestamps
- **messages**: id, conversation_id, sender_id, content, created_at

**AWS (Backend - CQRS pattern):**
- **DynamoDB**: Fast reads for chat history (`conversation-commands`, `conversation-updates`)
- **PostgreSQL**: Conversation evaluation writes (`conversation-evaluations`)

### Real-time Pattern (Frontend)
Components subscribe to Supabase Realtime for live updates:
```typescript
supabase.channel(`conversation-${id}`)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` }, handler)
  .subscribe();
```

### Role-Based System
Three user roles with different dashboards:
- **customer** → CustomerChat component
- **representative** → RepresentativeDashboard component
- **admin** → AdminDashboard component

## Infrastructure (Terraform)

AWS resources defined in `terraform/`:

| Resource | Purpose |
|----------|---------|
| `postgres.tf` | RDS PostgreSQL for conversation evaluations |
| `dynamo.tf` | DynamoDB tables (conversation-commands, conversation-updates) |
| `msk.tf` | Managed Streaming Kafka cluster |
| `lambda.tf` | Actions Orchestrator Lambda function |
| `secrets.tf` | Secrets Manager for credentials |
| `networking.tf` | VPC and networking configuration |

## Environment Variables

**Frontend** (`packages/ui/customer-ui/.env`):
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend** (via AWS Secrets Manager):
- `supabase-key` - Supabase service key
- `conversation-evaluation-db-password` - PostgreSQL credentials

## Key Files

**Frontend:**
- `packages/ui/customer-ui/app/root.tsx` - Remix root component
- `packages/ui/customer-ui/app/lib/supabase.ts` - Supabase client initialization
- `packages/ui/customer-ui/app/lib/database.types.ts` - TypeScript types for Supabase tables

**Backend Utilities:**
- `packages/server/shared/dynamo/index.ts` - DynamoDB document client wrapper
- `packages/server/shared/postgres/index.ts` - PostgreSQL connection manager
- `packages/server/shared/event-producer/index.ts` - Kafka producer lifecycle management
- `packages/server/shared/secrets-manager/index.ts` - AWS Secrets Manager client

**GraphQL API:**
- `packages/server/apis/gateway-api/src/index.ts` - Apollo Server entry point
- `packages/server/apis/gateway-api/src/schema.ts` - GraphQL type definitions
- `packages/server/apis/gateway-api/src/resolvers.ts` - Query/mutation resolvers

**Infrastructure:**
- `terraform/*.tf` - AWS infrastructure definitions
- `tsconfig.base.json` - Base TypeScript config with path aliases

## Dependencies

Key runtime dependencies:
- `@apollo/server` - GraphQL server (v5)
- `graphql` - GraphQL implementation
- `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb` - DynamoDB
- `@aws-sdk/client-secrets-manager` - Secrets Manager
- `kafkajs` - Kafka producer/consumer
- `pg` - PostgreSQL client
- `zod` - Schema validation

## Testing

Not yet configured. Tests are a stretch goal.
