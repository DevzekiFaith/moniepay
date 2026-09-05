"use client";

// ─────────────────────────────────────────────────────────────────
// AjoPay — Authentication & Session Context
// Manages sign-in, instant demo access, and logout persistence
// ─────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  avatarLetter: string;
  lastLoginAt: string;
}

const DEFAULT_DEMO_USER: AuthUser = {
  id: "usr_demo_monie",
  name: "Alex Chen",
  email: "alex.chen@moniepay.app",
  role: "Verified Member",
  plan: "PRO TIER",
  avatarLetter: "A",
  lastLoginAt: "Today, just now",
};

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  demoLogin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("moniepay_session") || localStorage.getItem("ajopay_session");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default active demo user session for instant preview
        setUser(DEFAULT_DEMO_USER);
        localStorage.setItem("moniepay_session", JSON.stringify(DEFAULT_DEMO_USER));
      }
    } catch (e) {
      setUser(DEFAULT_DEMO_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setIsLoading(true);
    // Simulate instantaneous authentication check
    await new Promise((res) => setTimeout(res, 350));
    const newUser: AuthUser = {
      ...DEFAULT_DEMO_USER,
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      email: email || DEFAULT_DEMO_USER.email,
      name: email.split("@")[0] || DEFAULT_DEMO_USER.name,
      avatarLetter: (email[0] || "A").toUpperCase(),
      lastLoginAt: "Just now",
    };
    setUser(newUser);
    localStorage.setItem("moniepay_session", JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  }, []);

  const demoLogin = useCallback(async () => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 400));
    setUser(DEFAULT_DEMO_USER);
    localStorage.setItem("moniepay_session", JSON.stringify(DEFAULT_DEMO_USER));
    setIsLoading(false);
    router.push("/");
  }, [router]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("moniepay_session");
    localStorage.removeItem("ajopay_session");
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        demoLogin,
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
