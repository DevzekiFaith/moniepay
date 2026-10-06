"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export interface MarketNotification {
  id: string;
  title: string;
  message: string;
  type: "debt_reminder" | "price_alert" | "sales_milestone" | "rating_received" | "sync_status";
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  amount?: string;
}

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: "info" | "success" | "warning" | "error";
  duration?: number;
}

interface NotificationContextType {
  notifications: MarketNotification[];
  unreadCount: number;
  permission: NotificationPermission | "unsupported";
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  requestPermission: () => Promise<boolean>;
  sendPushNotification: (params: {
    title: string;
    message: string;
    type?: MarketNotification["type"];
    actionUrl?: string;
    actionLabel?: string;
    amount?: string;
  }) => void;
  notify: (title: string, message?: string, type?: any) => void;
  error: (title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  toast: (title: string, message?: string, options?: { type?: "info" | "success" | "warning" | "error"; duration?: number }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const INITIAL_NOTIFICATIONS: MarketNotification[] = [
  {
    id: "notif_01",
    title: "Customer Gbese Due Today",
    message: "Chidi promise say him go bring ₦15,000 today for provisions. Tap make you send am friendly WhatsApp reminder sharp-sharp.",
    type: "debt_reminder",
    timestamp: "10 mins ago",
    read: false,
    amount: "₦15,000",
    actionLabel: "Send WhatsApp Ping",
  },
  {
    id: "notif_02",
    title: "Wholesaler Price Surge Alert",
    message: "Mile 12 suppliers don add 6% on top carton price. Check your stock balance before you rush go restock.",
    type: "price_alert",
    timestamp: "1 hour ago",
    read: false,
    actionLabel: "Check 7 Decisions",
  },
  {
    id: "notif_03",
    title: "Daily Market Milestone 🎉",
    message: "Oya celebrate! Your shop don cross ₦340,000 in gross sales today inside Balogun Market!",
    type: "sales_milestone",
    timestamp: "3 hours ago",
    read: true,
    amount: "₦340,500",
  },
  {
    id: "notif_04",
    title: "Customer Drop 5-Star Rating ⭐",
    message: "One customer just scan your counter QR Code give you 5 stars: 'Original goods only, derica measure complete!'",
    type: "rating_received",
    timestamp: "Yesterday",
    read: true,
    actionLabel: "Open Rating Stand",
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<MarketNotification[]>(INITIAL_NOTIFICATIONS);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Initialize permission and local storage cache
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("Notification" in window) {
        setPermission(Notification.permission);
      } else {
        setPermission("unsupported");
      }

      try {
        const cached = localStorage.getItem("moniepay_notifications");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNotifications(parsed);
          }
        }
      } catch {}
    }
  }, []);

  // Save to localStorage on change
  const saveNotifications = (newList: MarketNotification[]) => {
    setNotifications(newList);
    try {
      localStorage.setItem("moniepay_notifications", JSON.stringify(newList));
    } catch {}
  };

  // Toast trigger function
  const toast = useCallback(
    (
      title: string,
      message?: string,
      options?: { type?: "info" | "success" | "warning" | "error"; duration?: number }
    ) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const duration = options?.duration || 3000;
      const type = options?.type || "info";

      const newToast: ToastItem = {
        id,
        title,
        message,
        type,
        duration,
      };

      setToasts((prev) => [...prev.slice(-2), newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Request browser push permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === "granted") {
        new Notification("MoniePay Alerts Enabled", {
          body: "You will now receive instant alerts for customer debt payments, price changes, and sales records.",
          icon: "/favicon.ico",
        });
        toast("Push Alerts Activated", "You will get live shop notices.", { type: "success" });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [toast]);

  // Send a push notification (both browser push, in-app drawer, and instant toast)
  const sendPushNotification = useCallback(
    ({
      title,
      message,
      type = "sales_milestone",
      actionUrl,
      actionLabel,
      amount,
    }: {
      title: string;
      message: string;
      type?: MarketNotification["type"];
      actionUrl?: string;
      actionLabel?: string;
      amount?: string;
    }) => {
      const newNotif: MarketNotification = {
        id: `notif_${Date.now()}`,
        title,
        message,
        type,
        timestamp: "Just now",
        read: false,
        actionUrl,
        actionLabel,
        amount,
      };

      setNotifications((prev) => {
        const updated = [newNotif, ...prev.slice(0, 49)];
        try {
          localStorage.setItem("moniepay_notifications", JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // Also trigger instant floating toast
      const toastType: ToastItem["type"] =
        type === "sales_milestone" ? "success" : type === "price_alert" ? "error" : type === "debt_reminder" ? "warning" : "info";
      toast(title, message, { type: toastType });

      // Fire native browser notification if granted
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(title, {
            body: message,
            icon: "/favicon.ico",
          });
        } catch {}
      }
    },
    [toast]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      try {
        localStorage.setItem("moniepay_notifications", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      try {
        localStorage.setItem("moniepay_notifications", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    try {
      localStorage.removeItem("moniepay_notifications");
    } catch {}
  }, []);

  const notify = useCallback(
    (title: string, message?: string, type?: any) => {
      sendPushNotification({
        title,
        message: message || title,
        type: type || "sync_status",
      });
    },
    [sendPushNotification]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      sendPushNotification({
        title: `⚠️ ${title}`,
        message: message || title,
        type: "price_alert",
      });
    },
    [sendPushNotification]
  );

  const success = useCallback(
    (title: string, message?: string) => {
      sendPushNotification({
        title: `✅ ${title}`,
        message: message || title,
        type: "sales_milestone",
      });
    },
    [sendPushNotification]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      sendPushNotification({
        title: `⚡ ${title}`,
        message: message || title,
        type: "debt_reminder",
      });
    },
    [sendPushNotification]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        permission,
        isDrawerOpen,
        setIsDrawerOpen,
        requestPermission,
        sendPushNotification,
        notify,
        error,
        success,
        warning,
        toast,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}

      {/* ── FLOATING GLASSMORPHIC TOAST NOTIFICATION STACK ── */}
      <div className="fixed top-4 sm:top-5 inset-x-0 z-[99999] pointer-events-none flex flex-col items-center gap-2 px-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.94, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 480, damping: 32 }}
              className="pointer-events-auto w-full max-w-sm sm:max-w-md rounded-[22px] backdrop-blur-xl bg-[#edf3fb]/60 sm:bg-[#edf3fb]/65 border border-white/40 shadow-[0_12px_28px_rgba(154,180,214,0.22),0_2px_8px_rgba(154,180,214,0.1)] ring-1 ring-white/20 px-3.5 py-2.5 flex items-center gap-3 relative overflow-hidden text-slate-800"
            >
              {/* Soft ambient refraction highlight */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/35 border border-white/45 shadow-2xs shrink-0">
                {t.type === "success" && <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 stroke-[2.5]" />}
                {t.type === "error" && <AlertCircle className="h-4.5 w-4.5 text-rose-600 stroke-[2.5]" />}
                {t.type === "warning" && <AlertTriangle className="h-4.5 w-4.5 text-amber-600 stroke-[2.5]" />}
                {t.type === "info" && <Info className="h-4.5 w-4.5 text-blue-600 stroke-[2.5]" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 leading-tight tracking-tight truncate">
                  {t.title}
                </p>
                {t.message && (
                  <p className="text-[11px] font-semibold text-slate-600 leading-tight truncate mt-0.5">
                    {t.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/30 transition-all shrink-0 cursor-pointer"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

export const useNotification = useNotifications;
export const useToast = () => {
  const { toast } = useNotifications();
  return { toast };
};

