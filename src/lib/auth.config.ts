import type { NextAuthConfig } from "next-auth";

// Edge-safe config: no Prisma / bcrypt imports here, so this can run in
// middleware. The Credentials provider (which needs both) is added in
// src/lib/auth.ts, which is only used in the Node runtime (route handlers,
// server actions, server components).
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const role = auth?.user?.role;

      const isAdminRoute = pathname.startsWith("/admin");
      const isUserRoute =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/plans") ||
        pathname.startsWith("/portfolio") ||
        pathname.startsWith("/transactions") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/deposit") ||
        pathname.startsWith("/notifications") ||
        pathname.startsWith("/investment");

      if (isAdminRoute) {
        return isLoggedIn && role === "ADMIN";
      }

      if (isUserRoute) {
        return isLoggedIn;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
