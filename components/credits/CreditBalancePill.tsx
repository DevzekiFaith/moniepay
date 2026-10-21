"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Insight Credits Balance Pill
// Displays live prepaid balance with 1-click modal access
// ─────────────────────────────────────────────────────────────────

import React from "react";
import { Sparkles, Coins, Plus } from "lucide-react";
import { useCredits } from "@/context/CreditContext";

export function CreditBalancePill({ className = "" }: { className?: string }) {
  const { balance, openPurchaseModal, isLoading } = useCredits();

  return (
    <button
      onClick={openPurchaseModal}
      className={`group relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-black transition-all active:scale-95 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/90 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 hover:border-amber-400 dark:hover:border-amber-700 shadow-xs ${className}`}
      title="Insight Credits Balance — Click to view history or top up"
      aria-label="View Insight Credits Balance"
    >
      <Coins className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 group-hover:rotate-12 transition-transform" />
      <span className="tracking-tight">
        {isLoading ? "..." : `${balance.toLocaleString()} Credits`}
      </span>
      <span className="flex items-center justify-center h-4 w-4 rounded-full bg-amber-200/80 dark:bg-amber-800/80 text-amber-950 dark:text-amber-100 text-[10px] ml-0.5">
        <Plus className="h-2.5 w-2.5" />
      </span>
    </button>
  );
}
