"use client";

// ─────────────────────────────────────────────────────────────────
// AJO — Personal Money Intelligence
// “Your money. Understood.”
//
// Answers the north-star question:
// “What is happening with my money right now?”
//
// Minimalist, black, white, neutral, editorial, calm, human.
// Zero fake data, zero manual entry, zero rainbow gradients.
// Compact executive dashboard with in-place pagination.
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo } from "react";
import { AppSidebar, AppBottomBar, AppMobileHeader } from "@/components/layout/AppNavigation";
import { MoneyStory } from "@/components/dashboard/MoneyStory";
import { SpendingTrend, type DailySpendItem } from "@/components/dashboard/SpendingTrend";
import { MoneyMap, type CategorySpend } from "@/components/dashboard/MoneyMap";
import { useRealtimeTransactions } from "@/hooks/useRealtimeTransactions";
import { useAuth } from "@/context/AuthContext";
import { formatNaira, formatTransactionDate } from "@/lib/utils";
import {
  RefreshCw,
  Loader2,
  Building2,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { RecordActivityModal } from "@/components/modals/RecordActivityModal";

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

interface TransactionItem {
  id: string;
  amount: number;
  currency: string;
  transactionDate: string | Date;
  description: string;
  merchantName?: string | null;
  normalizedMerchantName?: string | null;
  transactionType: "INCOME" | "EXPENSE" | "TRANSFER" | "REFUND" | string;
  status: string;
  isTransfer: boolean;
  category?: {
    id: string;
    name: string;
    slug?: string;
    icon?: string | null;
    color?: string | null;
  } | null;
  account?: {
    id: string;
    name: string;
  } | null;
}

export default function HomePage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>("this_month");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Accounts state
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountCount, setAccountCount] = useState(0);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Financial Metrics
  const [metrics, setMetrics] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netCashFlow: 0,
    savingsRate: 0,
  });

  const [topCategory, setTopCategory] = useState<{ name: string; amount: number } | undefined>();
  const [topMerchant, setTopMerchant] = useState<string | undefined>();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [categories, setCategories] = useState<CategorySpend[]>([]);
  const [dailySpend, setDailySpend] = useState<DailySpendItem[]>([]);
  const [averageDailySpend, setAverageDailySpend] = useState(0);

  // Recent Activity in-place pagination (5 items per page)
  const [recentPage, setRecentPage] = useState(1);
  const recentPageSize = 5;

  // ── Data Fetching ─────────────────────────────────────────────
  const loadDashboardData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      // 1. Accounts
      const acctRes = await fetch("/api/accounts");
      let currentAccountList: any[] = [];
      if (acctRes.ok) {
        const acctData = await acctRes.json();
        currentAccountList = acctData.accounts || [];
        setAccounts(currentAccountList);
        setAccountCount(currentAccountList.length);
      }

      // 2. Analytics
      const analyticsRes = await fetch(`/api/analytics?period=${period}`);
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();

        const totalIn = data.balance?.totalIn ?? 0;
        const totalOut = data.balance?.totalOut ?? 0;
        const netMovement = data.balance?.netMovement ?? (totalIn - totalOut);
        const savingsRate = totalIn > 0 ? Math.max(0, ((totalIn - totalOut) / totalIn) * 100) : 0;

        setMetrics({
          totalBalance: data.balance?.currentBalance ?? 0,
          totalIncome: totalIn,
          totalExpenses: totalOut,
          netCashFlow: netMovement,
          savingsRate,
        });

        setAverageDailySpend(data.averageDailySpend ?? 0);

        if (data.categoryBreakdown?.length > 0) {
          setTopCategory({
            name: data.categoryBreakdown[0].categoryName,
            amount: data.categoryBreakdown[0].amount,
          });
          setCategories(
            data.categoryBreakdown.map((c: any) => ({
              categoryId: c.categoryId,
              categoryName: c.categoryName,
              amount: c.amount,
              percentage: c.percentage,
              color: c.categoryColor,
              transactionCount: c.transactionCount,
            }))
          );
        } else {
          setCategories([]);
          setTopCategory(undefined);
        }

        if (data.topMerchants?.length > 0) {
          setTopMerchant(data.topMerchants[0].normalizedName || data.topMerchants[0].merchantName);
        } else {
          setTopMerchant(undefined);
        }

        if (data.dailySpend?.length > 0) {
          setDailySpend(
            data.dailySpend.map((d: any) => ({
              date: d.date,
              amount: d.totalOut ?? d.amount ?? 0,
              totalIn: d.totalIn ?? 0,
              totalOut: d.totalOut ?? d.amount ?? 0,
              net: d.net ?? (d.totalIn ?? 0) - (d.totalOut ?? d.amount ?? 0),
              transactionCount: d.transactionCount ?? 0,
              label: d.date.slice(5),
            }))
          );
        } else {
          setDailySpend([]);
        }
      }

      // 3. Transactions (fetch 25 for home feed pagination)
      const txRes = await fetch("/api/transactions?pageSize=25");
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Reset recent activity page to 1 when period changes
  useEffect(() => {
    setRecentPage(1);
  }, [period]);

  // Real-time updates subscription
  useRealtimeTransactions({
    userId: user?.id,
    onTransactionChange: () => loadDashboardData(true),
    onAccountChange: () => loadDashboardData(true),
  });

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name ? user.name.split(" ")[0] : "";

  // Paginated Recent Activity
  const totalRecent = transactions.length;
  const totalRecentPages = Math.max(1, Math.ceil(totalRecent / recentPageSize));
  const safeRecentPage = Math.min(Math.max(1, recentPage), totalRecentPages);
  const paginatedRecent = useMemo(() => {
    const start = (safeRecentPage - 1) * recentPageSize;
    return transactions.slice(start, start + recentPageSize);
  }, [transactions, safeRecentPage, recentPageSize]);

  return (
    <div className="app-shell" style={{ display: "flex", minHeight: "100dvh", background: "#050505", color: "#EDEDED" }}>
      {/* Desktop Sidebar */}
      <div className="desktop-only">
        <AppSidebar />
      </div>

      {/* Main Content Area */}
      <div className="page-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AppMobileHeader />

        <main className="page-body" style={{ maxWidth: "1080px", margin: "0 auto", width: "100%" }}>
          {isLoading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "50vh",
                gap: "12px",
                color: "#71717A",
              }}
            >
              <Loader2 size={24} className="animate-spin" />
              <p style={{ fontSize: "13.5px", fontWeight: 500 }}>Understanding your money story…</p>
            </div>
          ) : accountCount === 0 ? (
            /* ── ELEGANT EMPTY STATE (Section 27 of Specification) ── */
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "#0A0A0A",
                border: "1px dashed #27272A",
                borderRadius: "16px",
                padding: "4.5rem 2rem",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                maxWidth: "540px",
                margin: "3rem auto",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "12px",
                  background: "#141414",
                  border: "1px solid #222222",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  color: "#FFFFFF",
                }}
              >
                <Building2 size={24} />
              </div>

              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "#71717A", textTransform: "uppercase", marginBottom: "6px" }}>
                AJO Personal Money Intelligence
              </span>
              <h2 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.03em", color: "#FFFFFF", marginBottom: "10px" }}>
                YOUR MONEY STORY STARTS HERE
              </h2>
              <p style={{ fontSize: "14px", color: "#A1A1AA", lineHeight: 1.6, maxWidth: "420px", marginBottom: "2rem" }}>
                Connect your first account and AJO will automatically understand your income, spending and financial activity without manual entry.
              </p>

              <Link
                href="/accounts"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  background: "#FFFFFF",
                  color: "#050505",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <Plus size={16} />
                <span>Connect Account</span>
              </Link>

              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2rem", color: "#52525B", fontSize: "12px" }}>
                <ShieldCheck size={14} color="#10B981" />
                <span>Read-only 256-bit encrypted Open Banking</span>
              </div>
            </motion.div>
          ) : (
            /* ── REDESIGNED HIGH-DENSITY EDITORIAL DASHBOARD ── */
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Top Header Bar: Greeting & Period Switcher */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "#71717A", textTransform: "uppercase" }}>
                      AJO
                    </span>
                    <span style={{ fontSize: "10px", color: "#3F3F46" }}>•</span>
                    <span style={{ fontSize: "11.5px", color: "#71717A" }}>
                      Personal Money Intelligence
                    </span>
                  </div>
                  <h1 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.03em", color: "#FFFFFF", marginTop: "2px" }}>
                    {greeting}{firstName ? `, ${firstName}` : ""}.
                  </h1>
                </div>

                {/* Period Selector Tabs + Refresh */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "2px",
                      background: "#0D0D0D",
                      padding: "3px",
                      borderRadius: "8px",
                      border: "1px solid #1A1A1A",
                    }}
                  >
                    {PERIODS.map((p) => {
                      const isSelected = period === p.value;
                      return (
                        <button
                          key={p.value}
                          onClick={() => setPeriod(p.value)}
                          style={{
                            padding: "5px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: isSelected ? 600 : 500,
                            color: isSelected ? "#050505" : "#71717A",
                            background: isSelected ? "#FFFFFF" : "transparent",
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setIsRecordModalOpen(true)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      background: "#FFFFFF",
                      color: "#050505",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "opacity 0.15s ease",
                    }}
                  >
                    <Plus size={13} />
                    <span>Record Activity</span>
                  </button>

                  <button
                    onClick={() => loadDashboardData(true)}
                    disabled={isRefreshing}
                    title="Refresh data"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "#0D0D0D",
                      border: "1px solid #1A1A1A",
                      color: "#71717A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: isRefreshing ? "not-allowed" : "pointer",
                    }}
                  >
                    <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>

              {/* ── BENTO ROW 1: Financial State & Intelligence Brief ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
                  gap: "1.25rem",
                  alignItems: "stretch",
                }}
              >
                {/* Unified Financial Position Card */}
                <div
                  style={{
                    background: "#0D0D0D",
                    border: "1px solid #1A1A1A",
                    borderRadius: "12px",
                    padding: "1.35rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "1.25rem",
                  }}
                >
                  {/* Top: Balance & Pulse */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "#71717A", textTransform: "uppercase" }}>
                          YOUR MONEY
                        </span>
                        <div style={{ fontSize: "clamp(26px, 6vw, 36px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#FFFFFF", lineHeight: 1.15, marginTop: "4px" }}>
                          {formatNaira(metrics.totalBalance)}
                        </div>
                        <span style={{ fontSize: "12px", color: "#71717A", marginTop: "4px", display: "inline-block" }}>
                          Available across {accountCount} {accountCount === 1 ? "account" : "accounts"}
                        </span>
                      </div>

                      {/* Live Money Pulse Indicator */}
                      <div
                        style={{
                          background: "#141414",
                          border: "1px solid #222222",
                          borderRadius: "8px",
                          padding: "6px 10px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background: metrics.netCashFlow >= 0 ? "#10B981" : "#EF4444",
                          }}
                        />
                        <span style={{ fontSize: "11px", fontWeight: 600, color: metrics.netCashFlow >= 0 ? "#10B981" : "#EF4444" }}>
                          {metrics.netCashFlow >= 0 ? "Positive Flow" : "Net Deficit"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Micro-Metrics Inflow/Outflow/Net Strip */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "0.75rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid #171717",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.04em", color: "#71717A", textTransform: "uppercase" }}>
                        Inflow
                      </span>
                      <div style={{ fontSize: "clamp(13px, 3.8vw, 15.5px)", fontWeight: 700, color: "#10B981", marginTop: "2px", display: "flex", alignItems: "center", gap: "3px" }}>
                        <ArrowDownLeft size={13} />
                        <span>{formatNaira(metrics.totalIncome)}</span>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.04em", color: "#71717A", textTransform: "uppercase" }}>
                        Outflow
                      </span>
                      <div style={{ fontSize: "clamp(13px, 3.8vw, 15.5px)", fontWeight: 700, color: "#EDEDED", marginTop: "2px", display: "flex", alignItems: "center", gap: "3px" }}>
                        <ArrowUpRight size={13} color="#71717A" />
                        <span>{formatNaira(metrics.totalExpenses)}</span>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.04em", color: "#71717A", textTransform: "uppercase" }}>
                        Net
                      </span>
                      <div
                        style={{
                          fontSize: "clamp(13px, 3.8vw, 15.5px)",
                          fontWeight: 700,
                          color: metrics.netCashFlow >= 0 ? "#10B981" : "#EF4444",
                          marginTop: "2px",
                        }}
                      >
                        {metrics.netCashFlow >= 0 ? `+${formatNaira(metrics.netCashFlow)}` : `-${formatNaira(Math.abs(metrics.netCashFlow))}`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Companion: Money Story Intelligence Brief */}
                <div>
                  <MoneyStory
                    topCategoryName={topCategory?.name}
                    topCategoryAmount={topCategory?.amount}
                    topMerchantName={topMerchant}
                    retentionRate={metrics.savingsRate}
                    totalIncome={metrics.totalIncome}
                    totalExpenses={metrics.totalExpenses}
                    netCashFlow={metrics.netCashFlow}
                  />
                </div>
              </div>

              {/* ── BENTO ROW 2: Category Distribution & Spending Trend ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
                  gap: "1.25rem",
                  alignItems: "start",
                }}
              >
                <MoneyMap
                  categories={categories}
                  totalExpenses={metrics.totalExpenses}
                />
                <SpendingTrend
                  dailySpend={dailySpend}
                  averageDailySpend={averageDailySpend}
                  periodLabel={PERIOD_LABELS[period]}
                />
              </div>

              {/* ── BENTO ROW 3: Recent Activity with In-Place Pagination ── */}
              <div
                style={{
                  background: "#0D0D0D",
                  border: "1px solid #1A1A1A",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: "1.1rem 1.5rem",
                    borderBottom: "1px solid #171717",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#71717A", textTransform: "uppercase" }}>
                      RECENT ACTIVITY
                    </span>
                    <span style={{ fontSize: "10px", color: "#3F3F46" }}>•</span>
                    <span style={{ fontSize: "12px", color: "#71717A" }}>
                      Observed from connected accounts
                    </span>
                  </div>

                  <Link
                    href="/activity"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    <span>Full Ledger</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                {/* List Body */}
                <div style={{ padding: "0 0.5rem" }}>
                  {totalRecent === 0 ? (
                    <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#71717A", fontSize: "13px" }}>
                      No recent transactions observed for this period.
                    </div>
                  ) : (
                    <div>
                      {paginatedRecent.map((tx, idx) => {
                        const isIncome = tx.transactionType === "INCOME" && !tx.isTransfer;
                        const isTransfer = tx.isTransfer || tx.transactionType === "TRANSFER";
                        const title = tx.normalizedMerchantName || tx.merchantName || tx.description;

                        return (
                          <div
                            key={tx.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "0.85rem 1rem",
                              borderBottom: idx === paginatedRecent.length - 1 ? "none" : "1px solid #141414",
                              transition: "background 0.15s ease",
                            }}
                          >
                            {/* Direction Icon & Info */}
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "8px",
                                  background: "#141414",
                                  border: "1px solid #222222",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  color: isIncome ? "#10B981" : isTransfer ? "#60A5FA" : "#A1A1AA",
                                }}
                              >
                                {isIncome ? (
                                  <ArrowDownLeft size={14} />
                                ) : isTransfer ? (
                                  <ArrowLeftRight size={13} />
                                ) : (
                                  <ArrowUpRight size={14} />
                                )}
                              </div>

                              <div style={{ minWidth: 0, flex: 1 }}>
                                <p
                                  style={{
                                    fontSize: "13.5px",
                                    fontWeight: 600,
                                    color: "#FFFFFF",
                                    lineHeight: 1.2,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "100%",
                                  }}
                                >
                                  {title}
                                </p>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                                  <span style={{ fontSize: "11px", color: "#71717A" }}>
                                    {tx.category?.name || "Uncategorized"}
                                  </span>
                                  {tx.account?.name && (
                                    <>
                                      <span style={{ fontSize: "9px", color: "#3F3F46" }}>•</span>
                                      <span style={{ fontSize: "11px", color: "#52525B" }}>{tx.account.name}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Amount & Time */}
                            <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "1rem" }}>
                              <span
                                style={{
                                  fontSize: "13.5px",
                                  fontWeight: 700,
                                  color: isIncome ? "#10B981" : isTransfer ? "#93C5FD" : "#FFFFFF",
                                  display: "block",
                                }}
                              >
                                {isIncome ? `+${formatNaira(tx.amount)}` : isTransfer ? formatNaira(tx.amount) : `-${formatNaira(tx.amount)}`}
                              </span>
                              <span style={{ fontSize: "11px", color: "#52525B", marginTop: "1px", display: "block" }}>
                                {formatTransactionDate(tx.transactionDate)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* In-Place Pagination Footer */}
                {totalRecentPages > 1 && (
                  <div
                    style={{
                      padding: "0.75rem 1.25rem",
                      borderTop: "1px solid #171717",
                      background: "#0A0A0A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#71717A" }}>
                      Showing{" "}
                      <strong style={{ color: "#EDEDED" }}>
                        {(safeRecentPage - 1) * recentPageSize + 1}–{Math.min(safeRecentPage * recentPageSize, totalRecent)}
                      </strong>{" "}
                      of <strong style={{ color: "#EDEDED" }}>{totalRecent}</strong>
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => setRecentPage((p) => Math.max(1, p - 1))}
                        disabled={safeRecentPage <= 1}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                          padding: "4px 10px",
                          background: "#121212",
                          border: "1px solid #222222",
                          borderRadius: "6px",
                          fontSize: "11.5px",
                          fontWeight: 600,
                          color: safeRecentPage <= 1 ? "#3F3F46" : "#EDEDED",
                          cursor: safeRecentPage <= 1 ? "not-allowed" : "pointer",
                        }}
                      >
                        <ChevronLeft size={13} />
                        <span>Prev</span>
                      </button>

                      <span style={{ fontSize: "11.5px", color: "#A1A1AA", padding: "0 4px" }}>
                        {safeRecentPage} / {totalRecentPages}
                      </span>

                      <button
                        type="button"
                        onClick={() => setRecentPage((p) => Math.min(totalRecentPages, p + 1))}
                        disabled={safeRecentPage >= totalRecentPages}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                          padding: "4px 10px",
                          background: "#121212",
                          border: "1px solid #222222",
                          borderRadius: "6px",
                          fontSize: "11.5px",
                          fontWeight: 600,
                          color: safeRecentPage >= totalRecentPages ? "#3F3F46" : "#EDEDED",
                          cursor: safeRecentPage >= totalRecentPages ? "not-allowed" : "pointer",
                        }}
                      >
                        <span>Next</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Mobile Bottom Bar */}
      <div className="mobile-only">
        <AppBottomBar />
      </div>

      {/* ── RECORD LIVE ACTIVITY MODAL ── */}
      <RecordActivityModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={() => loadDashboardData(true)}
      />
    </div>
  );
}
