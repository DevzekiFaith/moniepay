"use client";

// ─────────────────────────────────────────────────────────────────
// AJO — Authentication & User Identity Context
// Real user authentication via Supabase Auth & verified session.
// Strictly no fake demo user fallbacks.
// ─────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarLetter: string;
  lastLoginAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function setSessionCookie(userId: string) {
  if (typeof document !== "undefined") {
    document.cookie = `ajo_session=${encodeURIComponent(userId)}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
  }
}

function clearSessionCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "ajo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 1. Session Hydration & Supabase Auth State Listener
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const initSession = async () => {
      try {
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            const sbUser = data.session.user;
            const displayName =
              sbUser.user_metadata?.full_name ||
              sbUser.user_metadata?.name ||
              sbUser.email?.split("@")[0] ||
              "Member";

            const authUser: AuthUser = {
              id: sbUser.id,
              email: sbUser.email || "",
              name: displayName,
              role: "Verified Account",
              avatarLetter: (displayName[0] || "A").toUpperCase(),
              lastLoginAt: "Active now",
            };
            setUser(authUser);
            localStorage.setItem("ajo_session", JSON.stringify(authUser));
            setSessionCookie(authUser.id);
            setIsLoading(false);
            return;
          }
        }

        // Check local storage session (if previously logged in)
        const stored = localStorage.getItem("ajo_session");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.id && parsed.email) {
              setUser(parsed);
              setSessionCookie(parsed.id);
              setIsLoading(false);
              return;
            }
          } catch {
            localStorage.removeItem("ajo_session");
          }
        }

        // No authenticated session found
        setUser(null);
      } catch (err) {
        console.warn("Session hydration error:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    // Supabase Auth Listener
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event: string, session: { user?: { id: string; email?: string; user_metadata?: Record<string, string> } } | null) => {
          if (event === "SIGNED_IN" && session?.user) {
            const sbUser = session.user;
            const displayName =
              sbUser.user_metadata?.full_name ||
              sbUser.user_metadata?.name ||
              sbUser.email?.split("@")[0] ||
              "Member";

            const authUser: AuthUser = {
              id: sbUser.id,
              email: sbUser.email || "",
              name: displayName,
              role: "Verified Account",
              avatarLetter: (displayName[0] || "A").toUpperCase(),
              lastLoginAt: "Just now",
            };
            setUser(authUser);
            localStorage.setItem("ajo_session", JSON.stringify(authUser));
            setSessionCookie(authUser.id);
            window.dispatchEvent(
              new CustomEvent("ajo:auth-changed", { detail: { state: "signed_in" } })
            );
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            clearSessionCookie();
            localStorage.removeItem("ajo_session");
            localStorage.removeItem("moniepay_session");
            localStorage.removeItem("ajopay_session");
            window.dispatchEvent(
              new CustomEvent("ajo:auth-changed", { detail: { state: "signed_out" } })
            );
            router.push("/login");
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [router]);

  // 2. Real Login (Fast local DB verification with bounded fallback)
  const login = useCallback(
    async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);

      const cleanEmail = email.trim();

      // 1. Primary: Verify against application database endpoint (instant, reliable, local)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, password: pass }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name || cleanEmail.split("@")[0],
            role: "Verified Account",
            avatarLetter: (data.user.name?.[0] || cleanEmail[0] || "A").toUpperCase(),
            lastLoginAt: "Just now",
          };
          setUser(authUser);
          localStorage.setItem("ajo_session", JSON.stringify(authUser));
          setSessionCookie(authUser.id);
          setIsLoading(false);
          return { success: true };
        }

        // If explicitly unauthorized by database, return server error immediately
        if (res.status === 401 || res.status === 400) {
          setIsLoading(false);
          return { success: false, error: data.error || "Invalid email or password." };
        }
      } catch (err) {
        console.warn("Application auth error:", err);
      }

      // 2. Fallback: Check against Supabase Auth (with strict 3-second timeout so it NEVER hangs)
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const authPromise = supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: pass,
          });
          const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) =>
            setTimeout(() => resolve({ data: null, error: { message: "Authentication timed out." } }), 3000)
          );

          const { data, error } = await Promise.race([authPromise, timeoutPromise]);

          if (!error && data?.user) {
            const displayName =
              data.user.user_metadata?.full_name ||
              data.user.user_metadata?.name ||
              cleanEmail.split("@")[0];

            const authUser: AuthUser = {
              id: data.user.id,
              email: data.user.email || cleanEmail,
              name: displayName,
              role: "Verified Account",
              avatarLetter: (displayName[0] || "A").toUpperCase(),
              lastLoginAt: "Just now",
            };
            setUser(authUser);
            localStorage.setItem("ajo_session", JSON.stringify(authUser));
            setSessionCookie(authUser.id);
            setIsLoading(false);
            return { success: true };
          }
        } catch (err) {
          console.warn("Supabase signIn attempt:", err);
        }
      }

      setIsLoading(false);
      return { success: false, error: "Invalid credentials. Please verify your details." };
    },
    []
  );

  // 3. Real Logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    const supabase = getSupabaseBrowserClient();
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn("Supabase signOut error:", err);
    }

    setUser(null);
    clearSessionCookie();
    localStorage.removeItem("ajo_session");
    localStorage.removeItem("moniepay_session");
    localStorage.removeItem("ajopay_session");
    setIsLoading(false);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
