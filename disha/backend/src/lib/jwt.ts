import crypto from 'crypto';
import type { UserRole } from '@prisma/client';

export interface TokenPayload {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  parentConsentVerified: boolean;
  exp?: number;
}

const DEFAULT_SECRET = process.env.AUTH_SECRET || 'development-secret-key-change-in-production-min-32-chars-long';

export function signJwt(payload: Omit<TokenPayload, 'exp'>, expiresInSeconds = 86400 * 7): string {
  const secret = process.env.AUTH_SECRET || DEFAULT_SECRET;
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload: TokenPayload = { ...payload, exp };

  const encode = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const h = encode(header);
  const p = encode(fullPayload);
  const sig = crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest('base64url');

  return `${h}.${p}.${sig}`;
}

export function verifyJwt<T = TokenPayload>(token: string): T | null {
  try {
    const secret = process.env.AUTH_SECRET || DEFAULT_SECRET;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [h, p, sig] = parts;
    const expectedSig = crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest('base64url');

    // Constant-time comparison
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload as T;
  } catch {
    return null;
  }
}
