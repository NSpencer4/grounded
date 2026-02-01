# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Grounded** is a POC for AI-grounded customer service features. The name comes from an electrical engineering metaphor: like a ground wire protects systems from voltage surges, this architecture "grounds" AI agents with organizational data to prevent hallucinations.

**Status:** Proof of Concept
**Stack:** Remix + React + TypeScript + Cloudflare Workers/Durable Objects (Frontend) | Ruby on Rails + AWS Lambda +
DynamoDB + Kafka (Backend)

## Build & Development Commands

```bash
# Install dependencies (from root)
npm install

# Root-level commands
yarn run build        # Build all packages
yarn run lint         # Lint all packages
yarn run typecheck    # TypeScript check all packages
yarn run format       # Prettier format

# Development (from packages/ui/customer-ui)
yarn run dev          # Start Remix dev server with Vite

# Production (from packages/ui/customer-ui)
yarn run build        # Build for production
yarn run serve        # Run production build

# GraphQL Gateway API (from packages/server/apis/gateway-api)
yarn run dev          # Start Wrangler dev server (port 8787)
yarn run build        # Build for production (dry-run)
yarn run deploy       # Deploy to Cloudflare Workers
yarn run typecheck    # Type check without emitting
```

## Monorepo Structure

Managed by Lerna with npm workspaces (`packages/**/*`):

```
packages/
├── server/                        # Backend infrastructure layer
│   ├── shared/                    # Shared utilities (@grounded/server-shared)
│   │   ├── dynamo/                # DynamoDB client wrapper
│   │   ├── postgres/              # PostgreSQL connection manager
│   │   ├── event-producer/        # Kafka producer with connection pooling
│   │   └── secrets-manager/       # AWS Secrets Manager client
│   ├── agents/                    # AI agent Lambdas
│   │   ├── shared/                # Shared agent utilities (@grounded/agents-shared)
│   │   ├── customer-spend-agent/  # Analyzes customer spending data
│   │   └── response-recommendation-agent/  # Generates response recommendations
│   ├── orchestrators/             # State machine orchestrators
│   │   ├── actions-orchestrator/  # Main orchestration Lambda
│   │   └── responder/             # Response decision Lambda
│   ├── mcp/                       # MCP servers
│   │   └── org-tools/              # Company Data Lambda integration tools
│   └── apis/                      # API implementations
│       ├── gateway-api/           # GraphQL Gateway (GraphQL Yoga + CF Workers)
│       │                          # Unified API for all services
│       ├── organization-api/      # Organization data API (Node.js Lambda)
│       └── company-data-api/      # Company data API (Node.js Lambda)
├── ui/
│   └── customer-ui/               # Remix + React frontend (Cloudflare Workers)
│       ├── app/                   # Application source
│       │   ├── components/        # React components
│       │   ├── lib/               # Utilities
│       │   └── routes/            # Remix routing
│       └── workers/               # Cloudflare Workers + Durable Objects
└── schemas/                       # Shared data schemas (@grounded/schemas)
    └── events/                    # Event type definitions

ruby-apis/                         # Ruby on Rails CQRS services
├── conversation-commands/         # Command side - writes
└── conversation-updates/          # Query side - reads

terraform/                         # AWS infrastructure-as-code
docs/                              # Architecture diagrams
```

## Architecture

### GraphQL Gateway API

The GraphQL Gateway serves as the unified API layer for all Grounded services, deployed on Cloudflare Workers:

**Integrated Services:**
- **Conversation Commands API** (Ruby on Rails) - Write operations for conversations and messages
- **Conversation Updates API** (Ruby on Rails) - Read operations for conversations and messages
- **Organization API** (Node.js Lambda) - All organization data (users, tickets, refunds, budgets, agents, etc.)

**Key Features:**
- Single GraphQL endpoint (`/graphql`) for all operations
- Comprehensive type system covering all entities
- Real-time SSE streaming via Durable Objects (`/sse/:conversationId`)
- Edge deployment on Cloudflare's global network
- GraphiQL playground for development

**API Coverage:**
- 25+ Query operations across conversations, organizations, users, representatives, customers, tickets, escalations, refunds, budgets, agents, decision rules, and performance metrics
- 30+ Mutation operations for creating, updating, and deleting entities
- Full pagination support (cursor-based and offset-based)
- Filter capabilities (status, date ranges, etc.)

See `packages/server/apis/gateway-api/API-REFERENCE.md` for complete documentation.

### CQRS Pattern

**Command Side (conversation-commands Rails API):**

- Receives conversation command requests from GraphQL Gateway
- Hydrates and validates data
- Produces events to `conversation-commands` Kafka topic

**Query Side (conversation-updates Rails API):**

- Serves conversation state for query requests via GraphQL Gateway
- Read-only service (no Kafka consumer)
- State is persisted by Responder Lambda

### Real-time Streaming Pattern

```
[Client] <--SSE-- [CF Durable Object] <-- [Conversation Updates API]
                         ^
                         |
              [CF Worker routes SSE, not GraphQL]
```

- Cloudflare Worker serves Remix React UI
- Same CF Worker hosts GraphQL for mutations/queries
- Durable Object handles SSE streaming to clients
- CF Worker routes SSE connections (not GraphQL)

### Event-Driven Orchestration

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Kafka Topics                                     │
├─────────────────────────────────────────────────────────────────────────┤
│  conversation-commands  │  conversation-evaluations  │  conversation-assertions  │  conversation-decisions  │
└─────────────────────────────────────────────────────────────────────────┘
         │                          │                          │                    │
         ▼                          ▼                          ▼                    │
┌─────────────────┐    ┌─────────────────────┐    ┌──────────────────┐              │
│ Actions         │───▶│ Evaluator Lambdas   │───▶│ Responder Lambda │──────────────┘
│ Orchestrator    │    │ (Agent & Non-Agent) │    │                  │
│                 │◀───┤                     │    │ Produces:        │
│ Consumes:       │    │ Uses: Org Tools MCP │    │ - Update events  │
│ - Commands      │    │                     │    │ - Decision events│
│ - Decisions     │    │ Produces:           │    └──────────────────┘
│                 │    │ - Assertion events  │
│ Produces:       │    └─────────────────────┘
│ - Evaluation    │
│   events        │
└─────────────────┘
```

**Actions Orchestrator Lambda:**

- Consumes `conversation-commands` and `conversation-decisions` events
- Persists state records to DynamoDB
- Decides what evaluations need to be made based on state
- Produces `conversation-evaluations` events

**Evaluator Lambdas (Agent & Non-Agent):**

- Consume `conversation-evaluations` events
- Use Org Tools MCP Server to fetch data from Company Data Lambda
- Make assertions/recommendations
- Produce `conversation-assertions` events

**Company Data Lambda (Node.js Monolith):**

- Single Lambda serving as the organizational data source
- Uses PostgreSQL for company/customer data storage
- Exposes endpoints for: customer info, billing, orders, subscriptions, etc.
- Accessed by evaluators via MCP Server tools (simplified POC approach vs. microservices)

**Responder Lambda:**

- Consumes `conversation-assertions` events
- Decides whether to respond with a conversation update
- Persists conversation state to DynamoDB (for query side reads)
- Forwards state updates to Cloudflare Durable Object for SSE streaming
- Produces `conversation-decisions` events (for orchestrator to process)

### Key Kafka Topics

| Topic                      | Producer     | Consumer          | Purpose                |
|----------------------------|--------------|-------------------|------------------------|
| `conversation-commands`    | Commands API | Orchestrator      | New commands           |
| `conversation-evaluations` | Orchestrator | Evaluator Lambdas | Evaluation requests    |
| `conversation-assertions`  | Evaluators   | Responder         | Agent assertions       |
| `conversation-decisions`   | Responder    | Orchestrator      | Decision feedback loop |

## Data Model

**DynamoDB (Single Table Design):**

| Entity                   | PK (Partition Key)  | SK (Sort Key)        | GSI1PK                  | GSI1SK          | Purpose                           |
|:-------------------------|:--------------------|:---------------------|:------------------------|:----------------|:----------------------------------|
| **Conversation State**   | `conversation#<id>` | `state#CURRENT`      | `organization#<org_id>` | `2026-01-20...` | Latest state + Org-wide list      |
| **Conversation Message** | `conversation#<id>` | `message#<ts>#<id>`  | `user#<user_id>`        | `2026-01-20...` | Threaded chat + User history      |
| **Decision Record**      | `conversation#<id>` | `decision#<ts>#<id>` | -                       | -               | Tracks pending/resolved decisions |
| **Action Record**        | `conversation#<id>` | `action#<ts>#<id>`   | -                       | -               | Actions taken based on decisions  |

**Decision Record:** Tracks decisions that need to be made or have been resolved. AI agents query pending decisions to
determine what to evaluate. Statuses: `PENDING` (awaiting agent evaluation) or `RESOLVED` (decision made).

**Action Record:** Logs what actions the orchestrator took based on decision records. Links back to the decision(s) that
triggered the action via `decisionIds`.

**Primary Access Patterns:**

- **Fetch Conversation by ID:** `GetItem(PK: conversation#<id>, SK: state#CURRENT)`. (Clean lookup, no timestamp
  needed).
- **List Org Conversations by Date:** `Query(GSI1PK: organization#<org_id>, ScanIndexForward: false)`.
- **List User Conversations by Date:** `Query(GSI1PK: user#<user_id>, ScanIndexForward: false)`.
- **Fetch Message History:** `Query(PK: conversation#<id>, SK begins_with: message#)`.
- **Fetch All Decisions:** `Query(PK: conversation#<id>, SK begins_with: decision#)`. (Evaluate what agents should look
  at).
- **Fetch All Actions:** `Query(PK: conversation#<id>, SK begins_with: action#)`. (Audit trail of orchestrator actions).

**Persistence Responsibilities:**

- **Conversation Commands API:** Writes the initial `message#` record and the initial `state` record.
- **Actions Orchestrator:** Updates `state`, creates `decision#` records (pending decisions), and creates `action#`
  records (actions taken).
- **Responder Lambda:** Updates `state`, manages `GSI1` attributes, resolves `decision#` records, and appends new
  `message#` (AI responses).
- **Conversation Updates API:** Read-only (no persistence).

## Infrastructure (Terraform)

AWS resources defined in `terraform/`:

| File                                      | Purpose                                         |
|-------------------------------------------|-------------------------------------------------|
| `providers.tf`                            | AWS provider configuration (us-east-1)          |
| `variables.tf`                            | Environment, VPC, and resource name variables   |
| `networking.tf`                           | VPC, subnets, security groups, VPC endpoints    |
| `dynamo.tf`                               | Single DynamoDB table (grounded-datastore)      |
| `postgres.tf`                             | PostgreSQL RDS for Company Data Lambda          |
| `ec2-kafka-cluster.tf`                    | EC2 instance running Kafka via Docker Compose   |
| `secrets.tf`                              | Secrets Manager data sources                    |
| `lambda-actions-orchestrator.tf`          | Actions Orchestrator Lambda                     |
| `lambda-responder.tf`                     | Responder Lambda (state persistence + SSE)      |
| `lambda-evaluators.tf`                    | Customer Spend & Response Recommendation agents |
| `lambda-company-data-api.tf`              | Company Data Lambda (PostgreSQL monolith)       |
| `app-runner-graphql-api.tf`               | GraphQL API App Runner service                  |
| `app-runner-conversation-commands-api.tf` | Conversation Commands API (Ruby write-side)     |
| `app-runner-conversation-updates-api.tf`  | Conversation Updates API (Ruby read-side)       |

## Environment Variables

**GraphQL Gateway API** (`packages/server/apis/gateway-api/wrangler.jsonc`):
```
CONVERSATION_COMMANDS_API_URL - Commands API endpoint (Ruby on Rails)
CONVERSATION_UPDATES_API_URL  - Updates API endpoint (Ruby on Rails)
ORGANIZATION_API_URL           - Organization API endpoint (Node.js Lambda)
```

**Frontend** (`packages/ui/customer-ui/.env`):
```
GRAPHQL_ENDPOINT=https://your-cf-worker.workers.dev/graphql
```

**Backend Lambdas:**

- `KAFKA_BROKER` - Kafka broker address
- `DYNAMO_TABLE_NAME` - DynamoDB table name
- `AWS_REGION` - AWS region
- `ANTHROPIC_API_KEY` - For AI agents
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - PostgreSQL credentials (Organization API)

## Key Files

**GraphQL Gateway API:**

- `packages/server/apis/gateway-api/src/index.ts` - Cloudflare Worker entry point
- `packages/server/apis/gateway-api/src/schema.ts` - GraphQL schema definitions (25+ queries, 30+ mutations)
- `packages/server/apis/gateway-api/src/resolvers.ts` - Query/mutation resolvers
- `packages/server/apis/gateway-api/src/durable-objects/conversation-stream.ts` - SSE streaming handler
- `packages/server/apis/gateway-api/wrangler.jsonc` - Cloudflare Workers configuration
- `packages/server/apis/gateway-api/API-REFERENCE.md` - Complete API documentation

**Schemas:**

- `packages/schemas/events/` - Event type definitions (Zod schemas)
- `packages/schemas/index.ts` - Core entity schemas

**Orchestrators:**

- `packages/server/orchestrators/actions-orchestrator/src/handler.ts` - Main Lambda handler
- `packages/server/orchestrators/actions-orchestrator/src/evaluator.ts` - Evaluation logic
- `packages/server/orchestrators/actions-orchestrator/src/state.ts` - DynamoDB persistence

**Agents:**

- `packages/server/agents/shared/src/llm-client.ts` - Anthropic SDK wrapper
- `packages/server/agents/customer-spend-agent/src/agent.ts` - Spend analysis
- `packages/server/agents/response-recommendation-agent/src/agent.ts` - Response generation

**MCP Servers:**

- `packages/server/mcp/state-machine-query-tools/src/index.ts` - DynamoDB query tools
- `packages/server/mcp/org-tools/` - Company Data Lambda integration tools (customer info, billing, orders)

**APIs:**

- `packages/server/apis/organization-api/src/router.ts` - Organization API routes (10+ resource types)
- `packages/server/apis/organization-api/src/controllers/` - Resource controllers
- `ruby-apis/conversation-commands/config/routes.rb` - Conversation write operations
- `ruby-apis/conversation-updates/config/routes.rb` - Conversation read operations

**Backend Utilities:**
- `packages/server/shared/dynamo/index.ts` - DynamoDB document client wrapper
- `packages/server/shared/postgres/index.ts` - PostgreSQL connection manager
- `packages/server/shared/event-producer/index.ts` - Kafka producer lifecycle management
- `packages/server/shared/secrets-manager/index.ts` - AWS Secrets Manager client

**Infrastructure:**
- `terraform/*.tf` - AWS infrastructure definitions
- `tsconfig.base.json` - Base TypeScript config with path aliases

## Workspace Packages

| Package                         | Name                      | Purpose            |
|---------------------------------|---------------------------|--------------------|
| `packages/schemas`              | `@grounded/schemas`       | Shared Zod schemas |
| `packages/server/shared`        | `@grounded/server-shared` | Server utilities   |
| `packages/server/agents/shared` | `@grounded/agents-shared` | Agent utilities    |

## Key Considerations

1. **Read/Write Separation:** Conversation Updates API is purely read-only. Responder Lambda handles all state
   persistence and SSE updates.

2. **SSE Routing:** Cloudflare Worker handles SSE routing to Durable Object, not GraphQL

3. **API Exposure:** Commands and Updates APIs are HTTPS exposed for CF Worker access. In production, these would be
   VPC-internal with GraphQL in the same VPC

4. **Kafka Producer Connection Pooling:** The event-producer module (`@grounded/server-shared/event-producer`) handles
   connection pooling for Lambda warm starts with:
   - Connection state tracking and automatic reconnection
   - Health checks (5-minute interval)
   - Idle connection cleanup (10-minute timeout)
   - Batch message support for throughput
   - GZIP compression
   - If latency becomes an issue, consider Kafka REST Proxy or AWS MSK Connect

## Testing

Not yet configured. Tests are a stretch goal.
