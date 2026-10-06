"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Shop Notifications & Push Alerts Drawer
// Real-time Nigerian Market Alerts: Debts, Price Surges, Sales
// ─────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  Bell,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Star,
  Zap,
  Phone,
  ArrowRight,
  ShieldCheck,
  Trash2,
  Check,
  Sparkles,
  Info,
  Radio,
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
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<"all" | "debts" | "alerts" | "sales">("all");
  const [testSent, setTestSent] = useState(false);

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "debts") return n.type === "debt_reminder";
    if (activeFilter === "alerts") return n.type === "price_alert";
    if (activeFilter === "sales") return n.type === "sales_milestone" || n.type === "rating_received";
    return true;
  });

  const handleSendTestPush = () => {
    sendPushNotification({
      title: "₦45,000 Sale Recorded",
      message: "Customer paid via instant bank transfer at Balogun Market.",
      type: "sales_milestone",
      amount: "₦45,000",
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2000);
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
        return <Star className="h-4 w-4 text-amber-500 fill-amber-400" />;
      default:
        return <Bell className="h-4 w-4 text-emerald-600" />;
    }
  };

  return (
    <>
      {/* ── HEADER BELL TRIGGER BUTTON ── */}
      <InfoTooltip content={unreadCount > 0 ? `${unreadCount} unread shop alerts` : "Shop alerts & push notifications"}>
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="relative flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-white/15 text-white hover:bg-white/25 active:scale-95 transition-all cursor-pointer backdrop-blur-md border border-white/20"
          aria-label="Shop Notifications"
        >
          <Bell className="h-4 w-4 text-emerald-100" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-emerald-900 animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </InfoTooltip>

      {/* ── NOTIFICATION DRAWER / SLIDE-OVER ── */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
            {/* Backdrop click */}
            <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />

            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="relative w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden text-slate-900"
            >
              {/* Drawer Top Header */}
              <div className="bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#047857] px-5 py-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 border border-white/20">
                    <Bell className="h-4 w-4 text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight leading-none">Shop &amp; Market Alerts</h3>
                    <p className="text-[10.5px] text-emerald-200 font-semibold mt-0.5">
                      Real-time alerts for your shop
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Push Permission Prompt Strip */}
              {permission !== "granted" && permission !== "unsupported" && (
                <div className="p-3 bg-amber-50 border-b border-amber-200/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Radio className="h-4 w-4 text-amber-600 shrink-0 animate-pulse" />
                    <p className="text-[11px] font-bold text-amber-900 leading-tight">
                      Turn on Push Alerts for instant sales &amp; debt reminders
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={requestPermission}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10.5px] font-black shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    Enable
                  </button>
                </div>
              )}

              {/* Filter Tabs & Quick Actions */}
              <div className="p-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {[
                    { id: "all", label: "All" },
                    { id: "debts", label: "Debts" },
                    { id: "alerts", label: "Price Surges" },
                    { id: "sales", label: "Sales" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveFilter(tab.id as any)}
                      className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                        activeFilter === tab.id
                          ? "bg-emerald-700 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-900 bg-white border border-slate-200/60"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[10.5px] font-bold text-emerald-700 hover:text-emerald-900 shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    <span>Mark read</span>
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => markAsRead(n.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                        n.read
                          ? "bg-white border-slate-200/70 text-slate-700"
                          : "bg-emerald-50/40 border-emerald-300 text-slate-900 shadow-xs"
                      }`}
                    >
                      {!n.read && (
                        <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-emerald-600" />
                      )}

                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-white border border-slate-200/80 shrink-0 shadow-2xs mt-0.5">
                          {getNotificationIcon(n.type)}
                        </div>

                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black text-slate-900 leading-tight truncate">
                              {n.title}
                            </h4>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                            {n.message}
                          </p>

                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-slate-400">
                              {n.timestamp}
                            </span>

                            {n.amount && (
                              <span className="text-xs font-black text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md font-mono">
                                {n.amount}
                              </span>
                            )}
                          </div>

                          {/* Quick Action Button */}
                          {n.actionLabel && (
                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1">
                                <span>{n.actionLabel}</span>
                                <ArrowRight className="h-3 w-3" />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 space-y-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto">
                      <Bell className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-600">No alerts in this category</p>
                    <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                      Your shop notifications and market alerts will appear here.
                    </p>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleSendTestPush}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{testSent ? "Alert Sent!" : "Test Push Alert"}</span>
                </button>

                <button
                  type="button"
                  onClick={clearNotifications}
                  className="px-2.5 py-2 rounded-xl text-slate-400 hover:text-rose-600 text-xs font-bold cursor-pointer transition-colors"
                  title="Clear all alerts"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
