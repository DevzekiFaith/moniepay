"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Subscription & Free Trial Banner Card Widget
// Clean, Modern, 100% Mobile Responsive • Zero Overflow
// ─────────────────────────────────────────────────────────────────

import React from "react";
import {
  ShieldCheck,
  Store,
  Clock,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  AlertTriangle,
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
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-white/10 p-3.5 sm:p-4.5 shadow-sm transition-colors"
    >
      <div className="space-y-3 sm:space-y-3.5 relative z-10">
        {/* ── TOP HEADER ROW ── */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
            {/* Dynamic Status Icon */}
            <div
              className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-2xs border ${
                isSubscribed
                  ? "bg-emerald-600 border-emerald-500 text-white"
                  : isGracePeriodActive
                  ? "bg-amber-500 border-amber-400 text-white animate-pulse"
                  : isTrialActive
                  ? "bg-[#1d4ed8] border-blue-600 text-white shadow-[0_4px_12px_rgba(29,78,216,0.25)]"
                  : "bg-rose-600 border-rose-500 text-white"
              }`}
            >
              {isSubscribed ? (
                <ShieldCheck className="h-5 w-5" />
              ) : isGracePeriodActive ? (
                <Clock className="h-5 w-5" />
              ) : isTrialActive ? (
                <Store className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>

            {/* Title & Badge */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                  {isSubscribed
                    ? subscription?.planName || "MoniePay Plus Active"
                    : isGracePeriodActive
                    ? "Grace Period Active"
                    : isTrialActive
                    ? "7 Days Free Shop Test-Run"
                    : "Subscription Don Expire"}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide border ${
                    isSubscribed
                      ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      : isGracePeriodActive
                      ? "bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse"
                      : isTrialActive
                      ? "bg-blue-50 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                      : "bg-rose-50 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-800"
                  }`}
                >
                  {isSubscribed
                    ? "Plus Active"
                    : isGracePeriodActive
                    ? `${graceDaysLeft}d Grace`
                    : isTrialActive
                    ? `${trialDaysLeft}d Remain`
                    : "Renew Now"}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-snug">
                {isSubscribed
                  ? `Renews on ${nextRenewalFormatted || "Active"}`
                  : isGracePeriodActive
                  ? "Full access dey open. Renew make your record no pause."
                  : isTrialActive
                  ? `You get ${trialDaysLeft} days remaining of sharp-sharp shop intelligence.`
                  : "Renew for ₦1,500/mo make you continue recording."}
              </p>
            </div>
          </div>

          {/* Install App Button */}
          <button
            type="button"
            onClick={triggerInstallPrompt}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[10.5px] font-black text-slate-700 dark:text-slate-200 active:scale-95 transition-all cursor-pointer shrink-0 shadow-2xs"
            title="Install MoniePay app on your phone"
          >
            <Smartphone className="h-3 w-3 text-[#1d4ed8] dark:text-blue-400" />
            <span className="hidden min-[360px]:inline">Install App</span>
            <span className="inline min-[360px]:hidden">App</span>
          </button>
        </div>

        {/* ── VISUAL PROGRESS CAPSULE (Trial Mode) ── */}
        {isTrialActive && (
          <div className="bg-slate-50/90 dark:bg-slate-800/60 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-900 dark:text-white font-black text-[11.5px]">
                <Clock className="h-3.5 w-3.5 text-[#1d4ed8] dark:text-blue-400" />
                Day {7 - trialDaysLeft + 1} of 7 don enter
              </span>
              <span className="text-[10.5px] font-black text-[#1d4ed8] dark:text-sky-300 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                {trialDaysLeft} {trialDaysLeft === 1 ? "Day" : "Days"} Left
              </span>
            </div>

            {/* 7-Segmented Day Pills */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                const isPassed = dayNum <= 7 - trialDaysLeft;
                const isCurrent = dayNum === 7 - trialDaysLeft + 1;

                return (
                  <div key={dayNum} className="space-y-1 text-center">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isPassed
                          ? "bg-slate-300 dark:bg-slate-700"
                          : isCurrent
                          ? "bg-[#1d4ed8] dark:bg-sky-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse"
                          : "bg-slate-200 dark:bg-slate-800"
                      }`}
                    />
                    <span
                      className={`text-[9px] font-black block leading-none ${
                        isCurrent
                          ? "text-[#1d4ed8] dark:text-sky-400"
                          : isPassed
                          ? "text-slate-500 dark:text-slate-400"
                          : "text-slate-400 dark:text-slate-600"
                      }`}
                    >
                      D{dayNum}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-0.5 border-t border-slate-200/60 dark:border-slate-700/60">
              <span>One free trial per shop</span>
              <span className="text-[#1d4ed8] dark:text-sky-400 font-bold">Upgrade anytime without wahala</span>
            </div>
          </div>
        )}

        {/* ── FOOTER ROW ── */}
        <div className="flex items-center justify-between gap-2.5 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 min-w-0">
            <span className="inline-flex items-center gap-1 text-slate-900 dark:text-white font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10.5px] truncate">
              <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
              <span>₦1,500/mo</span>
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">• Record safe forever</span>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() =>
              openUpgradeModal(
                isExpired
                  ? "Your MoniePay Plus don expire. Renew for ₦1,500/month or ₦15,000/year to continue recording."
                  : undefined
              )
            }
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm transition-all shrink-0"
          >
            <span>{isSubscribed ? "Check Plan" : isExpired ? "Renew Plus" : "Upgrade Plan"}</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.section>
  );
}
