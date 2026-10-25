import { NextRequest } from 'next/server';
import { verifyJwt, TokenPayload } from './jwt';
import type { UserRole } from '@prisma/client';

export function getAuthUser(req: NextRequest): TokenPayload | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  const token = parts[1];
  return verifyJwt<TokenPayload>(token);
}

export function requireAuth(req: NextRequest, allowedRoles?: UserRole[]): { user: TokenPayload } | { error: string; status: number } {
  const user = getAuthUser(req);
  if (!user) {
    return { error: 'Unauthorized: Authentication required', status: 401 };
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return { error: 'Forbidden: Insufficient permissions', status: 403 };
    }
  }

  return { user };
}
