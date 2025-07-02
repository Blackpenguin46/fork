'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function AuthDebug() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkUserStatus = async () => {
    if (!email) return
    setLoading(true)
    try {
      if (!supabase) {
        setResults({ error: 'Supabase not available' })
        return
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      // Try to get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()

      setResults({
        currentAuthUser: {
          id: user?.id,
          email: user?.email,
          emailConfirmed: user?.email_confirmed_at,
          userMetadata: user?.user_metadata,
          appMetadata: user?.app_metadata,
          createdAt: user?.created_at,
          userError: userError?.message
        },
        session: {
          exists: !!session,
          sessionError: sessionError?.message
        },
        profileData: {
          profile,
          profileError: profileError?.message
        },
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setResults({ error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    try {
      if (!supabase) {
        setResults({ error: 'Supabase not available' })
        return
      }

      console.log('Debug login attempt for:', email)
      
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Raw Supabase login result:', result)

      setResults({
        success: !result.error,
        user: result.data?.user ? {
          id: result.data.user.id,
          email: result.data.user.email,
          emailConfirmed: result.data.user.email_confirmed_at,
          lastSignIn: result.data.user.last_sign_in_at,
          metadata: result.data.user.user_metadata
        } : null,
        session: !!result.data?.session,
        error: result.error ? {
          message: result.error.message,
          status: (result.error as any).status,
          name: result.error.name
        } : null,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setResults({ error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Auth Debug Tool</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="your@email.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password (for login test):</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="password"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={checkUserStatus}
            disabled={loading || !email}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Check User Status
          </button>
          
          <button
            onClick={testLogin}
            disabled={loading || !email || !password}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            Test Login
          </button>
        </div>
        
        {loading && <p>Loading...</p>}
        
        {results && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">Results:</h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}