import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Client (Auth Only)
 * 
 * This client is configured for authentication purposes only.
 * All data operations should use GraphQL via the Gateway API.
 * 
 * Available auth methods:
 * - supabase.auth.signUp()
 * - supabase.auth.signInWithPassword()
 * - supabase.auth.signOut()
 * - supabase.auth.getSession()
 * - supabase.auth.getUser()
 * - supabase.auth.onAuthStateChange()
 * 
 * For data operations, use GraphQL:
 * - See app/lib/graphql/ for queries and mutations
 * - See app/routes/ for Remix loaders and actions
 */

const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.SUPABASE_PUBLIC_KEY || process.env.SUPABASE_PUBLIC_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client without database types (auth only)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
