import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const source =
          process.env.NEXT_PUBLIC_LOGIN_SOURCE?.trim() || 'myridepartner';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
          method: 'POST',
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            source,
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await res.json();

        if (res.ok && data.user) {
          // Check for SUPER_ADMIN role
          if (data.user.role !== 'SUPER_ADMIN') {
            throw new Error('Unauthorized: Only Super Admins can access backoffice');
          }
          return {
            id: data.user.id.toString(),
            email: data.user.email,
            name: data.user.username,
            role: data.user.role,
            accessToken: data.access_token,
          };
        }
        return null;
      },
    }),
  ],
  secret: process.env.AUTH_SECRET || 'fallback-secret',
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).role = token.role;
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});
