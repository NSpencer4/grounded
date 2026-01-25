import { z } from 'zod'

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string
  message: string
}

/**
 * Validation result
 */
export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: ValidationError[]
}

/**
 * Validate request body against Zod schema
 * Returns parsed and typed data on success, or validation errors
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, body: unknown): ValidationResult<T> {
  const result = schema.safeParse(body)

  if (result.success) {
    return {
      success: true,
      data: result.data,
    }
  }

  const errors: ValidationError[] = result.error.errors.map((err) => ({
    field: err.path.join('.') || 'root',
    message: err.message,
  }))

  return {
    success: false,
    errors,
  }
}

/**
 * Validate that organization ID is provided
 */
export function requireOrganizationId(orgId: string | undefined): asserts orgId is string {
  if (!orgId) {
    throw new Error('Organization ID is required')
  }
}

/**
 * Validate UUID format
 */
export function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Validate and parse pagination parameters
 */
export function parsePaginationParams(query: Record<string, string | undefined>) {
  const limit = Math.min(parseInt(query.limit || '50', 10), 100)
  const offset = parseInt(query.offset || '0', 10)

  return {
    limit: isNaN(limit) ? 50 : limit,
    offset: isNaN(offset) ? 0 : offset,
  }
}
