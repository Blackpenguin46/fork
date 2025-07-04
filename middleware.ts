import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = req.nextUrl

  // Check if Supabase is configured
  const hasSupabaseConfig = (
    (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    (process.env.STORAGE_NEXT_PUBLIC_SUPABASE_URL && process.env.STORAGE_NEXT_PUBLIC_SUPABASE_ANON_KEY)
  )
  
  if (!hasSupabaseConfig) {
    console.warn('Supabase not configured - skipping auth checks')
    return res
  }

  try {
    const supabase = createMiddlewareClient({ req, res })
    const { data: { session } } = await supabase.auth.getSession()

    // Define routes
    const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/callback', '/auth/callback-new', '/pricing', '/about', '/contact', '/terms', '/privacy']
    const protectedRoutes = ['/dashboard', '/profile', '/settings']
    const contentRoutes = ['/community', '/insights', '/academy']

    const isPublicRoute = publicRoutes.some(route => pathname === route)
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isContentRoute = contentRoutes.some(route => pathname.startsWith(route))
    const isAuthRoute = pathname.startsWith('/auth/')

    // If accessing protected content without valid session, redirect to login
    if ((isProtectedRoute || isContentRoute) && !session?.user?.email_confirmed_at) {
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If accessing auth routes with valid session, redirect to dashboard
    if (isAuthRoute && session?.user?.email_confirmed_at && !pathname.startsWith('/auth/callback')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}