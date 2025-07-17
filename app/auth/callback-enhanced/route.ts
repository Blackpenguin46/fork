/**
 * Enhanced Authentication Callback Handler
 * Handles email verification with seamless user experience
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { ProfilesService } from '@/lib/services/profiles'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  
  console.log('Enhanced auth callback received:', { 
    code: code ? 'present' : 'missing',
    error,
    errorDescription,
    url: requestUrl.toString() 
  })

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const errorMessage = errorDescription || 'Authentication failed'
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=${encodeURIComponent(errorMessage)}`
    )
  }

  if (!code) {
    console.error('No authorization code received')
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=${encodeURIComponent('Invalid verification link')}`
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Exchange the code for a session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      
      // Handle specific error types
      let errorMessage = 'Email verification failed'
      if (exchangeError.message.includes('expired')) {
        errorMessage = 'Verification link has expired. Please request a new one.'
      } else if (exchangeError.message.includes('invalid')) {
        errorMessage = 'Invalid verification link. Please try again.'
      }
      
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=${encodeURIComponent(errorMessage)}`
      )
    }

    if (!data.user || !data.session) {
      console.error('No user or session returned after code exchange')
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=${encodeURIComponent('Verification failed. Please try again.')}`
      )
    }

    const user = data.user
    console.log('Email verification successful for:', user.email)

    // Ensure user profile exists
    try {
      const profileResult = await ProfilesService.getOrCreateProfile({
        id: user.id,
        email: user.email!,
        username: user.user_metadata?.username,
        full_name: user.user_metadata?.full_name
      })

      if (!profileResult.success) {
        console.error('Failed to create/get user profile:', profileResult.error)
        // Continue anyway - profile can be created later
      }
    } catch (profileError) {
      console.error('Profile creation error:', profileError)
      // Continue anyway - profile can be created later
    }

    // Determine redirect destination
    let redirectPath = '/dashboard'
    
    // Check if this is a new user (just verified email)
    const isNewUser = !user.email_confirmed_at || 
                     (new Date(user.email_confirmed_at).getTime() > Date.now() - 60000) // Within last minute

    if (isNewUser) {
      redirectPath = '/dashboard?welcome=true&verified=true'
    } else {
      redirectPath = '/dashboard?verified=true'
    }

    // Check for custom redirect
    const redirectTo = requestUrl.searchParams.get('redirect_to')
    if (redirectTo && redirectTo.startsWith('/')) {
      redirectPath = redirectTo
    }

    // Create response with proper headers
    const response = NextResponse.redirect(`${requestUrl.origin}${redirectPath}`)
    
    // Set security headers
    response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    // Set success cookie for client-side handling
    response.cookies.set('auth_success', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 // 1 minute
    })

    return response
    
  } catch (error) {
    console.error('Auth callback exception:', error)
    
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=${encodeURIComponent('An unexpected error occurred during verification')}`
    )
  }
}

// Handle POST requests for manual verification
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })
    
    // Resend verification email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback-enhanced`
      }
    })

    if (error) {
      console.error('Resend verification error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Verification email sent successfully'
    })

  } catch (error) {
    console.error('Resend verification exception:', error)
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    )
  }
}