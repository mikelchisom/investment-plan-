import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/trade/:path*",
    "/plans/:path*",
    "/portfolio/:path*",
    "/transactions/:path*",
    "/profile/:path*",
    "/deposit/:path*",
    "/notifications/:path*",
    "/investment/:path*",
    "/admin/:path*",
  ],
};
