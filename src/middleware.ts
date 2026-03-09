import NextAuth from 'next-auth';
import { authConfig } from '@/server/auth/config';

export default NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    authorized({ auth, request }) {
      if (request.nextUrl.pathname.includes('/invites/')) {
        return true;
      }
      return !!auth?.user;
    },
  },
  pages: {
    signIn: '/login',
  },
}).auth;

export const config = {
  matcher: ['/home', '/leaderboards', '/clubs', '/settings', '/notifications'],
};
