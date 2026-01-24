import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Auth from '../components/Auth'
import ProfileSetup from '../components/ProfileSetup'
import CustomerChat from '../components/CustomerChat'
import RepChatView from '../components/RepChatView'
import AdminLayout from '../components/AdminLayout'
import type { Database } from '../lib/database.types'
import type { User } from '@supabase/supabase-js'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function Index() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        throw error
      }
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleProfileCreated() {
    if (user) {
      loadProfile(user.id)
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
