import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          console.log('Attempting to authenticate with credentials:', {
            email: credentials.email,
            password: '********'
          });

          // Call your backend API for authentication
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/users/login`,
            {
              email: credentials.email,
              password: credentials.password,
            }
          );

          console.log('Authentication response:', {
            success: response.data.success,
            userId: response.data.user?.id,
            userRole: response.data.user?.role
          });

          if (response.data && response.data.success) {
            // Return the user object and token
            return {
              id: response.data.user.id,
              email: response.data.user.email,
              name: response.data.user.name,
              role: response.data.user.role,
              accessToken: response.data.token,
            };
          }
          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Add user info to the token when signing in
      if (user) {
        console.log('Adding user info to JWT token:', {
          id: user.id,
          role: user.role,
          accessToken: user.accessToken
        });

        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user info and access token to the session
      if (token) {
        console.log('Adding token info to session:', {
          id: token.id,
          role: token.role,
          hasAccessToken: !!token.accessToken
        });

        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          role: token.role as string,
        };
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions); 