/**
 * JWT Pre-Request Script for Organization API
 * 
 * This script automatically generates a valid JWT token for the Organization API
 * and sets it in the `jwt_token` collection variable.
 * 
 * SETUP INSTRUCTIONS:
 * 1. In Postman, select the "Organization API (NestJS)" collection
 * 2. Go to the "Scripts" tab
 * 3. In the "Pre-request" section, paste this entire script
 * 4. Save the collection
 * 
 * The script will automatically run before each request and generate a fresh JWT token.
 * 
 * ENVIRONMENT VARIABLES (configured in local.postman_environment.json):
 * - jwt_secret: The secret key for signing the JWT
 * - jwt_issuer: Token issuer (default: grounded-api)
 * - jwt_audience: Token audience (default: grounded-services)
 * - jwt_user_id: User ID for the token subject
 * - jwt_user_email: User email
 * - jwt_user_name: User display name
 * - jwt_organization_id: Organization ID
 * - jwt_user_role: User role (CUSTOMER, REPRESENTATIVE, or ADMIN)
 * - jwt_expiry_hours: Token expiry in hours (default: 24)
 */

// Get configuration from environment variables
const jwtSecret = pm.environment.get('jwt_secret');
const jwtIssuer = pm.environment.get('jwt_issuer') || 'grounded-api';
const jwtAudience = pm.environment.get('jwt_audience') || 'grounded-services';
const userId = pm.environment.get('jwt_user_id') || 'test-user-123';
const userEmail = pm.environment.get('jwt_user_email') || 'test@example.com';
const userName = pm.environment.get('jwt_user_name') || 'Test User';
const organizationId = pm.environment.get('jwt_organization_id') || 'acme-corp';
const userRole = pm.environment.get('jwt_user_role') || 'ADMIN';
const expiryHours = parseInt(pm.environment.get('jwt_expiry_hours') || '24', 10);

// Validate required configuration
if (!jwtSecret) {
    console.error('❌ JWT_SECRET not configured in environment variables');
    throw new Error('JWT_SECRET is required. Please set jwt_secret in your Postman environment.');
}

// Helper function to base64url encode
function base64url(source) {
    // Encode in classical base64
    let encodedSource = CryptoJS.enc.Base64.stringify(source);
    
    // Remove padding equal signs
    encodedSource = encodedSource.replace(/=+$/, '');
    
    // Replace characters according to base64url specifications
    encodedSource = encodedSource.replace(/\+/g, '-');
    encodedSource = encodedSource.replace(/\//g, '_');
    
    return encodedSource;
}

// Create JWT header
const header = {
    alg: 'HS256',
    typ: 'JWT'
};

// Create JWT payload
const now = Math.floor(Date.now() / 1000);
const exp = now + (expiryHours * 3600); // expiry in seconds

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

// Encode header and payload
const stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
const encodedHeader = base64url(stringifiedHeader);

const stringifiedPayload = CryptoJS.enc.Utf8.parse(JSON.stringify(payload));
const encodedPayload = base64url(stringifiedPayload);

// Create signature
const token = `${encodedHeader}.${encodedPayload}`;
const signature = CryptoJS.HmacSHA256(token, jwtSecret);
const encodedSignature = base64url(signature);

// Complete JWT
const jwt = `${token}.${encodedSignature}`;

// Set the JWT token in collection variable
pm.collectionVariables.set('jwt_token', jwt);

// Log token details (for debugging)
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
