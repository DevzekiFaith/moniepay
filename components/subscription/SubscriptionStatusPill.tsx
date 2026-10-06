"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Subscription Status Pill Header Widget
// Shows real-time trial days remaining or active Plus badge
// ─────────────────────────────────────────────────────────────────

import React from "react";
import { Crown, Sparkles, Clock, AlertTriangle } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";

export function SubscriptionStatusPill() {
  const {
    trialDaysLeft,
    isTrialActive,
    isSubscribed,
    isExpired,
    openUpgradeModal,
  } = useSubscription();

  if (isSubscribed) {
    return (
      <button
        type="button"
        onClick={() => openUpgradeModal()}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400/20 via-blue-500/15 to-indigo-500/20 border border-amber-400/30 text-amber-900 text-[11px] font-black shadow-2xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        title="MoniePay Plus Active"
      >
        <Crown className="h-3.5 w-3.5 text-amber-600 fill-amber-400" />
        <span className="hidden sm:inline">MoniePay Plus</span>
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
        title={`${trialDaysLeft} days remaining on your 7-day free trial. Click to upgrade.`}
      >
        <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
        <span>{trialDaysLeft}d Trial Left</span>
      </button>
    );
  }

  // Expired
  return (
    <button
      type="button"
      onClick={() => openUpgradeModal("Your free trial has ended. Subscribe for ₦1,500/month to keep full intelligence active.")}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-[11px] font-black shadow-2xs animate-bounce active:scale-95 transition-all cursor-pointer"
      title="Trial Expired — Upgrade to MoniePay Plus (₦1,500/mo)"
    >
      <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
      <span>Upgrade ₦1,500</span>
    </button>
  );
}
