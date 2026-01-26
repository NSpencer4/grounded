# GraphQL Gateway API

Unified GraphQL API gateway for the Grounded platform, providing a single endpoint to interact with all backend services.

## Features

- **Unified API Layer**: Single GraphQL endpoint for all services
- **Service Federation**: Integrates with Conversation Commands, Conversation Updates, and Organization APIs
- **Real-time Streaming**: Server-Sent Events (SSE) via Durable Objects
- **Type-Safe**: Full TypeScript support with GraphQL Yoga
- **Cloudflare Workers**: Deployed on Cloudflare's edge network
- **GraphiQL Playground**: Interactive API exploration (development mode)

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Wrangler CLI (`npm install -g wrangler`)

### Installation

```bash
# Install dependencies (from repository root)
npm install

# Navigate to the gateway API
cd packages/server/apis/gateway-api
```

### Configuration

Create a `local.env` file (or copy from `local.env.example`):

```env
# Backend API URLs
CONVERSATION_COMMANDS_API_URL=http://localhost:3001
CONVERSATION_UPDATES_API_URL=http://localhost:3002
ORGANIZATION_API_URL=http://localhost:3003
```

Or update `wrangler.jsonc` for deployment:

```jsonc
{
  "vars": {
    "CONVERSATION_COMMANDS_API_URL": "https://commands-api.example.com",
    "CONVERSATION_UPDATES_API_URL": "https://updates-api.example.com",
    "ORGANIZATION_API_URL": "https://organization-api.example.com"
  }
}
```

### Development

Start the development server with hot reload:

```bash
npm run dev
```

The GraphQL API will be available at:
- **GraphQL Endpoint**: http://localhost:8787/graphql
- **GraphiQL Playground**: http://localhost:8787/graphql (browser)
- **Health Check**: http://localhost:8787/health

### Testing Queries

Open http://localhost:8787/graphql in your browser to access the GraphiQL playground.

Example query:

```graphql
query {
  health {
    status
    timestamp
  }
  
  organization(id: "acme-corp") {
    id
    name
    slug
  }
  
  users(orgId: "acme-corp", limit: 10) {
    id
    name
    email
    role
  }
}
```

Example mutation:

```graphql
mutation {
  createConversation(
    orgId: "acme-corp"
    userId: "user_456"
    initialMessage: "Hello, I need help with my order"
  ) {
    id
    status
    messages {
      id
      content
      timestamp
    }
  }
}
```

## API Documentation

See [API-REFERENCE.md](./API-REFERENCE.md) for complete documentation of all queries, mutations, types, and enums.

## Architecture

### Service Integration

The gateway federates requests across three backend services:

```
┌─────────────────────────────────────────────────────────────┐
│                    GraphQL Gateway                           │
│                   (Cloudflare Worker)                        │
└─────────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
┌──────────────────┐ ┌─────────────┐ ┌──────────────┐
│  Conversation    │ │Conversation │ │ Organization │
│  Commands API    │ │ Updates API │ │     API      │
│  (Ruby/Rails)    │ │(Ruby/Rails) │ │ (Node.js)    │
│                  │ │             │ │              │
│  Mutations:      │ │  Queries:   │ │  Queries +   │
│  - Create Conv   │ │  - List     │ │  Mutations:  │
│  - Send Message  │ │  - Show     │ │  - All Org   │
└──────────────────┘ │  - Messages │ │    Data      │
                     └─────────────┘ └──────────────┘
```

### Durable Objects for SSE

The gateway uses Cloudflare Durable Objects to provide real-time streaming:

```
Client → /sse/:conversationId → Durable Object → SSE Stream
                                       ↑
                                       │
                        Backend (via /sse/:id/push)
```

## Project Structure

```
packages/server/apis/gateway-api/
├── src/
│   ├── index.ts                    # Worker entry point
│   ├── schema.ts                   # GraphQL schema definitions
│   ├── resolvers.ts                # Query/mutation resolvers
│   ├── types.ts                    # TypeScript type definitions
│   └── durable-objects/
│       └── conversation-stream.ts  # SSE streaming handler
├── wrangler.jsonc                  # Cloudflare configuration
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript config
├── README.md                       # This file
└── API-REFERENCE.md                # Complete API documentation
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (dry-run) |
| `npm run deploy` | Deploy to Cloudflare Workers |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run typegen` | Generate Cloudflare Worker types |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |

## Dependencies

### Production
- **graphql** (^16.9.0) - GraphQL.js reference implementation
- **graphql-yoga** (^5.10.0) - GraphQL server for Cloudflare Workers

### Development
- **@cloudflare/workers-types** - TypeScript types for Workers
- **wrangler** - Cloudflare Workers CLI

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `CONVERSATION_COMMANDS_API_URL` | Yes | Commands API endpoint | `https://commands.api.example.com` |
| `CONVERSATION_UPDATES_API_URL` | Yes | Updates API endpoint | `https://updates.api.example.com` |
| `ORGANIZATION_API_URL` | Yes | Organization API endpoint | `https://org.api.example.com` |

## Deployment

### Deploy to Cloudflare Workers

1. Authenticate with Cloudflare:
   ```bash
   wrangler login
   ```

2. Update environment variables in `wrangler.jsonc`

3. Deploy:
   ```bash
   npm run deploy
   ```

### Production Considerations

- Set appropriate CORS origins (currently set to `*` for development)
- Configure rate limiting via Cloudflare dashboard
- Enable Cloudflare Analytics for monitoring
- Set up error tracking (Sentry, Datadog, etc.)
- Use Cloudflare Secrets for sensitive values

## Error Handling

All resolvers include error handling and logging:

```typescript
try {
  return await callAPI(`${url}/endpoint`)
} catch (error) {
  console.error('Error:', error)
  return null // or [] for list queries
}
```

Errors are logged to Cloudflare Workers logs and returned in GraphQL error format.

## CORS Configuration

CORS is enabled for all origins in development. Update `index.ts` for production:

```typescript
headers: {
  'Access-Control-Allow-Origin': 'https://your-frontend.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
```

## Performance

- **Edge Deployment**: Runs on Cloudflare's global network
- **Connection Reuse**: Resolvers reuse fetch connections
- **Error Resilience**: Failed API calls return null/empty without breaking queries
- **Batch Queries**: GraphQL supports batching related queries in one request

## Monitoring

View logs in real-time:

```bash
wrangler tail
```

Access Cloudflare Workers dashboard for:
- Request volume
- Error rates
- Response times
- Geographic distribution

## Testing

### Manual Testing

Use GraphiQL playground at `/graphql` endpoint or tools like:
- Postman
- Insomnia
- curl

Example curl:

```bash
curl -X POST http://localhost:8787/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ health { status timestamp } }"
  }'
```

### Automated Testing

Tests are not yet configured (stretch goal).

## Troubleshooting

### "API not configured" errors

Ensure all environment variables are set in `wrangler.jsonc` or `local.env`.

### CORS errors

Check that CORS headers are properly configured in `src/index.ts`.

### Durable Object errors

Ensure migrations are applied:
```bash
wrangler deploy
```

### TypeScript errors

Run type checking:
```bash
npm run typecheck
```

## Contributing

1. Make changes in `src/`
2. Run type checking: `npm run typecheck`
3. Run linting: `npm run lint:fix`
4. Test locally: `npm run dev`
5. Update documentation if needed

## Related Documentation

- [API Reference](./API-REFERENCE.md) - Complete GraphQL API documentation
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [GraphQL Yoga Docs](https://the-guild.dev/graphql/yoga-server)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)

## License

Private - Grounded Project
