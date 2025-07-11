'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
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

  const signOut = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut()
      }
      setUser(null)
      
      // Clear any browser storage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    // If Supabase is not configured, just set loading to false
    if (!supabase) {
      console.warn('Supabase not configured')
      setLoading(false)
      return
    }

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing authentication...')
        
        // Get current session
        const { data: { session }, error } = await supabase!.auth.getSession()
        
        if (error) {
          console.error('❌ Session error:', error)
          setUser(null)
          setLoading(false)
          return
        }

        console.log('📋 Session check result:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          emailConfirmed: !!session?.user?.email_confirmed_at,
          sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'
        })
        
        // Set user if valid session exists
        if (session?.user) {
          console.log('✅ Setting authenticated user:', session.user.email)
          setUser(session.user)
        } else {
          console.log('❌ No valid session found')
          setUser(null)
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        setUser(null)
      } finally {
        console.log('🏁 Auth initialization complete')
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', {
          event,
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email
        })
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out')
          setUser(null)
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            console.log('User signed in:', session.user.email)
            setUser(session.user)
          }
        } else if (session?.user) {
          console.log('Session exists, setting user:', session.user.email)
          setUser(session.user)
        } else {
          console.log('No valid session, clearing user')
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    loading,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}