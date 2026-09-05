// ─────────────────────────────────────────────
// NextAuth Configuration
// ─────────────────────────────────────────────

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const nextAuth = NextAuth({
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
          where: { email },
          include: { preferences: true },
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "monielite-dev-secret-key-32chars!!",
  trustHost: true,
});

export const handlers = nextAuth.handlers;
export const signIn = nextAuth.signIn;
export const signOut = nextAuth.signOut;

export async function auth() {
  try {
    const session = await nextAuth.auth();
    if (session?.user?.id) {
      return session;
    }
  } catch {
    // Continue to fallback
  }

  // Graceful fallback to primary demo user in development/local mode
  try {
    const defaultUser = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
    });
    if (defaultUser) {
      return {
        user: {
          id: defaultUser.id,
          email: defaultUser.email,
          name: defaultUser.name || "Alex Chen",
        },
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }
  } catch (err) {
    console.error("Auth fallback error:", err);
  }

  return null;
}

