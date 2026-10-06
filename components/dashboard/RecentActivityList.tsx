"use client";

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
      <div className="rounded-[26px] bg-white border border-slate-200/80 p-8 sm:p-12 text-center shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)]">
        <Clock className="h-10 w-10 text-slate-400 mx-auto mb-3" />
        <h4 className="text-base font-extrabold text-slate-800">No activity recorded today</h4>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
          Tap below to record your first cash sale, fuel expense, or inventory restock.
        </p>
        <button
          onClick={onOpenRecordModal}
          className="mt-4 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          + Record First Sale
        </button>
      </div>
    );
  }

  const getTypeBadge = (type: BusinessTransaction["type"]) => {
    switch (type) {
      case "SALE":
        return {
          icon: <ArrowDownLeft className="h-5 w-5 text-emerald-600" />,
          bg: "bg-emerald-50 border-emerald-100",
        };
      case "EXPENSE":
        return {
          icon: <ArrowUpRight className="h-5 w-5 text-rose-600" />,
          bg: "bg-rose-50 border-rose-100",
        };
      case "STOCK_PURCHASE":
        return {
          icon: <Package className="h-5 w-5 text-blue-600" />,
          bg: "bg-blue-50 border-blue-100",
        };
      case "OWNER_WITHDRAWAL":
        return {
          icon: <Wallet className="h-5 w-5 text-purple-600" />,
          bg: "bg-purple-50 border-purple-100",
        };
      case "STAFF_PAYMENT":
        return {
          icon: <Users className="h-5 w-5 text-orange-600" />,
          bg: "bg-orange-50 border-orange-100",
        };
      case "DEBT_COLLECTION":
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
          bg: "bg-emerald-50 border-emerald-100",
        };
      default:
        return {
          icon: <Clock className="h-5 w-5 text-slate-500" />,
          bg: "bg-slate-50 border-slate-100",
        };
    }
  };

  const formatTxTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Today";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {transactions.slice(0, 8).map((tx) => {
        const badge = getTypeBadge(tx.type);
        const isPositive = tx.type === "SALE" || tx.type === "DEBT_COLLECTION";

        return (
          <div
            key={tx.id || tx.client_tx_id}
            className="flex items-center justify-between p-4 sm:p-4.5 rounded-[24px] bg-white border border-slate-200/80 shadow-[0_2px_12px_-1px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_-2px_rgba(15,23,42,0.08)] active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3.5">
              {/* Vibrant Thumbnail Badge */}
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${badge.bg} shrink-0 shadow-sm`}
              >
                {badge.icon}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate max-w-[170px] sm:max-w-xs">
                    {tx.description || tx.category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {tx.payment_method}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
                  <span>{tx.category}</span>
                  <span>•</span>
                  <span>{formatTxTime(tx.transaction_date)}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div
                className={`text-base sm:text-lg font-black tracking-tight ${
                  isPositive ? "text-emerald-700" : "text-slate-800"
                }`}
              >
                {isPositive ? "+" : "-"}₦{Number(tx.amount).toLocaleString()}
              </div>

              <div className="flex items-center justify-end gap-1 text-[11px] text-slate-400 mt-0.5">
                {tx.sync_status === "pending" ? (
                  <span className="text-amber-600 font-bold">Saving...</span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span>Recorded ✓</span>
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
