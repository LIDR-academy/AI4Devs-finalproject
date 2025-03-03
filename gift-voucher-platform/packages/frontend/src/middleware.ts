import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is a protected route
  const isProtectedRoute = pathname.startsWith('/dashboard');
  
  // Get the session token with more detailed options
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  // Log token status for debugging (remove in production)
  console.log(`Path: ${pathname}, Token exists: ${!!token}`);
  
  // Redirect to login if accessing a protected route without being authenticated
  if (isProtectedRoute && !token) {
    console.log('Redirecting to login: No token found for protected route');
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // If the user is authenticated and trying to access login/register pages, redirect to dashboard
  if ((pathname === '/login' || pathname === '/register') && token) {
    console.log('Redirecting to dashboard: User is already authenticated');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If the user is authenticated and on the home page, redirect to dashboard
  if (pathname === '/' && token) {
    console.log('Redirecting from home to dashboard: User is authenticated');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/register'],
}; 