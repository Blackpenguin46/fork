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

    // Define public routes (no authentication required)
    const publicRoutes = [
      '/', // Landing page
      '/auth/login', 
      '/auth/register', 
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
      '/auth/callback',
      '/about',
      '/contact',
      '/privacy',
      '/terms',
      '/pricing' // Allow viewing pricing without auth
    ]
    
    // Define routes that require authentication
    const protectedRoutes = ['/dashboard', '/profile', '/settings']
    const contentRoutes = ['/community', '/insights', '/academy'] // Content requires auth
    const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']
    
    // Check route types
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isContentRoute = contentRoutes.some(route => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    // Debug logging for dashboard access
    if (pathname.startsWith('/dashboard')) {
      console.log('Dashboard access attempt:', {
        hasSession: !!session,
        userId: session?.user?.id,
        verified: req.nextUrl.searchParams.get('verified'),
        pathname
      })
    }

    // If accessing content or protected routes without session, redirect to login
    if ((isContentRoute || isProtectedRoute) && !session) {
      // Special case: allow dashboard access for auto-login flow after email verification
      if (pathname === '/dashboard' && 
          req.nextUrl.searchParams.get('verified') === 'true' && 
          req.nextUrl.searchParams.get('auto_login') === 'true') {
        console.log('Allowing dashboard access for auto-login flow after email verification')
        return res
      }
      
      console.log('Redirecting to login - no session for content/protected route:', pathname)
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