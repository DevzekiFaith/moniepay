"use client";

// ─────────────────────────────────────────────────────────────────
// Monie Lite — Real-Time Notification & Toast System
// In-app animated neo-tactile toasts + Native Browser Push Notifications
// ─────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Bell,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatNaira } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning" | "push";

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration?: number;
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextValue {
  showToast: (toast: Omit<Toast, "id" | "timestamp">) => string;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  dismissToast: (id: string) => void;
  notify: (
    title: string,
    message?: string,
    options?: { type?: ToastType; sendPush?: boolean }
  ) => void;
  requestPushPermission: () => Promise<boolean>;
  pushPermission: NotificationPermission;
  isPushSupported: boolean;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");
  const [isPushSupported, setIsPushSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsPushSupported(true);
      setPushPermission(Notification.permission);
    }
  }, []);

  const requestPushPermission = async (): Promise<boolean> => {
    if (!isPushSupported) return false;
    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      return permission === "granted";
    } catch (err) {
      console.error("Push permission error:", err);
      return false;
    }
  };

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      title,
      message,
      type = "info",
      duration = 4500,
      action,
    }: Omit<Toast, "id" | "timestamp">): string => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const newToast: Toast = {
        id,
        title,
        message,
        type,
        duration,
        timestamp: new Date(),
        action,
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // max 5 active toasts

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const success = useCallback(
    (title: string, message?: string) => showToast({ title, message, type: "success" }),
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string) => showToast({ title, message, type: "error" }),
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string) => showToast({ title, message, type: "info" }),
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => showToast({ title, message, type: "warning" }),
    [showToast]
  );

function playNotificationChime(type: ToastType = "info") {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const freq = type === "error" || type === "warning" ? 360 : type === "push" ? 680 : 540;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.45, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.29);
  } catch {
    // Non-critical audio feedback fallback
  }
}

  const notify = useCallback(
    (
      title: string,
      message?: string,
      options?: { type?: ToastType; sendPush?: boolean }
    ) => {
      const type = options?.type || "success";
      showToast({ title, message, type });
      playNotificationChime(type);

      // Trigger browser push notification if permitted
      if (options?.sendPush !== false && isPushSupported && Notification.permission === "granted") {
        try {
          const notif = new Notification(title, {
            body: message || "Monie Lite real-time money activity",
            icon: "/favicon.ico",
          });
          notif.onclick = () => {
            window.focus();
            notif.close();
          };
        } catch (err) {
          console.error("Browser push error:", err);
        }
      }
    },
    [showToast, isPushSupported]
  );

  // ── Global Supabase Realtime Live Inflow/Debit & Notification Pipeline ──
  useEffect(() => {
    // 1. Listen to window event bus
    const handleWindowEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        title: string;
        message?: string;
        type?: ToastType;
        sendPush?: boolean;
      }>;
      if (customEvent.detail?.title) {
        notify(
          customEvent.detail.title,
          customEvent.detail.message,
          { type: customEvent.detail.type || "push", sendPush: customEvent.detail.sendPush ?? true }
        );
      }
    };
    window.addEventListener("moniepay:live-notification", handleWindowEvent);

    // 2. Supabase Realtime Subscriptions
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return () => {
        window.removeEventListener("moniepay:live-notification", handleWindowEvent);
      };
    }

    try {
      const channel = supabase
        .channel("realtime:moniepay:global-alerts")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "Transaction" },
          (payload: any) => {
            const newTx = payload.new;
            if (newTx) {
              const isIncome = newTx.transactionType === "INCOME" || (newTx.amount && newTx.amount > 0 && !newTx.transactionType);
              const isTransfer = newTx.transactionType === "TRANSFER" || newTx.isTransfer;
              const absAmt = formatNaira(Math.abs(newTx.amount || 0));
              const merchant = newTx.normalizedMerchantName || newTx.merchantName || newTx.description || "Transaction";

              if (isTransfer) {
                notify(
                  "Internal Transfer Reconciled",
                  `${absAmt} moved across verified accounts`,
                  { type: "info", sendPush: true }
                );
              } else if (isIncome) {
                notify(
                  "Live Inflow Verified",
                  `+${absAmt} received from ${merchant}`,
                  { type: "success", sendPush: true }
                );
              } else {
                notify(
                  "Live Outflow Processed",
                  `-${absAmt} paid at ${merchant}`,
                  { type: "push", sendPush: true }
                );
              }

              // Trigger app-wide ledger refresh
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("moniepay:transaction-sync"));
              }
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "Insight" },
          (payload: any) => {
            const insight = payload.new;
            if (insight) {
              notify(
                insight.title || "Proactive Money Intelligence",
                insight.body || "New real-time financial insight computed",
                { type: "push", sendPush: true }
              );
            }
          }
        )
        .on(
          "broadcast",
          { event: "live-notification" },
          (eventPayload: any) => {
            const data = eventPayload.payload || {};
            if (data.title) {
              notify(data.title, data.message, { type: data.type || "push", sendPush: data.sendPush ?? true });
            }
          }
        )
        .subscribe();

      return () => {
        window.removeEventListener("moniepay:live-notification", handleWindowEvent);
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn("Global Supabase Realtime channel error:", err);
      return () => {
        window.removeEventListener("moniepay:live-notification", handleWindowEvent);
      };
    }
  }, [notify]);

  return (
    <NotificationContext.Provider
      value={{
        showToast,
        success,
        error,
        info,
        warning,
        dismissToast,
        notify,
        requestPushPermission,
        pushPermission,
        isPushSupported,
      }}
    >
      {children}

      {/* Floating Toast Notification Container */}
      <div
        style={{
          position: "fixed",
          top: "1.25rem",
          right: "1.25rem",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          gap: "0.625rem",
          maxWidth: "420px",
          width: "calc(100% - 2.5rem)",
          pointerEvents: "none",
        }}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const isSuccess = toast.type === "success";
            const isError = toast.type === "error";
            const isWarning = toast.type === "warning";
            const isPush = toast.type === "push";

            const accentColor = isSuccess
              ? "var(--positive)"
              : isError
              ? "var(--negative)"
              : isWarning
              ? "#F59E0B"
              : isPush
              ? "#A855F7"
              : "var(--accent)";

            const bgGlow = isSuccess
              ? "rgba(52, 211, 153, 0.12)"
              : isError
              ? "rgba(244, 63, 94, 0.14)"
              : isWarning
              ? "rgba(245, 158, 11, 0.12)"
              : "rgba(79, 156, 249, 0.12)";

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -18, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{
                  pointerEvents: "auto",
                  background: "rgba(13, 21, 38, 0.94)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: `1px solid rgba(255, 255, 255, 0.12)`,
                  borderLeft: `4px solid ${accentColor}`,
                  borderRadius: "14px",
                  padding: "0.875rem 1rem",
                  boxShadow:
                    "0 20px 35px -10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 0, 0, 0.4)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "10px",
                    background: bgGlow,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: accentColor,
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  {isSuccess && <CheckCircle2 size={18} />}
                  {isError && <ShieldAlert size={18} />}
                  {isWarning && <AlertTriangle size={18} />}
                  {(toast.type === "info" || isPush) && <Bell size={18} />}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "13.5px",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.3,
                    }}
                  >
                    {toast.title}
                  </p>
                  {toast.message && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        marginTop: "3px",
                        lineHeight: 1.45,
                      }}
                    >
                      {toast.message}
                    </p>
                  )}

                  {toast.action && (
                    <button
                      type="button"
                      onClick={() => {
                        toast.action?.onClick();
                        dismissToast(toast.id);
                      }}
                      style={{
                        marginTop: "6px",
                        background: "transparent",
                        border: "none",
                        color: accentColor,
                        fontSize: "11.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: 0,
                      }}
                    >
                      <span>{toast.action.label}</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-tertiary)",
                    cursor: "pointer",
                    padding: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Dismiss notification"
                >
                  <X size={15} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
