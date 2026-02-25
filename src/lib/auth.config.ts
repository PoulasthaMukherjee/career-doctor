import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// This is the edge-compatible auth config (no Prisma imports).
// Used by middleware for lightweight JWT checks.
export const authConfig = {
    session: { strategy: "jwt" as const },
    pages: {
        signIn: "/login",
    },
    providers: [
        // Credential provider needs a stub here for middleware;
        // the real authorize logic lives in auth.ts
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize() {
                // This is never called from middleware.
                // The real authorize is in auth.ts.
                return null;
            },
        }),
    ],
    callbacks: {
        async authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isAuthPage =
                nextUrl.pathname.startsWith("/login") ||
                nextUrl.pathname.startsWith("/register");

            if (isAuthPage) {
                if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
                return true; // Allow access to auth pages
            }

            return isLoggedIn; // Redirect unauthenticated users to login
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        },
    },
} satisfies NextAuthConfig;
