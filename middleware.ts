import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth(async function middleware(req: any) {
  const session = req.auth;
  const pathname = req.nextUrl.pathname;
  
  // Allow access to auth pages for non-authenticated users
  if (pathname.startsWith('/auth/')) {
    if (session && !pathname.includes('error')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }
  
  // Public pages that don't require auth
  const publicPages = ['/', '/about', '/privacy', '/terms'];
  if (publicPages.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Protected routes
  if (!session) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url));
  }
  
  // Guest users can only access chapter 1
  if (session.user.isGuest && pathname.startsWith('/story/')) {
    // Parse chapter from URL or check progress
    // For now, allow access to continue development
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};