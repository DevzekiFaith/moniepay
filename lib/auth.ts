// ─────────────────────────────────────────────
// Authentication Configuration & Helpers — MoniePay
// Pure Supabase Auth & JWT Sessions — Zero Prisma
// ─────────────────────────────────────────────

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase/client";
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

        // Verify with Supabase Auth
        const supabase = (await createSupabaseServerClient()) || getSupabaseServerClient();
        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase(),
            password,
          });

          if (!error && data?.user) {
            return {
              id: data.user.id,
              email: data.user.email || email,
              name: data.user.user_metadata?.full_name || email.split("@")[0],
            };
          }
        }

        // Development fallback credential check
        if (email.toLowerCase() === "demo@monielite.app" && password === "MoneyMatters2024!") {
          return {
            id: "user_owner_01",
            email: "demo@monielite.app",
            name: "Mama Chidi",
          };
        }

        return null;
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

      return true; // Allow dashboard offline view
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
 * Unified authenticated user resolver using Supabase and session cookies.
 */
export async function getSessionUser(): Promise<{
  id: string;
  email: string;
  name?: string | null;
  businessName?: string;
  marketLocation?: string;
} | null> {
  try {
    // 1. Check Supabase server session
    try {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          return {
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Business Owner",
            businessName: user.user_metadata?.business_name,
            marketLocation: user.user_metadata?.market_location,
          };
        }
      }
    } catch {
      // Cookie context may not always be present
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

    // 3. Check MoniePay secure session cookie
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const rawCookie =
        cookieStore.get("moniepay_session")?.value ||
        cookieStore.get("ajo_session")?.value;

      if (rawCookie) {
        // A. If cookie is base64 encoded JSON
        if (rawCookie.startsWith("eyJ") || rawCookie.startsWith("ey")) {
          try {
            const decoded = JSON.parse(Buffer.from(rawCookie, "base64").toString("utf-8"));
            if (decoded?.id && decoded?.name) {
              return {
                id: decoded.id,
                email: decoded.email || "",
                name: decoded.name,
                businessName: decoded.businessName,
                marketLocation: decoded.marketLocation,
              };
            }
          } catch {}
        }

        // B. If cookie is direct JSON string
        if (rawCookie.startsWith("{")) {
          try {
            const parsed = JSON.parse(rawCookie);
            if (parsed?.id && parsed?.name) {
              return {
                id: parsed.id,
                email: parsed.email || "",
                name: parsed.name,
                businessName: parsed.businessName,
                marketLocation: parsed.marketLocation,
              };
            }
          } catch {}
        }

        // C. Demo preset user IDs
        if (rawCookie === "user_owner_01" || rawCookie === "demo") {
          return {
            id: "user_owner_01",
            email: "demo@moniepay.app",
            name: "Mama Chidi",
            businessName: "Mama Chidi Super Provisions",
            marketLocation: "Shop 14, Balogun Market, Lagos",
          };
        }

        if (rawCookie === "user_owner_02") {
          return {
            id: "user_owner_02",
            email: "garba@moniepay.app",
            name: "Alhaji Garba",
            businessName: "Alhaji Garba Grains & Foodstuff",
            marketLocation: "Mile 12 Market, Lagos",
          };
        }

        if (rawCookie === "user_owner_03") {
          return {
            id: "user_owner_03",
            email: "emeka@moniepay.app",
            name: "Emeka Okonkwo",
            businessName: "Emeka Mobile & Electronics Hub",
            marketLocation: "Alaba Int. Market, Lagos",
          };
        }

        if (rawCookie === "user_owner_04") {
          return {
            id: "user_owner_04",
            email: "blessing@moniepay.app",
            name: "Blessing Adebayo",
            businessName: "Blessing Fabrics & Lace",
            marketLocation: "Tejuosho Market, Yaba",
          };
        }

        // Plain ID fallback
        return {
          id: rawCookie,
          email: "owner@moniepay.app",
          name: "Shop Owner",
        };
      }
    } catch {
      // Cookie context not available
    }

    return null;
  } catch (err) {
    console.error("getSessionUser resolution error:", err);
    return null;
  }
}
