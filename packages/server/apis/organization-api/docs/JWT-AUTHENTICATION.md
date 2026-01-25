# JWT Authentication

The Organization API uses JSON Web Tokens (JWT) for authentication and authorization.

## Overview

All API endpoints (except `/health`) require a valid JWT token in the `Authorization` header. The token contains user identity and claims that are validated on every request.

### Token Format

```
Authorization: Bearer <jwt-token>
```

### JWT Claims

| Claim | Type | Required | Description |
|-------|------|----------|-------------|
| `sub` | string | ✅ Yes | User ID (subject) |
| `organizationId` | string | ❌ No | Organization ID (for org-scoped access) |
| `email` | string | ❌ No | User email address |
| `name` | string | ❌ No | User display name |
| `role` | string | ❌ No | User role: CUSTOMER, REPRESENTATIVE, ADMIN |
| `iss` | string | ✅ Yes | Token issuer (must match JWT_ISSUER) |
| `aud` | string | ✅ Yes | Token audience (must match JWT_AUDIENCE) |
| `iat` | number | ✅ Yes | Issued at timestamp |
| `exp` | number | ✅ Yes | Expiration timestamp |

## Configuration

### Environment Variables

**Required:**

```bash
JWT_SECRET=your-secret-key-here
```

**Optional (with defaults):**

```bash
JWT_ISSUER=grounded-api           # Token issuer
JWT_AUDIENCE=grounded-services    # Token audience
```

### Generate a Secure Secret

For production, generate a secure random secret:

```bash
openssl rand -base64 32
```

Example output:
```
xK9pQ2mN8vL4sH7jR3fT6wY0aE5iU8oB1cD4gF7hJ2k=
```

Use this as your `JWT_SECRET`.

## Generating Test Tokens

For local development and testing, use the JWT generator script:

### Basic Usage

```bash
npm run jwt:generate
```

This generates a token with default values:
- User ID: `test-user-123`
- Email: `test@example.com`
- Name: `Test User`
- Role: `CUSTOMER`
- Expires: 24 hours

### Custom Tokens

```bash
# Generate token for specific user and organization
npm run jwt:generate --userId=alice-123 --orgId=acme-corp-456

# Generate admin token
npm run jwt:generate --role=ADMIN --userId=admin-789

# Generate token with custom expiration
npm run jwt:generate --expiresIn=7d --userId=user-123

# Full example
npm run jwt:generate \
  --userId=john-doe-123 \
  --orgId=org-456 \
  --email=john@example.com \
  --name="John Doe" \
  --role=REPRESENTATIVE \
  --expiresIn=48h
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--userId=<id>` | User ID | test-user-123 |
| `--orgId=<id>` | Organization ID | (none) |
| `--email=<email>` | User email | test@example.com |
| `--name=<name>` | User name | Test User |
| `--role=<role>` | CUSTOMER, REPRESENTATIVE, or ADMIN | CUSTOMER |
| `--expiresIn=<time>` | Token expiration (e.g., 24h, 7d, 30m) | 24h |

## Using Tokens

### cURL

```bash
TOKEN="your-jwt-token-here"

curl http://localhost:9005/2015-03-31/functions/function/invocations/organizations/org-123/users \
  -H "Authorization: Bearer $TOKEN"
```

### Postman

1. Open your request
2. Go to the "Authorization" tab
3. Select "Bearer Token" type
4. Paste your JWT token
5. Send request

### JavaScript/TypeScript

```typescript
const token = 'your-jwt-token-here'

const response = await fetch('http://localhost:9005/.../organizations/org-123/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### GraphQL (via Gateway)

The GraphQL Gateway will forward the Authorization header to the Organization API:

```typescript
const client = new ApolloClient({
  uri: 'http://localhost:8787/graphql',
  headers: {
    Authorization: `Bearer ${token}`
  }
})
```

## Authorization Rules

### Organization Access

If the JWT token contains an `organizationId` claim, users can only access data for that organization:

```typescript
// Token claims:
{
  sub: "user-123",
  organizationId: "org-abc"
}

// ✅ Allowed
GET /organizations/org-abc/users

// ❌ Forbidden (403)
GET /organizations/org-xyz/users
```

### Admin Access

Users with `role: "ADMIN"` can access any organization (optional - implement as needed).

### Public Endpoints

Only the health check endpoint is public:

```bash
# No authentication required
GET /health
```

## Error Responses

### Missing Token (401)

```json
{
  "error": "MISSING_TOKEN",
  "message": "Missing authentication token. Provide a valid JWT in the Authorization header."
}
```

### Invalid Token (401)

```json
{
  "error": "INVALID_TOKEN",
  "message": "Invalid token: jwt malformed"
}
```

### Expired Token (401)

```json
{
  "error": "TOKEN_EXPIRED",
  "message": "Token has expired"
}
```

### Organization Access Denied (403)

```json
{
  "error": "ORGANIZATION_ACCESS_DENIED",
  "message": "Access denied. User does not have permission to access this organization."
}
```

## Testing Authentication

### 1. Generate a Test Token

```bash
npm run jwt:generate --userId=test-user --orgId=acme-corp
```

Copy the generated token.

### 2. Test Health Endpoint (No Auth)

```bash
curl http://localhost:9005/2015-03-31/functions/function/invocations/health
```

Expected: `200 OK` with health status.

### 3. Test Protected Endpoint Without Token

```bash
curl http://localhost:9005/2015-03-31/functions/function/invocations/organizations/acme-corp/users
```

Expected: `401 Unauthorized` with `MISSING_TOKEN` error.

### 4. Test Protected Endpoint With Token

```bash
TOKEN="your-jwt-token-here"

curl http://localhost:9005/2015-03-31/functions/function/invocations/organizations/acme-corp/users \
  -H "Authorization: Bearer $TOKEN"
```

Expected: `200 OK` with user data.

### 5. Test Organization Authorization

```bash
# Token has organizationId: "acme-corp"

# ✅ Should work
curl http://localhost:9005/.../organizations/acme-corp/users \
  -H "Authorization: Bearer $TOKEN"

# ❌ Should fail with 403
curl http://localhost:9005/.../organizations/different-org/users \
  -H "Authorization: Bearer $TOKEN"
```

## Integration with Seeded Data

When using the seeded data from `npm run db:seed-comprehensive`, generate tokens for specific users:

### Acme Corp Admin

```bash
npm run jwt:generate \
  --userId=<admin-user-id-from-seed> \
  --orgId=<acme-org-id-from-seed> \
  --role=ADMIN \
  --email=admin@acme.com \
  --name="Admin User"
```

### Acme Corp Representative

```bash
npm run jwt:generate \
  --userId=<rep-user-id> \
  --orgId=<acme-org-id> \
  --role=REPRESENTATIVE \
  --email=jane.rep@acme.com \
  --name="Jane Representative"
```

### Acme Corp Customer

```bash
npm run jwt:generate \
  --userId=<customer-user-id> \
  --orgId=<acme-org-id> \
  --role=CUSTOMER \
  --email=alice.johnson@customer.com \
  --name="Alice Johnson"
```

## Production Deployment

### AWS Lambda Environment Variables

Set these in your Lambda function configuration or via Terraform:

```hcl
environment {
  variables = {
    JWT_SECRET   = var.jwt_secret        # Store in AWS Secrets Manager
    JWT_ISSUER   = "grounded-api"
    JWT_AUDIENCE = "grounded-services"
  }
}
```

### AWS Secrets Manager

Store the JWT secret securely:

```bash
aws secretsmanager create-secret \
  --name grounded/jwt-secret \
  --secret-string "$(openssl rand -base64 32)"
```

Retrieve in Lambda:

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

const client = new SecretsManagerClient({ region: 'us-east-1' })
const response = await client.send(
  new GetSecretValueCommand({ SecretId: 'grounded/jwt-secret' })
)
process.env.JWT_SECRET = response.SecretString
```

### Token Generation Service

In production, tokens should be generated by an authentication service:

1. **Auth Service** (e.g., AWS Cognito, Auth0, custom)
   - Handles user login
   - Issues JWT tokens
   - Manages refresh tokens

2. **Organization API**
   - Validates JWT tokens
   - Authorizes access to resources
   - Does NOT generate tokens (except for testing)

## Security Best Practices

### Token Lifetime

- **Short-lived access tokens**: 15 minutes to 24 hours
- **Long-lived refresh tokens**: 7-30 days
- Implement refresh token rotation

### Secret Management

- ✅ Use environment variables for JWT_SECRET
- ✅ Store secrets in AWS Secrets Manager / Parameter Store
- ✅ Rotate secrets regularly
- ❌ Never commit secrets to version control
- ❌ Never log JWT secrets

### Token Validation

The API validates:
- ✅ Token signature (HS256/RS256)
- ✅ Token expiration (`exp` claim)
- ✅ Token issuer (`iss` claim)
- ✅ Token audience (`aud` claim)
- ✅ Required claims (`sub` claim)

### HTTPS Only

Always use HTTPS in production to prevent token interception.

### Token Revocation

For production, implement token revocation:
- Maintain a blacklist of revoked tokens
- Check blacklist before validating token
- Use short token lifetimes to reduce revocation window

## Troubleshooting

### "JWT_SECRET environment variable is required"

**Solution:** Set the JWT_SECRET environment variable:

```bash
export JWT_SECRET=your-secret-key
npm run dev
```

Or add to `local.env`:

```bash
JWT_SECRET=your-secret-key
```

### "Invalid token: jwt malformed"

**Cause:** Token format is incorrect.

**Solution:**
- Ensure token is properly formatted
- Check for extra spaces or characters
- Regenerate token with `npm run jwt:generate`

### "Token has expired"

**Cause:** Token's `exp` claim is in the past.

**Solution:** Generate a new token with a longer expiration:

```bash
npm run jwt:generate --expiresIn=7d
```

### "Organization access denied"

**Cause:** Token's `organizationId` doesn't match the requested organization.

**Solution:**
- Generate token with correct `--orgId`
- Or generate token without `--orgId` (allows access to any org)

### Token works locally but not in production

**Cause:** JWT_SECRET mismatch between environments.

**Solution:**
- Verify JWT_SECRET is set correctly in production
- Ensure token was generated with the same secret
- Check JWT_ISSUER and JWT_AUDIENCE match

## Examples

### Complete cURL Examples

```bash
# 1. Generate token
TOKEN=$(npm run jwt:generate --userId=test-123 --orgId=org-456 | grep -A 1 "JWT Token:" | tail -1)

# 2. Health check (no auth)
curl http://localhost:9005/2015-03-31/functions/function/invocations/health

# 3. List users (with auth)
curl http://localhost:9005/2015-03-31/functions/function/invocations/organizations/org-456/users \
  -H "Authorization: Bearer $TOKEN"

# 4. Create user (with auth)
curl -X POST \
  http://localhost:9005/2015-03-31/functions/function/invocations/organizations/org-456/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "name": "New User",
    "role": "CUSTOMER"
  }'
```

### GraphQL Gateway Example

```typescript
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

// Get JWT token (from auth service)
const token = 'your-jwt-token'

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    authorization: token ? `Bearer ${token}` : '',
  }
}))

const httpLink = new HttpLink({
  uri: 'http://localhost:8787/graphql',
})

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})

// Now all queries will include the JWT token
const { data } = await client.query({
  query: gql`
    query GetUsers($orgId: ID!) {
      users(orgId: $orgId) {
        id
        name
        email
      }
    }
  `,
  variables: { orgId: 'org-456' }
})
```

## Further Reading

- [JWT.io](https://jwt.io/) - JWT token decoder and debugger
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - JSON Web Token specification
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
