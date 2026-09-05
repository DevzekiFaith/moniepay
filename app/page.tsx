"use client";

// ─────────────────────────────────────────────────────────────────
// Monie Lite — Personal Money Intelligence Dashboard
// "Spend your money. We'll keep track of the story."
//
// Real-time account intelligence, open banking sync,
// zero manual entry, neo-tactile fintech aesthetics.
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { AppSidebar, AppBottomBar, AppMobileHeader } from "@/components/layout/AppNavigation";
import { PhysicalCard } from "@/components/dashboard/PhysicalCard";
import { MoneyNow } from "@/components/dashboard/MoneyNow";
import { MoneyStory } from "@/components/dashboard/MoneyStory";
import { SpendingTrend, type DailySpendItem } from "@/components/dashboard/SpendingTrend";
import { MoneyMap, type CategorySpend } from "@/components/dashboard/MoneyMap";
import { MoneyActivity, type TransactionItem } from "@/components/dashboard/MoneyActivity";
import { BillsDue } from "@/components/dashboard/BillsDue";
import { InsightCards, type InsightItem } from "@/components/dashboard/InsightCards";
import { useRealtimeTransactions } from "@/hooks/useRealtimeTransactions";
import { CreditCard, RefreshCw, Loader2, Bell, Sparkles } from "lucide-react";
import Link from "next/link";

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

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("this_month");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEvaluatingInsights, setIsEvaluatingInsights] = useState(false);

  // Accounts state
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountCount, setAccountCount] = useState(0);

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
  const [insights, setInsights] = useState<InsightItem[]>([]);

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
        }

        if (data.topMerchants?.length > 0) {
          setTopMerchant(data.topMerchants[0].normalizedName || data.topMerchants[0].merchantName);
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
        }
      }

      // 3. Transactions
      const txRes = await fetch("/api/transactions?pageSize=30");
      if (txRes.ok) {
        const txData = await txRes.json();
        if (txData.transactions) setTransactions(txData.transactions);
      }

      // 4. Insights
      const insRes = await fetch("/api/insights");
      if (insRes.ok) {
        const insData = await insRes.json();
        if (insData.insights && insData.insights.length > 0) {
          setInsights(insData.insights);
        } else {
          // If no insights exist, proactively trigger initial evaluation
          handleGenerateInsights(false);
        }
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

  // ── Realtime Subscription ─────────────────────────────────────
  useRealtimeTransactions({
    userId: "demo-user",
    onTransactionChange: () => loadDashboardData(true),
    onAccountChange: () => loadDashboardData(true),
  });

  // ── Insights Refresh ──────────────────────────────────────────
  const handleGenerateInsights = async (userInitiated = true) => {
    if (userInitiated) setIsEvaluatingInsights(true);
    try {
      const res = await fetch("/api/insights", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.insights) setInsights(data.insights);
      }
    } catch (err) {
      console.error("Insights refresh error:", err);
    } finally {
      if (userInitiated) setIsEvaluatingInsights(false);
    }
  };

  // ── Greeting & Date ───────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const primaryAccount = accounts.find((a) => a.isPrimary) || accounts[0];
  const secondaryAccount = accounts.find((a) => !a.isPrimary) || accounts[1];

  return (
    <div className="app-shell" style={{ display: "flex", minHeight: "100dvh", background: "var(--bg-base)" }}>
      {/* Desktop Sidebar (hidden on small viewports) */}
      <div className="desktop-only">
        <AppSidebar />
      </div>

      {/* Main Content Area */}
      <div className="page-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Mobile Animated Header with Hamburger Menu */}
        <AppMobileHeader />

        {/* Top Sticky Header (Desktop Only: Period Tabs) */}
        <header className="page-header desktop-only">
          {/* Time Period Tabs */}
          <div
            style={{
              display: "flex",
              gap: "3px",
              background: "var(--bg-elevated)",
              padding: "3px",
              borderRadius: "10px",
              border: "1px solid var(--border-base)",
              overflowX: "auto",
              maxWidth: "calc(100vw - 120px)",
            }}
          >
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                style={{
                  padding: "5px 14px",
                  borderRadius: "7px",
                  fontSize: "12.5px",
                  fontWeight: period === p.value ? 600 : 500,
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              onClick={() => loadDashboardData(true)}
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
              href="/insights"
              title="Proactive Notifications"
              className="neo-tactile-btn"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                position: "relative",
              }}
            >
              <Bell size={15} />
              {insights.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--accent)",
                    boxShadow: "0 0 6px var(--accent)",
                  }}
                />
              )}
            </Link>

            {/* User Avatar */}
            <div
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
              }}
            >
              A
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="page-body">
          {isLoading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "50vh",
                gap: "0.875rem",
                color: "var(--text-tertiary)",
              }}
            >
              <Loader2 size={28} className="animate-spin" color="var(--accent)" />
              <p style={{ fontSize: "14px", fontWeight: 500 }}>Connecting to Open Banking ledger…</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
              {/* Header Greeting Row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
                className="animate-fade-up"
              >
                <div>
                  <h1
                    style={{
                      fontSize: "26px",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.03em",
                      lineHeight: 1.2,
                    }}
                  >
                    {greeting}, Alex!
                  </h1>
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    Your money story is up to date across all connected accounts.
                  </p>
                </div>

                <Link
                  href="/accounts"
                  className="neo-tactile-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 14px",
                    borderRadius: "10px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    textDecoration: "none",
                  }}
                >
                  <CreditCard size={14} color="var(--accent)" />
                  <span>Manage Accounts ({accountCount})</span>
                </Link>
              </div>

              {/* Signature Hero: Physical Bank Card & Quick Actions Widget */}
              <PhysicalCard
                primaryAccountName={primaryAccount?.name ?? "GTBank Current Account"}
                primaryBalance={primaryAccount?.currentBalance ?? metrics.totalBalance}
                secondaryAccountName={secondaryAccount?.name ?? "GTBank Savings"}
                secondaryBalance={secondaryAccount?.currentBalance ?? 350000}
                userName="Alex Chen"
                isSyncing={isRefreshing}
                onSyncClick={() => loadDashboardData(true)}
              />

              {/* North Star 3 Financial Questions */}
              <MoneyNow
                totalBalance={metrics.totalBalance}
                totalIncome={metrics.totalIncome}
                totalExpenses={metrics.totalExpenses}
                netCashFlow={metrics.netCashFlow}
                periodLabel={PERIOD_LABELS[period]}
                accountCount={accountCount}
              />

              {/* Natural Language Narrative Commentary */}
              <MoneyStory
                topCategoryName={topCategory?.name}
                topCategoryAmount={topCategory?.amount}
                topMerchantName={topMerchant}
                retentionRate={metrics.savingsRate}
                totalIncome={metrics.totalIncome}
                totalExpenses={metrics.totalExpenses}
                netCashFlow={metrics.netCashFlow}
              />

              {/* Middle Row: Trend Curve Chart & Category Map */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                  gap: "1.25rem",
                }}
              >
                <SpendingTrend
                  dailySpend={dailySpend}
                  averageDailySpend={averageDailySpend}
                  periodLabel={PERIOD_LABELS[period]}
                />
                <MoneyMap
                  categories={categories}
                  totalExpenses={metrics.totalExpenses}
                />
              </div>

              {/* Bottom Row: Senders & Receivers Activity, Bills Due & Intelligence */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                  gap: "1.25rem",
                  alignItems: "start",
                }}
              >
                {/* Senders & Receivers / Activity Feed */}
                <MoneyActivity
                  transactions={transactions}
                  title="Senders &amp; Receivers"
                />

                {/* Right Column: Bills Due & Intelligence */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <BillsDue />
                  <InsightCards
                    insights={insights}
                    onGenerateClick={() => handleGenerateInsights(true)}
                    isGenerating={isEvaluatingInsights}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Mobile Dock */}
      <div className="mobile-only">
        <AppBottomBar />
      </div>
    </div>
  );
}
