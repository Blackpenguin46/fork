import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Check if Supabase is configured (check both naming conventions)
  const hasSupabaseConfig = (
    (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    (process.env.STORAGE_NEXT_PUBLIC_SUPABASE_URL && process.env.STORAGE_NEXT_PUBLIC_SUPABASE_ANON_KEY)
  )
  
  if (!hasSupabaseConfig) {
    console.warn('Supabase not configured in middleware - skipping auth checks')
    return res
  }

  try {
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired - required for Server Components
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const { pathname } = req.nextUrl

    // Define protected and auth-only routes
    const protectedRoutes = ['/dashboard', '/profile', '/settings']
    const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']
    
    // Check if the current path is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    // If accessing protected route without session, redirect to login
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If accessing auth routes with active session, redirect to dashboard
    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Handle email verification redirects
    if (pathname === '/auth/verify-email' && session?.user?.email_confirmed_at) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // If middleware fails, just continue without auth checks
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}