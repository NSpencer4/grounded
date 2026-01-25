# Components to Migrate from Supabase Database to GraphQL

These components currently use Supabase database operations and should be migrated to use GraphQL routes.

## Overview

| Component | Status | Database Usage | Migration Priority |
|-----------|--------|----------------|-------------------|
| Auth.tsx | ✅ Auth Only | None (auth only) | N/A - Already correct |
| ProfileSetup.tsx | ⚠️ Needs Migration | profiles table | High |
| CustomerChat.tsx | ⚠️ Needs Migration | conversations, messages | High |
| RepresentativeDashboard.tsx | ⚠️ Needs Migration | conversations, profiles, messages | High |
| AdminDashboard.tsx | ⚠️ Needs Migration | profiles | Medium |
| _index.tsx | ✅ Auth Only | None (auth only) | N/A - Already correct |

## 1. ProfileSetup.tsx

**Current Usage:**
```typescript
// Creates profile in Supabase database
await supabase.from('profiles').insert({
  user_id: user.id,
  email: user.email,
  name,
  role,
})
```

**Migration to GraphQL:**
```typescript
import { createGraphQLClient, CREATE_USER } from '~/lib/graphql'

const client = createGraphQLClient()
await client.request(CREATE_USER, {
  orgId: 'org_123',
  email: user.email,
  name,
  role: role.toUpperCase(), // CUSTOMER, REPRESENTATIVE, ADMIN
})
```

**Recommended Approach:**
Create a new route `app/routes/profile-setup.tsx` with a Remix action:

```typescript
// app/routes/profile-setup.tsx
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const session = await getSession(request)
  
  const client = createGraphQLClient()
  const result = await client.request(CREATE_USER, {
    orgId: 'org_123',
    email: session.user.email,
    name: formData.get('name'),
    role: formData.get('role').toUpperCase(),
  })
  
  return redirect('/dashboard')
}
```

---

## 2. CustomerChat.tsx

**Current Usage:**
```typescript
// Conversations
const { data } = await supabase
  .from('conversations')
  .select('*')
  .eq('customer_id', profile.id)

// Messages
const { data } = await supabase
  .from('messages')
  .select('*')
  .eq('conversation_id', conversationId)

// Send message
await supabase.from('messages').insert({
  conversation_id: conversationId,
  sender_id: profile.id,
  content: messageContent,
})

// Real-time subscriptions
supabase
  .channel(`conversation-${conversationId}`)
  .on('postgres_changes', ...)
```

**Migration to GraphQL:**

Replace entire component with the new route:

```typescript
// Use app/routes/conversations._index.tsx for list
// Use app/routes/conversations.$id.tsx for chat view
```

**Action Required:**
1. Update `_index.tsx` to route customers to `/conversations` instead of rendering `CustomerChat`
2. Remove or deprecate `CustomerChat.tsx` component
3. Use SSE hook for real-time updates instead of Supabase subscriptions

```typescript
// app/routes/_index.tsx
if (profile.role === 'customer') {
  return redirect('/conversations')
}
```

---

## 3. RepresentativeDashboard.tsx

**Current Usage:**
```typescript
// Conversations with customer profiles
const { data } = await supabase
  .from('conversations')
  .select(`
    *,
    customer:profiles!conversations_customer_id_fkey(*)
  `)
  .in('status', ['waiting', 'active'])

// Messages
const { data } = await supabase
  .from('messages')
  .select('*')
  .eq('conversation_id', selectedConversation)

// Update conversation
await supabase
  .from('conversations')
  .update({ rep_id: profile.id, status: 'active' })
  .eq('id', conversationId)

// Send message
await supabase.from('messages').insert(...)
```

**Migration to GraphQL:**

Create a representative dashboard route:

```typescript
// app/routes/representative.tsx
import { LIST_CONVERSATIONS, GET_CONVERSATION_MESSAGES } from '~/lib/graphql'

export async function loader({ context }: LoaderFunctionArgs) {
  const client = createGraphQLClient()
  
  // Get conversations with status filter
  const data = await client.request(LIST_CONVERSATIONS, {
    orgId: context.env.DEFAULT_ORG_ID,
    limit: 50,
  })
  
  return json({ conversations: data.conversations.edges.map(e => e.node) })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const action = formData.get('_action')
  const client = createGraphQLClient()
  
  if (action === 'assignConversation') {
    await client.request(UPDATE_CONVERSATION_STATUS, {
      id: formData.get('conversationId'),
      status: 'ACTIVE',
    })
  }
  
  if (action === 'sendMessage') {
    await client.request(SEND_MESSAGE, {
      conversationId: formData.get('conversationId'),
      content: formData.get('content'),
    })
  }
  
  return json({ success: true })
}
```

---

## 4. AdminDashboard.tsx

**Current Usage:**
```typescript
// Fetch representatives
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('role', 'representative')

// Fetch admins
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('role', 'admin')

// Create representative
await supabase.from('profiles').insert({
  email,
  role: 'representative',
  name,
})

// Delete user
await supabase.from('profiles').delete().eq('id', rep.id)
```

**Migration to GraphQL:**

Create admin dashboard route:

```typescript
// app/routes/admin.tsx
import { LIST_USERS, CREATE_USER, DELETE_USER } from '~/lib/graphql'

export async function loader({ context }: LoaderFunctionArgs) {
  const client = createGraphQLClient()
  
  const users = await client.request(LIST_USERS, {
    orgId: context.env.DEFAULT_ORG_ID,
    limit: 100,
  })
  
  const representatives = users.users.filter(u => u.role === 'REPRESENTATIVE')
  const admins = users.users.filter(u => u.role === 'ADMIN')
  
  return json({ representatives, admins })
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData()
  const action = formData.get('_action')
  const client = createGraphQLClient()
  
  if (action === 'createUser') {
    await client.request(CREATE_USER, {
      orgId: context.env.DEFAULT_ORG_ID,
      email: formData.get('email'),
      name: formData.get('name'),
      role: formData.get('role'),
    })
  }
  
  if (action === 'deleteUser') {
    await client.request(DELETE_USER, {
      orgId: context.env.DEFAULT_ORG_ID,
      id: formData.get('userId'),
    })
  }
  
  return json({ success: true })
}
```

---

## Migration Steps

### Phase 1: Create New Routes (Done ✅)
- ✅ `/conversations` - List conversations
- ✅ `/conversations/:id` - Chat view
- ✅ `/dashboard` - Metrics dashboard
- ✅ `/api/users` - User management API
- ✅ `/api/representatives` - Representatives API

### Phase 2: Update Main Route (_index.tsx)

```typescript
// app/routes/_index.tsx
export default function Index() {
  const { user, profile } = useLoaderData<typeof loader>()
  
  if (!user) return <Auth />
  if (!profile) return redirect('/profile-setup')
  
  // Route based on role
  if (profile.role === 'admin') {
    return redirect('/admin')
  }
  
  if (profile.role === 'customer') {
    return redirect('/conversations')
  }
  
  if (profile.role === 'representative') {
    return redirect('/representative')
  }
  
  return redirect('/dashboard')
}
```

### Phase 3: Create Replacement Routes

1. **Create `/profile-setup` route** (replace ProfileSetup component)
2. **Create `/representative` route** (replace RepresentativeDashboard component)
3. **Create `/admin` route** (replace AdminDashboard component)

### Phase 4: Update Navigation

Update any navigation/routing logic to use new routes:
- CustomerChat → `/conversations`
- RepresentativeDashboard → `/representative`
- AdminDashboard → `/admin`

### Phase 5: Remove Old Components

Once migration is complete:
1. Remove or deprecate old components
2. Remove database.types.ts (already done)
3. Update documentation

---

## Testing Migration

For each migrated component:

1. **Test data fetching:**
   ```bash
   # Visit the route
   curl http://localhost:5173/conversations
   ```

2. **Test mutations:**
   ```bash
   # Submit a form/action
   curl -X POST http://localhost:5173/conversations/123 \
     -d "_action=sendMessage&content=Hello"
   ```

3. **Compare with old component:**
   - Same data displayed?
   - Same functionality?
   - Better performance?

---

## Checklist

- [ ] Migrate ProfileSetup.tsx → `/profile-setup` route
- [ ] Migrate CustomerChat.tsx → Use `/conversations` routes
- [ ] Migrate RepresentativeDashboard.tsx → `/representative` route
- [ ] Migrate AdminDashboard.tsx → `/admin` route
- [ ] Update _index.tsx routing logic
- [ ] Remove old component imports
- [ ] Test all user flows
- [ ] Update documentation
- [ ] Remove deprecated components

---

## Notes

- **Real-time updates:** Use SSE hooks instead of Supabase subscriptions
- **Authentication:** Supabase auth still works, just pass token to GraphQL
- **Type safety:** Use GraphQL types instead of database types
- **Performance:** GraphQL can fetch related data in single query
- **Maintainability:** Routes are easier to test and maintain

---

## Need Help?

See these docs:
- `SUPABASE_AUTH_ONLY.md` - Auth-only configuration guide
- `MIGRATION_GUIDE.md` - GraphQL migration patterns
- `README.md` - Complete app documentation
