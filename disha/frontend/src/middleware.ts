import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const protectedRoutes: Record<string, string[]> = {
  '/dashboard': ['STUDENT', 'CONTRIBUTOR', 'MODERATOR', 'ADMIN'],
  '/admin': ['ADMIN', 'MODERATOR'],
  '/admin/careers': ['ADMIN', 'MODERATOR'],
  '/admin/moderation': ['ADMIN', 'MODERATOR'],
  '/admin/contributors': ['ADMIN', 'MODERATOR', 'CONTRIBUTOR'],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const matchedRoute = Object.keys(protectedRoutes).find((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (matchedRoute) {
    const session = req.auth;

    if (!session?.user) {
      const loginUrl = new URL('/login', req.nextUrl.origin);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = (session.user as any).role;
    const allowedRoles = protectedRoutes[matchedRoute];

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/', req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};
