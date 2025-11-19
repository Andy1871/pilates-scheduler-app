import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

console.log("[auth] has GOOGLE_CLIENT_ID:", !!process.env.GOOGLE_CLIENT_ID);
console.log("[auth] has GOOGLE_CLIENT_SECRET:", !!process.env.GOOGLE_CLIENT_SECRET);
console.log("[auth] has AUTH_SECRET:", !!process.env.AUTH_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),       
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token?.sub) session.user.id = token.sub;
      return session;
    },
  },
});
