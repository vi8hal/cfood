import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/auth';

const protectedRoutes = ['/dashboard', '/recipes/new'];
const publicRoutes = ['/login', '/signup', '/'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

  // Try to get the session from the cookie
  const session = await getSession();

  if (isProtectedRoute && !session?.userId) {
    // If user is not authenticated and tries to access a protected route,
    // redirect them to the login page.
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  if (session?.userId && publicRoutes.includes(path)) {
     // If user is authenticated and tries to access a public-only route,
     // redirect them to the dashboard.
     // return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }
  
  // If the user is authenticated, update the session cookie to refresh its expiration.
  if (session?.userId) {
      return await updateSession(request);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
