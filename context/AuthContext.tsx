"use client";

// ─────────────────────────────────────────────────────────────────
// MONIEPAY — High-Standard Authentication & Shop Identity Context
// Pure Supabase Auth & Secure HttpOnly Session Cookies.
// Offline-first graceful fallback with zero freezing.
// ─────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  businessName?: string;
  marketLocation?: string;
  role: string;
  avatarLetter: string;
  avatarUrl?: string;
  lastLoginAt: string;
}

interface RegisterParams {
  name: string;
  email: string;
  pass: string;
  businessName?: string;
  marketLocation?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginDemo: (personaKey?: "mama_chidi" | "alhaji_garba" | "emeka" | "blessing") => Promise<{ success: boolean }>;
  registerShop: (params: RegisterParams) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: AuthUser = {
  id: "user_owner_01",
  name: "Mama Chidi",
  email: "demo@moniepay.app",
  businessName: "Mama Chidi Super Provisions",
  marketLocation: "Shop 14, Balogun Market, Lagos",
  role: "Shop Owner",
  avatarLetter: "M",
  avatarUrl: "/images/traders/mama_chidi.jpg",
  lastLoginAt: "Active now",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 1. Session Hydration: Check Supabase session + Local cached profile
  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      try {
        // A. Check local fast-cache first for instant rendering
        const cached = localStorage.getItem("moniepay_session") || localStorage.getItem("ajo_session");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed?.id && isMounted) {
              if (!parsed.avatarUrl) {
                parsed.avatarUrl = "/images/traders/mama_chidi.jpg";
              }
              setUser(parsed);
              setIsLoading(false);
            }
          } catch {
            localStorage.removeItem("moniepay_session");
          }
        }

        // B. Verify with server API /api/auth/me
        try {
          const res = await fetch("/api/auth/me", { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (data?.authenticated && data?.user && isMounted) {
              const verifiedUser: AuthUser = {
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                businessName: data.business?.name || "My Business",
                marketLocation: data.business?.market_location || "Balogun Market, Lagos",
                role: "Shop Owner",
                avatarLetter: (data.user.name?.[0] || "M").toUpperCase(),
                avatarUrl: data.user.avatarUrl || "/images/traders/mama_chidi.jpg",
                lastLoginAt: "Verified Active",
              };
              setUser(verifiedUser);
              localStorage.setItem("moniepay_session", JSON.stringify(verifiedUser));
              return;
            }
          }
        } catch {
          // Offline network error — keep cached session intact
        }

        // C. Check Supabase client session if available
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user && isMounted) {
            const sbUser = data.session.user;
            const displayName =
              sbUser.user_metadata?.full_name ||
              sbUser.user_metadata?.name ||
              sbUser.email?.split("@")[0] ||
              "Shop Owner";

            const authUser: AuthUser = {
              id: sbUser.id,
              email: sbUser.email || "",
              name: displayName,
              businessName: sbUser.user_metadata?.business_name || "My Business",
              marketLocation: sbUser.user_metadata?.market_location || "Lagos, Nigeria",
              role: "Shop Owner",
              avatarLetter: (displayName[0] || "M").toUpperCase(),
              avatarUrl: sbUser.user_metadata?.avatar_url || "/images/traders/mama_chidi.jpg",
              lastLoginAt: "Active now",
            };

            setUser(authUser);
            localStorage.setItem("moniepay_session", JSON.stringify(authUser));
            return;
          }
        }
      } catch (err) {
        console.warn("Session hydration notice:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initSession();

    // D. Supabase Auth State Change Listener
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event: string, session: any) => {
          if (event === "SIGNED_IN" && session?.user) {
            const sbUser = session.user;
            const displayName =
              sbUser.user_metadata?.full_name ||
              sbUser.email?.split("@")[0] ||
              "Shop Owner";

            const authUser: AuthUser = {
              id: sbUser.id,
              email: sbUser.email || "",
              name: displayName,
              businessName: sbUser.user_metadata?.business_name || "My Business",
              marketLocation: sbUser.user_metadata?.market_location || "Balogun Market",
              role: "Shop Owner",
              avatarLetter: (displayName[0] || "M").toUpperCase(),
              avatarUrl: sbUser.user_metadata?.avatar_url || "/images/traders/mama_chidi.jpg",
              lastLoginAt: "Just now",
            };
            setUser(authUser);
            localStorage.setItem("moniepay_session", JSON.stringify(authUser));
            window.dispatchEvent(
              new CustomEvent("moniepay:auth-changed", { detail: { state: "signed_in" } })
            );
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            localStorage.removeItem("moniepay_session");
            window.dispatchEvent(
              new CustomEvent("moniepay:auth-changed", { detail: { state: "signed_out" } })
            );
          }
        }
      );

      return () => {
        isMounted = false;
        authListener.subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. High-Performance Login
  const login = useCallback(
    async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      const cleanIdentifier = email.trim();

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanIdentifier, password: pass }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name || "Business Owner",
            businessName: data.user.businessName || "My Business",
            marketLocation: data.user.marketLocation || "Balogun Market, Lagos",
            role: "Shop Owner",
            avatarLetter: (data.user.name?.[0] || "M").toUpperCase(),
            lastLoginAt: "Just now",
          };

          setUser(authUser);
          localStorage.setItem("moniepay_session", JSON.stringify(authUser));
          setIsLoading(false);
          return { success: true };
        }

        setIsLoading(false);
        return { success: false, error: data.error || "Invalid login credentials." };
      } catch (err: any) {
        setIsLoading(false);
        if (err.name === "AbortError") {
          return { success: false, error: "Network timed out. Please check your connection." };
        }
        return { success: false, error: "Authentication service unavailable. Please retry." };
      }
    },
    []
  );

  // 3. One-Tap Quick Demo Login (Mama Chidi, Alhaji Garba, Emeka, Blessing)
  const loginDemo = useCallback(async (personaKey?: "mama_chidi" | "alhaji_garba" | "emeka" | "blessing"): Promise<{ success: boolean }> => {
    setIsLoading(true);

    let selectedDemo = DEMO_USER;
    if (personaKey === "alhaji_garba") {
      selectedDemo = {
        id: "user_owner_02",
        name: "Alhaji Garba",
        email: "garba@moniepay.app",
        businessName: "Alhaji Garba Grains & Foodstuff",
        marketLocation: "Mile 12 Market, Lagos",
        role: "Shop Owner",
        avatarLetter: "A",
        avatarUrl: "/images/traders/alhaji_garba.jpg",
        lastLoginAt: "Active now",
      };
    } else if (personaKey === "emeka") {
      selectedDemo = {
        id: "user_owner_03",
        name: "Emeka Okonkwo",
        email: "emeka@moniepay.app",
        businessName: "Emeka Mobile & Electronics Hub",
        marketLocation: "Alaba Int. Market, Lagos",
        role: "Shop Owner",
        avatarLetter: "E",
        avatarUrl: "/images/traders/emeka_electronics.jpg",
        lastLoginAt: "Active now",
      };
    } else if (personaKey === "blessing") {
      selectedDemo = {
        id: "user_owner_04",
        name: "Blessing Adebayo",
        email: "blessing@moniepay.app",
        businessName: "Blessing Fabrics & Lace",
        marketLocation: "Tejuosho Market, Yaba",
        role: "Shop Owner",
        avatarLetter: "B",
        avatarUrl: "/images/traders/blessing_fabrics.jpg",
        lastLoginAt: "Active now",
      };
    }

    // Always hydrate client-side immediately
    setUser(selectedDemo);
    localStorage.setItem("moniepay_session", JSON.stringify(selectedDemo));

    try {
      fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "demo@monielite.app", password: "MoneyMatters2024!" }),
        keepalive: true,
      }).catch(() => {});
    } catch {}

    setIsLoading(false);
    return { success: true };
  }, []);

  // 4. Shop Registration
  const registerShop = useCallback(
    async (params: RegisterParams): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: params.name.trim(),
            email: params.email.trim(),
            password: params.pass,
            businessName: params.businessName?.trim(),
            marketLocation: params.marketLocation?.trim(),
            avatarUrl: params.avatarUrl,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            businessName: data.user.businessName,
            marketLocation: data.user.marketLocation,
            role: "Shop Owner",
            avatarLetter: (data.user.name[0] || "M").toUpperCase(),
            avatarUrl: params.avatarUrl || data.user.avatarUrl || "/images/traders/mama_chidi.jpg",
            lastLoginAt: "Just registered",
          };

          setUser(authUser);
          localStorage.setItem("moniepay_session", JSON.stringify(authUser));
          setIsLoading(false);
          return { success: true };
        }

        setIsLoading(false);
        return { success: false, error: data.error || "Failed to register shop account." };
      } catch (networkErr) {
        console.warn("Offline registration fallback:", networkErr);
        // Resilient offline registration: persist locally so trader can start immediately
        const offlineId = "usr_" + Math.random().toString(36).substring(2, 10);
        const authUser: AuthUser = {
          id: offlineId,
          email: params.email.trim(),
          name: params.name.trim(),
          businessName: params.businessName?.trim() || `${params.name.trim()}'s Store`,
          marketLocation: params.marketLocation?.trim() || "Balogun Market, Lagos",
          role: "Shop Owner",
          avatarLetter: (params.name.trim()[0] || "M").toUpperCase(),
          avatarUrl: params.avatarUrl || "/images/traders/mama_chidi.jpg",
          lastLoginAt: "Offline provisioned",
        };

        setUser(authUser);
        localStorage.setItem("moniepay_session", JSON.stringify(authUser));
        setIsLoading(false);
        return { success: true };
      }
    },
    []
  );

  // 5. Clean, Safe Logout (Preserving Offline Sales Queue)
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      // A. Call server logout endpoint to clear all HTTP cookies
      await fetch("/api/auth/logout", {
        method: "POST",
      }).catch(() => {});

      // B. Sign out from Supabase client
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase.auth.signOut().catch(() => {});
      }
    } catch (err) {
      console.warn("Signout cleanup notice:", err);
    }

    // C. Clear authentication storage while PRESERVING offline transaction queue
    setUser(null);
    localStorage.removeItem("moniepay_session");
    localStorage.removeItem("ajo_session");
    localStorage.removeItem("ajopay_session");
    sessionStorage.clear();

    // D. Notify app listeners
    window.dispatchEvent(
      new CustomEvent("moniepay:auth-changed", { detail: { state: "signed_out" } })
    );

    setIsLoading(false);

    // E. Smooth redirect to login
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginDemo,
        registerShop,
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
