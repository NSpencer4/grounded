import { Database } from './db'
import { AuthContext } from './middleware/auth'

export interface RouteContext {
  db: Database
  auth: AuthContext
  organizationId?: string
  userId?: string
}

export interface RouteResult {
  status: number
  body: unknown
}

export interface ListQuery {
  limit?: number
  offset?: number
  orderBy?: string
  orderDir?: 'asc' | 'desc'
}

export interface ErrorResponse {
  error: string
  message?: string
  details?: unknown
}

export interface SuccessResponse<T = unknown> {
  data: T
  meta?: {
    total?: number
    limit?: number
    offset?: number
  }
}
