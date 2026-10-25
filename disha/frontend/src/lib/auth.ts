import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { apiClient } from '@/lib/api-client';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const res = await apiClient.auth.login({
          email: credentials.email as string,
          password: credentials.password as string,
        });

        if (!res.success || !res.data) {
          return null;
        }

        const { user, token } = res.data;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          parentConsentVerified: user.parentConsentVerified,
          backendToken: token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.parentConsentVerified = (user as any).parentConsentVerified;
        token.backendToken = (user as any).backendToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).parentConsentVerified = token.parentConsentVerified;
        (session.user as any).backendToken = token.backendToken;
      }
      return session;
    },
  },
});
