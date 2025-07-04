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

    // Force clear any invalid sessions on startup
    const forceCleanStart = async () => {
      try {
        // Always start fresh - sign out any existing sessions
        await supabase!.auth.signOut()
        
        // Clear all browser storage
        if (typeof window !== 'undefined') {
          localStorage.clear()
          sessionStorage.clear()
        }
        
        // Small delay to ensure cleanup
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Now check for valid session
        const { data: { session } } = await supabase!.auth.getSession()
        
        console.log('Fresh session check:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          emailConfirmed: !!session?.user?.email_confirmed_at
        })
        
        // Only set user if they have a confirmed email
        if (session?.user?.email_confirmed_at) {
          setUser(session.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Session cleanup error:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    forceCleanStart()

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, !!session?.user)
        
        if (event === 'SIGNED_OUT') {
          setUser(null)
        } else if (session?.user?.email_confirmed_at) {
          setUser(session.user)
        } else {
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