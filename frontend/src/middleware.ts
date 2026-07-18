import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // If no session token or refresh token is found in cookies, redirect to the landing page with login prompt
  if (!token && !refreshToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('login', 'true');
    const response = NextResponse.redirect(url);
    
    // Add cache control headers to the redirect response to ensure it isn't cached
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  // Continue to page, but inject anti-cache headers so browser Back button won't restore sensitive content
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

export const config = {
  matcher: [
    '/dashboard',
    '/student/:path*',
    '/mentor/:path*',
    '/admin/:path*',
  ],
};
