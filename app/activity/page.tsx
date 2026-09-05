"use client";

// ─────────────────────────────────────────────────────────────────
// Monie Lite — Transaction Ledger & Activity
// Smart length management, pagination, date grouping & Framer Motion
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo } from "react";
import { AppSidebar, AppBottomBar } from "@/components/layout/AppNavigation";
import { MoneyNow } from "@/components/dashboard/MoneyNow";
import { formatNaira, formatTransactionDate } from "@/lib/utils";
import {
  RefreshCw,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Download,
  Loader2,
  X,
  ShieldCheck,
  Tag,
  Clock,
  CreditCard,
  Building2,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Layers,
  SlidersHorizontal,
  Grid,
  List,
} from "lucide-react";
import Link from "next/link";
import { RecordActivityModal } from "@/components/dashboard/RecordActivityModal";
import { motion, AnimatePresence } from "framer-motion";
import { ModernMerchantAvatar } from "@/components/ui/ModernIcons";

export interface TransactionItem {
  id: string;
  amount: number;
  currency: string;
  transactionDate: string | Date;
  description: string;
  merchantName?: string | null;
  normalizedMerchantName?: string | null;
  transactionType: "INCOME" | "EXPENSE" | "TRANSFER" | "REFUND" | string;
  isTransfer: boolean;
  category?: {
    id: string;
    name: string;
    icon?: string | null;
    color?: string | null;
  } | null;
  account?: {
    id: string;
    name: string;
  } | null;
  deduplicationHash?: string;
  source?: string;
}

type Period = "today" | "this_week" | "this_month" | "last_3_months";

const PERIODS: { label: string; value: Period }[] = [
  { label: "Today",       value: "today"          },
  { label: "This Week",   value: "this_week"      },
  { label: "This Month",  value: "this_month"     },
  { label: "3 Months",    value: "last_3_months"  },
];

const PERIOD_LABELS: Record<Period, string> = {
  today:          "Today",
  this_week:      "This Week",
  this_month:     "This Month",
  last_3_months:  "Last 3 Months",
};

type FilterType = "ALL" | "EXPENSE" | "INCOME" | "TRANSFER";

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All Records", value: "ALL" },
  { label: "Expenses",    value: "EXPENSE" },
  { label: "Inflow",      value: "INCOME" },
  { label: "Transfers",   value: "TRANSFER" },
];

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getDateGroupLabel(dateStr: string | Date): string {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const itemDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (itemDate.getTime() === today.getTime()) return "Today";
  if (itemDate.getTime() === yesterday.getTime()) return "Yesterday";

  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  if (itemDate >= oneWeekAgo) return "This Week";

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (itemDate.getFullYear() === now.getFullYear() && itemDate.getMonth() === now.getMonth()) {
    return "Earlier This Month";
  }

  return `${monthNames[itemDate.getMonth()]} ${itemDate.getFullYear()}`;
}

export default function ActivityPage() {
  const [period, setPeriod] = useState<Period>("this_month");
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeDetailTx, setActiveDetailTx] = useState<TransactionItem | null>(null);
  const [accounts, setAccounts] = useState<{ id: string; name: string; institution?: { name: string } }[]>([]);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Pagination & Density State (Manages Length)
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Financial Metrics
  const [metrics, setMetrics] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netCashFlow: 0,
    savingsRate: 0,
  });

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      // 1. Fetch Analytics for metrics
      const analyticsRes = await fetch(`/api/analytics?period=${period}`);
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        const totalIn = data.balance?.totalIn ?? 0;
        const totalOut = data.balance?.totalOut ?? 0;
        setMetrics({
          totalBalance: data.balance?.currentBalance ?? 0,
          totalIncome: totalIn,
          totalExpenses: totalOut,
          netCashFlow: data.balance?.netMovement ?? (totalIn - totalOut),
          savingsRate: totalIn > 0 ? Math.max(0, ((totalIn - totalOut) / totalIn) * 100) : 0,
        });
      }

      // 2. Fetch Transactions
      const txRes = await fetch("/api/transactions?pageSize=100");
      if (txRes.ok) {
        const txData = await txRes.json();
        if (txData.transactions) {
          setTransactions(txData.transactions);
        }
      }

      // 3. Fetch Accounts for logging activity
      const acctsRes = await fetch("/api/accounts");
      if (acctsRes.ok) {
        const acctsData = await acctsRes.json();
        setAccounts(acctsData.accounts || []);
      }
    } catch (err) {
      console.error("Activity page load error:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedCategory, pageSize]);

  // Unique categories list
  const categories = useMemo(() => {
    return Array.from(
      new Set(
        transactions
          .map((t) => t.category?.name)
          .filter((name): name is string => Boolean(name))
      )
    );
  }, [transactions]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (activeTab === "EXPENSE" && (tx.transactionType !== "EXPENSE" || tx.isTransfer)) return false;
      if (activeTab === "INCOME" && tx.transactionType !== "INCOME" && tx.transactionType !== "REFUND") return false;
      if (activeTab === "TRANSFER" && !tx.isTransfer && tx.transactionType !== "TRANSFER") return false;
      if (selectedCategory !== "ALL" && tx.category?.name !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          tx.description.toLowerCase().includes(q) ||
          (tx.merchantName ?? "").toLowerCase().includes(q) ||
          (tx.normalizedMerchantName ?? "").toLowerCase().includes(q) ||
          (tx.category?.name ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [transactions, activeTab, selectedCategory, searchQuery]);

  // Paginated transactions
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Group paginated transactions by Date
  const groupedTransactions = useMemo(() => {
    const groups: { label: string; items: TransactionItem[]; totalNet: number }[] = [];
    const map = new Map<string, { items: TransactionItem[]; totalNet: number }>();

    for (const tx of paginatedTransactions) {
      const groupLabel = getDateGroupLabel(tx.transactionDate);
      if (!map.has(groupLabel)) {
        map.set(groupLabel, { items: [], totalNet: 0 });
      }
      const entry = map.get(groupLabel)!;
      entry.items.push(tx);
      const isIncome = tx.transactionType === "INCOME" || tx.transactionType === "REFUND";
      entry.totalNet += isIncome ? tx.amount : -tx.amount;
    }

    for (const [label, data] of map.entries()) {
      groups.push({ label, items: data.items, totalNet: data.totalNet });
    }

    return groups;
  }, [paginatedTransactions]);

  const toggleGroupCollapse = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const exportCSV = () => {
    const headers = ["Date", "Description", "Merchant", "Category", "Type", "Amount", "Account"];
    const rows = filtered.map((tx) => [
      formatTransactionDate(tx.transactionDate),
      `"${tx.description.replace(/"/g, '""')}"`,
      `"${(tx.normalizedMerchantName || tx.merchantName || "").replace(/"/g, '""')}"`,
      `"${(tx.category?.name || "Uncategorized").replace(/"/g, '""')}"`,
      tx.transactionType,
      tx.amount,
      `"${(tx.account?.name || "Primary").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `monielite_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-shell" style={{ display: "flex", minHeight: "100dvh", background: "var(--bg-base)" }}>
      {/* Desktop Sidebar */}
      <div className="desktop-only">
        <AppSidebar />
      </div>

      {/* Main Container */}
      <div className="page-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Sticky Top Header */}
        <header
          style={{
            height: "64px",
            borderBottom: "1px solid var(--border-base)",
            background: "rgba(17, 24, 39, 0.75)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1.5rem",
            position: "sticky",
            top: 0,
            zIndex: 30,
            gap: "1rem",
            overflowX: "auto",
          }}
        >
          {/* Time Period Tabs */}
          <div
            style={{
              display: "flex",
              gap: "3px",
              background: "var(--bg-elevated)",
              padding: "3px",
              borderRadius: "10px",
              border: "1px solid var(--border-base)",
              flexShrink: 0,
            }}
          >
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "7px",
                  fontSize: "12px",
                  fontWeight: period === p.value ? 700 : 500,
                  color: period === p.value ? "var(--text-primary)" : "var(--text-secondary)",
                  background: period === p.value ? "var(--bg-surface)" : "transparent",
                  border: period === p.value ? "1px solid var(--border-strong)" : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: period === p.value ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Right Header Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
            <button
              onClick={() => setIsRecordModalOpen(true)}
              style={{
                height: "36px",
                padding: "0 14px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 700,
                background: "var(--accent)",
                color: "#FFFFFF",
                border: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(79, 156, 249, 0.3)",
              }}
            >
              <Plus size={14} />
              <span className="desktop-text">Record Live Activity</span>
            </button>

            <button
              onClick={exportCSV}
              className="neo-tactile-btn"
              style={{
                height: "36px",
                padding: "0 12px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Download size={13} />
              <span className="desktop-text">Export CSV</span>
            </button>

            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              title="Refresh ledger"
              className="neo-tactile-btn"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
              }}
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} color="var(--accent)" />
            </button>

            <Link
              href="/profile"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #38bdf8 0%, #1e40af 100%)",
                border: "1.5px solid rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                color: "#FFFFFF",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                textDecoration: "none",
              }}
            >
              A
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-body">
          {isLoading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "50vh",
                gap: "1rem",
              }}
            >
              <Loader2 size={32} className="animate-spin" color="var(--accent)" />
              <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                Aggregating real-time financial ledger…
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              {/* Header Title Section */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <h1
                    style={{
                      fontSize: "26px",
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.03em",
                      lineHeight: 1.2,
                    }}
                  >
                    Transaction Activity
                  </h1>
                  <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    Continuous chronological ledger across all verified accounts.
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span className="pill pill-positive" style={{ fontSize: "11px" }}>
                    <span className="pulse-dot" style={{ background: "var(--positive)", width: "5px", height: "5px", borderRadius: "50%" }} />
                    {filtered.length} Total Activities
                  </span>
                </div>
              </div>

              {/* North Star 3 Questions / Metrics */}
              <MoneyNow
                totalBalance={metrics.totalBalance}
                totalIncome={metrics.totalIncome}
                totalExpenses={metrics.totalExpenses}
                netCashFlow={metrics.netCashFlow}
                periodLabel={PERIOD_LABELS[period]}
                accountCount={accounts.length || 2}
              />

              {/* Senders & Receivers Activity Card */}
              <div className="card" style={{ padding: 0, overflow: "hidden", background: "#0D1526" }}>
                {/* Filter, Search & Density Controls Bar */}
                <div
                  style={{
                    padding: "1.1rem 1.5rem",
                    borderBottom: "1px solid var(--border-base)",
                    background: "var(--bg-elevated)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  {/* Type Filter Pills */}
                  <div style={{ display: "flex", gap: "4px", overflowX: "auto", paddingBottom: "2px" }}>
                    {FILTERS.map((f) => {
                      const isActive = activeTab === f.value;
                      return (
                        <button
                          key={f.value}
                          onClick={() => setActiveTab(f.value)}
                          style={{
                            padding: "5px 12px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? "var(--accent)" : "var(--text-secondary)",
                            background: isActive ? "rgba(79, 156, 249, 0.15)" : "transparent",
                            border: isActive ? "1.5px solid rgba(79, 156, 249, 0.3)" : "1px solid transparent",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Search, Category & View Controls */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
                    {/* Category Filter */}
                    {categories.length > 0 && (
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{
                          height: "34px",
                          padding: "0 10px",
                          borderRadius: "8px",
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-base)",
                          color: "var(--text-secondary)",
                          fontSize: "12px",
                          outline: "none",
                        }}
                      >
                        <option value="ALL">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Search Field */}
                    <div style={{ position: "relative", minWidth: "160px" }}>
                      <Search
                        size={13}
                        style={{
                          position: "absolute",
                          left: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "var(--text-tertiary)",
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Search narration..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          width: "100%",
                          height: "34px",
                          padding: "0 10px 0 30px",
                          fontSize: "12px",
                          borderRadius: "8px",
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-base)",
                          color: "var(--text-primary)",
                          outline: "none",
                        }}
                      />
                    </div>

                    {/* Density Toggle */}
                    <div
                      style={{
                        display: "flex",
                        background: "var(--bg-surface)",
                        borderRadius: "8px",
                        padding: "2px",
                        border: "1px solid var(--border-base)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setDensity("comfortable")}
                        title="Comfortable view"
                        style={{
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background: density === "comfortable" ? "var(--bg-elevated)" : "transparent",
                          color: density === "comfortable" ? "var(--accent)" : "var(--text-tertiary)",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Grid size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDensity("compact")}
                        title="Compact view"
                        style={{
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background: density === "compact" ? "var(--bg-elevated)" : "transparent",
                          color: density === "compact" ? "var(--accent)" : "var(--text-tertiary)",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <List size={13} />
                      </button>
                    </div>

                    {/* Page Size Dropdown */}
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      style={{
                        height: "34px",
                        padding: "0 8px",
                        borderRadius: "8px",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-base)",
                        color: "var(--text-secondary)",
                        fontSize: "12px",
                        outline: "none",
                      }}
                    >
                      <option value={10}>10 / page</option>
                      <option value={15}>15 / page</option>
                      <option value={25}>25 / page</option>
                      <option value={50}>50 / page</option>
                    </select>
                  </div>
                </div>

                {/* Grouped & Paginated Transaction Rows */}
                <div style={{ padding: "0.5rem 1.25rem 1rem" }}>
                  {filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-tertiary)", fontSize: "13.5px" }}>
                      No transactions match your search or filter.
                    </div>
                  ) : (
                    <div>
                      {groupedTransactions.map((group) => {
                        const isCollapsed = collapsedGroups[group.label];
                        return (
                          <div key={group.label} style={{ marginBottom: "0.75rem" }}>
                            {/* Date Group Header */}
                            <div
                              onClick={() => toggleGroupCollapse(group.label)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "0.625rem 0.5rem",
                                cursor: "pointer",
                                borderBottom: "1px solid var(--border-subtle)",
                                userSelect: "none",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ color: "var(--text-tertiary)", transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.15s ease" }}>
                                  <ChevronDown size={14} />
                                </span>
                                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                  {group.label}
                                </span>
                                <span
                                  style={{
                                    fontSize: "10.5px",
                                    padding: "1px 6px",
                                    borderRadius: "10px",
                                    background: "var(--bg-elevated)",
                                    color: "var(--text-tertiary)",
                                    fontWeight: 600,
                                  }}
                                >
                                  {group.items.length}
                                </span>
                              </div>

                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  color: group.totalNet >= 0 ? "var(--positive)" : "var(--text-tertiary)",
                                }}
                              >
                                {group.totalNet >= 0 ? `+${formatNaira(group.totalNet)}` : `-${formatNaira(Math.abs(group.totalNet))}`}
                              </span>
                            </div>

                            {/* Group Items */}
                            {!isCollapsed && (
                              <AnimatePresence mode="popLayout">
                                {group.items.map((tx) => {
                                  const isIncome = tx.transactionType === "INCOME" || tx.transactionType === "REFUND";
                                  const isTransfer = tx.isTransfer || tx.transactionType === "TRANSFER";
                                  const displayName = tx.normalizedMerchantName || tx.merchantName || tx.description;
                                  const dateStr = formatTransactionDate(tx.transactionDate);

                                  if (density === "compact") {
                                    return (
                                      <motion.div
                                        key={tx.id}
                                        onClick={() => setActiveDetailTx(tx)}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          padding: "0.5rem 0.5rem",
                                          borderBottom: "1px solid var(--border-subtle)",
                                          cursor: "pointer",
                                          borderRadius: "6px",
                                          fontSize: "12.5px",
                                        }}
                                        whileHover={{ background: "var(--bg-elevated)" }}
                                      >
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: isIncome ? "var(--positive)" : isTransfer ? "#a855f7" : "var(--accent)", flexShrink: 0 }} />
                                          <p style={{ fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "280px" }}>
                                            {displayName}
                                          </p>
                                          {tx.category?.name && (
                                            <span style={{ fontSize: "11px", color: "var(--text-tertiary)", display: "none" }} className="desktop-inline">
                                              • {tx.category.name}
                                            </span>
                                          )}
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
                                          <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                                            {dateStr}
                                          </span>
                                          <span style={{ fontWeight: 700, color: isIncome ? "var(--positive)" : "var(--text-primary)", minWidth: "90px", textAlign: "right" }}>
                                            {isIncome ? `+${formatNaira(tx.amount)}` : `-${formatNaira(tx.amount)}`}
                                          </span>
                                        </div>
                                      </motion.div>
                                    );
                                  }

                                  return (
                                    <motion.div
                                      key={tx.id}
                                      onClick={() => setActiveDetailTx(tx)}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "0.85rem 0.5rem",
                                        borderBottom: "1px solid var(--border-subtle)",
                                        cursor: "pointer",
                                        borderRadius: "8px",
                                      }}
                                      whileHover={{ background: "var(--bg-elevated)" }}
                                    >
                                      {/* Left: Avatar + Merchant + Category */}
                                      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", minWidth: 0 }}>
                                        <ModernMerchantAvatar
                                          categoryName={tx.category?.name}
                                          merchantName={displayName}
                                          transactionType={tx.transactionType}
                                          isTransfer={isTransfer}
                                          size={40}
                                        />

                                        <div style={{ minWidth: 0 }}>
                                          <p
                                            style={{
                                              fontWeight: 700,
                                              fontSize: "13.5px",
                                              color: "var(--text-primary)",
                                              letterSpacing: "-0.01em",
                                              whiteSpace: "nowrap",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              maxWidth: "260px",
                                            }}
                                            title={displayName}
                                          >
                                            {displayName}
                                          </p>

                                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px", flexWrap: "wrap" }}>
                                            <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                                              {dateStr}
                                            </span>
                                            {tx.category?.name && (
                                              <>
                                                <span style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>•</span>
                                                <span
                                                  style={{
                                                    fontSize: "10.5px",
                                                    color: tx.category.color || "var(--text-secondary)",
                                                    background: "var(--bg-elevated)",
                                                    padding: "1px 6px",
                                                    borderRadius: "4px",
                                                    fontWeight: 600,
                                                  }}
                                                >
                                                  {tx.category.name}
                                                </span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Right: Amount & Account */}
                                      <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: "0.5rem" }}>
                                        <p
                                          className="figure"
                                          style={{
                                            fontSize: "14.5px",
                                            fontWeight: 800,
                                            color: isIncome ? "var(--positive)" : "var(--text-primary)",
                                            letterSpacing: "-0.02em",
                                          }}
                                        >
                                          {isIncome ? `+${formatNaira(tx.amount)}` : `-${formatNaira(tx.amount)}`}
                                        </p>
                                        <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end", marginTop: "2px" }}>
                                          <span style={{ fontSize: "10px", color: "var(--text-tertiary)", fontWeight: 500 }}>
                                            {tx.account?.name ? tx.account.name.split(" ")[0] : "Verified"}
                                          </span>
                                          <span
                                            style={{
                                              fontSize: "9.5px",
                                              padding: "1px 5px",
                                              borderRadius: "4px",
                                              background: isIncome ? "rgba(52, 211, 153, 0.12)" : "rgba(255, 255, 255, 0.05)",
                                              color: isIncome ? "var(--positive)" : "var(--text-secondary)",
                                              fontWeight: 600,
                                            }}
                                          >
                                            {isIncome ? "Received" : "Paid"}
                                          </span>
                                        </div>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </AnimatePresence>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Sleek Pagination Footer (Keeps page compact) */}
                {filtered.length > 0 && (
                  <div
                    style={{
                      padding: "1rem 1.5rem",
                      borderTop: "1px solid var(--border-base)",
                      background: "var(--bg-elevated)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} activities
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{
                          height: "30px",
                          padding: "0 10px",
                          borderRadius: "6px",
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-base)",
                          color: currentPage === 1 ? "var(--text-tertiary)" : "var(--text-primary)",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: currentPage === 1 ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <ChevronLeft size={13} />
                        <span>Prev</span>
                      </button>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = i + 1;
                        if (totalPages > 5 && currentPage > 3) {
                          pageNum = currentPage - 3 + i;
                          if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                        }
                        const isCurrent = currentPage === pageNum;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setCurrentPage(pageNum)}
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "6px",
                              background: isCurrent ? "var(--accent)" : "var(--bg-surface)",
                              border: isCurrent ? "1px solid var(--accent)" : "1px solid var(--border-base)",
                              color: isCurrent ? "#FFFFFF" : "var(--text-secondary)",
                              fontSize: "12px",
                              fontWeight: isCurrent ? 700 : 500,
                              cursor: "pointer",
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                          height: "30px",
                          padding: "0 10px",
                          borderRadius: "6px",
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-base)",
                          color: currentPage === totalPages ? "var(--text-tertiary)" : "var(--text-primary)",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span>Next</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Transaction Detail Inspector Modal */}
      <AnimatePresence>
        {activeDetailTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
            onClick={() => setActiveDetailTx(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              className="card"
              style={{
                width: "100%",
                maxWidth: "480px",
                background: "#0D1526",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "18px",
                padding: "1.75rem",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                  <ModernMerchantAvatar
                    categoryName={activeDetailTx.category?.name}
                    merchantName={activeDetailTx.normalizedMerchantName || activeDetailTx.merchantName || activeDetailTx.description}
                    transactionType={activeDetailTx.transactionType}
                    isTransfer={activeDetailTx.isTransfer}
                    size={46}
                  />
                  <div>
                    <span className="pill pill-positive" style={{ fontSize: "10px" }}>
                      Verified Ledger Record
                    </span>
                    <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
                      {activeDetailTx.normalizedMerchantName || activeDetailTx.merchantName || activeDetailTx.description}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDetailTx(null)}
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-base)",
                    color: "var(--text-secondary)",
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <div
                style={{
                  padding: "1.25rem",
                  borderRadius: "12px",
                  background: "var(--bg-elevated)",
                  textAlign: "center",
                  marginBottom: "1.5rem",
                  border: "1px solid var(--border-base)",
                }}
              >
                <p style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 600 }}>
                  Amount Settled
                </p>
                <p
                  className="figure"
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: activeDetailTx.transactionType === "INCOME" ? "var(--positive)" : "var(--text-primary)",
                    marginTop: "2px",
                  }}
                >
                  {activeDetailTx.transactionType === "INCOME"
                    ? `+${formatNaira(activeDetailTx.amount)}`
                    : `-${formatNaira(activeDetailTx.amount)}`}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-tertiary)" }}>Date &amp; Time</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {formatTransactionDate(activeDetailTx.transactionDate)}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-tertiary)" }}>Raw Narration</span>
                  <span style={{ color: "var(--text-secondary)", textAlign: "right", maxWidth: "260px" }}>
                    {activeDetailTx.description}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-tertiary)" }}>Category</span>
                  <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                    {activeDetailTx.category?.name || "Uncategorized"}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-tertiary)" }}>Bank Account</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {activeDetailTx.account?.name || "Connected Account"}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-tertiary)" }}>Type Classification</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {activeDetailTx.transactionType}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveDetailTx(null)}
                className="neo-tactile-btn"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginTop: "1.5rem",
                }}
              >
                Close Details
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Mobile Dock */}
      <div className="mobile-only">
        <AppBottomBar />
      </div>

      {/* Record Live Activity Modal */}
      <RecordActivityModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={() => loadData(true)}
        accounts={accounts}
      />
    </div>
  );
}
