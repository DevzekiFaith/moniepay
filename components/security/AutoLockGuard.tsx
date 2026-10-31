"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Automatic Anti-Theft Lock Guard (Inactivity Timer)
// Automatically locks screen after merchant idle period (Default 2 mins)
// 100% Client-Side • Instant 4-Digit Owner PIN Verification
// ─────────────────────────────────────────────────────────────────

import React, { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getAutoLockMinutes,
  isShopLocked,
  lockShop,
  unlockShop,
} from "@/lib/security/ownerPinService";
import { OwnerPinModal } from "./OwnerPinModal";

// Public unauthenticated routes that should never be auto-locked
const PUBLIC_PATHS = ["/login", "/logout", "/dev"];

export function AutoLockGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [isLocked, setIsLocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  const lastActivityRef = useRef<number>(Date.now());
  const hiddenTimeRef = useRef<number | null>(null);

  // Check initial state
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setIsLocked(isShopLocked());
    }
  }, []);

  const isPublicRoute = PUBLIC_PATHS.some((p) => pathname?.startsWith(p));

  // Activity updater
  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Listen to manual lock/unlock custom events
  useEffect(() => {
    const handleLock = () => setIsLocked(true);
    const handleUnlock = () => setIsLocked(false);

    window.addEventListener("moniepay:lock-shop", handleLock);
    window.addEventListener("moniepay:unlock-shop", handleUnlock);

    return () => {
      window.removeEventListener("moniepay:lock-shop", handleLock);
      window.removeEventListener("moniepay:unlock-shop", handleUnlock);
    };
  }, []);

  // Inactivity ticker & visibility listener
  useEffect(() => {
    if (!mounted || !isAuthenticated || isPublicRoute) return;

    // Track standard user interactions
    const events = ["mousedown", "mousemove", "keydown", "touchstart", "scroll", "pointerdown"];
    const handleUserInteraction = () => {
      recordActivity();
    };

    events.forEach((evt) => {
      window.addEventListener(evt, handleUserInteraction, { passive: true });
    });

    // Check idle duration every 5 seconds
    const interval = setInterval(() => {
      const lockMins = getAutoLockMinutes(user?.id);
      if (lockMins <= 0) return; // 0 = Never auto-lock

      const idleDurationMs = Date.now() - lastActivityRef.current;
      const thresholdMs = lockMins * 60 * 1000;

      if (idleDurationMs >= thresholdMs) {
        lockShop();
        setIsLocked(true);
      }
    }, 5000);

    // Visibility change (when trader puts phone in pocket or switches apps)
    const handleVisibility = () => {
      const lockMins = getAutoLockMinutes(user?.id);
      if (lockMins <= 0) return;

      if (document.visibilityState === "hidden") {
        hiddenTimeRef.current = Date.now();
      } else if (document.visibilityState === "visible") {
        if (hiddenTimeRef.current) {
          const backgroundTimeMs = Date.now() - hiddenTimeRef.current;
          // If backgrounded for more than 45 seconds or idle limit, lock immediately
          const backgroundLimitMs = Math.min(45 * 1000, lockMins * 60 * 1000);
          if (backgroundTimeMs >= backgroundLimitMs) {
            lockShop();
            setIsLocked(true);
          }
          hiddenTimeRef.current = null;
        }
        recordActivity();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserInteraction);
      });
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [mounted, isAuthenticated, isPublicRoute, user?.id, recordActivity]);

  const handleUnlockSuccess = () => {
    unlockShop();
    setIsLocked(false);
    recordActivity();
  };

  const handleSignOut = () => {
    unlockShop();
    setIsLocked(false);
    logout();
  };

  const isDemoMamaChidi = !user || user.id === "user_owner_01" || (user.name === "Mama Chidi" && (!user.marketLocation || user.marketLocation.includes("Balogun")));
  const displayName = user?.name || "Shop Owner";
  const shopName = user?.businessName || (isDemoMamaChidi ? "Mama Chidi Provision Store" : `${displayName}'s Store`);
  const profilePhoto = user?.avatarUrl || (isDemoMamaChidi ? "/images/traders/mama_chidi.jpg" : undefined);

  return (
    <>
      {children}

      {/* Persistent Auto-Lock Screen (Active when idle timer expires or manually locked) */}
      {mounted && isAuthenticated && !isPublicRoute && (
        <OwnerPinModal
          isOpen={isLocked}
          isStrictLock={true}
          onSuccess={handleUnlockSuccess}
          onSignOut={handleSignOut}
          userId={user?.id}
          userName={displayName}
          businessName={shopName}
          avatarUrl={profilePhoto}
        />
      )}
    </>
  );
}

