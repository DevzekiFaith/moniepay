"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Subscription Status Pill Header Widget
// Core Ledger is 100% Free Forever • Staff Mode Subscription Badge
// Responsive for all screen sizes (320px mobile to 4K desktop)
// ─────────────────────────────────────────────────────────────────

import React from "react";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";

export function SubscriptionStatusPill() {
  const {
    subscription,
    isSubscribed,
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
        className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-[10.5px] sm:text-[11px] font-black shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
        title={formattedRenewal ? `Staff Mode Active • Renews ${formattedRenewal}` : "Staff Mode Active"}
      >
        <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="hidden sm:inline">Staff Active</span>
        <span className="sm:hidden">Staff</span>
      </button>
    );
  }

  // 100% Free Core Ledger (Default for all merchants)
  return (
    <button
      type="button"
      onClick={() =>
        openUpgradeModal(
          "MoniePay Core Ledger is 100% Free Forever. Upgrade to Staff & Multi-Attendant Mode for multi-device sync, employee logins, and anti-theft controls."
        )
      }
      className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-slate-800/80 hover:bg-blue-100 dark:hover:bg-slate-700/80 border border-blue-200 dark:border-slate-700 text-blue-900 dark:text-blue-200 text-[10.5px] sm:text-[11px] font-black shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
      title="Core Ledger 100% Free Forever • Click to view Staff & Multi-Device Mode"
    >
      <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
      <span className="hidden sm:inline">Free Core</span>
      <span className="sm:hidden">Free</span>
    </button>
  );
}
