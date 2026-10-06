"use client";

import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Users,
  ChevronRight,
} from "lucide-react";
import type { DeterministicMetrics } from "@/types/moniepay.types";

interface CoreQuestionsGridProps {
  metrics: DeterministicMetrics;
  onOpenGbeseBook?: () => void;
  onOpenCashDetail?: () => void;
  onOpenRevenueDetail?: () => void;
  onOpenCostsDetail?: () => void;
}

export function CoreQuestionsGrid({
  metrics,
  onOpenGbeseBook,
  onOpenCashDetail,
  onOpenRevenueDetail,
  onOpenCostsDetail,
}: CoreQuestionsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5">
      {/* 1. HOW MUCH DID I MAKE? */}
      <div
        onClick={onOpenRevenueDetail}
        className="group relative cursor-pointer overflow-hidden rounded-[26px] bg-white border border-slate-200/80 p-4 sm:p-5 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_28px_-3px_rgba(15,23,42,0.1)] active:scale-[0.98] transition-all flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">
            How much made?
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
            <ArrowDownLeft className="h-4 w-4 stroke-[2.5]" />
          </div>
        </div>

        <div className="mt-3 text-xl sm:text-2xl font-black tracking-tight text-slate-900">
          ₦{metrics.totalRevenue.toLocaleString()}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <span className="text-emerald-700 font-bold">
            Cash ₦{metrics.cashRevenue.toLocaleString()}
          </span>
          <span>•</span>
          <span>POS/Tx ₦{(metrics.transferRevenue + metrics.posRevenue).toLocaleString()}</span>
        </div>
      </div>

      {/* 2. HOW MUCH DID I SPEND? */}
      <div
        onClick={onOpenCostsDetail}
        className="group relative cursor-pointer overflow-hidden rounded-[26px] bg-white border border-slate-200/80 p-4 sm:p-5 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_28px_-3px_rgba(15,23,42,0.1)] active:scale-[0.98] transition-all flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">
            How much spent?
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shadow-sm">
            <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
          </div>
        </div>

        <div className="mt-3 text-xl sm:text-2xl font-black tracking-tight text-slate-900">
          ₦{metrics.totalCosts.toLocaleString()}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium truncate">
          <span>Stock ₦{metrics.directStockCost.toLocaleString()}</span>
          <span>•</span>
          <span>Fuel ₦{metrics.operatingExpenses.toLocaleString()}</span>
        </div>
      </div>

      {/* 3. HOW MUCH CASH DO I HAVE? */}
      <div
        onClick={onOpenCashDetail}
        className="group relative cursor-pointer overflow-hidden rounded-[26px] bg-white border border-slate-200/80 p-4 sm:p-5 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_28px_-3px_rgba(15,23,42,0.1)] active:scale-[0.98] transition-all flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">
            How much cash?
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
            <Wallet className="h-4 w-4 stroke-[2.5]" />
          </div>
        </div>

        <div className="mt-3 text-xl sm:text-2xl font-black tracking-tight text-slate-900">
          ₦{metrics.liquidCash.toLocaleString()}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <span className="text-slate-800 font-bold">
            Drawer ₦{metrics.cashAtHand.toLocaleString()}
          </span>
          <span>•</span>
          <span>Banks ₦{metrics.bankAndPosBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* 4. WHO OWES ME? (Gbese Book) */}
      <div
        onClick={onOpenGbeseBook}
        className={`group relative cursor-pointer overflow-hidden rounded-[26px] p-4 sm:p-5 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_28px_-3px_rgba(15,23,42,0.1)] active:scale-[0.98] transition-all flex flex-col justify-between ${
          metrics.customerDebtTotal > 0
            ? "bg-amber-50/80 border border-amber-200"
            : "bg-white border border-slate-200/80"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-900">
            Who owes me?
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
            <Users className="h-4 w-4 stroke-[2.5]" />
          </div>
        </div>

        <div className="mt-3 text-xl sm:text-2xl font-black tracking-tight text-slate-900">
          ₦{metrics.customerDebtTotal.toLocaleString()}
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-amber-800 font-bold">
            {metrics.customerDebtorCount} {metrics.customerDebtorCount === 1 ? "person" : "people"}
          </span>
          <span className="text-slate-600 font-bold flex items-center gap-0.5 group-hover:text-amber-800">
            Open Book <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  );
}
