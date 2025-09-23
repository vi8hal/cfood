import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/auth';

const protectedRoutes = ['/dashboard', '/recipes/new', '/profile'];
const publicOnlyRoutes = ['/login', '/signup'];

export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicOnlyRoute = publicOnlyRoutes.includes(path);

  // Try to get the session from the cookie
  const session = await getSession();

  if (isProtectedRoute && !session?.user) {
    // If user is not authenticated and tries to access a protected route,
    // redirect them to the login page.
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  if (session?.user && isPublicOnlyRoute) {
     // If user is authenticated and tries to access a public-only route (like login),
     // redirect them to the dashboard.
     return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }
  
  // If the user is authenticated, attempt to update the session cookie to refresh its expiration.
  // This will only create a new response if a session exists.
  if (session?.user) {
      const response = await updateSession(request);
      return response || NextResponse.next();
  }

  // Otherwise, continue with the request as is.
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
