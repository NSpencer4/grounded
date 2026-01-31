# Grounded Customer UI

Modern customer support interface built with Remix, React, and GraphQL.

## Features

- **GraphQL Integration**: Unified API access via GraphQL Gateway
- **Real-time Updates**: SSE streaming for live conversation updates
- **Multi-role Support**: Customer, Representative, and Admin views
- **Dashboard Analytics**: Performance metrics and KPIs
- **Refund Management**: Track and manage customer refunds
- **Team Performance**: Monitor representative metrics and leaderboards

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- GraphQL Gateway API running (see `packages/server/apis/gateway-api`)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example local.env
```

### Configuration

Update `local.env` with your API endpoints:

```env
# GraphQL Gateway API
GRAPHQL_ENDPOINT=http://localhost:8787/graphql

# Supabase (for authentication)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Default organization for development
DEFAULT_ORG_ID=acme-corp
```

### Development

```bash
# Start development server
yarn run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
app/
├── components/          # React components (existing UI components)
├── lib/
│   ├── graphql/        # GraphQL queries, mutations, and types
│   │   ├── queries.ts  # All GraphQL queries
│   │   ├── mutations.ts # All GraphQL mutations
│   │   ├── types.ts    # TypeScript types matching GraphQL schema
│   │   └── index.ts    # Exports
│   ├── graphql-client.ts # GraphQL client configuration
│   ├── hooks/          # Custom React hooks
│   │   └── useSSE.ts   # SSE streaming hook
│   ├── database.types.ts # Supabase types (legacy)
│   └── supabase.ts     # Supabase client (for auth only)
├── routes/             # Remix routes with loaders/actions
│   ├── _index.tsx      # Home/auth route
│   ├── dashboard.tsx   # Main dashboard
│   ├── conversations._index.tsx # Conversations list
│   ├── conversations.$id.tsx    # Individual conversation
│   ├── refunds.tsx     # Refund management
│   ├── team-performance.tsx # Team metrics
│   └── api.*.tsx       # API routes (users, representatives, etc.)
├── root.tsx            # App root
└── styles.css          # Global styles
```

## GraphQL Integration

### Queries

All GraphQL queries are defined in `app/lib/graphql/queries.ts`:

- Health & System queries
- Conversation queries
- Organization queries
- User & Representative queries
- Customer queries
- Ticket & Escalation queries
- Refund & Budget queries
- Agent & Performance queries

### Mutations

All GraphQL mutations are defined in `app/lib/graphql/mutations.ts`:

- Conversation operations (create, send message, update status)
- User CRUD operations
- Representative management
- Customer management
- Ticket operations
- Escalation handling
- Refund processing
- Budget management
- Agent configuration
- Decision rule management

### Usage in Routes

```typescript
import { createGraphQLClient, LIST_CONVERSATIONS } from '~/lib/graphql'

export async function loader({ context }: LoaderFunctionArgs) {
  const graphqlClient = createGraphQLClient()
  const orgId = context.env.DEFAULT_ORG_ID

  const data = await graphqlClient.request(LIST_CONVERSATIONS, {
    orgId,
    limit: 50,
  })

  return json({ conversations: data.conversations.edges.map(e => e.node) })
}
```

## Routes

### Main Routes

- `/` - Home/Authentication
- `/dashboard` - Main dashboard with metrics
- `/conversations` - Conversations list
- `/conversations/:id` - Individual conversation view
- `/refunds` - Refund management dashboard
- `/team-performance` - Team performance metrics

### API Routes

- `/api/users` - User management (list, get, create, update, delete)
- `/api/representatives` - Representative management
- `/api/refunds` - Refund operations and budgets
- `/api/tickets` - Ticket and escalation management
- `/api/performance` - Performance metrics

## Real-time Updates

The app supports real-time updates via Server-Sent Events (SSE):

```typescript
import { useConversationSSE } from '~/lib/hooks/useSSE'

function ConversationView({ conversationId }) {
  const { isConnected, messages } = useConversationSSE(conversationId)
  
  // Handle real-time messages
  // ...
}
```

SSE endpoint: `${GRAPHQL_ENDPOINT}/sse/:conversationId`

## Authentication

**Supabase is used for authentication ONLY.** All data operations use GraphQL.

### Auth Operations (Supabase)
- User sign up
- User sign in/out
- Session management
- Token refresh

### Data Operations (GraphQL)
- All queries (conversations, users, tickets, etc.)
- All mutations (create, update, delete)
- Real-time updates via SSE

See `SUPABASE_AUTH_ONLY.md` for complete auth-only configuration guide.

## Migration Notes

### From Supabase to GraphQL

The app has been migrated from Supabase direct database access to GraphQL:

- **Before**: Components used Supabase client directly
- **After**: Routes use Remix loaders/actions with GraphQL
- **Auth**: Still uses Supabase (separation of concerns)

### Existing Components

Original components in `app/components/` are preserved:
- `CustomerChat.tsx` - Uses Supabase (to be migrated)
- `RepresentativeDashboard.tsx` - Uses Supabase (to be migrated)
- `AdminDashboard.tsx` - Uses Supabase (to be migrated)
- `Dashboard.tsx` - Presentational component with static data

New routes in `app/routes/` use GraphQL and replace component functionality.

## Development

### Adding New Queries

1. Add GraphQL query to `app/lib/graphql/queries.ts`
2. Add corresponding TypeScript types to `app/lib/graphql/types.ts`
3. Use in Remix loader:

```typescript
export async function loader({ context }: LoaderFunctionArgs) {
  const client = createGraphQLClient()
  const data = await client.request(YOUR_QUERY, variables)
  return json(data)
}
```

### Adding New Mutations

1. Add GraphQL mutation to `app/lib/graphql/mutations.ts`
2. Create Remix action:

```typescript
export async function action({ request }: ActionFunctionArgs) {
  const client = createGraphQLClient()
  const formData = await request.formData()
  const result = await client.request(YOUR_MUTATION, variables)
  return json(result)
}
```

## Deployment

### Quick Deployment (Development)

```bash
# Build and deploy to default environment
yarn run build
yarn run deploy
```

### Production Deployment

For complete production deployment with custom domain, see: **[../../terraform/CLOUDFLARE-DEPLOYMENT-GUIDE.md](../../terraform/CLOUDFLARE-DEPLOYMENT-GUIDE.md)**

#### Quick Reference:

```bash
# 1. Update wrangler.jsonc production environment
# Edit env.production.vars with your GraphQL endpoint

# 2. Build and deploy worker
yarn run deploy:production

# 3. Configure custom domain (from terraform directory)
cd ../../terraform
./deploy-customer-ui.sh production
```

#### Manual Terraform Setup:

```bash
# 1. Deploy worker
yarn run deploy:production

# 2. Apply Terraform for custom domain
cd ../../terraform
terraform apply \
  -target=cloudflare_record.customer_ui \
  -target=cloudflare_worker_domain.customer_ui \
  -var-file="production.tfvars"
```

### Staging Deployment

```bash
# Deploy to staging environment
yarn run deploy:staging
```

### Available Deploy Commands

| Command                      | Description                             |
|------------------------------|-----------------------------------------|
| `yarn run deploy`            | Deploy to default environment           |
| `yarn run deploy:production` | Deploy to production with custom domain |
| `yarn run deploy:staging`    | Deploy to staging environment           |
| `yarn run preview`           | Build and run local preview             |

## Environment Variables (Cloudflare Workers)

### Local Development

Set in `local.env`:

```env
GRAPHQL_ENDPOINT=http://localhost:8787/graphql
DEFAULT_ORG_ID=acme-corp
```

### Production

Set in `wrangler.jsonc` under `env.production.vars`:

```jsonc
{
  "env": {
    "production": {
      "name": "grounded-customer-ui",
      "vars": {
        "GRAPHQL_ENDPOINT": "https://your-gateway.workers.dev/graphql",
        "DEFAULT_ORG_ID": "org_production"
      },
      "routes": [
        {
          "pattern": "grounded.chasespencer.dev",
          "custom_domain": true
        }
      ]
    }
  }
}
```

### Secrets (Not in wrangler.jsonc)

For sensitive values, use Wrangler secrets:

```bash
wrangler secret put SUPABASE_ANON_KEY --env production
wrangler secret put SUPABASE_URL --env production
```

## Testing

Tests are not yet configured (stretch goal).

## Troubleshooting

### GraphQL Connection Issues

- Ensure Gateway API is running on port 8787
- Check `GRAPHQL_ENDPOINT` in environment
- Verify CORS settings on Gateway API

### SSE Not Working

- Confirm Gateway API has SSE endpoint enabled
- Check browser console for connection errors
- Verify Durable Objects are configured

### Type Errors

- Run `yarn run typecheck` to identify issues
- Ensure GraphQL types match schema
- Check `app/lib/graphql/types.ts` for type definitions

## Related Documentation

- [GraphQL Gateway API](../../server/apis/gateway-api/README.md)
- [GraphQL API Reference](../../server/apis/gateway-api/API-REFERENCE.md)
- [Remix Documentation](https://remix.run/docs)
- [GraphQL Request Library](https://github.com/jasonkuhrt/graphql-request)
