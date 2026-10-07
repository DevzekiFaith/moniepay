"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Daily Business Pulse Component
// Tactile Framer Motion Cards • Fintech Light & Dark Mode
// ─────────────────────────────────────────────────────────────────

import React from "react";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Wallet, Users, Activity } from "lucide-react";
import type { DeterministicMetrics } from "@/types/moniepay.types";
import { InfoTooltip } from "@/components/ui/tooltip";

interface DailyBusinessPulseProps {
  metrics: DeterministicMetrics;
  onOpenGbeseBook?: () => void;
  onOpenWithdrawal?: () => void;
  onOpenSales?: () => void;
  onOpenCosts?: () => void;
}

export function DailyBusinessPulse({
  metrics,
  onOpenGbeseBook,
  onOpenWithdrawal,
  onOpenSales,
  onOpenCosts,
}: DailyBusinessPulseProps) {
  return (
    <section className="space-y-2.5">
      {/* Section Header with Business Position Pill */}
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
          Shop Pulse (Wetin Dey Enter)
        </h2>
        <InfoTooltip content="Condition of your shop moni (0-100)">
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/20 backdrop-blur-md border border-blue-400/20 dark:border-blue-500/30 text-blue-950 dark:text-blue-200 text-[10.5px] sm:text-xs font-black shadow-xs cursor-help shrink-0">
            <Activity className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="sm:hidden">{metrics.healthScore >= 75 ? "Health: Body Dey Sweet" : "Health: Small Adjustment"} ({metrics.healthScore}/100)</span>
            <span className="hidden sm:inline">Shop Condition: {metrics.healthScore >= 75 ? "Body Dey Sweet Business" : "Small Adjustment Needed"} ({metrics.healthScore}/100)</span>
          </div>
        </InfoTooltip>
      </div>

      {/* 4 Core Scannable Metric Cards with Tooltips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* 1. TODAY'S SALES */}
        <InfoTooltip content="All moni wey enter shop today">
          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenSales}
            className="clay-card-sm p-3.5 sm:p-4.5 cursor-pointer transition-all flex flex-col justify-between min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                Moni Wey Enter (Sales)
              </span>
              <div className="flex h-6.5 w-6.5 sm:h-7.5 sm:w-7.5 items-center justify-center rounded-xl bg-blue-500/15 dark:bg-blue-500/25 text-blue-700 dark:text-blue-300 shrink-0">
                <ArrowDownLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="mt-2.5 min-w-0">
              <span className="text-base sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight truncate block font-mono">
                ₦{metrics.totalRevenue.toLocaleString()}
              </span>
              <p className="text-[10px] sm:text-[10.5px] font-bold text-blue-700 dark:text-blue-400 mt-0.5 truncate">
                Cash Wey Dey Hand: ₦{metrics.cashRevenue.toLocaleString()}
              </p>
            </div>
          </motion.div>
        </InfoTooltip>

        {/* 2. MONEY OUT */}
        <InfoTooltip content="Moni wey comot for goods & shop bills">
          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenCosts}
            className="clay-card-sm p-3.5 sm:p-4.5 cursor-pointer transition-all flex flex-col justify-between min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                Moni Wey Comot (Expenses)
              </span>
              <div className="flex h-6.5 w-6.5 sm:h-7.5 sm:w-7.5 items-center justify-center rounded-xl bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="mt-2.5 min-w-0">
              <span className="text-base sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight truncate block font-mono">
                ₦{metrics.totalCosts.toLocaleString()}
              </span>
              <p className="text-[10px] sm:text-[10.5px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                Fresh Stock: ₦{metrics.directStockCost.toLocaleString()}
              </p>
            </div>
          </motion.div>
        </InfoTooltip>

        {/* 3. MONEY AVAILABLE */}
        <InfoTooltip content="Cash wey dey drawer & bank account">
          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenWithdrawal}
            className="clay-card-sm p-3.5 sm:p-4.5 cursor-pointer transition-all flex flex-col justify-between min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                Cash Wey Dey Hand (Liquid)
              </span>
              <div className="flex h-6.5 w-6.5 sm:h-7.5 sm:w-7.5 items-center justify-center rounded-xl bg-blue-500/15 dark:bg-blue-500/25 text-blue-700 dark:text-blue-300 shrink-0">
                <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="mt-2.5 min-w-0">
              <span className="text-base sm:text-xl md:text-2xl font-black text-blue-950 dark:text-blue-100 leading-tight tracking-tight truncate block font-mono">
                ₦{metrics.liquidCash.toLocaleString()}
              </span>
              <p className="text-[10px] sm:text-[10.5px] font-bold text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                Safe Chop Moni: ₦{metrics.safeWithdrawalAmount.toLocaleString()}
              </p>
            </div>
          </motion.div>
        </InfoTooltip>

        {/* 4. CUSTOMERS OWING */}
        <InfoTooltip content="Customer gbese wey dey outside to collect">
          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenGbeseBook}
            className="clay-card-sm p-3.5 sm:p-4.5 cursor-pointer transition-all flex flex-col justify-between min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                People Wey Owe (Gbese)
              </span>
              <div className="flex h-6.5 w-6.5 sm:h-7.5 sm:w-7.5 items-center justify-center rounded-xl bg-blue-500/15 dark:bg-blue-500/25 text-blue-700 dark:text-blue-300 shrink-0">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="mt-2.5 min-w-0">
              <span className="text-base sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight truncate block font-mono">
                ₦{metrics.customerDebtTotal.toLocaleString()}
              </span>
              <p className="text-[10px] sm:text-[10.5px] font-bold text-blue-700 dark:text-blue-400 mt-0.5 truncate">
                {metrics.customerDebtorCount} customer(s) dey owe shop
              </p>
            </div>
          </motion.div>
        </InfoTooltip>
      </div>
    </section>
  );
}
