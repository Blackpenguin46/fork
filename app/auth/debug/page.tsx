'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/providers'

export default function AuthDebugPage() {
  const { user, loading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    setDebugInfo({
      user: user ? {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        user_metadata: user.user_metadata
      } : null,
      loading,
      timestamp: new Date().toISOString()
    })
  }, [user, loading])

  return (
    <div className="min-h-screen bg-deep-space-blue p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Auth Debug Info</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Current Auth State:</h2>
          <pre className="text-green-400 text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="mt-6 space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white font-semibold">Auth Status:</h3>
            <p className="text-gray-300">
              {loading ? 'Loading...' : user ? `Logged in as ${user.email}` : 'Not logged in'}
            </p>
          </div>

          {user && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-white font-semibold">Email Confirmed:</h3>
              <p className="text-gray-300">
                {user.email_confirmed_at ? 'Yes' : 'No'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}