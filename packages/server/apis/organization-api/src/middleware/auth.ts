import jwt from 'jsonwebtoken'

/**
 * JWT Payload Structure
 */
export interface JWTPayload {
  sub: string // User ID
  email?: string
  name?: string
  organizationId?: string
  role?: 'CUSTOMER' | 'REPRESENTATIVE' | 'ADMIN'
  iat?: number
  exp?: number
  iss?: string
  aud?: string
}

/**
 * Authentication Context
 */
export interface AuthContext {
  userId: string
  organizationId?: string
  email?: string
  name?: string
  role?: string
}

/**
 * Authentication Error
 */
export class AuthenticationError extends Error {
  statusCode: number
  code: string

  constructor(message: string, code: string = 'AUTHENTICATION_FAILED', statusCode = 401) {
    super(message)
    this.name = 'AuthenticationError'
    this.code = code
    this.statusCode = statusCode
  }
}

/**
 * JWT Configuration
 */
interface JWTConfig {
  secret: string
  issuer?: string
  audience?: string
}

/**
 * Get JWT configuration from environment
 */
function getJWTConfig(): JWTConfig {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }

  return {
    secret,
    issuer: process.env.JWT_ISSUER || 'grounded-api',
    audience: process.env.JWT_AUDIENCE || 'grounded-services',
  }
}

/**
 * Extract JWT token from Authorization header
 */
export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null
  }

  // Support both "Bearer <token>" and just "<token>"
  const parts = authHeader.split(' ')
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1]
  }

  // If no "Bearer" prefix, treat the whole string as the token
  if (parts.length === 1) {
    return parts[0]
  }

  return null
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload {
  const config = getJWTConfig()

  try {
    const decoded = jwt.verify(token, config.secret, {
      issuer: config.issuer,
      audience: config.audience,
      algorithms: ['HS256', 'HS384', 'HS512', 'RS256'],
    }) as JWTPayload

    // Validate required claims
    if (!decoded.sub) {
      throw new AuthenticationError('Token missing required "sub" claim', 'INVALID_TOKEN')
    }

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Token has expired', 'TOKEN_EXPIRED', 401)
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError(
        `Invalid token: ${error.message}`,
        'INVALID_TOKEN',
        401,
      )
    }

    if (error instanceof jwt.NotBeforeError) {
      throw new AuthenticationError('Token not yet valid', 'TOKEN_NOT_ACTIVE', 401)
    }

    // Re-throw AuthenticationError as-is
    if (error instanceof AuthenticationError) {
      throw error
    }

    // Unknown error
    throw new AuthenticationError(
      'Token verification failed',
      'VERIFICATION_FAILED',
      401,
    )
  }
}

/**
 * Authenticate request and extract user context
 */
export function authenticate(authHeader: string | undefined): AuthContext {
  // Extract token from Authorization header
  const token = extractToken(authHeader)
  if (!token) {
    throw new AuthenticationError(
      'Missing authentication token. Provide a valid JWT in the Authorization header.',
      'MISSING_TOKEN',
      401,
    )
  }

  // Verify and decode token
  const payload = verifyToken(token)

  // Build auth context
  return {
    userId: payload.sub,
    organizationId: payload.organizationId,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  }
}

/**
 * Check if user has access to organization
 */
export function authorizeOrganization(
  authContext: AuthContext,
  requestedOrgId: string,
): void {
  // If user has an organizationId in their token, verify it matches
  if (authContext.organizationId && authContext.organizationId !== requestedOrgId) {
    throw new AuthenticationError(
      'Access denied. User does not have permission to access this organization.',
      'ORGANIZATION_ACCESS_DENIED',
      403,
    )
  }

  // ADMIN role can access any organization (optional enhancement)
  if (authContext.role === 'ADMIN') {
    return
  }

  // For now, allow if organizationId in token matches or is not set
  // In production, you'd enforce stricter rules based on your requirements
}

/**
 * Generate a JWT token (for testing/development)
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const config = getJWTConfig()

  return jwt.sign(payload, config.secret, {
    expiresIn: '24h',
    issuer: config.issuer,
    audience: config.audience,
    algorithm: 'HS256',
  })
}
