# GraphQL Integration Migration Guide

This document explains the changes made to integrate the customer-ui with the GraphQL Gateway API.

## Overview

The customer-ui has been migrated from using static mocked data and Supabase direct access to using GraphQL queries and mutations via the Gateway API. This provides:

- ✅ Unified API access through GraphQL
- ✅ Type-safe queries and mutations
- ✅ Better separation of concerns (Remix loaders/actions)
- ✅ Real-time updates via SSE
- ✅ Centralized data fetching logic

## What Was Changed

### 1. Dependencies Added

```bash
npm install graphql graphql-request
```

- `graphql`: GraphQL.js library for parsing and executing GraphQL
- `graphql-request`: Lightweight GraphQL client for making requests

### 2. New Files Created

#### GraphQL Infrastructure

```
app/lib/
├── graphql/
│   ├── index.ts           # Exports all GraphQL modules
│   ├── queries.ts         # All GraphQL queries (25+ operations)
│   ├── mutations.ts       # All GraphQL mutations (30+ operations)
│   └── types.ts           # TypeScript types matching GraphQL schema
├── graphql-client.ts      # GraphQL client configuration
└── hooks/
    └── useSSE.ts          # Custom hook for SSE real-time updates
```

#### New Routes (Remix)

```
app/routes/
├── conversations._index.tsx  # List conversations
├── conversations.$id.tsx     # Individual conversation with messages
├── dashboard.tsx             # Main dashboard with live metrics
├── refunds.tsx               # Refund management
├── team-performance.tsx      # Team metrics and leaderboard
└── api.*.tsx                 # API routes for data operations
    ├── api.users.tsx         # User management
    ├── api.representatives.tsx # Representative management
    ├── api.refunds.tsx       # Refund operations
    ├── api.tickets.tsx       # Ticket/escalation management
    └── api.performance.tsx   # Performance metrics
```

### 3. Configuration Updates

#### Environment Variables (`wrangler.jsonc`)

```jsonc
{
  "vars": {
    "GRAPHQL_ENDPOINT": "http://localhost:8787/graphql",
    "DEFAULT_ORG_ID": "org_123"
  }
}
```

#### New `.env.example`

```env
GRAPHQL_ENDPOINT=http://localhost:8787/graphql
DEFAULT_ORG_ID=org_123
SUPABASE_URL=your-supabase-url
SUPABASE_PUBLIC_KEY=your-supabase-anon-key
```

### 4. Documentation

- `README.md` - Comprehensive guide for the customer-ui
- `MIGRATION_GUIDE.md` - This document

## How to Use GraphQL Integration

### Basic Pattern: Loader + Component

```typescript
// app/routes/example.tsx
import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { createGraphQLClient, LIST_CONVERSATIONS } from '~/lib/graphql'

// Loader: Fetch data server-side
export async function loader({ context }: LoaderFunctionArgs) {
  const client = createGraphQLClient()
  const orgId = context.env.DEFAULT_ORG_ID

  const data = await client.request(LIST_CONVERSATIONS, {
    orgId,
    limit: 50,
  })

  return json({ conversations: data.conversations.edges.map(e => e.node) })
}

// Component: Use the data
export default function ExampleRoute() {
  const { conversations } = useLoaderData<typeof loader>()
  
  return (
    <div>
      {conversations.map(conv => (
        <div key={conv.id}>{conv.status}</div>
      ))}
    </div>
  )
}
```

### Mutations with Actions

```typescript
// Action: Handle form submissions
export async function action({ request }: ActionFunctionArgs) {
  const client = createGraphQLClient()
  const formData = await request.formData()
  
  const content = formData.get('content') as string
  const conversationId = formData.get('conversationId') as string
  
  const result = await client.request(SEND_MESSAGE, {
    conversationId,
    content,
  })
  
  return json({ message: result.sendMessage })
}

// Component: Submit the form
function MessageForm({ conversationId }) {
  const fetcher = useFetcher()
  
  return (
    <fetcher.Form method="post">
      <input type="hidden" name="conversationId" value={conversationId} />
      <textarea name="content" />
      <button type="submit">Send</button>
    </fetcher.Form>
  )
}
```

### Real-time Updates with SSE

```typescript
import { useConversationSSE } from '~/lib/hooks/useSSE'

function ConversationView({ conversationId }) {
  const { isConnected, messages } = useConversationSSE(conversationId)
  
  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      {messages.map(msg => <div key={msg.id}>{msg.content}</div>)}
    </div>
  )
}
```

## Available GraphQL Operations

### Queries

**Conversations:**
- `GET_CONVERSATION` - Fetch single conversation with messages
- `LIST_CONVERSATIONS` - List conversations with pagination
- `GET_CONVERSATION_MESSAGES` - Get all messages for a conversation

**Users:**
- `LIST_USERS` - List users in organization
- `GET_USER` - Get single user details

**Representatives:**
- `LIST_REPRESENTATIVES` - List representatives with metrics
- `GET_REPRESENTATIVE` - Get single representative

**Customers:**
- `LIST_CUSTOMERS` - List customers
- `GET_CUSTOMER` - Get single customer

**Tickets:**
- `LIST_TICKETS` - List tickets with filtering
- `LIST_ESCALATIONS` - List escalations

**Refunds:**
- `LIST_REFUNDS` - List refunds
- `LIST_BUDGETS` - List budgets

**Agents:**
- `LIST_AGENTS` - List AI agents
- `GET_PERFORMANCE_METRICS` - Get performance analytics

### Mutations

**Conversations:**
- `CREATE_CONVERSATION` - Start new conversation
- `SEND_MESSAGE` - Send message in conversation
- `UPDATE_CONVERSATION_STATUS` - Update conversation status

**Users:**
- `CREATE_USER` - Create new user
- `UPDATE_USER` - Update user details
- `DELETE_USER` - Delete user

**Representatives:**
- `CREATE_REPRESENTATIVE` - Add representative
- `UPDATE_REPRESENTATIVE` - Update representative
- `DELETE_REPRESENTATIVE` - Remove representative

**Customers:**
- `CREATE_CUSTOMER` - Add customer
- `UPDATE_CUSTOMER` - Update customer
- `DELETE_CUSTOMER` - Remove customer

**Tickets:**
- `CREATE_TICKET` - Create support ticket
- `UPDATE_TICKET` - Update ticket
- `RESOLVE_TICKET` - Resolve ticket
- `CREATE_ESCALATION` - Escalate ticket

**Refunds:**
- `CREATE_REFUND` - Request refund
- `PROCESS_REFUND` - Process refund

**Budgets:**
- `CREATE_BUDGET` - Create budget
- `UPDATE_BUDGET` - Update budget

**Agents:**
- `CREATE_AGENT` - Add AI agent
- `UPDATE_AGENT` - Update agent config
- `DELETE_AGENT` - Remove agent

**Decision Rules:**
- `CREATE_DECISION_RULE` - Add decision rule
- `UPDATE_DECISION_RULE` - Update rule
- `DELETE_DECISION_RULE` - Remove rule

## Type Safety

All GraphQL operations have corresponding TypeScript types in `app/lib/graphql/types.ts`:

```typescript
import type { Conversation, Message, User, Representative } from '~/lib/graphql'

function example(conversation: Conversation) {
  console.log(conversation.status) // TypeScript knows this exists
  console.log(conversation.messages) // Optional<Message[]>
}
```

## Migration Checklist

If you want to migrate existing components:

- [ ] Replace Supabase queries with GraphQL queries
- [ ] Move data fetching to Remix loaders
- [ ] Move mutations to Remix actions
- [ ] Use `useLoaderData()` instead of `useState()` for server data
- [ ] Use `useFetcher()` for mutations instead of direct API calls
- [ ] Replace Supabase real-time with SSE hooks
- [ ] Update TypeScript types to use GraphQL types

## Example Migration

### Before (Supabase Direct Access)

```typescript
function Conversations() {
  const [conversations, setConversations] = useState([])
  
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('conversations')
        .select('*')
      setConversations(data)
    }
    load()
  }, [])
  
  return <div>{conversations.map(...)}</div>
}
```

### After (GraphQL + Remix)

```typescript
// Loader
export async function loader({ context }) {
  const client = createGraphQLClient()
  const data = await client.request(LIST_CONVERSATIONS, {
    orgId: context.env.DEFAULT_ORG_ID,
  })
  return json({ conversations: data.conversations.edges.map(e => e.node) })
}

// Component
function Conversations() {
  const { conversations } = useLoaderData<typeof loader>()
  return <div>{conversations.map(...)}</div>
}
```

## Testing Locally

1. **Start Gateway API:**
   ```bash
   cd packages/server/apis/gateway-api
   npm run dev  # Runs on port 8787
   ```

2. **Start Customer UI:**
   ```bash
   cd packages/ui/customer-ui
   npm run dev  # Runs on port 5173
   ```

3. **Test Routes:**
   - Dashboard: http://localhost:5173/dashboard
   - Conversations: http://localhost:5173/conversations
   - Refunds: http://localhost:5173/refunds
   - Team Performance: http://localhost:5173/team-performance

4. **GraphiQL Playground:**
   - http://localhost:8787/graphql (Gateway API)

## Troubleshooting

### "GraphQL client not configured" error

Check that `GRAPHQL_ENDPOINT` is set in `wrangler.jsonc` or environment.

### "Network request failed"

Ensure Gateway API is running on the correct port (8787).

### Type errors

Run `npm run typecheck` to identify issues. Ensure types in `types.ts` match GraphQL schema.

### SSE not connecting

- Check Gateway API has SSE endpoint enabled
- Verify Durable Objects are configured
- Check browser console for errors

### Data not loading

- Check Gateway API logs: `cd packages/server/apis/gateway-api && wrangler tail`
- Verify backend services (Commands API, Updates API, Organization API) are running
- Check network tab in browser dev tools

## Next Steps

1. **Update Existing Components:** Migrate `CustomerChat`, `RepresentativeDashboard`, and `AdminDashboard` components to use new routes
2. **Add Authentication:** Integrate Supabase auth with GraphQL (pass auth token in headers)
3. **Add Error Boundaries:** Handle GraphQL errors gracefully in UI
4. **Add Loading States:** Show loading indicators during data fetching
5. **Add Optimistic Updates:** Update UI optimistically before server confirms
6. **Add Caching:** Implement client-side caching for better performance

## Resources

- [GraphQL Gateway API Reference](../../server/apis/gateway-api/API-REFERENCE.md)
- [Remix Documentation](https://remix.run/docs)
- [GraphQL Request Docs](https://github.com/jasonkuhrt/graphql-request)
- [SSE MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

## Support

For issues or questions, check:
- Gateway API logs: `wrangler tail`
- Browser console for client-side errors
- Network tab for failed requests
- GraphiQL playground to test queries directly
