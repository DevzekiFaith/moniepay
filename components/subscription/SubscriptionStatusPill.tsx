"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Subscription Status Pill Header Widget
// Shows real-time trial days remaining, grace period, or active Plus badge
// Responsive for all screen sizes (320px mobile to 4K desktop)
// ─────────────────────────────────────────────────────────────────

import React from "react";
import { BadgeCheck, AlertTriangle, Clock } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";

export function SubscriptionStatusPill() {
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

  if (isSubscribed) {
    const formattedRenewal = subscription?.subscriptionEndsAt
      ? new Date(subscription.subscriptionEndsAt).toLocaleDateString("en-NG", {
          month: "short",
          day: "numeric",
        })
      : null;

    return (
      <button
        type="button"
        onClick={() => openUpgradeModal()}
        className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 dark:border-emerald-400/60 text-emerald-950 dark:text-emerald-300 text-[10.5px] sm:text-[11px] font-black shadow-2xs active:scale-95 transition-all cursor-pointer backdrop-blur-md shrink-0"
        title={formattedRenewal ? `MoniePay Plus Active • Renews ${formattedRenewal}` : "MoniePay Plus Active"}
      >
        <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="hidden sm:inline">Plus Active</span>
        <span className="sm:hidden">Plus</span>
      </button>
    );
  }

  if (isTrialActive) {
    return (
      <button
        type="button"
        onClick={() => openUpgradeModal()}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/95 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 border border-blue-200 dark:border-blue-400/40 text-blue-950 dark:text-sky-200 text-[10.5px] sm:text-[11px] font-black shadow-xs dark:shadow-md active:scale-95 transition-all cursor-pointer backdrop-blur-md shrink-0"
        title={`${trialDaysLeft} days remaining on your 7-day free trial. Click to subscribe.`}
      >
        <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-sky-400 animate-pulse shrink-0 ring-2 ring-blue-300/60 dark:ring-sky-400/40" />
        <span className="hidden sm:inline text-blue-950 dark:text-sky-200">{trialDaysLeft}d Test-Run</span>
        <span className="sm:hidden text-blue-950 dark:text-sky-200">{trialDaysLeft}d Left</span>
      </button>
    );
  }

  if (isGracePeriodActive) {
    return (
      <button
        type="button"
        onClick={() => openUpgradeModal("Grace period dey active. Renew your MoniePay Plus subscription make you keep full access.")}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/80 hover:bg-amber-100 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-500/50 text-amber-900 dark:text-amber-200 text-[10.5px] sm:text-[11px] font-black shadow-xs active:scale-95 transition-all cursor-pointer animate-pulse shrink-0"
        title={`Grace period: ${graceDaysLeft} days remaining to renew MoniePay Plus.`}
      >
        <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="hidden sm:inline">Grace: {graceDaysLeft}d Remain</span>
        <span className="sm:hidden">{graceDaysLeft}d Grace</span>
      </button>
    );
  }

  // Expired (Read-Only)
  return (
    <button
      type="button"
      onClick={() => openUpgradeModal("Your MoniePay Plus don expire. Renew for ₦1,500/month or ₦15,000/year to continue.")}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/80 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-300 dark:border-rose-500/50 text-rose-900 dark:text-rose-200 text-[10.5px] sm:text-[11px] font-black shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
      title="MoniePay Plus Don Expire — Renew for ₦1,500/mo or ₦15,000/yr"
    >
      <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
      <span>Renew</span>
    </button>
  );
}
