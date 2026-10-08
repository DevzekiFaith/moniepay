"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Shop Notifications & Push Alerts Drawer
// Real-time Nigerian Market Alerts: Debts, Price Surges, Sales
// Tactile Glassmorphism, Actionable WhatsApp Pings, Web Audio Chime
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  X,
  AlertCircle,
  TrendingUp,
  ThumbsUp,
  Zap,
  Phone,
  ArrowRight,
  Trash2,
  Check,
  BellRing,
  Radio,
  ExternalLink,
  Store,
  Volume2,
  VolumeX,
  Vibrate,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications, MarketNotification } from "@/context/NotificationContext";
import { InfoTooltip } from "@/components/ui/tooltip";

export function NotificationBellDrawer() {
  const {
    notifications,
    unreadCount,
    permission,
    isDrawerOpen,
    setIsDrawerOpen,
    requestPermission,
    sendPushNotification,
    sendDebtReminderNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    soundEnabled,
    vibrationEnabled,
    toggleSound,
    toggleVibration,
    testFeedback,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<"all" | "debts" | "alerts" | "sales">("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, setIsDrawerOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

  // Count per category
  const debtCount = notifications.filter((n) => n.type === "debt_reminder" && !n.read).length;
  const alertCount = notifications.filter((n) => n.type === "price_alert" && !n.read).length;
  const salesCount = notifications.filter(
    (n) => (n.type === "sales_milestone" || n.type === "rating_received") && !n.read
  ).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "debts") return n.type === "debt_reminder";
    if (activeFilter === "alerts") return n.type === "price_alert";
    if (activeFilter === "sales") return n.type === "sales_milestone" || n.type === "rating_received";
    return true;
  });

  const handleActionClick = (n: MarketNotification, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(n.id);

    if (n.actionUrl) {
      if (n.actionUrl.startsWith("http")) {
        window.open(n.actionUrl, "_blank");
        return;
      } else if (n.actionUrl.startsWith("/")) {
        setIsDrawerOpen(false);
        window.location.href = n.actionUrl;
        return;
      }
    }

    if (n.type === "debt_reminder") {
      const waMsg = encodeURIComponent(
        `Good day, hope work dey go well. Abeg friendly reminder from our shop about the ${n.amount || "pending balance"} due today. We need am for market restock. Thank you and God bless your hustle!`
      );
      window.open(`https://wa.me/?text=${waMsg}`, "_blank");
    } else if (n.type === "price_alert") {
      setIsDrawerOpen(false);
      const el = document.getElementById("decisions-grid");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (n.type === "rating_received") {
      setIsDrawerOpen(false);
      window.location.href = "/rate";
    }
  };

  const getNotificationIcon = (type: MarketNotification["type"]) => {
    switch (type) {
      case "debt_reminder":
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      case "price_alert":
        return <TrendingUp className="h-4 w-4 text-rose-600" />;
      case "sales_milestone":
        return <Zap className="h-4 w-4 text-emerald-600" />;
      case "rating_received":
        return <ThumbsUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Bell className="h-4 w-4 text-emerald-600" />;
    }
  };

  // Drawer Portal Component to escape parent stacking context
  const drawerPortal = isDrawerOpen && mounted ? (
    createPortal(
      <AnimatePresence>
        {isDrawerOpen && (
          <div
            className="fixed inset-0 z-[9999] flex items-end sm:items-stretch sm:justify-end bg-slate-950/75 backdrop-blur-sm transition-opacity"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            {/* Backdrop click to dismiss */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-transparent"
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Slide-over Drawer / Bottom Sheet Container with Soft Translucent Ice-Glass */}
            <motion.div
              initial={{ y: "100%", opacity: 0.9 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.9 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className="relative w-full sm:max-w-md h-[90vh] sm:h-full rounded-t-[36px] sm:rounded-none sm:rounded-l-[36px] p-0 flex flex-col z-20 overflow-hidden text-slate-800 dark:text-slate-100 shadow-[0_20px_50px_rgba(154,180,214,0.3)] dark:shadow-2xl border-t sm:border-t-0 sm:border-l border-white/40 dark:border-white/10 backdrop-blur-2xl bg-[#edf3fb]/65 sm:bg-[#edf3fb]/75 dark:bg-slate-900/95"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Drag Handle */}
              <div className="flex sm:hidden justify-center pt-2.5 pb-1 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950">
                <span className="h-1.5 w-12 rounded-full bg-white/30" />
              </div>

              {/* Drawer Top Sapphire Glass Header */}
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 px-5 py-4 text-white flex items-center justify-between border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-inner">
                    <BellRing className="h-5 w-5 text-blue-200" />
                  </div>
                  <div>
                    <h3 id="drawer-title" className="text-base font-black tracking-tight leading-none text-white">
                      Wetin Dey Happen (Shop Alerts)
                    </h3>
                    <p className="text-[11px] text-blue-200 font-semibold mt-1">
                      Real-time market &amp; customer debt updates
                    </p>
                  </div>
                </div>

                {/* Sound, Vibration & Close Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleSound}
                    aria-label={soundEnabled ? "Sound ON (Tap make e off)" : "Sound OFF (Tap make e on)"}
                    title={soundEnabled ? "Notification sound: ON (Tap make e off)" : "Notification sound: OFF (Tap make e on)"}
                    className={`flex h-8 w-8 items-center justify-center rounded-xl border backdrop-blur-md transition-all cursor-pointer active:scale-95 ${
                      soundEnabled
                        ? "bg-white/20 hover:bg-white/30 text-emerald-300 border-white/25 shadow-xs"
                        : "bg-white/10 hover:bg-white/20 text-slate-400 border-white/10 opacity-70"
                    }`}
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={toggleVibration}
                    aria-label={vibrationEnabled ? "Vibration ON (Tap make e off)" : "Vibration OFF (Tap make e on)"}
                    title={vibrationEnabled ? "Phone vibration: ON (Tap make e off)" : "Phone vibration: OFF (Tap make e on)"}
                    className={`flex h-8 w-8 items-center justify-center rounded-xl border backdrop-blur-md transition-all cursor-pointer active:scale-95 ${
                      vibrationEnabled
                        ? "bg-white/20 hover:bg-white/30 text-emerald-300 border-white/25 shadow-xs"
                        : "bg-white/10 hover:bg-white/20 text-slate-400 border-white/10 opacity-70"
                    }`}
                  >
                    <Vibrate className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    aria-label="Close notification drawer"
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer backdrop-blur-md border border-white/20 active:scale-95 ml-0.5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Push Permission Prompt Strip */}
              {permission !== "granted" && permission !== "unsupported" && (
                <div className="p-3 bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/20 dark:border-amber-800 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Radio className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
                    <p className="text-[11px] font-bold text-amber-950 dark:text-amber-200 leading-tight">
                      Turn on phone alerts make MoniePay ping you sharp-sharp when customer pay
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={requestPermission}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-black shrink-0 shadow-sm cursor-pointer active:scale-95 transition-all"
                  >
                    Enable
                  </button>
                </div>
              )}

              {/* Filter Tabs & Quick Actions */}
              <div className="p-3 border-b border-white/40 dark:border-white/10 bg-[#edf3fb]/40 dark:bg-slate-900/40 backdrop-blur-md flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {[
                    { id: "all", label: "Everything", count: unreadCount },
                    { id: "debts", label: "Customer Gbese", count: debtCount },
                    { id: "alerts", label: "Price Alerts", count: alertCount },
                    { id: "sales", label: "Money & Reviews", count: salesCount },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveFilter(tab.id as any)}
                      className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        activeFilter === tab.id
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/25 dark:bg-slate-800/60 hover:bg-white/40 dark:hover:bg-slate-800 border border-white/40 dark:border-white/10"
                      }`}
                    >
                      <span>{tab.label}</span>
                      {tab.count > 0 && (
                        <span
                          className={`text-[9.5px] px-1.5 py-0.5 rounded-full font-bold ${
                            activeFilter === tab.id
                              ? "bg-white/25 text-white"
                              : "bg-blue-100/80 dark:bg-blue-950 text-blue-900 dark:text-blue-200"
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 shrink-0 cursor-pointer flex items-center gap-1 bg-blue-50/80 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 px-2.5 py-1.5 rounded-xl border border-blue-200/60 dark:border-blue-800 transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Mark all</span>
                  </button>
                )}
              </div>

              {/* Notification List Body with Translucent Frosted Cards */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 min-h-0 bg-[#edf3fb]/20 dark:bg-slate-950/40">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => markAsRead(n.id)}
                      className={`p-3.5 sm:p-4 rounded-2xl transition-all cursor-pointer relative ${
                        n.read
                          ? "bg-white/25 dark:bg-slate-800/40 hover:bg-white/40 dark:hover:bg-slate-800/60 border border-white/35 dark:border-white/10 text-slate-700 dark:text-slate-300 shadow-2xs"
                          : "bg-white/45 dark:bg-slate-800/80 hover:bg-white/55 dark:hover:bg-slate-800 border border-blue-300/50 dark:border-blue-700/60 text-slate-900 dark:text-white shadow-xs ring-1 ring-blue-400/20"
                      }`}
                    >
                      {!n.read && (
                        <span className="absolute top-3.5 right-3.5 h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-blue-200 dark:ring-blue-900 animate-pulse" />
                      )}

                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2.5 rounded-2xl bg-white/40 dark:bg-slate-700/60 border border-white/50 dark:border-white/10 shadow-2xs shrink-0 mt-0.5 ${
                            n.type === "debt_reminder"
                              ? "text-amber-600 dark:text-amber-400"
                              : n.type === "price_alert"
                              ? "text-rose-600 dark:text-rose-400"
                              : n.type === "sales_milestone"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-amber-500 dark:text-amber-400"
                          }`}
                        >
                          {getNotificationIcon(n.type)}
                        </div>

                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                            {n.title}
                          </h4>

                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1 font-medium">
                            {n.message}
                          </p>

                          <div className="mt-2.5 flex items-center justify-between gap-2">
                            <span className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500">
                              {n.timestamp}
                            </span>

                            {n.amount && (
                              <span className="text-xs font-black text-blue-900 dark:text-blue-200 bg-blue-50/70 dark:bg-blue-950/80 border border-blue-200/60 dark:border-blue-800 px-2.5 py-0.5 rounded-xl font-mono shadow-2xs">
                                {n.amount}
                              </span>
                            )}
                          </div>

                          {/* Actionable Button */}
                          {n.actionLabel && (
                            <div className="mt-2.5 pt-2 border-t border-white/30 dark:border-white/10 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={(e) => handleActionClick(n, e)}
                                className="text-xs font-black text-white inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl clay-btn-primary active:scale-95 transition-all cursor-pointer"
                              >
                                <span>{n.actionLabel}</span>
                                <ArrowRight className="h-3.5 w-3.5 text-white" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-16 space-y-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/30 dark:bg-slate-800 border border-white/45 dark:border-white/10 text-slate-400 dark:text-slate-500 mx-auto">
                      <Bell className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-700 dark:text-slate-200">No alert for this section right now</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto mt-0.5 font-medium leading-relaxed">
                        Your customer debts, sales progress and market price updates go appear here.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-3.5 sm:p-4 bg-[#edf3fb]/60 dark:bg-slate-900/90 backdrop-blur-md border-t border-white/40 dark:border-white/10 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Due debt & market alerts sync automatically</span>
                </div>

                <button
                  type="button"
                  onClick={clearNotifications}
                  className="p-2 rounded-xl bg-white/40 dark:bg-slate-800 hover:bg-white/70 dark:hover:bg-slate-700 border border-white/50 dark:border-white/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                  title="Clear all alerts"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )
  ) : null;

  return (
    <>
      {/* ── HEADER BELL TRIGGER BUTTON ── */}
      <InfoTooltip content={unreadCount > 0 ? `${unreadCount} unread shop alerts` : "Shop alerts & push notifications"}>
        <button
          type="button"
          onClick={() => {
            testFeedback();
            setIsDrawerOpen(true);
          }}
          className="relative flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-white/15 text-white hover:bg-white/25 active:scale-95 transition-all cursor-pointer backdrop-blur-md border border-white/20 shadow-xs"
          aria-label="Shop Notifications"
        >
          <Bell className="h-4 w-4 text-emerald-100" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-emerald-900 shadow-sm animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </InfoTooltip>

      {/* ── PORTALLED NOTIFICATION MODAL / DRAWER (z-[9999]) ── */}
      {drawerPortal}
    </>
  );
}
