"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Live Business Activity Log
// 100% Mobile Fluid • Multi-Dimensional Filters • Smart Pagination
// Market Informal Terminology • Balogun / Alaba Trader Vernacular
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
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  RotateCcw,
  ArrowUpDown,
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { BusinessTransaction, TransactionType, PaymentMethod } from "@/types/moniepay.types";
import { getCachedTransactions, setCachedTransactions } from "@/lib/offline/offlineQueue";
import { DEFAULT_TRANSACTIONS } from "@/lib/data/initialBusinessData";
import { InstantRecordSheet } from "@/components/dashboard/InstantRecordSheet";

type DateRangeFilter = "ALL" | "TODAY" | "THIS_WEEK" | "THIS_MONTH";
type SortOption = "NEWEST" | "OLDEST" | "AMOUNT_HIGH" | "AMOUNT_LOW";

function getMarketTypeBadge(type: string, method?: string): string {
  if (type === "SALE" && method === "CREDIT") return "Customer Gbese";
  if (type === "SALE") return "Market Sale";
  if (type === "DEBT_COLLECTION") return "Gbese Paid";
  if (type === "STOCK_PURCHASE") return "Restock Goods";
  if (type === "EXPENSE") return "Shop Expense";
  if (type === "STAFF_PAYMENT") return "Shop Boy Wage";
  if (type === "OWNER_WITHDRAWAL") return "Chop Money";
  if (type === "SUPPLIER_PAYMENT") return "Supplier Payment";
  return type.replace(/_/g, " ");
}

function getPaymentBadge(method: string): string {
  if (method === "CASH") return "Cash";
  if (method === "TRANSFER") return "Transfer";
  if (method === "CREDIT") return "Gbese";
  if (method === "POS") return "POS";
  return method;
}

export default function ActivityPage() {
  const { user } = useAuth();
  const { notify } = useNotification();

  const [transactions, setTransactions] = useState<BusinessTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterMethod, setFilterMethod] = useState<string>("ALL");
  const [filterDateRange, setFilterDateRange] = useState<DateRangeFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("NEWEST");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterMethod, filterDateRange, sortBy, pageSize]);

  // Filtered & Sorted Transactions
  const filtered = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneWeekAgo = today - 7 * 24 * 3600 * 1000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const result = transactions.filter((tx) => {
      // 1. Search Query
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        (tx.description?.toLowerCase() || "").includes(q) ||
        (tx.category?.toLowerCase() || "").includes(q) ||
        (tx.type?.toLowerCase() || "").includes(q) ||
        (tx.payment_method?.toLowerCase() || "").includes(q);

      // 2. Type Filter
      const matchesType =
        filterType === "ALL" ||
        (filterType === "SALE" && tx.type === "SALE" && tx.payment_method !== "CREDIT") ||
        (filterType === "CREDIT" && (tx.payment_method === "CREDIT" || tx.type === "DEBT_COLLECTION" || tx.category?.toLowerCase().includes("credit"))) ||
        (filterType === "STOCK" && tx.type === "STOCK_PURCHASE") ||
        (filterType === "EXPENSE" && (tx.type === "EXPENSE" || tx.type === "STAFF_PAYMENT")) ||
        (filterType === "WITHDRAWAL" && tx.type === "OWNER_WITHDRAWAL");

      // 3. Payment Method Filter
      const matchesMethod =
        filterMethod === "ALL" || tx.payment_method === filterMethod;

      // 4. Date Range Filter
      let matchesDate = true;
      if (filterDateRange !== "ALL") {
        const txTime = new Date(tx.transaction_date).getTime();
        if (filterDateRange === "TODAY") {
          matchesDate = txTime >= today;
        } else if (filterDateRange === "THIS_WEEK") {
          matchesDate = txTime >= oneWeekAgo;
        } else if (filterDateRange === "THIS_MONTH") {
          matchesDate = txTime >= startOfMonth;
        }
      }

      return matchesSearch && matchesType && matchesMethod && matchesDate;
    });

    // Sort order
    return result.sort((a, b) => {
      const timeA = new Date(a.transaction_date).getTime();
      const timeB = new Date(b.transaction_date).getTime();
      const amtA = Number(a.amount) || 0;
      const amtB = Number(b.amount) || 0;

      if (sortBy === "NEWEST") return timeB - timeA;
      if (sortBy === "OLDEST") return timeA - timeB;
      if (sortBy === "AMOUNT_HIGH") return amtB - amtA;
      if (sortBy === "AMOUNT_LOW") return amtA - amtB;
      return 0;
    });
  }, [transactions, searchTerm, filterType, filterMethod, filterDateRange, sortBy]);

  // Aggregate Metrics for current filtered view
  const { totalInflow, totalOutflow, netFlow } = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    for (const tx of filtered) {
      const amt = Number(tx.amount) || 0;
      if (tx.type === "SALE" || tx.type === "DEBT_COLLECTION") {
        inflow += amt;
      } else {
        outflow += amt;
      }
    }
    return {
      totalInflow: inflow,
      totalOutflow: outflow,
      netFlow: inflow - outflow,
    };
  }, [filtered]);

  // Pagination slicing
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filtered.length);
  const paginatedTransactions = filtered.slice(startIndex, endIndex);

  const hasActiveFilters =
    searchTerm !== "" ||
    filterType !== "ALL" ||
    filterMethod !== "ALL" ||
    filterDateRange !== "ALL" ||
    sortBy !== "NEWEST";

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterType("ALL");
    setFilterMethod("ALL");
    setFilterDateRange("ALL");
    setSortBy("NEWEST");
  };

  const handleOpenRecord = (type: TransactionType) => {
    setRecordType(type);
    setIsRecordOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500/20 overflow-x-hidden">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-10">
        <AppMobileHeader />

        <main className="w-full max-w-3xl mx-auto px-3 sm:px-5 md:px-8 py-3.5 sm:py-6 space-y-3.5">
          {/* ── HEADER ── */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-2.5">
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight truncate">
                Live Market Activity & Receipts
              </h1>
              <p className="text-[10.5px] sm:text-xs text-slate-500 mt-0.5 truncate">
                Every cash sale, restock expense, and customer gbese record.
              </p>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-2.5 py-1.5 sm:p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showAdvancedFilters || hasActiveFilters
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-white border border-slate-200 text-slate-700 hover:text-slate-900"
                }`}
                title="Toggle Filters"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="text-[11px] sm:text-xs">Filter</span>
                {hasActiveFilters && (
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleOpenRecord("SALE")}
                className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden min-[360px]:inline">Record Sale</span>
                <span className="inline min-[360px]:hidden">Record</span>
              </button>
            </div>
          </div>

          {/* ── FILTER & SEARCH SECTION ── */}
          <div className="space-y-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search goods, items, or customer name..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Type Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
              {[
                { id: "ALL", label: "All Market Records" },
                { id: "SALE", label: "Sales (Cash In)" },
                { id: "CREDIT", label: "Customer Gbese" },
                { id: "STOCK", label: "Restock Goods" },
                { id: "EXPENSE", label: "Expenses & Gen Fuel" },
                { id: "WITHDRAWAL", label: "Chop Money" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterType(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                    filterType === f.id
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* ── EXPANDABLE ADVANCED FILTER PANEL ── */}
            <AnimatePresence>
              {showAdvancedFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl bg-white border border-slate-200 p-3.5 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Filter className="h-3.5 w-3.5 text-emerald-700" />
                        <span>Filter & Sort Controls</span>
                      </span>

                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Clear Filters</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {/* 1. Payment Method Filter */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          Payment Way
                        </label>
                        <select
                          value={filterMethod}
                          onChange={(e) => setFilterMethod(e.target.value)}
                          className="w-full py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:outline-none focus:border-emerald-600 text-xs cursor-pointer"
                        >
                          <option value="ALL">All Payment Ways</option>
                          <option value="CASH">Cash Drawer</option>
                          <option value="TRANSFER">Bank Transfer</option>
                          <option value="POS">POS Machine</option>
                          <option value="CREDIT">Gbese / Book Credit</option>
                        </select>
                      </div>

                      {/* 2. Date Range Filter */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          Market Time
                        </label>
                        <select
                          value={filterDateRange}
                          onChange={(e) => setFilterDateRange(e.target.value as DateRangeFilter)}
                          className="w-full py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:outline-none focus:border-emerald-600 text-xs cursor-pointer"
                        >
                          <option value="ALL">All Time</option>
                          <option value="TODAY">Today Only</option>
                          <option value="THIS_WEEK">Past 7 Days</option>
                          <option value="THIS_MONTH">This Month</option>
                        </select>
                      </div>

                      {/* 3. Sort Order */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          Sort Records
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as SortOption)}
                          className="w-full py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:outline-none focus:border-emerald-600 text-xs cursor-pointer"
                        >
                          <option value="NEWEST">Latest First</option>
                          <option value="OLDEST">Oldest First</option>
                          <option value="AMOUNT_HIGH">Highest Amount (₦)</option>
                          <option value="AMOUNT_LOW">Lowest Amount (₦)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── FILTERED TOTALS SUMMARY BAR ── */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-white border border-slate-200/90 text-xs shadow-2xs">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-slate-500 font-medium whitespace-nowrap">
                Found <strong className="text-slate-900 font-black">{filtered.length}</strong> records
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[11px] sm:text-xs text-emerald-800 font-black bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60 whitespace-nowrap">
                  <TrendingUp className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span>+₦{totalInflow.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-700 font-black bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/80 whitespace-nowrap">
                  <TrendingDown className="h-3 w-3 text-rose-500 shrink-0" />
                  <span>-₦{totalOutflow.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-slate-500 shrink-0 ml-auto">
              <span className="text-[11px] font-bold">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="py-0.5 px-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-bold cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* ── TRANSACTIONS FEED ── */}
          <div className="space-y-2 min-w-0">
            {paginatedTransactions.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs font-semibold space-y-2">
                <p>No matching market records found for your filter.</p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              paginatedTransactions.map((tx) => {
                const isPositive =
                  tx.type === "SALE" || tx.type === "DEBT_COLLECTION";
                const txId = tx.id || tx.client_tx_id;

                return (
                  <Link
                    key={txId}
                    href={`/activity/${txId}`}
                    className="flex items-center justify-between p-2.5 sm:p-4 rounded-2xl bg-white border border-emerald-900/10 shadow-xs hover:border-emerald-500 hover:shadow-md active:scale-[0.99] transition-all min-w-0 gap-2 sm:gap-2.5 group cursor-pointer"
                  >
                    {/* Left info */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div
                        className={`h-8 w-8 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${
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
                            {getPaymentBadge(tx.payment_method)}
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

                    {/* Right amount */}
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
                          <span className="font-bold text-slate-400 truncate max-w-[90px] sm:max-w-[140px] block text-right">
                            {getMarketTypeBadge(tx.type, tx.payment_method)}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* ── PAGINATION CONTROLS ── */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 pb-1 px-1">
              <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
                Showing {startIndex + 1}–{endIndex} of {filtered.length}
              </span>

              <div className="flex items-center gap-1 shrink-0 ml-auto">
                {/* Previous Button */}
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page Number Pills (Smart Responsive) */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && page - prev > 1;

                      return (
                        <div key={page} className="flex items-center gap-1">
                          {showEllipsis && (
                            <span className="text-xs text-slate-400 px-0.5 font-bold">
                              ..
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`h-7 min-w-[28px] px-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                              currentPage === page
                                ? "bg-emerald-700 text-white shadow-xs"
                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
                  aria-label="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
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
