import { UserRole } from '@prisma/client';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      parentConsentVerified: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    role: UserRole;
    parentConsentVerified: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    parentConsentVerified: boolean;
  }
}
