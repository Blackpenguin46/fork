'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase not configured')
        setUser(null)
        return
      }
      
      // First try to get session, then user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error('Session error in refresh:', sessionError)
      }
      
      if (session?.user) {
        console.log('Refreshed user from session:', session.user.id)
        setUser(session.user)
      } else {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) {
          console.error('User error in refresh:', userError)
        }
        console.log('Refreshed user directly:', user?.id || 'none')
        setUser(user)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase not configured')
        setUser(null)
        return
      }
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    // Check if supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured - auth functionality disabled')
      setLoading(false)
      return
    }

    // Get initial session first
    const getInitialSession = async () => {
      try {
        if (!supabase) {
          console.log('Supabase not available in auth provider')
          setUser(null)
          setLoading(false)
          return
        }
        
        console.log('Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setUser(null)
        } else {
          console.log('Initial session:', { 
            hasUser: !!session?.user, 
            userId: session?.user?.id,
            email: session?.user?.email,
            emailConfirmed: session?.user?.email_confirmed_at,
            sessionValid: !!(session?.access_token && session?.user)
          })
          
          // Only set user if we have a valid session with access token
          if (session?.access_token && session?.user) {
            setUser(session.user)
          } else {
            console.log('No valid session found, clearing user state')
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log('Auth state change:', { 
          event, 
          hasUser: !!session?.user, 
          userId: session?.user?.id,
          email: session?.user?.email 
        })
        
        // Handle all auth state changes with strict validation
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.access_token && session?.user) {
            setUser(session.user)
          } else {
            setUser(null)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        } else if (event === 'INITIAL_SESSION') {
          if (session?.access_token && session?.user) {
            setUser(session.user)
          } else {
            setUser(null)
          }
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Auto-refresh when URL contains verification parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('verified') === 'true' && !user && !loading) {
        console.log('Auto-refreshing user after email verification')
        setTimeout(() => refreshUser(), 500)
      }
    }
  }, [user, loading, refreshUser])

  const value = {
    user,
    loading,
    signOut,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}