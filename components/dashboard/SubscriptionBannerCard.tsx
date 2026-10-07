"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Subscription & Free Trial Banner Card Widget (Modern Market Design)
// Informal market language tailored for Nigerian merchants & traders
// ─────────────────────────────────────────────────────────────────

import React from "react";
import {
  ShieldCheck,
  Store,
  Clock,
  CheckCircle2,
  ArrowRight,
  Download,
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[26px] bg-gradient-to-b from-white via-white to-[#f4f8fe] border border-blue-100/90 p-4 sm:p-5 shadow-[0_10px_30px_rgba(29,78,216,0.06)]"
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-blue-500/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-28 w-28 rounded-full bg-sky-400/10 blur-xl" />

      <div className="space-y-4 relative z-10">
        {/* ── TOP HEADER ROW ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Dynamic Status Icon Capsule */}
            <div
              className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                isSubscribed
                  ? "bg-emerald-600 border-emerald-500 text-white"
                  : isGracePeriodActive
                  ? "bg-amber-500 border-amber-400 text-white animate-pulse"
                  : isTrialActive
                  ? "bg-[#1d4ed8] border-blue-600 text-white shadow-[0_4px_14px_rgba(29,78,216,0.25)]"
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
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  {isSubscribed
                    ? subscription?.planName || "MoniePay Plus Active"
                    : isGracePeriodActive
                    ? "Grace Period Active"
                    : isTrialActive
                    ? "7 Days Free Shop Test-Run"
                    : "Subscription Don Expire"}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-black tracking-wide border shadow-2xs ${
                    isSubscribed
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : isGracePeriodActive
                      ? "bg-amber-50 text-amber-900 border-amber-300 animate-pulse"
                      : isTrialActive
                      ? "bg-blue-50 text-blue-900 border-blue-200"
                      : "bg-rose-50 text-rose-900 border-rose-300"
                  }`}
                >
                  {isSubscribed
                    ? "Plus Active"
                    : isGracePeriodActive
                    ? `${graceDaysLeft}d Grace Remain`
                    : isTrialActive
                    ? `${trialDaysLeft}d Remain`
                    : "Renew Now"}
                </span>
              </div>

              <p className="text-[11.5px] text-slate-500 font-medium mt-0.5 leading-snug">
                {isSubscribed
                  ? `All Plus features dey active • Renews on ${nextRenewalFormatted || "Active"}`
                  : isGracePeriodActive
                  ? "Full access dey open for 3 days. Renew now so your shop record no go pause."
                  : isTrialActive
                  ? `You still get ${trialDaysLeft} days remaining of sharp-sharp shop intelligence access.`
                  : "Renew for ₦1,500/month or ₦15,000/year make you continue recording."}
              </p>
            </div>
          </div>

          {/* Install App Quick Action */}
          <button
            type="button"
            onClick={triggerInstallPrompt}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-[11px] font-black text-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer shrink-0"
            title="Install MoniePay app on your phone"
          >
            <Download className="h-3.5 w-3.5 text-[#1d4ed8]" />
            <span>Install App 📲</span>
          </button>
        </div>

        {/* ── VISUAL PROGRESS CAPSULE (Trial / Grace) ── */}
        {isTrialActive && (
          <div className="bg-white/95 rounded-2xl p-3 sm:p-3.5 border border-blue-100/90 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5 text-slate-900 font-black text-[12px]">
                <Clock className="h-3.5 w-3.5 text-[#1d4ed8]" />
                Day {7 - trialDaysLeft + 1} of 7 don enter
              </span>
              <span className="text-[11px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {trialDaysLeft} {trialDaysLeft === 1 ? "Day" : "Days"} Dey Left
              </span>
            </div>

            {/* 7-Segmented Day Pills */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                const isPassed = dayNum <= 7 - trialDaysLeft;
                const isCurrent = dayNum === 7 - trialDaysLeft + 1;

                return (
                  <div key={dayNum} className="space-y-1 text-center">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        isPassed
                          ? "bg-slate-200"
                          : isCurrent
                          ? "bg-[#1d4ed8] shadow-[0_0_8px_rgba(29,78,216,0.6)] animate-pulse"
                          : "bg-blue-100"
                      }`}
                    />
                    <span
                      className={`text-[9.5px] font-black block leading-none ${
                        isCurrent
                          ? "text-[#1d4ed8]"
                          : isPassed
                          ? "text-slate-400"
                          : "text-slate-400"
                      }`}
                    >
                      D{dayNum}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10.5px] text-slate-500 font-medium pt-0.5 border-t border-slate-100">
              <span>One free trial per shop</span>
              <span className="text-[#1d4ed8] font-bold">Upgrade anytime without wahala</span>
            </div>
          </div>
        )}

        {/* ── FOOTER ROW (Pricing + Zero Deletion + Solid Blue CTA) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-blue-50">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-slate-900 font-black bg-white px-2.5 py-1 rounded-xl border border-slate-200/80 shadow-2xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>₦1,500/mo or ₦15,000/yr</span>
            </span>
            <span className="text-slate-400 font-bold">•</span>
            <span className="inline-flex items-center gap-1 text-slate-600 font-medium text-[11px]">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>Zero data deletion (Record safe forever)</span>
            </span>
          </div>

          {/* Solid MoniePay Blue Button (No Gradient) */}
          <button
            type="button"
            onClick={() =>
              openUpgradeModal(
                isExpired
                  ? "Your MoniePay Plus don expire. Renew for ₦1,500/month or ₦15,000/year to continue recording."
                  : undefined
              )
            }
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-black text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-[0_4px_14px_rgba(29,78,216,0.25)] transition-all shrink-0"
          >
            <span>{isSubscribed ? "Check Your Plan" : isExpired ? "Renew Your Plus" : "Upgrade to Plus"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.section>
  );
}
