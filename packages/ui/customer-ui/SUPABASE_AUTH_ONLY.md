# Supabase Auth-Only Configuration

This application uses **Supabase for authentication only**. All data operations are performed through the GraphQL Gateway API.

## What Supabase Does

✅ **Authentication:**
- User sign up
- User sign in
- User sign out
- Session management
- Token refresh
- Auth state changes

❌ **What Supabase Does NOT Do:**
- Database queries
- Data storage
- Real-time subscriptions (use SSE from Gateway API)

## Supabase Client Usage

The Supabase client is configured in `app/lib/supabase.ts` for auth-only operations:

```typescript
import { supabase } from '~/lib/supabase'

// ✅ Allowed - Authentication operations
await supabase.auth.signUp({ email, password })
await supabase.auth.signInWithPassword({ email, password })
await supabase.auth.signOut()
await supabase.auth.getSession()
await supabase.auth.getUser()
supabase.auth.onAuthStateChange(callback)

// ❌ Not allowed - Database operations
// Don't use: supabase.from('table').select()
// Instead use: GraphQL queries via Gateway API
```

## User Authentication Flow

### 1. Sign Up (New User)

```typescript
// app/components/Auth.tsx
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
})

// After sign up, create user profile via GraphQL
const client = createGraphQLClient()
await client.request(CREATE_USER, {
  orgId: 'acme-corp',
  email: data.user.email,
  name: 'User Name',
  role: 'CUSTOMER',
})
```

### 2. Sign In (Existing User)

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
})

// Session is automatically persisted
// User data can be fetched via GraphQL using the auth token
```

### 3. Get Current Session

```typescript
const { data: { session } } = await supabase.auth.getSession()

if (session) {
  // User is authenticated
  const userId = session.user.id
  const email = session.user.email
}
```

### 4. Auth State Changes

```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    if (event === 'SIGNED_IN') {
      // User signed in
    }
    if (event === 'SIGNED_OUT') {
      // User signed out
    }
  }
)

// Clean up
subscription.unsubscribe()
```

## Integration with GraphQL

### Fetching User Profile

After authentication, fetch user data via GraphQL:

```typescript
import { createGraphQLClient, GET_USER } from '~/lib/graphql'

// In a Remix loader
export async function loader({ request }: LoaderFunctionArgs) {
  // Get Supabase session
  const authHeader = request.headers.get('Authorization')
  
  // Use session to fetch user profile from GraphQL
  const client = createGraphQLClient({
    headers: { Authorization: authHeader }
  })
  
  const data = await client.request(GET_USER, {
    orgId: 'acme-corp',
    id: userId,
  })
  
  return json({ user: data.user })
}
```

### Creating User After Sign Up

```typescript
// After Supabase auth.signUp succeeds
const client = createGraphQLClient()

const result = await client.request(CREATE_USER, {
  orgId: 'acme-corp',
  email: authUser.email,
  name: formData.name,
  role: 'CUSTOMER',
})

// User profile is now in your GraphQL database
```

## Component Examples

### Auth Component (Sign In/Sign Up)

```typescript
// app/components/Auth.tsx
import { supabase } from '~/lib/supabase'

export default function Auth() {
  const handleSignUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      console.error('Auth error:', error)
      return
    }
    
    // Now create user profile via GraphQL
    // (See "Creating User After Sign Up" above)
  }
  
  return <form onSubmit={...}>...</form>
}
```

### Protected Route

```typescript
// app/routes/dashboard.tsx
import { redirect } from '@remix-run/cloudflare'

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if user is authenticated
  // You can use cookies, headers, or session storage
  const session = await getSessionFromRequest(request)
  
  if (!session) {
    return redirect('/login')
  }
  
  // Fetch data via GraphQL
  const client = createGraphQLClient()
  const data = await client.request(...)
  
  return json(data)
}
```

## Migration from Database to Auth-Only

### Before (Using Supabase Database)

```typescript
// ❌ Old way - Direct database access
const { data: profiles } = await supabase
  .from('profiles')
  .select('*')
  .eq('role', 'representative')

const { data: conversations } = await supabase
  .from('conversations')
  .select('*')
  .order('created_at', { ascending: false })
```

### After (Auth + GraphQL)

```typescript
// ✅ New way - Auth only, data via GraphQL
// 1. Auth remains with Supabase
const { data: { session } } = await supabase.auth.getSession()

// 2. Data fetching via GraphQL
const client = createGraphQLClient({
  headers: {
    Authorization: `Bearer ${session?.access_token}`
  }
})

const representatives = await client.request(LIST_REPRESENTATIVES, {
  orgId: 'acme-corp',
})

const conversations = await client.request(LIST_CONVERSATIONS, {
  orgId: 'acme-corp',
  limit: 50,
})
```

## Components Still Using Supabase Database

These components need migration to use GraphQL routes:

### 1. CustomerChat.tsx
**Current:** Uses Supabase for conversations and messages  
**Migration:** Use `/conversations` routes

```typescript
// Replace with:
import { useLoaderData } from '@remix-run/react'
// Use loader to fetch data via GraphQL
```

### 2. RepresentativeDashboard.tsx
**Current:** Uses Supabase for conversations, profiles, messages  
**Migration:** Use GraphQL queries in loader

### 3. AdminDashboard.tsx
**Current:** Uses Supabase profiles table  
**Migration:** Use `/api/users` and `/api/representatives` routes

### 4. ProfileSetup.tsx
**Current:** Uses Supabase profiles table  
**Migration:** Use `CREATE_USER` mutation via GraphQL

## Environment Setup

### 1. Supabase Dashboard

Configure your Supabase project for **auth only**:

1. Go to Authentication settings
2. Enable Email authentication
3. Configure Email templates (optional)
4. Set Site URL and redirect URLs
5. **Disable** or remove database tables (not needed)

### 2. Environment Variables

```env
# .env or local.env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
GRAPHQL_ENDPOINT=http://localhost:8787/graphql
DEFAULT_ORG_ID=acme-corp
```

### 3. Wrangler Configuration

```jsonc
// wrangler.jsonc
{
  "vars": {
    "GRAPHQL_ENDPOINT": "http://localhost:8787/graphql",
    "DEFAULT_ORG_ID": "acme-corp"
  }
}
```

## Security Considerations

### JWT Tokens

When a user authenticates with Supabase:
1. Supabase issues a JWT access token
2. This token can be passed to your GraphQL API
3. GraphQL API can verify the token with Supabase

```typescript
// In GraphQL requests
const client = createGraphQLClient({
  headers: {
    Authorization: `Bearer ${session.access_token}`
  }
})
```

### Token Refresh

Supabase automatically handles token refresh:

```typescript
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true, // ✅ Enabled
  },
})
```

## Benefits of Auth-Only Approach

1. **Separation of Concerns:** Auth and data are separate systems
2. **Unified API:** All data operations through one GraphQL endpoint
3. **Type Safety:** GraphQL schema provides strong typing
4. **Flexibility:** Easy to switch auth providers without changing data layer
5. **Performance:** Optimized queries through GraphQL
6. **Simplicity:** No need to manage Supabase database schema

## Troubleshooting

### "Missing Supabase environment variables"

Ensure these are set in your `.env` or `local.env`:
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### "User not found" after authentication

After Supabase auth succeeds, you must create the user profile via GraphQL:

```typescript
const { data: authData } = await supabase.auth.signUp(credentials)

// Create profile in your system via GraphQL
await graphqlClient.request(CREATE_USER, {
  orgId: 'acme-corp',
  email: authData.user.email,
  name: name,
  role: 'CUSTOMER',
})
```

### Auth state not persisting

Check that `persistSession: true` is set in Supabase client config.

## Testing

### Test Authentication

```typescript
// Test sign up
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'test-password',
})

console.log('User ID:', data.user?.id)
console.log('Email:', data.user?.email)

// Test sign in
const { data: signInData } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'test-password',
})

console.log('Session:', signInData.session)
console.log('Access Token:', signInData.session?.access_token)
```

### Test with GraphQL

```typescript
// After authentication
const session = await supabase.auth.getSession()

const client = createGraphQLClient({
  headers: {
    Authorization: `Bearer ${session.data.session?.access_token}`
  }
})

const user = await client.request(GET_USER, {
  orgId: 'acme-corp',
  id: session.data.session?.user.id,
})

console.log('User from GraphQL:', user)
```

## Next Steps

1. ✅ Supabase configured for auth only
2. ✅ GraphQL client set up for data operations
3. ⏳ Migrate remaining components (CustomerChat, RepresentativeDashboard, etc.)
4. ⏳ Add auth token to GraphQL requests
5. ⏳ Implement protected routes
6. ⏳ Add error handling for auth failures

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [GraphQL Gateway API Reference](../../server/apis/gateway-api/API-REFERENCE.md)
- [Remix Authentication Guide](https://remix.run/docs/en/main/guides/authentication)
