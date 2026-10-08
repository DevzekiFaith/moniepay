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

export interface DebtReminderParams {
  personName: string;
  amount: number;
  dueDate?: string;
  phone?: string;
  notes?: string;
  debtType?: "CUSTOMER_CREDIT" | "SUPPLIER_OBLIGATION";
  isOverdue?: boolean;
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
  sendDebtReminderNotification: (params: DebtReminderParams) => void;
  notify: (title: string, message?: string, type?: any) => void;
  error: (title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  toast: (title: string, message?: string, options?: { type?: "info" | "success" | "warning" | "error"; duration?: number }) => void;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  toggleSound: () => void;
  toggleVibration: () => void;
  testFeedback: () => void;
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
    title: "Customer Drop 5-Point Review 👍",
    message: "One customer just scan your counter QR Code give you 5.0 rating: 'Original goods only, derica measure complete!'",
    type: "rating_received",
    timestamp: "Yesterday",
    read: true,
    actionLabel: "Open Rating Stand",
  },
];

// Synthetic Web Audio API Audio Chime (Zero external assets, instant 100% offline playback)
function playNotificationChime(type: "debt" | "success" | "review" | "general" = "debt") {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    if (type === "debt") {
      // Urgent, clear two-tone shop alert chime (587Hz -> 880Hz)
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    } else if (type === "success") {
      // Pleasant cash drawer success chime (523Hz -> 784Hz)
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(784, ctx.currentTime + 0.14);
    } else if (type === "review") {
      // Harmonious review confirmation chime (440Hz -> 659Hz)
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15);
    } else {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(554.37, ctx.currentTime + 0.1);
    }

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.33);
  } catch {}
}

// Native Haptic Vibration Pattern trigger (Zero overhead, Works on mobile & PWA)
function triggerHapticVibration(type: "debt" | "success" | "review" | "general" = "debt") {
  if (typeof window === "undefined" || typeof navigator === "undefined" || !("vibrate" in navigator)) {
    return;
  }
  try {
    if (type === "debt") {
      // Urgent double buzz for debt / overdue reminders
      navigator.vibrate([140, 70, 140]);
    } else if (type === "success") {
      // Cheerful cash confirmation buzz
      navigator.vibrate([100, 50, 150]);
    } else if (type === "review") {
      // Celebratory review double tap
      navigator.vibrate([80, 50, 100]);
    } else {
      // Soft single tap
      navigator.vibrate(100);
    }
  } catch {}
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<MarketNotification[]>(INITIAL_NOTIFICATIONS);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);

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

  // Automatic Background Debt Scanner (Scans due & overdue debts automatically every 60s & on load)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const runAutoDebtScan = () => {
      try {
        const raw = localStorage.getItem("moniepay_debts");
        if (!raw) return;
        const debts: any[] = JSON.parse(raw);
        if (!Array.isArray(debts) || debts.length === 0) return;

        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];
        const pingedKey = `moniepay_debts_autoping_${todayStr}`;
        const pingedIds: Record<string, boolean> = JSON.parse(localStorage.getItem(pingedKey) || "{}");

        let hasNewAlerts = false;
        const newAlerts: MarketNotification[] = [];

        debts.forEach((debt) => {
          if (debt.status === "SETTLED") return;

          const isOverdue = debt.status === "OVERDUE" || (debt.due_date && new Date(debt.due_date) < now);
          const isDueToday = debt.due_date && new Date(debt.due_date).toDateString() === now.toDateString();

          if ((isOverdue || isDueToday) && !pingedIds[debt.id]) {
            pingedIds[debt.id] = true;
            hasNewAlerts = true;

            const isSupplier = debt.debt_type === "SUPPLIER_OBLIGATION";
            const formattedAmount = `₦${Number(debt.balance_due || 0).toLocaleString()}`;
            const cleanPhone = (debt.phone || "").replace(/[^0-9]/g, "");

            const title = isSupplier
              ? isOverdue
                ? "⚠️ Overdue Supplier Payment"
                : "⏰ Supplier Payment Due Today"
              : isOverdue
              ? "🚨 Overdue Customer Gbese Due"
              : "🔔 Customer Gbese Due Today";

            const message = isSupplier
              ? `You owe ${debt.person_name} ${formattedAmount}${debt.notes ? ` (${debt.notes})` : ""}. Settle on time make supplier continue giving you goods on credit.`
              : `${debt.person_name} owes your shop ${formattedAmount}${debt.notes ? ` for ${debt.notes}` : ""}. Tap to send WhatsApp reminder now.`;

            const actionLabel = isSupplier ? "Record Payment" : "Send WhatsApp Nudge";
            const actionUrl = isSupplier
              ? "/accounts"
              : cleanPhone
              ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  `Good day ${debt.person_name}, hope work dey go well. Abeg kindly remember your balance of ${formattedAmount} with our shop. We need am for fresh market restock today. Thank you and God bless your hustle!`
                )}`
              : undefined;

            newAlerts.push({
              id: `auto_debt_${debt.id}_${Date.now()}`,
              title,
              message,
              type: "debt_reminder",
              timestamp: "Just now",
              read: false,
              amount: formattedAmount,
              actionLabel,
              actionUrl,
            });

            // Play in-app audio chime beep
            playNotificationChime("debt");

            // Native OS browser notification if granted
            if ("Notification" in window && Notification.permission === "granted") {
              try {
                new Notification(title, {
                  body: message,
                  icon: "/icons/icon-192x192.png",
                });
              } catch {}
            }
          }
        });

        if (hasNewAlerts && newAlerts.length > 0) {
          localStorage.setItem(pingedKey, JSON.stringify(pingedIds));
          setNotifications((prev) => {
            const updated = [...newAlerts, ...prev];
            try {
              localStorage.setItem("moniepay_notifications", JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
      } catch (err) {
        console.warn("Auto debt scan error:", err);
      }
    };

    // 1. Initial Auto-scan 1.5s after load
    const initialTimer = setTimeout(runAutoDebtScan, 1500);

    // 2. Periodic background interval: every 60 seconds
    const intervalTimer = setInterval(runAutoDebtScan, 60000);

    // 3. Scan on window focus (when trader switches back to MoniePay tab)
    window.addEventListener("focus", runAutoDebtScan);
    window.addEventListener("moniepay:debts-updated", runAutoDebtScan);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
      window.removeEventListener("focus", runAutoDebtScan);
      window.removeEventListener("moniepay:debts-updated", runAutoDebtScan);
    };
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
  // Initialize sound and vibration preferences
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSound = localStorage.getItem("moniepay_notif_sound");
      if (savedSound !== null) setSoundEnabled(savedSound === "true");
      const savedVib = localStorage.getItem("moniepay_notif_vibration");
      if (savedVib !== null) setVibrationEnabled(savedVib === "true");
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("moniepay_notif_sound", String(next));
      } catch {}
      if (next) {
        playNotificationChime("success");
      }
      return next;
    });
  }, []);

  const toggleVibration = useCallback(() => {
    setVibrationEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("moniepay_notif_vibration", String(next));
      } catch {}
      if (next) {
        triggerHapticVibration("success");
      }
      return next;
    });
  }, []);

  const testFeedback = useCallback(() => {
    if (soundEnabled) playNotificationChime("success");
    if (vibrationEnabled) triggerHapticVibration("success");
  }, [soundEnabled, vibrationEnabled]);

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

      // Play in-app audio chime & haptics if enabled
      if (soundEnabled) {
        playNotificationChime(
          type === "debt_reminder" ? "debt" : type === "sales_milestone" ? "success" : type === "rating_received" ? "review" : "general"
        );
      }
      if (vibrationEnabled) {
        triggerHapticVibration(
          type === "debt_reminder" ? "debt" : type === "sales_milestone" ? "success" : type === "rating_received" ? "review" : "general"
        );
      }

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
    [toast, soundEnabled, vibrationEnabled]
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

  const sendDebtReminderNotification = useCallback(
    (params: DebtReminderParams) => {
      const { personName, amount, dueDate, phone, notes, debtType, isOverdue } = params;
      const isSupplier = debtType === "SUPPLIER_OBLIGATION";
      const cleanPhone = (phone || "").replace(/[^0-9]/g, "");

      const title = isSupplier
        ? isOverdue
          ? "⚠️ Overdue Supplier Payment Due"
          : "⏰ Supplier Payment Due"
        : isOverdue
        ? "🚨 Overdue Customer Gbese Due"
        : "🔔 Customer Gbese Reminder Due";

      const formattedAmount = `₦${Number(amount || 0).toLocaleString()}`;

      const message = isSupplier
        ? `You owe ${personName} ${formattedAmount}${notes ? ` (${notes})` : ""}${dueDate ? ` due ${dueDate}` : ""}. Pay on time make goods keep flowing.`
        : `${personName} owes your shop ${formattedAmount}${notes ? ` for ${notes}` : ""}${dueDate ? ` (promised ${dueDate})` : ""}. Tap to send WhatsApp reminder now.`;

      const actionLabel = isSupplier ? "Record Supplier Payment" : "Send WhatsApp Nudge";
      
      const actionUrl = isSupplier
        ? "/accounts"
        : cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            `Good day ${personName}, hope work dey go well. Abeg kindly remember your balance of ${formattedAmount} with our shop. We need am for fresh market restock today. Thank you and God bless your hustle!`
          )}`
        : undefined;

      sendPushNotification({
        title,
        message,
        type: "debt_reminder",
        amount: formattedAmount,
        actionLabel,
        actionUrl,
      });

      toast(
        isSupplier ? "Supplier Alert Scheduled ⏰" : "Customer Gbese Alert Created 🔔",
        `Reminder set for ${personName} (${formattedAmount})`,
        { type: "warning", duration: 4000 }
      );
    },
    [sendPushNotification, toast]
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
        sendDebtReminderNotification,
        notify,
        error,
        success,
        warning,
        toast,
        soundEnabled,
        vibrationEnabled,
        toggleSound,
        toggleVibration,
        testFeedback,
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

