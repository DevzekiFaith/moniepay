"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Recent Business Activity Component
// 100% Mobile Fluid • Zero Overflow • Single Green Theme
// ─────────────────────────────────────────────────────────────────

import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  Users,
  Wallet,
  Clock,
  CheckCircle2,
  Plus,
} from "lucide-react";
import type { BusinessTransaction } from "@/types/moniepay.types";

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
        <h4 className="text-sm sm:text-base font-black text-slate-800">No activity recorded for this period</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
          Record your first cash sale, stock purchase, or chop money withdrawal.
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

  const formatTxTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Today";
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full min-w-0">
      {transactions.slice(0, 8).map((tx) => {
        const isPositive = tx.type === "SALE" || tx.type === "DEBT_COLLECTION";

        return (
          <div
            key={tx.id || tx.client_tx_id}
            className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-white border border-emerald-900/10 shadow-xs hover:border-emerald-500 active:scale-[0.99] transition-all min-w-0 gap-2.5"
          >
            {/* Left info */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              {/* Thumbnail Badge */}
              <div
                className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl shrink-0 border ${
                  isPositive
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                {isPositive ? (
                  <ArrowDownLeft className="h-4 w-4" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs sm:text-sm font-black text-slate-900 truncate block">
                    {tx.description || tx.category}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                    {tx.payment_method}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 mt-0.5 truncate">
                  <span className="truncate">{tx.category}</span>
                  <span>•</span>
                  <span className="shrink-0">{formatTxTime(tx.transaction_date)}</span>
                </div>
              </div>
            </div>

            {/* Right amount */}
            <div className="text-right shrink-0 pl-1">
              <div
                className={`text-xs sm:text-sm font-black tracking-tight ${
                  isPositive ? "text-emerald-800" : "text-slate-900"
                }`}
              >
                {isPositive ? "+" : "-"}₦{Number(tx.amount).toLocaleString()}
              </div>

              <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 mt-0.5">
                {tx.sync_status === "pending" ? (
                  <span className="text-amber-700 font-bold">Saving...</span>
                ) : (
                  <span className="flex items-center gap-0.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                    <span>Saved ✓</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
