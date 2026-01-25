# Postman Collections for Grounded

This directory contains Postman collections for testing the Grounded APIs.

## Collections

### 1. Conversation Commands Service
**File:** `collections/conversation-commands-service.json`  
**Purpose:** Command-side API for creating and updating conversations (write operations)  
**Base URL:** `http://localhost:3001` (docker-compose port mapping)

### 2. Conversation Updates Service
**File:** `collections/conversation-updates-service.json`  
**Purpose:** Query-side API for reading conversation data (read operations)  
**Base URL:** `http://localhost:3002` (docker-compose port mapping)

## Setup Instructions

### Import Collections

1. Open Postman
2. Click **Import** in the top-left corner
3. Navigate to `postman/collections/` and select both JSON files
4. Import the environment file: `postman/environments/local.postman_environment.json`
5. Import the globals file: `postman/globals/workspace.postman_globals.json`
6. Select the **Local** environment in Postman (top-right dropdown)

### Environment Variables

The following environment variables are configured in the **Local** environment for your local docker-compose setup:

#### Ruby APIs
| Variable | Default Value | Description |
|----------|---------------|-------------|
| `conversation_commands_base_url` | `http://localhost:3001` | Conversation Commands API (write operations) |
| `conversation_updates_base_url` | `http://localhost:3002` | Conversation Updates API (read operations) |

#### Lambda Functions (via AWS Lambda Runtime Interface Emulator)
| Variable | Default Value | Description |
|----------|---------------|-------------|
| `actions_orchestrator_base_url` | `http://localhost:9001/2015-03-31/functions/function/invocations` | Actions Orchestrator Lambda |
| `conversation_responder_base_url` | `http://localhost:9002/2015-03-31/functions/function/invocations` | Conversation Responder Lambda |
| `customer_spend_agent_base_url` | `http://localhost:9003/2015-03-31/functions/function/invocations` | Customer Spend Agent Lambda |
| `response_recommendation_agent_base_url` | `http://localhost:9004/2015-03-31/functions/function/invocations` | Response Recommendation Agent Lambda |
| `organization_api_base_url` | `http://localhost:9005/2015-03-31/functions/function/invocations` | Organization API Lambda |

#### Infrastructure Services
| Variable | Default Value | Description |
|----------|---------------|-------------|
| `dynamodb_endpoint` | `http://localhost:8000` | DynamoDB Local endpoint |
| `dynamodb_admin_url` | `http://localhost:8001` | DynamoDB Admin UI (Web interface) |
| `kafka_ui_url` | `http://localhost:8080` | Kafka UI (Web interface) |
| `localstack_endpoint` | `http://localhost:4566` | LocalStack (AWS services emulator) |
| `postgres_host` | `localhost` | PostgreSQL host |
| `postgres_port` | `5432` | PostgreSQL port |

### Global Variables

The following global variables are configured (these are shared across all environments):

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `org_id` | `org_123` | Sample organization ID for testing |
| `user_id` | `user_456` | Sample user ID for testing |

You can modify environment-specific values in Postman by selecting **Environments** → **Local**, and global values under **Globals**.

## Starting Local Services

To start all services defined in docker-compose.yml:

```bash
# Start all services
docker-compose up -d

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f conversation-updates-api

# Stop all services
docker-compose down

# Rebuild and restart services
docker-compose up -d --build
```

### Individual Service Access

Once docker-compose is running, you can access these web UIs in your browser:

- **Kafka UI**: http://localhost:8080
- **DynamoDB Admin**: http://localhost:8001
- **Conversation Commands API**: http://localhost:3001
- **Conversation Updates API**: http://localhost:3002

## API Endpoints

### Conversation Updates Service (Read-Only)

#### Get Conversation by ID
```
GET /conversations/:conversation_id
```
Fetches a single conversation with its current state.

**Response:**
```json
{
  "id": "01JK7Z8M9N2P3Q4R5S6T7V8W9X",
  "org_id": "org_123",
  "user_id": "user_456",
  "status": "active",
  "current_step": "awaiting_response",
  "created_at": "2026-01-25T10:00:00Z",
  "updated_at": "2026-01-25T10:05:00Z",
  "metadata": {}
}
```

#### List Conversations by Organization
```
GET /conversations?org_id={org_id}&limit=20&last_evaluated_key={key}
```
Lists conversations for an organization, sorted by newest first.

**Query Parameters:**
- `org_id` (required): Organization ID
- `limit` (optional): Number of results (default: 20)
- `last_evaluated_key` (optional): Base64-encoded pagination key

**Response:**
```json
{
  "conversations": [...],
  "last_evaluated_key": "eyJQSyI6..."
}
```

#### List Conversations by User
```
GET /conversations?user_id={user_id}&limit=20&last_evaluated_key={key}
```
Lists conversations for a user, sorted by newest first.

**Query Parameters:**
- `user_id` (required): User ID
- `limit` (optional): Number of results (default: 20)
- `last_evaluated_key` (optional): Base64-encoded pagination key

#### Get Conversation Messages
```
GET /conversations/:conversation_id/messages?limit=50&last_evaluated_key={key}
```
Fetches all messages in a conversation in chronological order (oldest first).

**Query Parameters:**
- `limit` (optional): Number of messages (default: 50)
- `last_evaluated_key` (optional): Base64-encoded pagination key

**Response:**
```json
{
  "messages": [
    {
      "id": "msg_123",
      "conversation_id": "01JK7Z8M9N2P3Q4R5S6T7V8W9X",
      "role": "user",
      "content": "I need help with my order",
      "timestamp": "2026-01-25T10:00:00Z",
      "metadata": {}
    },
    {
      "id": "msg_124",
      "conversation_id": "01JK7Z8M9N2P3Q4R5S6T7V8W9X",
      "role": "assistant",
      "content": "I'd be happy to help you with your order.",
      "timestamp": "2026-01-25T10:00:15Z",
      "metadata": {}
    }
  ],
  "last_evaluated_key": null
}
```

## Running Services Outside Docker

If you need to run services individually outside of Docker:

### Conversation Commands Service
```bash
cd ruby-apis/conversation-commands
bin/rails server -p 3001
```

### Conversation Updates Service
```bash
cd ruby-apis/conversation-updates
bin/rails server -p 3002
```

### Required Environment Variables

When running outside of Docker, configure these environment variables:

#### Ruby APIs
- `DYNAMO_TABLE_NAME` - DynamoDB table name (default: `grounded-datastore`)
- `AWS_REGION` - AWS region (default: `us-east-1`)
- `AWS_ACCESS_KEY_ID` - AWS credentials (use `local` for local development)
- `AWS_SECRET_ACCESS_KEY` - AWS credentials (use `local` for local development)
- `DYNAMODB_ENDPOINT` - Local DynamoDB endpoint (`http://localhost:8000`)

#### Lambda Functions
- `KAFKA_BROKERS` - Kafka broker address (`localhost:9092`)
- `DYNAMO_TABLE_NAME` - DynamoDB table name (`grounded-datastore`)
- `DYNAMODB_ENDPOINT` - Local DynamoDB endpoint (`http://localhost:8000`)
- `ANTHROPIC_API_KEY` - Required for AI agent Lambdas
- `ORG_API_ENDPOINT` - Organization API endpoint for agent Lambdas

## Pagination

All list endpoints support pagination using DynamoDB's `last_evaluated_key`:

1. Make initial request without `last_evaluated_key`
2. If response includes `last_evaluated_key`, include it in the next request
3. Continue until `last_evaluated_key` is `null`

The key is Base64-encoded and opaque - don't try to decode or modify it.

## Testing Tips

1. **Start with health check**: Test `/up` endpoint first to ensure the service is running
2. **Use sample data**: Replace the sample `conversation_id`, `org_id`, and `user_id` with actual values from your DynamoDB
3. **Test pagination**: Use small `limit` values to test pagination behavior
4. **CQRS pattern**: Remember the Updates service is read-only - use the Commands service for writes
5. **Check Docker logs**: If requests fail, check service logs with `docker-compose logs -f <service-name>`

## Invoking Lambda Functions Locally

Lambda functions run with AWS Lambda Runtime Interface Emulator. To invoke them via Postman:

**Method:** POST  
**URL:** `http://localhost:900X/2015-03-31/functions/function/invocations`  
**Body:** JSON payload matching the Lambda's expected event structure

Example for Actions Orchestrator:
```json
{
  "Records": [
    {
      "body": "{\"event_type\":\"conversation_initiated\",\"data\":{...}}"
    }
  ]
}
```

## Architecture Notes

- **Port Mapping**: Docker containers run on internal port 3000, but are mapped to different external ports (3001, 3002)
- **Service Discovery**: Containers use service names (e.g., `dynamodb-local`, `kafka`) for internal communication
- **Lambda RIE**: Lambda functions use the `/2015-03-31/functions/function/invocations` endpoint for local testing
- **CQRS**: Commands API writes events, Updates API reads persisted state
