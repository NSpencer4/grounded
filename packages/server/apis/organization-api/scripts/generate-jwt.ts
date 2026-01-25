#!/usr/bin/env tsx
/**
 * JWT Token Generator
 *
 * Generates test JWT tokens for local development and testing.
 *
 * Usage:
 *   npm run jwt:generate
 *   npx tsx scripts/generate-jwt.ts
 *   npx tsx scripts/generate-jwt.ts --userId=user123 --orgId=org456
 *
 * Options:
 *   --userId=<id>        User ID (default: test-user-123)
 *   --orgId=<id>         Organization ID (default: none)
 *   --email=<email>      User email (default: test@example.com)
 *   --name=<name>        User name (default: Test User)
 *   --role=<role>        User role: CUSTOMER, REPRESENTATIVE, ADMIN (default: CUSTOMER)
 *   --expiresIn=<time>   Expiration time (default: 24h)
 *
 * Environment Variables:
 *   JWT_SECRET - Secret key for signing JWTs (required)
 *   JWT_ISSUER - Token issuer (default: grounded-api)
 *   JWT_AUDIENCE - Token audience (default: grounded-services)
 */

import jwt from 'jsonwebtoken'

interface GenerateOptions {
  userId: string
  orgId?: string
  email: string
  name: string
  role: 'CUSTOMER' | 'REPRESENTATIVE' | 'ADMIN'
  expiresIn: string
}

/**
 * Parse command line arguments
 */
function parseArgs(): GenerateOptions {
  const args = process.argv.slice(2)
  const options: GenerateOptions = {
    userId: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'CUSTOMER',
    expiresIn: '24h',
  }

  for (const arg of args) {
    if (arg.startsWith('--userId=')) {
      options.userId = arg.split('=')[1]
    } else if (arg.startsWith('--orgId=')) {
      options.orgId = arg.split('=')[1]
    } else if (arg.startsWith('--email=')) {
      options.email = arg.split('=')[1]
    } else if (arg.startsWith('--name=')) {
      options.name = arg.split('=')[1]
    } else if (arg.startsWith('--role=')) {
      const role = arg.split('=')[1].toUpperCase()
      if (['CUSTOMER', 'REPRESENTATIVE', 'ADMIN'].includes(role)) {
        options.role = role as GenerateOptions['role']
      }
    } else if (arg.startsWith('--expiresIn=')) {
      options.expiresIn = arg.split('=')[1]
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
JWT Token Generator

Usage:
  npm run jwt:generate [options]

Options:
  --userId=<id>        User ID (default: test-user-123)
  --orgId=<id>         Organization ID (default: none)
  --email=<email>      User email (default: test@example.com)
  --name=<name>        User name (default: Test User)
  --role=<role>        User role: CUSTOMER, REPRESENTATIVE, ADMIN (default: CUSTOMER)
  --expiresIn=<time>   Expiration time (default: 24h)
  --help, -h           Show this help message

Examples:
  npm run jwt:generate
  npm run jwt:generate --userId=alice123 --orgId=acme-corp
  npm run jwt:generate --role=ADMIN --expiresIn=7d

Environment Variables:
  JWT_SECRET           Required secret key for signing tokens
  JWT_ISSUER          Token issuer (default: grounded-api)
  JWT_AUDIENCE        Token audience (default: grounded-services)
      `)
      process.exit(0)
    }
  }

  return options
}

/**
 * Generate JWT token
 */
function generateToken(options: GenerateOptions): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }

  const issuer = process.env.JWT_ISSUER || 'grounded-api'
  const audience = process.env.JWT_AUDIENCE || 'grounded-services'

  const payload: Record<string, unknown> = {
    sub: options.userId,
    email: options.email,
    name: options.name,
    role: options.role,
  }

  if (options.orgId) {
    payload.organizationId = options.orgId
  }

  return jwt.sign(payload, secret, {
    expiresIn: options.expiresIn,
    issuer,
    audience,
    algorithm: 'HS256',
  })
}

/**
 * Decode token to show claims
 */
function decodeToken(token: string): Record<string, unknown> {
  return jwt.decode(token) as Record<string, unknown>
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🔑 JWT Token Generator\n')

    // Parse arguments
    const options = parseArgs()

    // Generate token
    const token = generateToken(options)
    const decoded = decodeToken(token)

    // Display results
    console.log('✅ Token generated successfully!\n')

    console.log('📋 Token Claims:')
    console.log(`   User ID:      ${decoded.sub}`)
    if (decoded.organizationId) {
      console.log(`   Organization: ${decoded.organizationId}`)
    }
    console.log(`   Email:        ${decoded.email}`)
    console.log(`   Name:         ${decoded.name}`)
    console.log(`   Role:         ${decoded.role}`)
    console.log(`   Issuer:       ${decoded.iss}`)
    console.log(`   Audience:     ${decoded.aud}`)
    console.log(`   Issued At:    ${new Date((decoded.iat as number) * 1000).toISOString()}`)
    console.log(`   Expires At:   ${new Date((decoded.exp as number) * 1000).toISOString()}`)

    console.log('\n📝 JWT Token:')
    console.log('─────────────────────────────────────────────────────────────────────')
    console.log(token)
    console.log('─────────────────────────────────────────────────────────────────────')

    console.log('\n💡 Usage:')
    console.log('   Add to Authorization header:')
    console.log(`   Authorization: Bearer ${token.substring(0, 50)}...`)

    console.log('\n📮 Postman / cURL:')
    console.log('   1. Copy the token above')
    console.log('   2. Add to request headers:')
    console.log('      Key: Authorization')
    console.log(`      Value: Bearer <paste-token-here>`)

    console.log('\n🧪 Test with cURL:')
    console.log(`   curl http://localhost:9005/2015-03-31/functions/function/invocations/health \\`)
    console.log(`     -H "Authorization: Bearer ${token.substring(0, 50)}..."`)

    console.log('\n🔍 Environment:')
    console.log(`   JWT_SECRET:   ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`)
    console.log(`   JWT_ISSUER:   ${process.env.JWT_ISSUER || 'grounded-api (default)'}`)
    console.log(`   JWT_AUDIENCE: ${process.env.JWT_AUDIENCE || 'grounded-services (default)'}`)
  } catch (error) {
    console.error('\n❌ Error generating token:', error)
    if (error instanceof Error) {
      console.error(`   ${error.message}`)
    }
    process.exit(1)
  }
}

main()
