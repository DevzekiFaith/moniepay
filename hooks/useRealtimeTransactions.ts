"use client";

// ─────────────────────────────────────────────
// MoniePay — Live Realtime Synchronization Hook
// Subscribes to Supabase Realtime, Window Event Bus,
// and automatic background ledger polling (12s cadence).
// ─────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface UseRealtimeTransactionsOptions {
  userId?: string;
  onTransactionChange?: (payload?: any) => void;
  onAccountChange?: (payload?: any) => void;
  pollingIntervalMs?: number; // default 12,000ms
  enablePolling?: boolean;
}

/**
 * Dispatch an application-wide realtime event to trigger
 * instant synchronization across all charts and audit components.
 */
export function dispatchRealtimeUpdate(type: "transaction" | "account" = "transaction") {
  if (typeof window !== "undefined") {
    const eventName = type === "transaction" ? "moniepay:transaction-sync" : "moniepay:account-sync";
    window.dispatchEvent(new CustomEvent(eventName, { detail: { timestamp: Date.now(), type } }));
    // Also dispatch legacy event for compatibility
    window.dispatchEvent(new CustomEvent(type === "transaction" ? "ajopay:transaction-sync" : "ajopay:account-sync"));
  }
}

/**
 * Dispatch a live push notification across the application and to native desktop/mobile.
 */
export function dispatchLiveNotification(notification: {
  title: string;
  message?: string;
  type?: "success" | "error" | "info" | "warning" | "push";
  sendPush?: boolean;
}) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("moniepay:live-notification", { detail: notification })
    );
  }
}

export function useRealtimeTransactions({
  userId,
  onTransactionChange,
  onAccountChange,
  pollingIntervalMs = 12000,
  enablePolling = true,
}: UseRealtimeTransactionsOptions) {
  const onTxRef = useRef(onTransactionChange);
  const onAcctRef = useRef(onAccountChange);

  useEffect(() => {
    onTxRef.current = onTransactionChange;
    onAcctRef.current = onAccountChange;
  }, [onTransactionChange, onAccountChange]);

  // 1. Supabase Realtime Channel
  useEffect(() => {
    if (!userId) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    try {
      const channel = supabase
        .channel(`realtime:user:${userId}:audit-stream`)
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

  // 2. Window Custom Event Bus (Instant Inter-Component Sync)
  useEffect(() => {
    const handleTxEvent = () => onTxRef.current?.({ source: "event-bus" });
    const handleAcctEvent = () => onAcctRef.current?.({ source: "event-bus" });

    window.addEventListener("moniepay:transaction-sync", handleTxEvent);
    window.addEventListener("moniepay:account-sync", handleAcctEvent);
    window.addEventListener("ajopay:transaction-sync", handleTxEvent);
    window.addEventListener("ajopay:account-sync", handleAcctEvent);

    return () => {
      window.removeEventListener("moniepay:transaction-sync", handleTxEvent);
      window.removeEventListener("moniepay:account-sync", handleAcctEvent);
      window.removeEventListener("ajopay:transaction-sync", handleTxEvent);
      window.removeEventListener("ajopay:account-sync", handleAcctEvent);
    };
  }, []);

  // 3. Smart Background Polling (keeps graph alive in real-time)
  useEffect(() => {
    if (!enablePolling) return;

    const interval = setInterval(() => {
      // Only refresh if tab is active/visible to save network
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        onTxRef.current?.({ source: "realtime-poll" });
      }
    }, pollingIntervalMs);

    return () => clearInterval(interval);
  }, [enablePolling, pollingIntervalMs]);
}
