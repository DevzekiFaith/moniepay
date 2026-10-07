"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Recent Business Activity Component
// 100% Mobile Fluid • Zero Overflow • Single Green Theme
// ─────────────────────────────────────────────────────────────────

import React from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  Users,
  Wallet,
  Clock,
  CheckCircle2,
  Plus,
  ChevronRight,
} from "lucide-react";
import type { BusinessTransaction } from "@/types/moniepay.types";
import { formatTransactionDate } from "@/lib/utils";

interface RecentActivityListProps {
  transactions: BusinessTransaction[];
  onOpenRecordModal: () => void;
}

export function RecentActivityList({
  transactions,
  onOpenRecordModal,
}: RecentActivityListProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-[24px] bg-white border border-emerald-900/10 p-6 sm:p-10 text-center shadow-xs">
        <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <h4 className="text-sm sm:text-base font-black text-slate-800">No market activity recorded yet today</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
          Record your first cash sale, market restock, or take chop money for house feeding.
        </p>
        <button
          type="button"
          onClick={onOpenRecordModal}
          className="mt-3.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          + Record First Sale
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full min-w-0">
      {transactions.slice(0, 10).map((tx) => {
        const isPositive = tx.type === "SALE" || tx.type === "DEBT_COLLECTION";
        const txId = tx.id || tx.client_tx_id;

        const paymentLabel =
          tx.payment_method === "CASH"
            ? "Cash"
            : tx.payment_method === "TRANSFER"
            ? "Transfer"
            : tx.payment_method === "CREDIT"
            ? "Gbese"
            : "POS";

        return (
          <Link
            key={txId}
            href={`/activity/${txId}`}
            className="flex items-center justify-between p-2.5 sm:p-4 rounded-2xl bg-white border border-emerald-900/10 shadow-xs hover:border-emerald-500 hover:shadow-md active:scale-[0.99] transition-all min-w-0 gap-2 sm:gap-2.5 group cursor-pointer"
          >
            {/* Left info */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {/* Thumbnail Badge */}
              <div
                className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl shrink-0 border transition-transform group-hover:scale-105 ${
                  isPositive
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                {isPositive ? (
                  <ArrowDownLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs sm:text-sm font-black text-slate-900 truncate block group-hover:text-emerald-700 transition-colors">
                    {tx.description || tx.category}
                  </span>
                  <span className="text-[8.5px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                    {paymentLabel}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] sm:text-[10.5px] text-slate-400 mt-0.5 truncate">
                  <span className="truncate">{tx.category}</span>
                  <span>•</span>
                  <span className="shrink-0 font-medium text-slate-500">
                    {formatTransactionDate(tx.transaction_date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right amount & arrow */}
            <div className="text-right shrink-0 pl-1 flex items-center gap-1.5 sm:gap-2">
              <div>
                <div
                  className={`text-xs sm:text-sm font-black tracking-tight whitespace-nowrap ${
                    isPositive ? "text-emerald-800" : "text-slate-900"
                  }`}
                >
                  {isPositive ? "+" : "-"}₦{Number(tx.amount).toLocaleString()}
                </div>

                <div className="flex items-center justify-end gap-1 text-[9.5px] sm:text-[10px] text-slate-400 mt-0.5">
                  {tx.sync_status === "pending" ? (
                    <span className="text-amber-700 font-bold">Dey Save...</span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-emerald-700 font-bold whitespace-nowrap">
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
                      <span>Saved Safe ✓</span>
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
