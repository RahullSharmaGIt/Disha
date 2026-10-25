import { DefaultSession } from 'next-auth';

export type UserRole = 'STUDENT' | 'CONTRIBUTOR' | 'MODERATOR' | 'ADMIN';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      parentConsentVerified: boolean;
      backendToken?: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: UserRole;
    parentConsentVerified: boolean;
    backendToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    parentConsentVerified: boolean;
    backendToken?: string;
  }
}
