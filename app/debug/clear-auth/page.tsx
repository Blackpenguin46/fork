'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function ClearAuthPage() {
  const [cleared, setCleared] = useState(false)

  const clearAllAuthData = async () => {
    try {
      // Sign out from Supabase
      if (supabase) {
        await supabase.auth.signOut()
      }

      // Clear all browser storage
      if (typeof window !== 'undefined') {
        // Clear localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth')) {
            localStorage.removeItem(key)
          }
        })

        // Clear sessionStorage
        sessionStorage.clear()

        // Clear cookies
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
      }

      setCleared(true)
    } catch (error) {
      console.error('Error clearing auth data:', error)
    }
  }

  useEffect(() => {
    // Auto-clear on page load
    clearAllAuthData()
  }, [])

  return (
    <div className="min-h-screen bg-deep-space-blue flex items-center justify-center">
      <div className="max-w-md mx-auto p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
        <h1 className="text-2xl font-bold text-white mb-4">Clear Authentication Data</h1>
        
        {cleared ? (
          <div className="space-y-4">
            <p className="text-green-400">✅ All authentication data cleared successfully!</p>
            <p className="text-gray-300 text-sm">
              All browser storage, cookies, and session data have been removed.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-cyan-500 hover:bg-cyan-600"
            >
              Go to Homepage
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-300">Clearing authentication data...</p>
            <Button 
              onClick={clearAllAuthData}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              Manual Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}