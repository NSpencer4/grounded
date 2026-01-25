# Postman Collections for Grounded

This directory contains Postman collections for testing the Grounded APIs.

## Collections

### 1. Conversation Commands Service

**File:** `collections/conversation-commands-service.json`  
**Purpose:** Command-side API for creating and updating conversations (write operations)  
**Base URL:** `http://localhost:3000`

### 2. Conversation Updates Service

**File:** `collections/conversation-updates-service.json`  
**Purpose:** Query-side API for reading conversation data (read operations)  
**Base URL:** `http://localhost:3001`

## Setup Instructions

### Import Collections

1. Open Postman
2. Click **Import** in the top-left corner
3. Navigate to `postman/collections/` and select both JSON files
4. Import the globals file: `postman/globals/workspace.postman_globals.json`

### Configure Environment Variables

The following global variables are configured:

| Variable                        | Default Value           | Description                                   |
|---------------------------------|-------------------------|-----------------------------------------------|
| `conversation_updates_base_url` | `http://localhost:3001` | Base URL for the conversation-updates service |
| `org_id`                        | `org_123`               | Sample organization ID for testing            |
| `user_id`                       | `user_456`              | Sample user ID for testing                    |

You can modify these values in Postman under **Environments** → **Globals**.

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
  "conversations": [
    ...
  ],
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

## Running the Services Locally

### Conversation Updates Service

```bash
cd ruby-apis/conversation-updates
bin/rails server -p 3001
```

### Required Environment Variables

The conversation-updates service requires:

- `DYNAMO_TABLE_NAME` - DynamoDB table name (default: `grounded-datastore`)
- `AWS_REGION` - AWS region (default: `us-east-1`)
- `AWS_ACCESS_KEY_ID` - AWS credentials
- `AWS_SECRET_ACCESS_KEY` - AWS credentials

For local development with DynamoDB Local:

- `DYNAMODB_ENDPOINT` - e.g., `http://localhost:8000`

## Pagination

All list endpoints support pagination using DynamoDB's `last_evaluated_key`:

1. Make initial request without `last_evaluated_key`
2. If response includes `last_evaluated_key`, include it in the next request
3. Continue until `last_evaluated_key` is `null`

The key is Base64-encoded and opaque - don't try to decode or modify it.

## Testing Tips

1. **Start with health check**: Test `/up` endpoint first to ensure the service is running
2. **Use sample data**: Replace the sample `conversation_id`, `org_id`, and `user_id` with actual values from your
   DynamoDB
3. **Test pagination**: Use small `limit` values to test pagination behavior
4. **CQRS pattern**: Remember this service is read-only - use the conversation-commands service for writes
