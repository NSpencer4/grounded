# Supabase Client for Lambda Functions

This module provides a cached Supabase client for use in AWS Lambda functions, with automatic credential retrieval from AWS Secrets Manager.

## Features

- ✅ Automatic credential fetching from Secrets Manager
- ✅ Connection caching for Lambda warm starts
- ✅ Both anonymous and admin (service role) clients
- ✅ Helper functions for common auth operations
- ✅ TypeScript support

## Setup

### 1. Install Dependencies

Dependencies are already included in `@grounded/server-shared`:

```json
{
  "@supabase/supabase-js": "^2.39.0",
  "@aws-sdk/client-secrets-manager": "^3.0.0"
}
```

### 2. Configure IAM Policy

Ensure your Lambda execution role has the Supabase secrets access policy attached. This is automatically done via Terraform in `terraform/lambda-supabase-integration.tf`.

### 3. Set Environment Variable

Your Lambda function needs this environment variable (automatically set by Terraform):

```bash
SUPABASE_CREDENTIALS_SECRET_ARN=arn:aws:secretsmanager:us-east-1:123456789:secret:production/grounded/supabase-credentials
```

## Usage

### Import

```typescript
import {
  getSupabaseClient,
  getSupabaseAdminClient,
  verifyUserToken,
  getUserById,
  listUsers,
  createUser,
  deleteUser,
  updateUserMetadata,
} from '@grounded/server-shared/supabase';
```

### Basic Client Usage

```typescript
// Get anonymous client (client-side operations)
const supabase = await getSupabaseClient();

// Get admin client (server-side operations)
const adminClient = await getSupabaseAdminClient();
```

### Verify User JWT Token

Useful for API Gateway authorizers or protected Lambda endpoints:

```typescript
import { verifyUserToken } from '@grounded/server-shared/supabase';

export async function handler(event: APIGatewayProxyEvent) {
  // Extract JWT from Authorization header
  const token = event.headers.Authorization?.replace('Bearer ', '');
  
  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }
  
  // Verify the token
  const user = await verifyUserToken(token);
  
  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid token' }),
    };
  }
  
  // User is authenticated
  console.log('Authenticated user:', user.email);
  
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      message: 'Welcome!',
      userId: user.id,
      email: user.email,
    }),
  };
}
```

### Get User by ID

```typescript
import { getUserById } from '@grounded/server-shared/supabase';

// Get user details
const user = await getUserById('user-uuid-here');

if (user) {
  console.log('User email:', user.email);
  console.log('User metadata:', user.user_metadata);
  console.log('Created at:', user.created_at);
}
```

### List All Users

```typescript
import { listUsers } from '@grounded/server-shared/supabase';

// Get first page (50 users)
const users = await listUsers();

// Get specific page
const page2Users = await listUsers(2, 100); // Page 2, 100 per page

if (users) {
  users.forEach(user => {
    console.log(`${user.email} - ${user.id}`);
  });
}
```

### Create User (Admin Operation)

```typescript
import { createUser } from '@grounded/server-shared/supabase';

// Create user without email confirmation
const user = await createUser('newuser@example.com', 'securepassword', {
  email_confirm: true,
  user_metadata: {
    organization_id: 'acme-corp',
    role: 'customer',
  },
});

if (user) {
  console.log('User created:', user.id);
}
```

### Update User Metadata

```typescript
import { updateUserMetadata } from '@grounded/server-shared/supabase';

// Update user's metadata
const updatedUser = await updateUserMetadata('user-uuid', {
  organization_id: 'org_456',
  role: 'admin',
  last_active: new Date().toISOString(),
});

if (updatedUser) {
  console.log('User updated:', updatedUser.user_metadata);
}
```

### Delete User

```typescript
import { deleteUser } from '@grounded/server-shared/supabase';

// Delete user account
const success = await deleteUser('user-uuid');

if (success) {
  console.log('User deleted successfully');
}
```

### Advanced: Direct Client Access

For operations not covered by helper functions:

```typescript
import { getSupabaseAdminClient } from '@grounded/server-shared/supabase';

const supabase = await getSupabaseAdminClient();

// Generate magic link
const { data, error } = await supabase.auth.admin.generateLink({
  type: 'magiclink',
  email: 'user@example.com',
});

if (data) {
  console.log('Magic link:', data.properties.action_link);
}

// Update user email
const { data: user, error: updateError } = await supabase.auth.admin.updateUserById(
  'user-uuid',
  { email: 'newemail@example.com' }
);

// Invite user
const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
  'invited@example.com',
  { redirectTo: 'http://localhost:8787/welcome' }
);
```

## Use Cases

### 1. Actions Orchestrator - User Context

```typescript
// packages/server/orchestrators/actions-orchestrator/src/handler.ts
import { verifyUserToken, getUserById } from '@grounded/server-shared/supabase';

export async function handler(event: KafkaEvent) {
  const record = event.Records[0];
  const message = JSON.parse(record.value);
  
  // Verify user if JWT is present in message
  if (message.userToken) {
    const user = await verifyUserToken(message.userToken);
    
    if (user) {
      console.log('Processing action for user:', user.email);
      // Add user context to processing
      message.userContext = {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
      };
    }
  }
  
  // Continue with orchestration
  // ...
}
```

### 2. Responder Lambda - User Notifications

```typescript
// packages/server/orchestrators/responder/src/responder.ts
import { getUserById } from '@grounded/server-shared/supabase';

async function sendResponse(conversationId: string, userId: string) {
  // Get user details
  const user = await getUserById(userId);
  
  if (!user) {
    console.error('User not found:', userId);
    return;
  }
  
  // Use user email for notifications
  console.log('Sending notification to:', user.email);
  
  // Update conversation state with user info
  // ...
}
```

### 3. GraphQL Gateway - Authorization

If you want to add Supabase auth to your GraphQL Gateway:

```typescript
// packages/server/apis/gateway-api/src/index.ts
import { verifyUserToken } from '@grounded/server-shared/supabase';

const yoga = createYoga<Env>({
  schema,
  context: async ({ request, env }) => {
    // Extract JWT from request
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    let user = null;
    if (token) {
      user = await verifyUserToken(token);
    }
    
    return {
      env,
      user, // Add authenticated user to context
    };
  },
  // ...
});

// Then in resolvers:
const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      
      return {
        id: context.user.id,
        email: context.user.email,
      };
    },
  },
};
```

### 4. Custom MCP Tool - User Management

```typescript
// packages/server/mcp/org-tools/src/tools/user-management.ts
import {
  createUser,
  getUserById,
  updateUserMetadata,
  listUsers,
} from '@grounded/server-shared/supabase';

export const userManagementTools = [
  {
    name: 'create_user',
    description: 'Create a new user account',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
        organizationId: { type: 'string' },
      },
      required: ['email', 'password', 'organizationId'],
    },
    handler: async ({ email, password, organizationId }) => {
      const user = await createUser(email, password, {
        email_confirm: false,
        user_metadata: { organization_id: organizationId },
      });
      
      return user ? { success: true, userId: user.id } : { success: false };
    },
  },
  {
    name: 'get_user_profile',
    description: 'Get user profile by ID',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
      },
      required: ['userId'],
    },
    handler: async ({ userId }) => {
      const user = await getUserById(userId);
      
      return user
        ? {
            id: user.id,
            email: user.email,
            metadata: user.user_metadata,
            created_at: user.created_at,
          }
        : null;
    },
  },
];
```

## Performance

### Connection Caching

The module automatically caches the Supabase client and AWS Secrets Manager client for Lambda warm starts:

- **Cold start**: ~200-300ms (fetches credentials from Secrets Manager)
- **Warm start**: ~1-5ms (uses cached client)

### Best Practices

1. **Reuse clients**: Don't call `getSupabaseClient()` multiple times in the same invocation
   ```typescript
   // ❌ Bad
   await verifyUserToken(token);
   await getUserById(userId);
   await listUsers();
   
   // ✅ Good
   const supabase = await getSupabaseAdminClient();
   const user1 = await supabase.auth.getUser(token);
   const user2 = await supabase.auth.admin.getUserById(userId);
   const users = await supabase.auth.admin.listUsers();
   ```

2. **Use helper functions for common operations**: They handle errors gracefully

3. **Cache user data**: If you need user info multiple times, cache it in your handler

## Error Handling

All helper functions return `null` on error and log to console:

```typescript
const user = await getUserById('invalid-id');

if (!user) {
  // Handle error (user not found or other error)
  console.error('Failed to get user');
  return;
}

// Success - user is valid
console.log(user.email);
```

For more control, use direct client access:

```typescript
const supabase = await getSupabaseAdminClient();
const { data, error } = await supabase.auth.admin.getUserById(userId);

if (error) {
  console.error('Error:', error.message, error.status);
  // Handle specific error
}
```

## Testing

### Clear Cache Between Tests

```typescript
import { clearCache } from '@grounded/server-shared/supabase';

afterEach(() => {
  clearCache();
});
```

### Mock in Tests

```typescript
import * as supabase from '@grounded/server-shared/supabase';

jest.spyOn(supabase, 'verifyUserToken').mockResolvedValue({
  id: 'test-user-id',
  email: 'test@example.com',
  // ... other user properties
});
```

## Security Notes

- **Never expose service role key**: Only use in Lambda functions (server-side)
- **Use anonymous key for client operations**: When possible
- **Validate tokens**: Always verify JWT tokens before trusting user identity
- **Use RLS**: Enable Row Level Security in Supabase for data protection

## Troubleshooting

### "SUPABASE_CREDENTIALS_SECRET_ARN environment variable is not set"

Ensure your Lambda function has the environment variable set. Check Terraform:

```bash
terraform output supabase_credentials_secret_arn
```

### "Secret value is empty"

Check that the secret exists in Secrets Manager:

```bash
aws secretsmanager get-secret-value \
  --secret-id production/grounded/supabase-credentials
```

### "Access Denied" when fetching secret

Verify IAM policy is attached:

```bash
terraform output supabase_secrets_policy_arn

aws iam list-attached-role-policies \
  --role-name grounded-actions-orchestrator-role
```

### Slow cold starts

This is expected (200-300ms) due to Secrets Manager fetch. Optimize by:
- Using provisioned concurrency
- Keeping functions warm with scheduled invocations
- Caching is automatic for warm starts

## API Reference

See inline TypeScript documentation in `index.ts` for full API details.
