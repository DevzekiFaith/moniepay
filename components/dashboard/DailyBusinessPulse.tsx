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
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Daily Business View
        </h2>
        <InfoTooltip content={`Diagnostic Score: ${metrics.healthScore}/100. Based on cash, stock reserves, and supplier debts.`}>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-950 text-xs font-black shadow-2xs cursor-help">
            <Activity className="h-3.5 w-3.5 text-emerald-700" />
            <span>Position: {metrics.healthStatus} ({metrics.healthScore}/100)</span>
          </div>
        </InfoTooltip>
      </div>

      {/* 4 Core Scannable Metric Cards with Tooltips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* 1. TODAY'S SALES */}
        <InfoTooltip content="Total revenue collected today across physical cash, POS, and instant bank transfers.">
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenSales}
            className="rounded-[24px] bg-white border border-emerald-950/[0.08] p-3.5 sm:p-4.5 shadow-[0_4px_16px_rgba(15,23,42,0.03)] hover:shadow-md hover:border-emerald-500/40 cursor-pointer transition-all flex flex-col justify-between min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 truncate">
                Today's Sales
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 shrink-0">
                <ArrowDownLeft className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2.5 min-w-0">
              <span className="text-lg sm:text-2xl font-black text-slate-900 leading-none truncate block">
                ₦{metrics.totalRevenue.toLocaleString()}
              </span>
              <p className="text-[10.5px] font-bold text-emerald-800 mt-1 truncate">
                Cash: ₦{metrics.cashRevenue.toLocaleString()}
              </p>
            </div>
          </motion.div>
        </InfoTooltip>

        {/* 2. MONEY OUT */}
        <InfoTooltip content="All outgoing expenses today including restock purchases, shop rent, transport, and utilities.">
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenCosts}
            className="rounded-[24px] bg-white border border-emerald-950/[0.08] p-3.5 sm:p-4.5 shadow-[0_4px_16px_rgba(15,23,42,0.03)] hover:shadow-md hover:border-emerald-500/40 cursor-pointer transition-all flex flex-col justify-between min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 truncate">
                Money Out
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-slate-700 shrink-0">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2.5 min-w-0">
              <span className="text-lg sm:text-2xl font-black text-slate-900 leading-none truncate block">
                ₦{metrics.totalCosts.toLocaleString()}
              </span>
              <p className="text-[10.5px] font-bold text-slate-500 mt-1 truncate">
                Stock: ₦{metrics.directStockCost.toLocaleString()}
              </p>
            </div>
          </motion.div>
        </InfoTooltip>

        {/* 3. MONEY AVAILABLE */}
        <InfoTooltip content="Liquid cash physically in drawer + bank, alongside safe chop money you can withdraw without killing restock.">
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenWithdrawal}
            className="rounded-[24px] bg-white border border-emerald-950/[0.08] p-3.5 sm:p-4.5 shadow-[0_4px_16px_rgba(15,23,42,0.03)] hover:shadow-md hover:border-emerald-500/40 cursor-pointer transition-all flex flex-col justify-between min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 truncate">
                Money Available
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 shrink-0">
                <Wallet className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2.5 min-w-0">
              <span className="text-lg sm:text-2xl font-black text-emerald-950 leading-none truncate block">
                ₦{metrics.liquidCash.toLocaleString()}
              </span>
              <p className="text-[10.5px] font-bold text-emerald-700 mt-1 truncate">
                Safe: ₦{metrics.safeWithdrawalAmount.toLocaleString()}
              </p>
            </div>
          </motion.div>
        </InfoTooltip>

        {/* 4. CUSTOMERS OWING */}
        <InfoTooltip content="Total outstanding Gbese owed to your shop by credit customers. Tap to view debtors and send WhatsApp reminders.">
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenGbeseBook}
            className="rounded-[24px] bg-white border border-emerald-950/[0.08] p-3.5 sm:p-4.5 shadow-[0_4px_16px_rgba(15,23,42,0.03)] hover:shadow-md hover:border-emerald-500/40 cursor-pointer transition-all flex flex-col justify-between min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 truncate">
                Customers Owing
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 shrink-0">
                <Users className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2.5 min-w-0">
              <span className="text-lg sm:text-2xl font-black text-slate-900 leading-none truncate block">
                ₦{metrics.customerDebtTotal.toLocaleString()}
              </span>
              <p className="text-[10.5px] font-bold text-emerald-800 mt-1 truncate">
                {metrics.customerDebtorCount} debtor(s)
              </p>
            </div>
          </motion.div>
        </InfoTooltip>
      </div>
    </section>
  );
}

