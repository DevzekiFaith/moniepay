"use client";

// ─────────────────────────────────────────────────────────────────
// Monie Lite — Financial Intelligence & Proactive Insights
// Unified design matching Home Overview page aesthetics
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { AppSidebar, AppBottomBar, AppMobileHeader } from "@/components/layout/AppNavigation";
import { MoneyNow } from "@/components/dashboard/MoneyNow";
import { MoneyStory } from "@/components/dashboard/MoneyStory";
import { SpendingTrend, type DailySpendItem } from "@/components/dashboard/SpendingTrend";
import { MoneyMap, type CategorySpend } from "@/components/dashboard/MoneyMap";
import { BillsDue } from "@/components/dashboard/BillsDue";
import { formatNaira } from "@/lib/utils";
import {
  Sparkles,
  RefreshCw,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  BrainCircuit,
  Loader2,
  Bell,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRealtimeTransactions } from "@/hooks/useRealtimeTransactions";

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

interface InsightItem {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  importance: "LOW" | "NORMAL" | "HIGH" | "CRITICAL" | string;
  createdAt: string | Date;
}

export default function InsightsPage() {
  const [period, setPeriod] = useState<Period>("this_month");
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);

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
  const [categories, setCategories] = useState<CategorySpend[]>([]);
  const [dailySpend, setDailySpend] = useState<DailySpendItem[]>([]);
  const [averageDailySpend, setAverageDailySpend] = useState(0);
  const [insights, setInsights] = useState<InsightItem[]>([]);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);

    try {
      // 1. Analytics for period
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

      // 2. Insights
      const insRes = await fetch("/api/insights");
      if (insRes.ok) {
        const insData = await insRes.json();
        if (insData.insights && insData.insights.length > 0) {
          setInsights(insData.insights);
        } else {
          handleEvaluate(false);
        }
      }
    } catch (err) {
      console.error("Failed to load insights data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEvaluate = async (userTriggered = true) => {
    if (userTriggered) setIsEvaluating(true);
    try {
      const res = await fetch("/api/insights", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.insights) {
          setInsights(data.insights);
        }
      }
    } catch (err) {
      console.error("Failed to evaluate:", err);
    } finally {
      if (userTriggered) setIsEvaluating(false);
    }
  };

  const { user } = useAuth();

  // Real-time synchronization
  useRealtimeTransactions({
    userId: user?.id || "demo-user",
    onTransactionChange: () => loadData(),
    onAccountChange: () => loadData(),
  });

  return (
    <div className="app-shell" style={{ display: "flex", minHeight: "100dvh", background: "var(--bg-base)" }}>
      {/* Desktop Sidebar */}
      <div className="desktop-only">
        <AppSidebar />
      </div>

      {/* Main Container */}
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
              onClick={() => handleEvaluate(true)}
              disabled={isEvaluating}
              title="Re-scan ledger"
              className="neo-tactile-btn"
              style={{
                height: "36px",
                padding: "0 14px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-primary)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <RefreshCw size={13} className={isEvaluating ? "animate-spin" : ""} color="var(--accent)" />
              <span>{isEvaluating ? "Scanning..." : "Re-evaluate"}</span>
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
              {user?.name ? user.name[0].toUpperCase() : "A"}
            </Link>
          </div>
        </header>

        {/* Page Body */}
        <main
          className="page-body"
          style={{
            flex: 1,
            maxWidth: "1140px",
            width: "100%",
            margin: "0 auto",
          }}
        >
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
              <p style={{ fontSize: "14px", fontWeight: 500 }}>Scanning Open Banking transactions…</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
              {/* Header Headline Row */}
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
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <BrainCircuit size={16} color="var(--accent)" />
                    <span className="label" style={{ color: "var(--accent)" }}>
                      Proactive Financial Intelligence
                    </span>
                  </div>
                  <h1
                    style={{
                      fontSize: "26px",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.03em",
                      lineHeight: 1.2,
                    }}
                  >
                    Continuous Ledger Analysis
                  </h1>
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    Automated anomaly detection, recurring cadence, and smart spending commentary.
                  </p>
                </div>

                <span className="pill pill-positive" style={{ fontSize: "11px" }}>
                  <ShieldCheck size={12} /> Live Heuristic Engine
                </span>
              </div>

              {/* North Star 3 Question / Metric Panels (Exact match to Home Overview) */}
              <MoneyNow
                totalBalance={metrics.totalBalance}
                totalIncome={metrics.totalIncome}
                totalExpenses={metrics.totalExpenses}
                netCashFlow={metrics.netCashFlow}
                periodLabel={PERIOD_LABELS[period]}
                accountCount={2}
              />

              {/* Natural Language Narrative Commentary (Exact match to Home Overview) */}
              <MoneyStory
                topCategoryName={topCategory?.name}
                topCategoryAmount={topCategory?.amount}
                topMerchantName={topMerchant}
                retentionRate={metrics.savingsRate}
                totalIncome={metrics.totalIncome}
                totalExpenses={metrics.totalExpenses}
                netCashFlow={metrics.netCashFlow}
              />

              {/* Middle Row: Trend Curve Chart & Category Map (Exact match to Home Overview) */}
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

              {/* Bottom Section: Full Intelligence Feed & Bills Due */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                  gap: "1.25rem",
                  alignItems: "start",
                }}
              >
                {/* Proactive Intelligence Cards */}
                <div className="card animate-fade-up" style={{ padding: 0, overflow: "hidden" }}>
                  <div
                    style={{
                      padding: "1.25rem 1.5rem",
                      borderBottom: "1px solid var(--border-base)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <p className="label">Active Heuristics</p>
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "2px 6px",
                            borderRadius: "99px",
                            background: "rgba(168, 85, 247, 0.12)",
                            color: "#c084fc",
                            fontWeight: 600,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          <Sparkles size={10} />
                          {insights.length} Detected
                        </span>
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                        Pattern recognition across current transactions
                      </p>
                    </div>

                    <button
                      onClick={() => handleEvaluate(true)}
                      disabled={isEvaluating}
                      className="neo-tactile-btn"
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        padding: "5px 12px",
                        borderRadius: "8px",
                        color: "var(--text-primary)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <RefreshCw size={12} className={isEvaluating ? "animate-spin" : ""} color="var(--accent)" />
                      {isEvaluating ? "Analyzing…" : "Scan Now"}
                    </button>
                  </div>

                  <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                    {insights.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "2.5rem 0", color: "var(--text-tertiary)" }}>
                        <BrainCircuit size={26} color="var(--accent)" style={{ margin: "0 auto 0.5rem", opacity: 0.85 }} />
                        <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>Everything balanced</p>
                        <p style={{ fontSize: "12px", marginTop: "4px" }}>Click Scan Now to evaluate ledger.</p>
                      </div>
                    ) : (
                      insights.map((ins) => {
                        const isHigh = ins.importance === "HIGH" || ins.importance === "CRITICAL";
                        const isPositive = ins.type.includes("INCOME") || ins.type.includes("DECREASE");

                        return (
                          <div
                            key={ins.id}
                            style={{
                              padding: "1rem",
                              borderRadius: "12px",
                              background: isHigh
                                ? "rgba(251, 191, 36, 0.08)"
                                : isPositive
                                ? "rgba(52, 211, 153, 0.06)"
                                : "var(--bg-elevated)",
                              border: `1px solid ${
                                isHigh
                                  ? "rgba(251, 191, 36, 0.25)"
                                  : isPositive
                                  ? "rgba(52, 211, 153, 0.2)"
                                  : "var(--border-base)"
                              }`,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                              {isHigh ? (
                                <AlertTriangle size={16} color="#FBBF24" style={{ flexShrink: 0, marginTop: "2px" }} />
                              ) : isPositive ? (
                                <CheckCircle2 size={16} color="var(--positive)" style={{ flexShrink: 0, marginTop: "2px" }} />
                              ) : (
                                <Sparkles size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: "2px" }} />
                              )}
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                                  <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary)" }}>
                                    {ins.title}
                                  </span>
                                  <span className={`pill ${isHigh ? "pill-negative" : isPositive ? "pill-positive" : ""}`} style={{ fontSize: "9.5px" }}>
                                    {ins.type.replace(/_/g, " ")}
                                  </span>
                                </div>
                                <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.55 }}>
                                  {ins.body}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Bills Due & Recurring Obligations (Exact match to Home Overview) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <BillsDue />
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
