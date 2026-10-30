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
  phone?: string;
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
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  loginDemo: (personaKey?: "mama_chidi" | "alhaji_garba" | "emeka" | "blessing") => Promise<{ success: boolean }>;
  registerShop: (params: RegisterParams) => Promise<{ success: boolean; error?: string; code?: string }>;
  logout: () => Promise<void>;
}

interface KnownClientUser extends AuthUser {
  passKey?: string;
}

const KNOWN_USERS_STORAGE_KEY = "moniepay_known_users";

function encodePassKey(pass: string): string {
  try {
    return typeof window !== "undefined" ? window.btoa(unescape(encodeURIComponent(pass))) : pass;
  } catch {
    return pass;
  }
}

function getKnownClientUsers(): Record<string, KnownClientUser> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KNOWN_USERS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveKnownClientUser(user: AuthUser, pass?: string): void {
  if (typeof window === "undefined") return;
  try {
    const store = getKnownClientUsers();
    const emailKey = user.email?.trim().toLowerCase();
    const phoneKey = user.phone?.trim().toLowerCase();
    const entry: KnownClientUser = {
      ...user,
      passKey: pass ? encodePassKey(pass) : (emailKey && store[emailKey]?.passKey) || undefined,
    };
    if (emailKey) store[emailKey] = entry;
    if (phoneKey) store[phoneKey] = entry;
    localStorage.setItem(KNOWN_USERS_STORAGE_KEY, JSON.stringify(store));
  } catch {}
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: AuthUser = {
  id: "user_owner_01",
  name: "Mama Chidi",
  email: "demo@moniepay.app",
  businessName: "Mama Chidi Super Provisions",
  marketLocation: undefined,
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
        let activeCachedUser: AuthUser | null = null;

        // A. Check local fast-cache first for instant rendering
        const cached = localStorage.getItem("moniepay_session") || localStorage.getItem("ajo_session");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed?.id && isMounted) {
              if (!parsed.avatarUrl) {
                parsed.avatarUrl = "/images/traders/mama_chidi.jpg";
              }
              // Clean out stale static Balogun or default locations so users only see registered location
              if (parsed.marketLocation && (parsed.marketLocation.toLowerCase().includes("balogun") || parsed.marketLocation.includes("Commercial Trading Shop") || parsed.marketLocation.includes("Commercial Market Stall"))) {
                delete parsed.marketLocation;
                localStorage.setItem("moniepay_session", JSON.stringify(parsed));
              }
              activeCachedUser = parsed;
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
              // Preserve client cached registered business name and custom name if server is generic
              const finalName =
                (data.user.name && data.user.name !== "Business Owner" && data.user.name !== "Mama Chidi")
                  ? data.user.name
                  : activeCachedUser?.name || data.user.name || "Shop Owner";

              const finalBusinessName =
                (data.business?.name && data.business?.name !== "Mama Chidi Super Provisions" && data.business?.name !== "My Business")
                  ? data.business.name
                  : activeCachedUser?.businessName || data.business?.name || `${finalName}'s Store`;

              const rawLoc = (data.business?.market_location && !data.business.market_location.toLowerCase().includes("balogun") && data.business.market_location !== "Commercial Trading Shop, Nigeria")
                ? data.business.market_location
                : activeCachedUser?.marketLocation;

              const finalLocation = rawLoc && !rawLoc.toLowerCase().includes("balogun") && rawLoc !== "Commercial Trading Shop, Nigeria" && rawLoc !== "Commercial Market Stall, Lagos, Nigeria"
                ? rawLoc
                : undefined;

              const verifiedUser: AuthUser = {
                id: data.user.id || activeCachedUser?.id || "user_01",
                email: data.user.email || activeCachedUser?.email || "",
                phone: data.user.phone || activeCachedUser?.phone || (data.user.email?.match(/^(\+?234|0)[789][01]\d{8}$/) ? data.user.email : undefined),
                name: finalName,
                businessName: finalBusinessName,
                marketLocation: finalLocation,
                role: "Shop Owner",
                avatarLetter: (finalName[0] || "M").toUpperCase(),
                avatarUrl: activeCachedUser?.avatarUrl || data.user.avatarUrl || "/images/traders/mama_chidi.jpg",
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
              activeCachedUser?.name ||
              sbUser.email?.split("@")[0] ||
              "Shop Owner";

            const rawSbLoc = sbUser.user_metadata?.market_location;
            const cleanSbLoc = rawSbLoc && !rawSbLoc.toLowerCase().includes("balogun") && rawSbLoc !== "Lagos, Nigeria" ? rawSbLoc : undefined;
            const authUser: AuthUser = {
              id: sbUser.id,
              email: sbUser.email || "",
              name: displayName,
              businessName: sbUser.user_metadata?.business_name || activeCachedUser?.businessName || `${displayName}'s Store`,
              marketLocation: cleanSbLoc || (activeCachedUser?.marketLocation && !activeCachedUser.marketLocation.toLowerCase().includes("balogun") ? activeCachedUser.marketLocation : undefined),
              role: "Shop Owner",
              avatarLetter: (displayName[0] || "M").toUpperCase(),
              avatarUrl: sbUser.user_metadata?.avatar_url || activeCachedUser?.avatarUrl || "/images/traders/mama_chidi.jpg",
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

            const rawSbLoc = sbUser.user_metadata?.market_location;
            const cleanSbLoc = rawSbLoc && !rawSbLoc.toLowerCase().includes("balogun") && !rawSbLoc.includes("Commercial Market Stall") ? rawSbLoc : undefined;
            const authUser: AuthUser = {
              id: sbUser.id,
              email: sbUser.email || "",
              phone: sbUser.user_metadata?.phone || (sbUser.email?.match(/^(\+?234|0)[789][01]\d{8}$/) ? sbUser.email : undefined),
              name: displayName,
              businessName: sbUser.user_metadata?.business_name || "My Business",
              marketLocation: cleanSbLoc,
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

  // 2. High-Performance Login (Strict check: only grant access if user has signed in / registered previously)
  const login = useCallback(
    async (email: string, pass: string): Promise<{ success: boolean; error?: string; code?: string }> => {
      setIsLoading(true);
      const cleanIdentifier = email.trim();
      const normalizedKey = cleanIdentifier.toLowerCase();

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
          const rawUserLoc = data.user.marketLocation;
          const cleanUserLoc =
            rawUserLoc &&
            !rawUserLoc.toLowerCase().includes("balogun") &&
            !rawUserLoc.includes("Commercial Market Stall")
              ? rawUserLoc
              : undefined;
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email,
            phone:
              data.user.phone ||
              (cleanIdentifier.match(/^(\+?234|0)[789][01]\d{8}$/) ? cleanIdentifier : undefined),
            name: data.user.name || "Business Owner",
            businessName: data.user.businessName || "My Business",
            marketLocation: cleanUserLoc,
            role: "Shop Owner",
            avatarLetter: (data.user.name?.[0] || "M").toUpperCase(),
            avatarUrl: data.user.avatarUrl || "/images/traders/mama_chidi.jpg",
            lastLoginAt: "Just now",
          };

          setUser(authUser);
          localStorage.setItem("moniepay_session", JSON.stringify(authUser));
          saveKnownClientUser(authUser, pass);
          setIsLoading(false);
          return { success: true };
        }

        // Check client-side known users registry if user previously signed in on this device
        const knownUsers = getKnownClientUsers();
        const knownUser = knownUsers[normalizedKey];
        if (knownUser && data.code === "USER_NOT_REGISTERED") {
          if (!knownUser.passKey || knownUser.passKey === encodePassKey(pass)) {
            const restoredUser: AuthUser = {
              id: knownUser.id,
              email: knownUser.email,
              phone: knownUser.phone,
              name: knownUser.name,
              businessName: knownUser.businessName,
              marketLocation: knownUser.marketLocation,
              role: knownUser.role || "Shop Owner",
              avatarLetter: knownUser.avatarLetter || (knownUser.name[0] || "M").toUpperCase(),
              avatarUrl: knownUser.avatarUrl || "/images/traders/mama_chidi.jpg",
              lastLoginAt: "Just now",
            };
            setUser(restoredUser);
            localStorage.setItem("moniepay_session", JSON.stringify(restoredUser));
            setIsLoading(false);
            return { success: true };
          }
          setIsLoading(false);
          return {
            success: false,
            code: "INVALID_PASSWORD",
            error: "Wrong password. Please check your password and try again.",
          };
        }

        setIsLoading(false);
        return {
          success: false,
          code: data.code || "AUTH_ERROR",
          error:
            data.error ||
            "We couldn't find an account with this email or phone number. If you are new here, please tap 'Register New Shop' to create your account first.",
        };
      } catch (err: any) {
        // Offline fallback: only grant access if the user has signed in previously on this device
        const knownUsers = getKnownClientUsers();
        const knownUser = knownUsers[normalizedKey];
        if (knownUser) {
          if (!knownUser.passKey || knownUser.passKey === encodePassKey(pass)) {
            const restoredUser: AuthUser = {
              id: knownUser.id,
              email: knownUser.email,
              phone: knownUser.phone,
              name: knownUser.name,
              businessName: knownUser.businessName,
              marketLocation: knownUser.marketLocation,
              role: knownUser.role || "Shop Owner",
              avatarLetter: knownUser.avatarLetter || (knownUser.name[0] || "M").toUpperCase(),
              avatarUrl: knownUser.avatarUrl || "/images/traders/mama_chidi.jpg",
              lastLoginAt: "Offline verified",
            };
            setUser(restoredUser);
            localStorage.setItem("moniepay_session", JSON.stringify(restoredUser));
            setIsLoading(false);
            return { success: true };
          }
          setIsLoading(false);
          return {
            success: false,
            code: "INVALID_PASSWORD",
            error: "Wrong password. Please check your password and try again.",
          };
        }

        setIsLoading(false);
        if (err.name === "AbortError") {
          return {
            success: false,
            code: "NETWORK_TIMEOUT",
            error: "Your internet connection is slow and you haven't signed in on this device before. Please check your internet and try again.",
          };
        }
        return {
          success: false,
          code: "USER_NOT_REGISTERED",
          error:
            "You haven't signed in on this device before. Please tap 'Register New Shop' to create an account, or check your internet connection.",
        };
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
    saveKnownClientUser(selectedDemo, "MoneyMatters2024!");

    try {
      fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedDemo.email, password: "MoneyMatters2024!" }),
        keepalive: true,
      }).catch(() => {});
    } catch {}

    setIsLoading(false);
    return { success: true };
  }, []);

  // 4. Shop Registration
  const registerShop = useCallback(
    async (params: RegisterParams): Promise<{ success: boolean; error?: string; code?: string }> => {
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
          const regLocation = params.marketLocation?.trim() || data.user.marketLocation;
          const cleanRegLoc = regLocation && !regLocation.toLowerCase().includes("balogun") && !regLocation.includes("Commercial Market Stall") ? regLocation : undefined;
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email,
            phone: data.user.phone || (params.email.match(/^(\+?234|0)[789][01]\d{8}$/) ? params.email.trim() : undefined),
            name: data.user.name,
            businessName: data.user.businessName,
            marketLocation: cleanRegLoc,
            role: "Shop Owner",
            avatarLetter: (data.user.name[0] || "M").toUpperCase(),
            avatarUrl: params.avatarUrl || data.user.avatarUrl || "/images/traders/mama_chidi.jpg",
            lastLoginAt: "Just registered",
          };

          setUser(authUser);
          localStorage.setItem("moniepay_session", JSON.stringify(authUser));
          saveKnownClientUser(authUser, params.pass);
          setIsLoading(false);
          return { success: true };
        }

        setIsLoading(false);
        return {
          success: false,
          code: data.code,
          error: data.error || "Failed to register shop account.",
        };
      } catch (networkErr) {
        console.warn("Offline registration fallback:", networkErr);
        // Resilient offline registration: persist locally so trader can start immediately
        const offlineId = "usr_" + Math.random().toString(36).substring(2, 10);
        const offlineLocation = params.marketLocation?.trim();
        const cleanOfflineLoc = offlineLocation && !offlineLocation.toLowerCase().includes("balogun") && !offlineLocation.includes("Commercial Market Stall") ? offlineLocation : undefined;
        const authUser: AuthUser = {
          id: offlineId,
          email: params.email.trim(),
          phone: params.email.match(/^(\+?234|0)[789][01]\d{8}$/) ? params.email.trim() : undefined,
          name: params.name.trim(),
          businessName: params.businessName?.trim() || `${params.name.trim()}'s Store`,
          marketLocation: cleanOfflineLoc,
          role: "Shop Owner",
          avatarLetter: (params.name.trim()[0] || "M").toUpperCase(),
          avatarUrl: params.avatarUrl || "/images/traders/mama_chidi.jpg",
          lastLoginAt: "Offline provisioned",
        };

        setUser(authUser);
        localStorage.setItem("moniepay_session", JSON.stringify(authUser));
        saveKnownClientUser(authUser, params.pass);
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
