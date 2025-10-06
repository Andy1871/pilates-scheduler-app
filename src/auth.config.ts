import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const baseAuthConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        (session.user as any).id = (user?.id as string) ?? (token?.sub as string);
      }
      return session;
    },
  },
  debug: true, 
};
