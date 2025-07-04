import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  
  console.log('Auth callback received:', { 
    code: code ? 'present' : 'missing', 
    type, 
    url: requestUrl.toString(),
    searchParams: Object.fromEntries(requestUrl.searchParams)
  })

  if (code) {
    try {
      const supabase = createRouteHandlerClient({ cookies })
      
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        let errorMessage = 'Authentication failed. Please try again.'
        
        // Provide more specific error messages
        if (error.message.includes('email')) {
          errorMessage = 'Please verify your email address before signing in.'
        } else if (error.message.includes('expired')) {
          errorMessage = 'Your verification link has expired. Please request a new one.'
        } else if (error.message.includes('invalid')) {
          errorMessage = 'Invalid verification link. Please request a new one.'
        }
        
        return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=auth_error&message=${encodeURIComponent(errorMessage)}`)
      }

      if (data.user && data.session) {
        console.log('User session created successfully:', {
          userId: data.user.id,
          email: data.user.email,
          emailConfirmed: !!data.user.email_confirmed_at,
          sessionExists: !!data.session,
          accessToken: !!data.session.access_token
        })
        
        // Email verification successful - user should be auto-logged in
        // Redirect to dashboard with verified flag for smooth UX
        const response = NextResponse.redirect(`${requestUrl.origin}/dashboard?verified=true&auto_login=true`)
        
        // Ensure session cookies are properly set for auto-login
        return response
      } else {
        console.log('No user or session in callback data:', { user: !!data.user, session: !!data.session })
        // Fallback: redirect to login page if session creation failed
        return NextResponse.redirect(`${requestUrl.origin}/auth/login?message=${encodeURIComponent('Please sign in to complete verification')}`)
      }
      
    } catch (error) {
      console.error('Auth callback exception:', error)
      const errorMessage = 'An unexpected error occurred during authentication. Please try signing in again.'
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=callback_error&message=${encodeURIComponent(errorMessage)}`)
    }
  }

  // No code provided
  console.log('No code provided in callback')
  return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=no_code`)
}