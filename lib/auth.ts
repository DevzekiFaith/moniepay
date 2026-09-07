// ─────────────────────────────────────────────
// Authentication Configuration & Helpers — AJO
// ─────────────────────────────────────────────

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/api/auth");

      if (isAuthRoute) return true;
      if (isLoggedIn) return true;

      return false;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
});

/**
 * Unified authenticated user resolver.
 * Inspects NextAuth session, Supabase auth session, or database user.
 */
export async function getSessionUser(): Promise<{ id: string; email: string; name?: string | null } | null> {
  try {
    // 1. Check AJO session cookie (primary for direct live logins)
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const sessionUserId = cookieStore.get("ajo_session")?.value;
      if (sessionUserId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: sessionUserId },
          select: { id: true, email: true, name: true },
        });
        if (dbUser) {
          return dbUser;
        }
      }
    } catch {
      // Cookie context might not be available in non-request contexts
    }

    // 2. Check NextAuth session
    const session = await auth();
    if (session?.user?.id) {
      return {
        id: session.user.id,
        email: session.user.email || "",
        name: session.user.name,
      };
    }

    // 3. Check Supabase server session
    try {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          return {
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Member",
          };
        }
      }
    } catch {
      // Cookie context may not always be present
    }

    // Zero mock/demo fallback. If not logged in, user is strictly null.
    return null;
  } catch (err) {
    console.error("getSessionUser resolution error:", err);
    return null;
  }
}
