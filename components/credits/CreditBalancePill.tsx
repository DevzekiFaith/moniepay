"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Insight Credits Balance Pill
// Displays live prepaid balance with 1-click modal access
// ─────────────────────────────────────────────────────────────────

import React from "react";
import { Coins, Plus } from "lucide-react";
import { useCredits } from "@/context/CreditContext";

export function CreditBalancePill({ className = "" }: { className?: string }) {
  const { balance, openPurchaseModal, isLoading } = useCredits();

  return (
    <button
      onClick={openPurchaseModal}
      className={`group relative inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl text-[10.5px] sm:text-xs font-black transition-all active:scale-95 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:border-amber-400 dark:hover:border-amber-700 shadow-2xs shrink-0 cursor-pointer ${className}`}
      title="Decision Coins Balance — Click to view history or top up"
      aria-label="View Decision Coins Balance"
    >
      <Coins className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 group-hover:rotate-12 transition-transform shrink-0" />
      <span className="tracking-tight font-black">
        {isLoading ? (
          "..."
        ) : (
          <>
            <span className="sm:hidden">{balance} cr</span>
            <span className="hidden sm:inline">{balance.toLocaleString()} Coins</span>
          </>
        )}
      </span>
      <span className="flex items-center justify-center h-3.5 w-3.5 rounded-full bg-amber-200/90 dark:bg-amber-800/90 text-amber-950 dark:text-amber-100 text-[9px] font-black shrink-0">
        <Plus className="h-2 w-2" />
      </span>
    </button>
  );
}
