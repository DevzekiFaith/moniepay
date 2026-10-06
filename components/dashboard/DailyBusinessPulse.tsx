"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Daily Business View Component
// Tactile Framer Motion Cards • Single Emerald Theme
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
        <h2 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-emerald-950/60 truncate">
          Shop Pulse
        </h2>
        <InfoTooltip content={`Shop Health Score: ${metrics.healthScore}/100. E show whether your capital, cash in hand, and customer debts dey balanced well.`}>
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-600/20 text-emerald-950 text-[10.5px] sm:text-xs font-black shadow-2xs cursor-help shrink-0">
            <Activity className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-700" />
            <span className="sm:hidden">{metrics.healthScore >= 75 ? "Health: Sweet 🚀" : "Health: Adjust ⚡"} ({metrics.healthScore}/100)</span>
            <span className="hidden sm:inline">Shop Condition: {metrics.healthScore >= 75 ? "Body Dey Sweet Business 🚀" : "Small Adjustment Needed ⚡"} ({metrics.healthScore}/100)</span>
          </div>
        </InfoTooltip>
      </div>

      {/* 4 Core Scannable Metric Cards with Tooltips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* 1. TODAY'S SALES */}
        <InfoTooltip content="Total money wey enter your shop today from cash and POS transfers. Tap to see full sales breakdown.">
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenSales}
            className="rounded-[22px] sm:rounded-[24px] bg-white/80 backdrop-blur-md border border-emerald-950/[0.08] p-3 sm:p-4 shadow-[0_4px_20px_rgba(4,120,87,0.04)] hover:shadow-md hover:border-emerald-500/40 cursor-pointer transition-all flex flex-col justify-between min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 truncate">
                Sales (Money In)
              </span>
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500/15 text-emerald-800 shrink-0">
                <ArrowDownLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </div>
            </div>
            <div className="mt-2 min-w-0">
              <span className="text-base sm:text-xl md:text-2xl font-black text-slate-900 leading-tight tracking-tight truncate block font-mono">
                ₦{metrics.totalRevenue.toLocaleString()}
              </span>
              <p className="text-[10px] sm:text-[10.5px] font-bold text-emerald-800 mt-0.5 truncate">
                Cash: ₦{metrics.cashRevenue.toLocaleString()}
              </p>
            </div>
          </motion.div>
        </InfoTooltip>

        {/* 2. MONEY OUT */}
        <InfoTooltip content="Every kobo wey comot today for stock restock, shop bills, transport, and loader fees. Tap to check expense list.">
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenCosts}
            className="rounded-[22px] sm:rounded-[24px] bg-white/80 backdrop-blur-md border border-emerald-950/[0.08] p-3 sm:p-4 shadow-[0_4px_20px_rgba(4,120,87,0.04)] hover:shadow-md hover:border-emerald-500/40 cursor-pointer transition-all flex flex-col justify-between min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 truncate">
                Money Out (Expenses)
              </span>
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg sm:rounded-xl bg-slate-100/90 text-slate-700 shrink-0">
                <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </div>
            </div>
            <div className="mt-2 min-w-0">
              <span className="text-base sm:text-xl md:text-2xl font-black text-slate-900 leading-tight tracking-tight truncate block font-mono">
                ₦{metrics.totalCosts.toLocaleString()}
              </span>
              <p className="text-[10px] sm:text-[10.5px] font-bold text-slate-500 mt-0.5 truncate">
                Stock: ₦{metrics.directStockCost.toLocaleString()}
              </p>
            </div>
          </motion.div>
        </InfoTooltip>

        {/* 3. MONEY AVAILABLE */}
        <InfoTooltip content="Real liquid cash wey dey your drawer and bank right now, plus safe profit (chop moni) you fit take without touching market capital.">
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenWithdrawal}
            className="rounded-[22px] sm:rounded-[24px] bg-white/80 backdrop-blur-md border border-emerald-950/[0.08] p-3 sm:p-4 shadow-[0_4px_20px_rgba(4,120,87,0.04)] hover:shadow-md hover:border-emerald-500/40 cursor-pointer transition-all flex flex-col justify-between min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 truncate">
                Cash in Hand (Liquid)
              </span>
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500/15 text-emerald-800 shrink-0">
                <Wallet className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </div>
            </div>
            <div className="mt-2 min-w-0">
              <span className="text-base sm:text-xl md:text-2xl font-black text-emerald-950 leading-tight tracking-tight truncate block font-mono">
                ₦{metrics.liquidCash.toLocaleString()}
              </span>
              <p className="text-[10px] sm:text-[10.5px] font-bold text-emerald-700 mt-0.5 truncate">
                Chop: ₦{metrics.safeWithdrawalAmount.toLocaleString()}
              </p>
            </div>
          </motion.div>
        </InfoTooltip>

        {/* 4. CUSTOMERS OWING */}
        <InfoTooltip content="Total customer debts outside. Tap to open debt book and send polite WhatsApp reminder sharp-sharp!">
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenGbeseBook}
            className="rounded-[22px] sm:rounded-[24px] bg-white/80 backdrop-blur-md border border-emerald-950/[0.08] p-3 sm:p-4 shadow-[0_4px_20px_rgba(4,120,87,0.04)] hover:shadow-md hover:border-emerald-500/40 cursor-pointer transition-all flex flex-col justify-between min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 truncate">
                People Wey Owe (Gbese)
              </span>
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-500/15 text-emerald-800 shrink-0">
                <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </div>
            </div>
            <div className="mt-2.5 min-w-0">
              <span className="text-lg sm:text-2xl font-black text-slate-900 leading-none truncate block">
                ₦{metrics.customerDebtTotal.toLocaleString()}
              </span>
              <p className="text-[10.5px] font-bold text-emerald-800 mt-1 truncate">
                {metrics.customerDebtorCount} customer(s) owing
              </p>
            </div>
          </motion.div>
        </InfoTooltip>
      </div>
    </section>
  );
}

