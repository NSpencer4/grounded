import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { GraphQLClient } from 'graphql-request'
import { LIST_USERS } from '../lib/graphql/queries'
import Auth from '../components/Auth'
import ProfileSetup from '../components/ProfileSetup'
import CustomerChat from '../components/CustomerChat'
import RepChatView from '../components/RepChatView'
import AdminLayout from '../components/AdminLayout'
import type { User } from '@supabase/supabase-js'
import type { User as GraphQLUser } from '../lib/graphql/types'

/**
 * Get GraphQL endpoint and orgId from environment
 */
const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:8787/graphql'
const DEFAULT_ORG_ID = import.meta.env.VITE_DEFAULT_ORG_ID || 'acme-corp'

/**
 * Legacy Profile Type (for existing components)
 * TODO: Migrate components to use GraphQL types
 */
interface Profile {
  id: string
  user_id: string
  email: string
  name: string
  role: 'customer' | 'representative' | 'admin'
  created_at: string
}

export default function Index() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.email!)
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.email!)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userEmail: string) {
    try {
      // Create GraphQL client
      const client = new GraphQLClient(GRAPHQL_ENDPOINT, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Fetch users from GraphQL and find by email
      const response = await client.request<{ users: GraphQLUser[] }>(LIST_USERS, {
        orgId: DEFAULT_ORG_ID,
        limit: 100,
        offset: 0,
      })

      // Find user by email
      const graphqlUser = response.users.find((u) => u.email.toLowerCase() === userEmail.toLowerCase())

      if (graphqlUser) {
        // Convert GraphQL user to legacy profile format
        const legacyProfile: Profile = {
          id: graphqlUser.id,
          user_id: graphqlUser.id,
          email: graphqlUser.email,
          name: graphqlUser.name,
          role: graphqlUser.role.toLowerCase() as 'customer' | 'representative' | 'admin',
          created_at: graphqlUser.createdAt,
        }
        setProfile(legacyProfile)
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  function handleProfileCreated() {
    if (user?.email) {
      loadProfile(user.email)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  if (!profile) {
    return <ProfileSetup onProfileCreated={handleProfileCreated} />
  }

  if (profile.role === 'admin') {
    return <AdminLayout onLogout={handleLogout} userName={profile.name} userRole="Admin" />
  }

  return (
    <>
      {profile.role === 'customer' ? (
        <CustomerChat profile={profile} />
      ) : (
        <RepChatView onLogout={handleLogout} userName={profile.name} />
      )}
    </>
  )
}
