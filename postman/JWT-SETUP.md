# JWT Authentication Setup for Organization API

This guide explains how to set up automatic JWT token generation for the Organization API Postman collection.

## Overview

The JWT pre-request script automatically generates a valid JWT token before each API request, eliminating the need to manually create and update tokens.

## Quick Setup

### 1. Import Environment

1. Open Postman
2. Go to **Environments** (left sidebar)
3. Click **Import**
4. Select `postman/environments/local.postman_environment.json`
5. Activate the "Local" environment (dropdown in top-right corner)

### 2. Add Pre-Request Script to Collection

1. In Postman, select the **"Organization API (NestJS)"** collection
2. Click the three dots (...) and select **Edit**
3. Go to the **Scripts** tab
4. Select the **Pre-request** tab
5. Copy the entire contents of `postman/scripts/jwt-pre-request.js`
6. Paste it into the Pre-request script editor
7. Click **Update** to save

### 3. Test It

1. Make sure the "Local" environment is selected
2. Send any request from the collection (e.g., "Health Check")
3. Check the Postman Console (View → Show Postman Console) to see token generation logs
4. The JWT will automatically be included in the Authorization header

## Configuration

The JWT token is configured using environment variables in the "Local" environment:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `jwt_secret` | Secret key for signing JWTs | `***REMOVED***` |
| `jwt_issuer` | Token issuer claim | `grounded-api` |
| `jwt_audience` | Token audience claim | `grounded-services` |
| `jwt_user_id` | User ID (sub claim) | `test-user-123` |
| `jwt_user_email` | User email | `admin@acme-corp.com` |
| `jwt_user_name` | User display name | `Test Admin` |
| `jwt_organization_id` | Organization ID | `acme-corp` |
| `jwt_user_role` | User role | `ADMIN` |
| `jwt_expiry_hours` | Token validity in hours | `24` |

### Customizing Token Claims

To test with different users or roles:

1. Go to **Environments** → **Local**
2. Modify the JWT variables as needed:
   - `jwt_user_id`: Change to a different user ID
   - `jwt_user_role`: Set to `CUSTOMER`, `REPRESENTATIVE`, or `ADMIN`
   - `jwt_organization_id`: Test with different organizations
3. Save the environment
4. Send your next request - a new token will be generated automatically

### Testing Different Roles

Example configurations for different user types:

**Admin User:**
```
jwt_user_id: admin-123
jwt_user_email: admin@acme-corp.com
jwt_user_name: Admin User
jwt_user_role: ADMIN
jwt_organization_id: acme-corp
```

**Representative User:**
```
jwt_user_id: rep-456
jwt_user_email: rep@acme-corp.com
jwt_user_name: Support Rep
jwt_user_role: REPRESENTATIVE
jwt_organization_id: acme-corp
```

**Customer User:**
```
jwt_user_id: cust-789
jwt_user_email: customer@example.com
jwt_user_name: Jane Doe
jwt_user_role: CUSTOMER
jwt_organization_id: acme-corp
```

## How It Works

1. **Before each request**, the pre-request script runs
2. It reads JWT configuration from environment variables
3. Creates a JWT with proper header and payload:
   ```json
   {
     "sub": "test-user-123",
     "email": "admin@acme-corp.com",
     "name": "Test Admin",
     "organizationId": "acme-corp",
     "role": "ADMIN",
     "iat": 1706227200,
     "exp": 1706313600,
     "iss": "grounded-api",
     "aud": "grounded-services"
   }
   ```
4. Signs the token using HS256 with the JWT secret
5. Sets the token in the `jwt_token` collection variable
6. The token is automatically included in requests via `Bearer {{jwt_token}}`

## Debugging

### View Token Generation Logs

1. Open Postman Console: **View** → **Show Postman Console**
2. Send a request
3. Look for the "✅ JWT Token Generated Successfully" message
4. Review token details and claims

### Common Issues

**Problem: "JWT_SECRET is required" error**
- **Solution**: Make sure the "Local" environment is selected and `jwt_secret` is set

**Problem: 401 Unauthorized responses**
- **Solution**: Verify the JWT secret matches the server configuration (`.env` file)
- Check that the server is running: `docker-compose ps organization-api`

**Problem: Token expired**
- **Solution**: The script generates a fresh token before each request. If you're getting expiration errors, check the server's system clock.

**Problem: Invalid organization access**
- **Solution**: Make sure `jwt_organization_id` matches the `orgId` used in your request URLs

## Production Notes

⚠️ **Important**: The current JWT secret is for development only. In production:

1. Use a strong, randomly generated secret
2. Store secrets securely (never commit to git)
3. Use short-lived tokens (1-2 hours)
4. Implement refresh token mechanism
5. Consider using asymmetric keys (RS256) instead of HS256

## API Endpoints

All endpoints are prefixed with `/api`:

- Base URL (Docker): `http://localhost:9005/api`
- Health Check: `GET /api/health`
- Organizations: `/api/organizations/:orgId/*`

See the collection for all available endpoints.

## Manual JWT Generation (Alternative)

If you prefer to generate tokens manually, you can use jwt.io:

1. Go to https://jwt.io
2. Select **HS256** algorithm
3. Set the payload:
   ```json
   {
     "sub": "test-user-123",
     "email": "admin@acme-corp.com",
     "name": "Test Admin",
     "organizationId": "acme-corp",
     "role": "ADMIN",
     "iat": 1706227200,
     "exp": 1706313600,
     "iss": "grounded-api",
     "aud": "grounded-services"
   }
   ```
4. Set the secret: `***REMOVED***`
5. Copy the generated token
6. Paste it into the `jwt_token` collection variable

## Related Files

- `postman/collections/organization-api.json` - API collection
- `postman/environments/local.postman_environment.json` - Local environment with JWT config
- `postman/scripts/jwt-pre-request.js` - JWT generation script
- `packages/server/apis/organization-api/src/auth/strategies/jwt.strategy.ts` - Server JWT validation
