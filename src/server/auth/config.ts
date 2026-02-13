import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string | null;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    DiscordProvider,
    CredentialsProvider({
      name: "Manual Auth",
      credentials: {
        userId: { label: "User ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.userId) return null;
        
        const user = await db.user.findUnique({
          where: { id: credentials.userId as string },
        });

        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
        };
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub!,
        username: token.username as string | null,
      },
    }),
    jwt: ({ token, user }) => {
      if (user) {
        token.username = user.username;
      }
      return token;
    },
  },
} satisfies NextAuthConfig;
