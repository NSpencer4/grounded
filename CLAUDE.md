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
│       ├── gateway-api/           # GraphQL API (Apollo Server v5)
│       └── company-data-api/      # Node.js Lambda monolith (PostgreSQL)
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

### CQRS Pattern

**Command Side (conversation-commands Rails API):**

- Receives conversation command requests from GraphQL
- Hydrates and validates data
- Produces events to `conversation-commands` Kafka topic

**Query Side (conversation-updates Rails API):**

- Serves conversation state for query requests via GraphQL
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
│  conversation-commands  │  conversation-evaluation  │  conversation-assertion  │  conversation-decision  │
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

- Consumes `conversation-commands` and `conversation-decision` events
- Persists state records to DynamoDB
- Decides what evaluations need to be made based on state
- Produces `conversation-evaluation` events

**Evaluator Lambdas (Agent & Non-Agent):**

- Consume `conversation-evaluation` events
- Use Org Tools MCP Server to fetch data from Company Data Lambda
- Make assertions/recommendations
- Produce `conversation-assertion` events

**Company Data Lambda (Node.js Monolith):**

- Single Lambda serving as the organizational data source
- Uses PostgreSQL for company/customer data storage
- Exposes endpoints for: customer info, billing, orders, subscriptions, etc.
- Accessed by evaluators via MCP Server tools (simplified POC approach vs. microservices)

**Responder Lambda:**

- Consumes `conversation-assertion` events
- Decides whether to respond with a conversation update
- Persists conversation state to DynamoDB (for query side reads)
- Forwards state updates to Cloudflare Durable Object for SSE streaming
- Produces `conversation-decision` events (for orchestrator to process)

### Key Kafka Topics

| Topic                     | Producer     | Consumer          | Purpose                |
|---------------------------|--------------|-------------------|------------------------|
| `conversation-commands`   | Commands API | Orchestrator      | New commands           |
| `conversation-evaluation` | Orchestrator | Evaluator Lambdas | Evaluation requests    |
| `conversation-assertion`  | Evaluators   | Responder         | Agent assertions       |
| `conversation-decision`   | Responder    | Orchestrator      | Decision feedback loop |

## Data Model

**DynamoDB (Single Table Design):**

| Entity                   | PK (Partition Key) | SK (Sort Key)      | GSI1-PK          | GSI1-SK         | Purpose                      |
|:-------------------------|:-------------------|:-------------------|:-----------------|:----------------|:-----------------------------|
| **Conversation State**   | `CONV#<id>`        | `STATE`            | `ORG#<org_id>`   | `2026-01-20...` | Latest state + Org-wide list |
| **Conversation Message** | `CONV#<id>`        | `MSG#<ts>#<id>`    | `USER#<user_id>` | `2026-01-20...` | Threaded chat + User history |
| **Process State**        | `CONV#<id>`        | `PROC#<ts>#<type>` | -                | -               | State Machine Internal Data  |

**Primary Access Patterns:**

- **Fetch Conversation by ID:** `GetItem(PK: CONV#<id>, SK: STATE)`. (Clean lookup, no timestamp needed).
- **List Org Conversations by Date:** `Query(GSI1-PK: ORG#<org_id>, ScanIndexForward: false)`.
- **List User Conversations by Date:** `Query(GSI1-PK: USER#<user_id>, ScanIndexForward: false)`.
- **Fetch Message History:** `Query(PK: CONV#<id>, SK begins_with: MSG#)`.

**Persistence Responsibilities:**

- **Conversation Commands API:** Writes the initial `MSG#` record and the initial `STATE` record.
- **Actions Orchestrator:** Updates `STATE` and appends `PROC#` logs.
- **Responder Lambda:** Updates `STATE`, manages `GSI1` attributes, and appends new `MSG#` (AI responses).
- **Conversation Updates API:** Read-only (no persistence).

## Infrastructure (Terraform)

AWS resources defined in `terraform/`:

| File                             | Purpose                                       |
|----------------------------------|-----------------------------------------------|
| `providers.tf`                   | AWS provider configuration (us-east-1)        |
| `variables.tf`                   | Environment, VPC, and resource name variables |
| `networking.tf`                  | VPC, subnets, security groups, VPC endpoints  |
| `dynamo.tf`                      | Single DynamoDB table (grounded-datastore)    |
| `ec2-kafka-cluster.tf`           | EC2 instance running Kafka via Docker Compose |
| `lambda-actions-orchestrator.tf` | Actions Orchestrator Lambda                   |
| `secrets.tf`                     | Secrets Manager data sources                  |

## Environment Variables

**Frontend** (`packages/ui/customer-ui/.env`):
```
GRAPHQL_ENDPOINT=https://your-cf-worker.workers.dev/graphql
```

**Backend Lambdas:**

- `KAFKA_BROKER` - Kafka broker address
- `DYNAMO_TABLE_NAME` - DynamoDB table name
- `AWS_REGION` - AWS region
- `ANTHROPIC_API_KEY` - For AI agents

## Key Files

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
