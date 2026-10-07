"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Subscription & Free Trial Banner Card Widget
// Prominently displays:
// - 7-Day Free Trial Days Left / Grace Period Days Left / Active Status
// - Visual countdown progress bar
// - Monthly (₦1,500/mo) vs Annual (₦15,000/yr) upgrade triggers
// - 1-Tap PWA Install App button
// - Solid MoniePay Sapphire Blue (no gradients)
// - Zero Data Deletion Guarantee
// ─────────────────────────────────────────────────────────────────

import React from "react";
import {
  ShieldCheck,
  Zap,
  Store,
  Clock,
  CheckCircle2,
  ArrowRight,
  Download,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSubscription } from "@/context/SubscriptionContext";
import { triggerInstallPrompt } from "@/components/pwa/InstallAppBanner";

interface SubscriptionBannerCardProps {
  compact?: boolean;
}

export function SubscriptionBannerCard({ compact = false }: SubscriptionBannerCardProps) {
  const {
    subscription,
    trialDaysLeft,
    graceDaysLeft,
    isTrialActive,
    isSubscribed,
    isGracePeriodActive,
    isExpired,
    openUpgradeModal,
  } = useSubscription();

  const nextRenewalFormatted = subscription?.subscriptionEndsAt
    ? new Date(subscription.subscriptionEndsAt).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="clay-card-sm p-4 sm:p-5 relative overflow-hidden bg-white border border-slate-200/80 shadow-xs rounded-3xl"
    >
      <div className="space-y-3.5 relative z-10">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2.5">
            <div
              className={`h-9 w-9 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                isSubscribed
                  ? "bg-emerald-600 text-white"
                  : isGracePeriodActive
                  ? "bg-amber-500 text-white"
                  : isTrialActive
                  ? "bg-[#1d4ed8] text-white"
                  : "bg-rose-600 text-white"
              }`}
            >
              {isSubscribed ? (
                <ShieldCheck className="h-5 w-5" />
              ) : isGracePeriodActive ? (
                <Clock className="h-5 w-5 animate-pulse" />
              ) : isTrialActive ? (
                <Store className="h-5 w-5 text-white" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                  {isSubscribed
                    ? subscription?.planName || "MoniePay Plus Active"
                    : isGracePeriodActive
                    ? "3-Day Grace Period Active"
                    : isTrialActive
                    ? "7-Day Free Trial"
                    : "Subscription Expired (Read-Only)"}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isSubscribed
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : isGracePeriodActive
                      ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                      : isTrialActive
                      ? "bg-blue-50 text-blue-900 border border-blue-200"
                      : "bg-rose-100 text-rose-900 border border-rose-300"
                  }`}
                >
                  {isSubscribed
                    ? "Subscribed"
                    : isGracePeriodActive
                    ? `${graceDaysLeft}d Left`
                    : isTrialActive
                    ? `${trialDaysLeft}d Left`
                    : "Renew"}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {isSubscribed
                  ? `All Plus features active • Renews on ${nextRenewalFormatted || "Active"}`
                  : isGracePeriodActive
                  ? "Full access open for 3 days. Renew now to prevent any restriction."
                  : isTrialActive
                  ? `${trialDaysLeft} days remaining of full free shop intelligence access.`
                  : "Renew for ₦1,500/month or ₦15,000/year to continue recording."}
              </p>
            </div>
          </div>

          {/* Quick Install App Button */}
          <button
            type="button"
            onClick={triggerInstallPrompt}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-black text-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer shrink-0"
            title="Install MoniePay as a standalone app on your phone"
          >
            <Download className="h-3.5 w-3.5 text-[#1d4ed8]" />
            <span>Install App 📲</span>
          </button>
        </div>

        {/* Visual Progress Bar for Trial / Grace */}
        {isTrialActive && (
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span className="flex items-center gap-1 text-slate-900 font-black">
                <Clock className="h-3.5 w-3.5 text-[#1d4ed8]" />
                {trialDaysLeft} of 7 Days Remaining
              </span>
              <span className="text-slate-500 text-[10.5px]">One-time trial per shop</span>
            </div>

            {/* Visual Segments Bar */}
            <div className="grid grid-cols-7 gap-1.5 pt-0.5">
              {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                const isPassed = dayNum <= 7 - trialDaysLeft;
                const isCurrent = dayNum === 7 - trialDaysLeft + 1;

                return (
                  <div
                    key={dayNum}
                    className={`h-2 rounded-full transition-all ${
                      isPassed
                        ? "bg-slate-300"
                        : isCurrent
                        ? "bg-[#1d4ed8] animate-pulse shadow-xs"
                        : "bg-[#3b82f6]"
                    }`}
                    title={`Day ${dayNum}`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Action Controls & Value Pitch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1 text-slate-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              ₦1,500/mo or ₦15,000/yr
            </span>
            <span>•</span>
            <span className="text-slate-500 text-[11px]">Zero data deletion</span>
          </div>

          {/* Solid MoniePay Blue Button (No Gradient) */}
          <button
            type="button"
            onClick={() =>
              openUpgradeModal(
                isExpired
                  ? "Your MoniePay Plus has expired. Renew for ₦1,500/month or ₦15,000/year to continue."
                  : undefined
              )
            }
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm transition-all"
          >
            <span>{isSubscribed ? "Manage Plan" : isExpired ? "Renew MoniePay Plus" : "Upgrade to Plus"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.section>
  );
}
