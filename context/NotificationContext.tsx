"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Push Notification & Market Intelligence Alerts Context
// Native Web Push API + Offline-ready In-App Notification Center
// ─────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Send a push notification (both browser push and in-app alert)
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
    []
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
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
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
