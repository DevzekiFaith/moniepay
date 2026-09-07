"use client";

// ─────────────────────────────────────────────
// AJO — Realtime Synchronization Hook
// Subscribes to real Supabase Realtime backend events
// and application-wide synchronization event bus.
// Strictly no fake timers or setInterval polling simulations.
// ─────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface UseRealtimeTransactionsOptions {
  userId?: string;
  onTransactionChange?: (payload?: any) => void;
  onAccountChange?: (payload?: any) => void;
}

/**
 * Dispatch an application-wide realtime event when an account or transaction
 * is synced, created, or updated through the provider.
 */
export function dispatchRealtimeUpdate(type: "transaction" | "account" = "transaction") {
  if (typeof window !== "undefined") {
    const eventName = type === "transaction" ? "ajo:transaction-sync" : "ajo:account-sync";
    window.dispatchEvent(new CustomEvent(eventName, { detail: { timestamp: Date.now(), type } }));
  }
}

export function useRealtimeTransactions({
  userId,
  onTransactionChange,
  onAccountChange,
}: UseRealtimeTransactionsOptions) {
  const onTxRef = useRef(onTransactionChange);
  const onAcctRef = useRef(onAccountChange);

  useEffect(() => {
    onTxRef.current = onTransactionChange;
    onAcctRef.current = onAccountChange;
  }, [onTransactionChange, onAccountChange]);

  // 1. Supabase Realtime Channel for Postgres Events
  useEffect(() => {
    if (!userId) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    try {
      const channel = supabase
        .channel(`realtime:user:${userId}:stream`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "Transaction",
            filter: `userId=eq.${userId}`,
          },
          (payload: Record<string, unknown>) => {
            onTxRef.current?.(payload);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "FinancialAccount",
            filter: `userId=eq.${userId}`,
          },
          (payload: Record<string, unknown>) => {
            onAcctRef.current?.(payload);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn("Supabase realtime subscription failed:", err);
    }
  }, [userId]);

  // 2. Client Event Bus (Triggered upon provider synchronization)
  useEffect(() => {
    const handleTxEvent = () => onTxRef.current?.({ source: "sync-event" });
    const handleAcctEvent = () => onAcctRef.current?.({ source: "sync-event" });

    window.addEventListener("ajo:transaction-sync", handleTxEvent);
    window.addEventListener("ajo:account-sync", handleAcctEvent);
    // Legacy event fallbacks
    window.addEventListener("moniepay:transaction-sync", handleTxEvent);
    window.addEventListener("moniepay:account-sync", handleAcctEvent);

    return () => {
      window.removeEventListener("ajo:transaction-sync", handleTxEvent);
      window.removeEventListener("ajo:account-sync", handleAcctEvent);
      window.removeEventListener("moniepay:transaction-sync", handleTxEvent);
      window.removeEventListener("moniepay:account-sync", handleAcctEvent);
    };
  }, []);
}
