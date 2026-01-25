/**
 * Authentication Types
 * 
 * Types for Supabase auth-only operations.
 * For data types, see app/lib/graphql/types.ts
 */

import type { User, Session } from '@supabase/supabase-js'

export type { User, Session }

/**
 * Auth state for the application
 */
export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

/**
 * User profile information
 * This should match the user data from your GraphQL API
 */
export interface UserProfile {
  id: string
  email: string
  name: string
  role: 'customer' | 'representative' | 'admin'
  createdAt: string
  updatedAt?: string
}

/**
 * Sign up credentials
 */
export interface SignUpCredentials {
  email: string
  password: string
  name?: string
}

/**
 * Sign in credentials
 */
export interface SignInCredentials {
  email: string
  password: string
}
