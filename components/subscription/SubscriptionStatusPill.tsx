"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Subscription Status Pill Header Widget
// Shows real-time trial days remaining, grace period, or active Plus badge
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
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/25 border border-emerald-400/40 text-emerald-100 text-[11px] font-black shadow-2xs hover:opacity-90 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
        title={formattedRenewal ? `MoniePay Plus Active • Renews ${formattedRenewal}` : "MoniePay Plus Active"}
      >
        <BadgeCheck className="h-3.5 w-3.5 text-emerald-300" />
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
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50/90 hover:bg-blue-100/90 border border-blue-200 text-blue-900 text-[11px] font-black shadow-2xs active:scale-95 transition-all cursor-pointer"
        title={`${trialDaysLeft} days remaining on your 7-day free trial. Click to subscribe.`}
      >
        <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
        <span>{trialDaysLeft}d Trial Left</span>
      </button>
    );
  }

  if (isGracePeriodActive) {
    return (
      <button
        type="button"
        onClick={() => openUpgradeModal("Grace period active. Renew your MoniePay Plus subscription to keep full access.")}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-black shadow-2xs active:scale-95 transition-all cursor-pointer animate-pulse"
        title={`Grace period: ${graceDaysLeft} days remaining to renew MoniePay Plus.`}
      >
        <Clock className="h-3.5 w-3.5 text-amber-700" />
        <span>Grace: {graceDaysLeft}d Left</span>
      </button>
    );
  }

  // Expired (Read-Only)
  return (
    <button
      type="button"
      onClick={() => openUpgradeModal("Your MoniePay Plus has expired. Renew for ₦1,500/month or ₦15,000/year to continue.")}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 text-[11px] font-black shadow-2xs active:scale-95 transition-all cursor-pointer"
      title="MoniePay Plus Expired — Renew for ₦1,500/mo or ₦15,000/yr"
    >
      <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
      <span>Renew Plus</span>
    </button>
  );
}
