"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Live Business Activity Log
// 100% Mobile Fluid • Zero Overflow • Single Green Theme
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from "react";
import { AppSidebar, AppBottomBar, AppMobileHeader } from "@/components/layout/AppNavigation";
import { formatNaira, formatTransactionDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import {
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Plus,
  Calendar,
  Store,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { BusinessTransaction, TransactionType } from "@/types/moniepay.types";
import { getCachedTransactions, setCachedTransactions } from "@/lib/offline/offlineQueue";
import { DEFAULT_TRANSACTIONS } from "@/lib/data/initialBusinessData";
import { InstantRecordSheet } from "@/components/dashboard/InstantRecordSheet";

export default function ActivityPage() {
  const { user } = useAuth();
  const { notify } = useNotification();

  const [transactions, setTransactions] = useState<BusinessTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [recordType, setRecordType] = useState<TransactionType>("SALE");

  useEffect(() => {
    const cached = getCachedTransactions();
    if (cached.length > 0) {
      setTransactions(cached);
    } else {
      setTransactions(DEFAULT_TRANSACTIONS);
      setCachedTransactions(DEFAULT_TRANSACTIONS);
    }
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        (tx.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (tx.category?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (tx.type?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      const matchesType =
        filterType === "ALL" ||
        (filterType === "SALE" && tx.type === "SALE") ||
        (filterType === "STOCK" && tx.type === "STOCK_PURCHASE") ||
        (filterType === "EXPENSE" && (tx.type === "EXPENSE" || tx.type === "STAFF_PAYMENT")) ||
        (filterType === "WITHDRAWAL" && tx.type === "OWNER_WITHDRAWAL");

      return matchesSearch && matchesType;
    });
  }, [transactions, searchTerm, filterType]);

  const handleOpenRecord = (type: TransactionType) => {
    setRecordType(type);
    setIsRecordOpen(true);
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
    <div className="flex min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500/20 overflow-x-hidden">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-10">
        <AppMobileHeader />

        <main className="w-full max-w-3xl mx-auto px-3 sm:px-5 md:px-8 py-3.5 sm:py-6 space-y-3.5">
          {/* Header */}
          <div className="flex items-center justify-between gap-2.5">
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight truncate">
                Activity Log
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                Live chronological business records.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenRecord("SALE")}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-xs shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
              {[
                { id: "ALL", label: "All" },
                { id: "SALE", label: "Sales" },
                { id: "STOCK", label: "Stock" },
                { id: "EXPENSE", label: "Expenses" },
                { id: "WITHDRAWAL", label: "Chop Money" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterType(f.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                    filterType === f.id
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions Feed */}
          <div className="space-y-2 min-w-0">
            {filtered.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs font-semibold">
                No matching business activities found.
              </div>
            ) : (
              filtered.map((tx) => {
                const isPositive =
                  tx.type === "SALE" || tx.type === "DEBT_COLLECTION";

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-white border border-emerald-900/10 shadow-xs hover:border-emerald-500 active:scale-[0.99] transition-all min-w-0 gap-2.5"
                  >
                    {/* Left info */}
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <div
                        className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shrink-0 border ${
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
                        <span className="text-[10px] font-bold text-slate-400">
                          {tx.type.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>

        <AppBottomBar />
      </div>

      <InstantRecordSheet
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        accounts={[]}
        businessId="biz_default_01"
        initialType={recordType}
      />
    </div>
  );
}
