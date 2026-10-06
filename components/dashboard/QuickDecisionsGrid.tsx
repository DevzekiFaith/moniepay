"use client";

import React from "react";
import {
  HelpCircle,
  PiggyBank,
  ShoppingBag,
  Users,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { DeterministicMetrics } from "@/types/moniepay.types";

interface QuickDecisionsGridProps {
  metrics: DeterministicMetrics;
  onOpenWithdrawal?: () => void;
  onOpenRestock?: () => void;
  onOpenGbeseBook?: () => void;
  onOpenProfitDetail?: () => void;
}

export function QuickDecisionsGrid({
  metrics,
  onOpenWithdrawal,
  onOpenRestock,
  onOpenGbeseBook,
  onOpenProfitDetail,
}: QuickDecisionsGridProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
          Decisions You Can Make Right Now
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* 1. CAN I WITHDRAW? */}
        <div
          onClick={onOpenWithdrawal}
          className="rounded-[24px] bg-white border border-emerald-900/10 p-4 shadow-[0_4px_16px_rgba(5,150,105,0.04)] hover:shadow-md cursor-pointer active:scale-[0.98] transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Can I withdraw?</span>
            <PiggyBank className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="my-2">
            <span className="text-sm sm:text-base font-black text-slate-900 leading-tight block">
              Yes, ₦{metrics.safeWithdrawalAmount.toLocaleString()} Safe
            </span>
            <p className="text-[10.5px] font-medium text-emerald-800 mt-0.5">
              Restock capital protected
            </p>
          </div>
          <span className="text-[10px] font-black text-emerald-700 flex items-center gap-0.5 mt-1">
            Withdraw Now →
          </span>
        </div>

        {/* 2. CAN I RESTOCK? */}
        <div
          onClick={onOpenRestock}
          className="rounded-[24px] bg-white border border-emerald-900/10 p-4 shadow-[0_4px_16px_rgba(5,150,105,0.04)] hover:shadow-md cursor-pointer active:scale-[0.98] transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Can I restock?</span>
            <ShoppingBag className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="my-2">
            <span className="text-sm sm:text-base font-black text-slate-900 leading-tight block">
              ₦{Math.max(0, metrics.liquidCash - metrics.safeWithdrawalAmount).toLocaleString()} Ready
            </span>
            <p className="text-[10.5px] font-medium text-slate-500 mt-0.5">
              Available cash pool
            </p>
          </div>
          <span className="text-[10px] font-black text-emerald-700 flex items-center gap-0.5 mt-1">
            Plan Restock →
          </span>
        </div>

        {/* 3. WHO OWES ME? */}
        <div
          onClick={onOpenGbeseBook}
          className="rounded-[24px] bg-white border border-emerald-900/10 p-4 shadow-[0_4px_16px_rgba(5,150,105,0.04)] hover:shadow-md cursor-pointer active:scale-[0.98] transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Who owes me?</span>
            <Users className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="my-2">
            <span className="text-sm sm:text-base font-black text-slate-900 leading-tight block">
              ₦{metrics.customerDebtTotal.toLocaleString()} Owed
            </span>
            <p className="text-[10.5px] font-medium text-slate-500 mt-0.5">
              {metrics.customerDebtorCount} customer(s)
            </p>
          </div>
          <span className="text-[10px] font-black text-emerald-700 flex items-center gap-0.5 mt-1">
            Collect Debt →
          </span>
        </div>

        {/* 4. AM I MAKING PROFIT? */}
        <div
          onClick={onOpenProfitDetail}
          className="rounded-[24px] bg-white border border-emerald-900/10 p-4 shadow-[0_4px_16px_rgba(5,150,105,0.04)] hover:shadow-md cursor-pointer active:scale-[0.98] transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Making real profit?</span>
            <TrendingUp className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="my-2">
            <span className="text-sm sm:text-base font-black text-slate-900 leading-tight block">
              ₦{metrics.operatingProfit.toLocaleString()} ({metrics.profitMarginPercent}%)
            </span>
            <p className="text-[10.5px] font-medium text-emerald-800 mt-0.5">
              Kept after all costs
            </p>
          </div>
          <span className="text-[10px] font-black text-emerald-700 flex items-center gap-0.5 mt-1">
            View Margin →
          </span>
        </div>
      </div>
    </section>
  );
}
