import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// List of routes that require authentication
const protectedRoutes = ['/dashboard', '/appointments', '/profile', '/dashboard/profile', '/dashboard/appointments']

// API routes that require authentication (excluding public API endpoints)
const protectedApiRoutes = ['/api/users', '/api/appointments', '/api/services', '/api/professionals']

// List of routes that should be accessible only if not authenticated
const authRoutes = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for auth callback route to prevent interference with Supabase auth flow
  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next()
  }
  
  // Check if there's a session cookie directly - more reliable than using Supabase client in middleware
  // This avoids potential race conditions with session establishment
  const hasSessionCookie = request.cookies.has('supabase-auth-token') || 
                          request.cookies.has('sb-access-token') || 
                          request.cookies.has('sb-refresh-token')
  
  // Check if the path is a protected route or a protected API route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) ||
    (pathname.startsWith('/api') && protectedApiRoutes.some(route => pathname.startsWith(route)))
  
  // For dashboard access right after login, check for special query param
  const isPostLoginAccess = pathname.startsWith('/dashboard') && 
                          request.nextUrl.searchParams.has('message') && 
                          request.nextUrl.searchParams.get('message')?.includes('confirmed')
  
  // If it's a post-login access with success message, allow it through
  if (isPostLoginAccess) {
    console.log('Allowing post-login access to dashboard with success message')
    return NextResponse.next()
  }
  
  // If user is accessing a protected route and no session cookie is found, redirect to login
  if (isProtectedRoute && !hasSessionCookie) {
    console.log('No session cookie found, redirecting to login')
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  // If user is accessing an auth route and has a session cookie, redirect to dashboard
  if (authRoutes.includes(pathname) && hasSessionCookie) {
    console.log('Session cookie found, redirecting to dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

// Configure matcher for middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
