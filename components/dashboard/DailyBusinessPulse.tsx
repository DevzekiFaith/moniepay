"use client";

import React from "react";
import { ArrowDownLeft, ArrowUpRight, Wallet, Users, Activity } from "lucide-react";
import type { DeterministicMetrics } from "@/types/moniepay.types";

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
    <section className="space-y-3">
      {/* Section Header with Business Position Pill */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
          Daily Business View
        </h2>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-black">
          <Activity className="h-3.5 w-3.5 text-emerald-700" />
          <span>Position: {metrics.healthStatus} ({metrics.healthScore}/100)</span>
        </div>
      </div>

      {/* 4 Core Scannable Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. TODAY'S SALES */}
        <div
          onClick={onOpenSales}
          className="rounded-[24px] bg-white border border-emerald-900/10 p-4 sm:p-5 shadow-[0_4px_16px_rgba(5,150,105,0.04)] hover:shadow-md cursor-pointer active:scale-[0.98] transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Today's Sales
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ArrowDownLeft className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
              ₦{metrics.totalRevenue.toLocaleString()}
            </span>
            <p className="text-[11px] font-bold text-emerald-700 mt-1.5">
              Cash: ₦{metrics.cashRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 2. MONEY OUT */}
        <div
          onClick={onOpenCosts}
          className="rounded-[24px] bg-white border border-emerald-900/10 p-4 sm:p-5 shadow-[0_4px_16px_rgba(5,150,105,0.04)] hover:shadow-md cursor-pointer active:scale-[0.98] transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Money Out
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
              ₦{metrics.totalCosts.toLocaleString()}
            </span>
            <p className="text-[11px] font-bold text-slate-500 mt-1.5">
              Stock: ₦{metrics.directStockCost.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 3. MONEY AVAILABLE */}
        <div
          onClick={onOpenWithdrawal}
          className="rounded-[24px] bg-white border border-emerald-900/10 p-4 sm:p-5 shadow-[0_4px_16px_rgba(5,150,105,0.04)] hover:shadow-md cursor-pointer active:scale-[0.98] transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Money Available
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Wallet className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-emerald-900 leading-none">
              ₦{metrics.liquidCash.toLocaleString()}
            </span>
            <p className="text-[11px] font-bold text-emerald-700 mt-1.5">
              Safe to take: ₦{metrics.safeWithdrawalAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 4. CUSTOMERS OWING */}
        <div
          onClick={onOpenGbeseBook}
          className="rounded-[24px] bg-white border border-emerald-900/10 p-4 sm:p-5 shadow-[0_4px_16px_rgba(5,150,105,0.04)] hover:shadow-md cursor-pointer active:scale-[0.98] transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Customers Owing
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
              ₦{metrics.customerDebtTotal.toLocaleString()}
            </span>
            <p className="text-[11px] font-bold text-emerald-800 mt-1.5">
              {metrics.customerDebtorCount} debtor(s)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
