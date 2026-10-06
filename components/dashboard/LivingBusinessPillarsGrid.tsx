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
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight">
            The Living Model of Your Business
          </h3>
          <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
            Automatic calculation of the 8 economic pillars of your shop
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. REVENUE */}
        <div className="rounded-[22px] bg-white border border-slate-200/90 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              1. Revenue
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ArrowDownLeft className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-lg font-black text-slate-900 leading-none">
              ₦{pillars.revenue.amount.toLocaleString()}
            </span>
            <p className="text-[10.5px] font-medium text-slate-500 mt-1 leading-snug">
              {pillars.revenue.description}
            </p>
          </div>
          <p className="text-[9.5px] font-semibold text-emerald-800 bg-emerald-50/80 p-1.5 rounded-lg truncate">
            {pillars.revenue.breakdown}
          </p>
        </div>

        {/* 2. COST */}
        <div className="rounded-[22px] bg-white border border-slate-200/90 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              2. Cost
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-lg font-black text-slate-900 leading-none">
              ₦{pillars.cost.amount.toLocaleString()}
            </span>
            <p className="text-[10.5px] font-medium text-slate-500 mt-1 leading-snug">
              {pillars.cost.description}
            </p>
          </div>
          <p className="text-[9.5px] font-semibold text-rose-800 bg-rose-50/80 p-1.5 rounded-lg truncate">
            {pillars.cost.breakdown}
          </p>
        </div>

        {/* 3. PROFIT */}
        <div className="rounded-[22px] bg-white border border-slate-200/90 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              3. Profit
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-lg font-black text-slate-900 leading-none">
              ₦{pillars.profit.amount.toLocaleString()}
            </span>
            <p className="text-[10.5px] font-bold text-blue-800 mt-1">
              {pillars.profit.marginPercent}% margin
            </p>
          </div>
          <p className="text-[9.5px] font-medium text-slate-600 bg-slate-50 p-1.5 rounded-lg leading-snug">
            {pillars.profit.verdict}
          </p>
        </div>

        {/* 4. CASH */}
        <div className="rounded-[22px] bg-white border border-slate-200/90 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              4. Cash
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Wallet className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-lg font-black text-slate-900 leading-none">
              ₦{pillars.cash.total.toLocaleString()}
            </span>
            <p className="text-[10.5px] font-medium text-slate-500 mt-1">
              Drawer: ₦{pillars.cash.drawerCash.toLocaleString()}
            </p>
          </div>
          <p className="text-[9.5px] font-semibold text-slate-700 bg-slate-50 p-1.5 rounded-lg truncate">
            POS/Bank: ₦{pillars.cash.bankPos.toLocaleString()}
          </p>
        </div>

        {/* 5. OBLIGATIONS (Owed to Suppliers) */}
        <div className="rounded-[22px] bg-white border border-slate-200/90 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              5. Obligations
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <AlertCircle className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-lg font-black text-slate-900 leading-none">
              ₦{pillars.obligations.amount.toLocaleString()}
            </span>
            <p className="text-[10.5px] font-medium text-slate-500 mt-1">
              {pillars.obligations.supplierCount} supplier(s)
            </p>
          </div>
          <p className="text-[9.5px] font-semibold text-amber-900 bg-amber-50/80 p-1.5 rounded-lg truncate">
            {pillars.obligations.urgency}
          </p>
        </div>

        {/* 6. CUSTOMER MONEY (Gbese) */}
        <div
          onClick={onOpenGbeseBook}
          className="rounded-[22px] bg-white border border-slate-200/90 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] flex flex-col justify-between cursor-pointer hover:border-emerald-300 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              6. Customer Money
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-lg font-black text-slate-900 leading-none">
              ₦{pillars.customerMoney.amount.toLocaleString()}
            </span>
            <p className="text-[10.5px] font-medium text-slate-500 mt-1">
              {pillars.customerMoney.debtorCount} customer(s) owe
            </p>
          </div>
          <p className="text-[9.5px] font-semibold text-orange-900 bg-orange-50/80 p-1.5 rounded-lg truncate">
            Top: {pillars.customerMoney.highestDebtor}
          </p>
        </div>

        {/* 7. OWNER MONEY (Chop Money) */}
        <div
          onClick={onOpenWithdrawal}
          className="rounded-[22px] bg-white border border-slate-200/90 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] flex flex-col justify-between cursor-pointer hover:border-emerald-300 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              7. Owner Money
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
              <PiggyBank className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-lg font-black text-slate-900 leading-none">
              ₦{pillars.ownerMoney.withdrawn.toLocaleString()}
            </span>
            <p className="text-[10.5px] font-medium text-slate-500 mt-1">
              Safe: ₦{pillars.ownerMoney.safeAllowance.toLocaleString()}
            </p>
          </div>
          <p className="text-[9.5px] font-semibold text-purple-900 bg-purple-50/80 p-1.5 rounded-lg truncate">
            {pillars.ownerMoney.status}
          </p>
        </div>

        {/* 8. BUSINESS HEALTH */}
        <div className="rounded-[22px] bg-white border border-slate-200/90 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              8. Business Health
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Activity className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-lg font-black text-slate-900 leading-none">
              {pillars.businessHealth.score}/100
            </span>
            <p className="text-[10.5px] font-bold text-teal-800 mt-1">
              {pillars.businessHealth.status}
            </p>
          </div>
          <p className="text-[9.5px] font-medium text-slate-600 bg-slate-50 p-1.5 rounded-lg leading-snug">
            {pillars.businessHealth.advice}
          </p>
        </div>
      </div>
    </section>
  );
}
