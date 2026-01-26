# Quick Start: Postman + JWT Authentication

Get up and running with the Organization API in 5 minutes!

## Step 1: Import into Postman

1. Open Postman
2. Click **Import** (top-left)
3. Select these files:
   - `postman/collections/organization-api.json`
   - `postman/environments/local.postman_environment.json`
4. Select the **"Local"** environment (top-right dropdown)

## Step 2: Add JWT Auto-Generation Script

1. In Postman, find the **"Organization API (NestJS)"** collection in the left sidebar
2. Click the three dots (...) next to it and select **Edit**
3. Go to the **Scripts** tab → **Pre-request** sub-tab
4. Copy and paste the entire script below
5. Click **Update** to save

### Copy This Script:

```javascript
// JWT Pre-Request Script - Auto-generates tokens for Organization API
// Configuration is pulled from environment variables

const jwtSecret = pm.environment.get('jwt_secret');
const jwtIssuer = pm.environment.get('jwt_issuer') || 'grounded-api';
const jwtAudience = pm.environment.get('jwt_audience') || 'grounded-services';
const userId = pm.environment.get('jwt_user_id') || 'test-user-123';
const userEmail = pm.environment.get('jwt_user_email') || 'test@example.com';
const userName = pm.environment.get('jwt_user_name') || 'Test User';
const organizationId = pm.environment.get('jwt_organization_id') || 'acme-corp';
const userRole = pm.environment.get('jwt_user_role') || 'ADMIN';
const expiryHours = parseInt(pm.environment.get('jwt_expiry_hours') || '24', 10);

if (!jwtSecret) {
    console.error('❌ JWT_SECRET not configured in environment variables');
    throw new Error('JWT_SECRET is required. Please set jwt_secret in your Postman environment.');
}

function base64url(source) {
    let encodedSource = CryptoJS.enc.Base64.stringify(source);
    encodedSource = encodedSource.replace(/=+$/, '');
    encodedSource = encodedSource.replace(/\+/g, '-');
    encodedSource = encodedSource.replace(/\//g, '_');
    return encodedSource;
}

const header = {
    alg: 'HS256',
    typ: 'JWT'
};

const now = Math.floor(Date.now() / 1000);
const exp = now + (expiryHours * 3600);

const payload = {
    sub: userId,
    email: userEmail,
    name: userName,
    organizationId: organizationId,
    role: userRole,
    iat: now,
    exp: exp,
    iss: jwtIssuer,
    aud: jwtAudience
};

const stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
const encodedHeader = base64url(stringifiedHeader);

const stringifiedPayload = CryptoJS.enc.Utf8.parse(JSON.stringify(payload));
const encodedPayload = base64url(stringifiedPayload);

const token = `${encodedHeader}.${encodedPayload}`;
const signature = CryptoJS.HmacSHA256(token, jwtSecret);
const encodedSignature = base64url(signature);

const jwt = `${token}.${encodedSignature}`;

pm.collectionVariables.set('jwt_token', jwt);

console.log('✅ JWT Token Generated Successfully');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 Token Details:');
console.log(`   User ID: ${userId}`);
console.log(`   Email: ${userEmail}`);
console.log(`   Name: ${userName}`);
console.log(`   Organization: ${organizationId}`);
console.log(`   Role: ${userRole}`);
console.log(`   Issuer: ${jwtIssuer}`);
console.log(`   Audience: ${jwtAudience}`);
console.log(`   Issued At: ${new Date(now * 1000).toISOString()}`);
console.log(`   Expires At: ${new Date(exp * 1000).toISOString()}`);
console.log(`   Valid For: ${expiryHours} hours`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔑 Token (first 50 chars):', jwt.substring(0, 50) + '...');
```

## Step 3: Start the Organization API

In your terminal:

```bash
# Start with Docker (recommended)
docker-compose up organization-api -d

# Check logs to ensure it's running
docker logs grounded-organization-api

# You should see:
# 🚀 Organization API running on port 8080
# 📍 API endpoints available at http://localhost:8080/api
```

## Step 4: Test It!

1. In Postman, expand the **"Organization API (NestJS)"** collection
2. Open **Health → Health Check**
3. Click **Send**
4. You should see: `{ "status": "healthy", ... }`

Now try an authenticated endpoint:

1. Open **Organizations → Get Organization**
2. Click **Send**
3. Open the Postman Console (**View → Show Postman Console**)
4. You'll see the JWT token being generated automatically!

## Step 5: Customize User/Role (Optional)

To test different users or roles:

1. Go to **Environments** → **Local**
2. Modify these variables:
   - `jwt_user_id`: Change user ID
   - `jwt_user_role`: Set to `ADMIN`, `REPRESENTATIVE`, or `CUSTOMER`
   - `jwt_organization_id`: Test different organizations
3. Send a request - a new token is automatically generated!

## Testing Different Roles

### Test as Admin
```
jwt_user_id: admin-123
jwt_user_role: ADMIN
jwt_organization_id: acme-corp
```

### Test as Customer
```
jwt_user_id: customer-456
jwt_user_role: CUSTOMER
jwt_organization_id: acme-corp
```

### Test as Representative
```
jwt_user_id: rep-789
jwt_user_role: REPRESENTATIVE
jwt_organization_id: acme-corp
```

## Troubleshooting

### ❌ "JWT_SECRET is required" error
**Fix:** The "Local" environment isn't selected. Select it from the top-right dropdown.

### ❌ 401 Unauthorized responses
**Fix:** Check that the container is running:
```bash
docker ps | grep organization-api
docker logs grounded-organization-api
```

### ❌ "Cannot connect to localhost:9005"
**Fix:** Start the service:
```bash
docker-compose up organization-api -d
```

### ❌ Token expired
**Fix:** Tokens auto-regenerate before each request. If you're seeing this, check:
1. The pre-request script is properly added to the collection
2. Check the Postman Console for generation logs

## Next Steps

- See [JWT-SETUP.md](./JWT-SETUP.md) for detailed configuration options
- See [README.md](./README.md) for complete API documentation
- Test all endpoints in the collection (60+ endpoints available!)

## Need Help?

- Check container logs: `docker logs grounded-organization-api`
- View Postman Console: `View → Show Postman Console`
- Test health endpoint: `curl http://localhost:9005/api/health`
