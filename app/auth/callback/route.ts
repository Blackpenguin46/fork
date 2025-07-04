import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  console.log('Auth callback received:', { 
    code: code ? 'present' : 'missing', 
    url: requestUrl.toString() 
  })

  if (code) {
    try {
      const supabase = createRouteHandlerClient({ cookies })
      
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=${encodeURIComponent('Email verification failed. Please try again.')}`)
      }

      if (data.user) {
        console.log('Email verification successful for:', data.user.email)
        
        // Always redirect to login page after email verification
        // This ensures clean authentication flow
        return NextResponse.redirect(`${requestUrl.origin}/auth/login?message=${encodeURIComponent('Email verified successfully! Please sign in to access your account.')}`)
      }
      
    } catch (error) {
      console.error('Auth callback exception:', error)
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${requestUrl.origin}/auth/login`)
}