"use client";

import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Wallet,
  Users,
  AlertCircle,
  PiggyBank,
  Activity,
  ChevronRight,
  Layers,
} from "lucide-react";
import type { DeterministicMetrics, Debt } from "@/types/moniepay.types";
import { deriveLivingBusinessPillars } from "@/lib/intelligence/deterministicEngine";

interface LivingBusinessPillarsGridProps {
  metrics: DeterministicMetrics;
  debts: Debt[];
  onOpenGbeseBook?: () => void;
  onOpenWithdrawal?: () => void;
  onOpenRecordSheet?: () => void;
}

export function LivingBusinessPillarsGrid({
  metrics,
  debts,
  onOpenGbeseBook,
  onOpenWithdrawal,
  onOpenRecordSheet,
}: LivingBusinessPillarsGridProps) {
  const pillars = deriveLivingBusinessPillars(metrics, debts);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
              The 8 Economic Pillars
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[9.5px] font-extrabold text-slate-600">
              Living Model
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
            Your Business Economic Pulse
          </h3>
        </div>
      </div>

      {/* ── 4 PAIRED PULSE DECKS (Dual-Metric Cards with Rich Contrast) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. CASH FLOW PULSE: REVENUE vs COST */}
        <div className="rounded-[26px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] dark:shadow-xl hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.09)] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold">
                1 & 2
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight">
                  Cash Flow Pulse
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  Revenue In vs Costs Spent
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
              Net +₦{pillars.profit.amount.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 py-2 border-y border-slate-100 dark:border-white/10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Money In (Sales)
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400 leading-tight">
                ₦{pillars.revenue.amount.toLocaleString()}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                Cash: ₦{metrics.cashRevenue.toLocaleString()}
              </p>
            </div>

            <div className="border-l border-slate-100 dark:border-white/10 pl-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Money Out (Cost)
              </span>
              <span className="text-base sm:text-lg font-black text-rose-700 dark:text-rose-400 leading-tight">
                ₦{pillars.cost.amount.toLocaleString()}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                Stock: ₦{metrics.directStockCost.toLocaleString()}
              </p>
            </div>
          </div>

          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-2.5 leading-snug">
            {pillars.profit.verdict}
          </p>
        </div>

        {/* 2. RETAINED PROFIT PULSE: TRUE PROFIT vs CHOP MONEY */}
        <div
          onClick={onOpenWithdrawal}
          className="rounded-[26px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] dark:shadow-xl hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.09)] transition-all flex flex-col justify-between cursor-pointer active:scale-[0.99] group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold">
                3 & 7
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight">
                  Take-Home & Profit
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  True Profit vs Chop Money
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-sky-300 border border-blue-100 dark:border-blue-800">
              {pillars.profit.marginPercent}% Margin
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 py-2 border-y border-slate-100 dark:border-white/10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                True Profit Made
              </span>
              <span className="text-base sm:text-lg font-black text-blue-700 dark:text-sky-300 leading-tight">
                ₦{pillars.profit.amount.toLocaleString()}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                After all shop costs
              </p>
            </div>

            <div className="border-l border-slate-100 dark:border-white/10 pl-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Chop Money Taken
              </span>
              <span className="text-base sm:text-lg font-black text-purple-700 dark:text-purple-300 leading-tight">
                ₦{pillars.ownerMoney.withdrawn.toLocaleString()}
              </span>
              <p className="text-[10px] text-purple-800 dark:text-purple-300 font-bold mt-0.5">
                Safe: ₦{pillars.ownerMoney.safeAllowance.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2.5">
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {pillars.ownerMoney.status}
            </p>
            <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Take Chop Money →
            </span>
          </div>
        </div>

        {/* 3. LIQUID RESERVES PULSE: DRAWER CASH vs BANK/POS */}
        <div className="rounded-[26px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] dark:shadow-xl hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.09)] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-bold">
                4 & 8
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight">
                  Liquid Cash & Vitality
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  Ready Cash in Hand
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-100 dark:border-teal-800">
              Total ₦{pillars.cash.total.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 py-2 border-y border-slate-100 dark:border-white/10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Drawer (Physical)
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                ₦{pillars.cash.drawerCash.toLocaleString()}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Instant cash for change
              </p>
            </div>

            <div className="border-l border-slate-100 dark:border-white/10 pl-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Bank / POS Account
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                ₦{pillars.cash.bankPos.toLocaleString()}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Digital transfer float
              </p>
            </div>
          </div>

          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-2.5 leading-snug">
            Vitality: <span className="font-bold text-slate-800 dark:text-white">{pillars.businessHealth.score}/100 • {pillars.businessHealth.status}</span>
          </p>
        </div>

        {/* 4. CREDIT PULSE: CUSTOMERS OWE (GBESE) vs YOU OWE SUPPLIERS */}
        <div
          onClick={onOpenGbeseBook}
          className="rounded-[26px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] dark:shadow-xl hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.09)] transition-all flex flex-col justify-between cursor-pointer active:scale-[0.99] group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold">
                5 & 6
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight">
                  Debt & Trapped Money
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  Customer Gbese vs Supplier Debt
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {pillars.customerMoney.debtorCount} Debtor(s)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 py-2 border-y border-slate-100 dark:border-white/10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Customers Owe You
              </span>
              <span className="text-base sm:text-lg font-black text-amber-800 dark:text-amber-400 leading-tight">
                ₦{pillars.customerMoney.amount.toLocaleString()}
              </span>
              <p className="text-[10px] text-amber-900 dark:text-amber-300 font-semibold truncate mt-0.5">
                Top: {pillars.customerMoney.highestDebtor}
              </p>
            </div>

            <div className="border-l border-slate-100 dark:border-white/10 pl-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                You Owe Suppliers
              </span>
              <span className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">
                ₦{pillars.obligations.amount.toLocaleString()}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                {pillars.obligations.supplierCount} Supplier(s)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2.5">
            <p className="text-[11px] font-bold text-amber-900 dark:text-amber-300">
              {pillars.obligations.urgency}
            </p>
            <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Open Gbese Book →
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
