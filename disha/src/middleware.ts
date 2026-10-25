import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { UserRole } from '@prisma/client';

const protectedRoutes: Record<string, UserRole[]> = {
  '/dashboard': ['STUDENT', 'CONTRIBUTOR', 'MODERATOR', 'ADMIN'],
  '/recommendations': ['STUDENT', 'ADMIN'],
  '/admin': ['ADMIN', 'MODERATOR'],
  '/admin/careers': ['ADMIN', 'MODERATOR'],
  '/admin/moderation': ['ADMIN', 'MODERATOR'],
  '/admin/users': ['ADMIN'],
  '/admin/contributors': ['ADMIN'],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Check if route matches any protected prefix
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

    const userRole = session.user.role;
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
    '/recommendations/:path*',
    '/admin/:path*',
  ],
};
