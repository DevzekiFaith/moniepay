"use client";

// ─────────────────────────────────────────────────────────────────
// AJO — Financial Intelligence & Insights
// Calm, prioritized observations derived exclusively from real data.
// Plain-English explanations. Zero rainbow cards or fake predictions.
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { AppSidebar, AppBottomBar, AppMobileHeader } from "@/components/layout/AppNavigation";
import { useAuth } from "@/context/AuthContext";
import { useRealtimeTransactions } from "@/hooks/useRealtimeTransactions";
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  BrainCircuit,
  Building2,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
  const { user } = useAuth();
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [accountCount, setAccountCount] = useState<number>(0);

  // Pagination state (4 insights per page for clean vertical rhythm)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const loadInsights = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);

    try {
      // Check accounts count
      const acctRes = await fetch("/api/accounts");
      if (acctRes.ok) {
        const acctData = await acctRes.json();
        setAccountCount(acctData.accounts?.length || 0);
      }

      // Fetch stored insights
      const res = await fetch("/api/insights");
      if (res.ok) {
        const data = await res.json();
        setInsights(data.insights || []);
      }
    } catch (err) {
      console.error("Failed to load insights:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  // Realtime updates subscription
  useRealtimeTransactions({
    userId: user?.id,
    onTransactionChange: () => loadInsights(true),
    onAccountChange: () => loadInsights(true),
  });

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch("/api/insights", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setInsights(data.insights || []);
      }
    } catch (err) {
      console.error("Failed to evaluate insights:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="app-shell" style={{ display: "flex", minHeight: "100dvh", background: "#050505", color: "#EDEDED" }}>
      {/* Desktop Sidebar */}
      <div className="desktop-only">
        <AppSidebar />
      </div>

      {/* Main Page Area */}
      <div className="page-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AppMobileHeader />

        <main className="page-body" style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "#71717A", textTransform: "uppercase" }}>
                Money Story Intelligence
              </span>
              <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.03em", color: "#FFFFFF", marginTop: "4px" }}>
                Insights
              </h1>
              <p style={{ fontSize: "13.5px", color: "#A1A1AA", marginTop: "4px" }}>
                Automated pattern recognition and explanations derived from your real financial activity.
              </p>
            </div>

            {accountCount > 0 && (
              <button
                onClick={handleEvaluate}
                disabled={isEvaluating}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  background: "#141414",
                  border: "1px solid #27272A",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  cursor: isEvaluating ? "not-allowed" : "pointer",
                }}
              >
                <RefreshCw size={13} className={isEvaluating ? "animate-spin" : ""} />
                <span>{isEvaluating ? "Analyzing…" : "Refresh Insights"}</span>
              </button>
            )}
          </div>

          {/* Content */}
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "45vh", gap: "12px", color: "#71717A" }}>
              <Loader2 size={24} className="animate-spin" />
              <p style={{ fontSize: "13.5px" }}>Evaluating financial patterns…</p>
            </div>
          ) : accountCount === 0 ? (
            /* ── EMPTY STATE ── */
            <div
              style={{
                background: "#0A0A0A",
                border: "1px dashed #222222",
                borderRadius: "16px",
                padding: "3.5rem 2rem",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                maxWidth: "500px",
                margin: "2rem auto",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "#141414",
                  border: "1px solid #222222",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                  color: "#FFFFFF",
                }}
              >
                <BrainCircuit size={20} />
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#FFFFFF", marginBottom: "6px" }}>
                Connect an Account to Begin
              </h3>
              <p style={{ fontSize: "13px", color: "#A1A1AA", lineHeight: 1.5, maxWidth: "380px", marginBottom: "1.5rem" }}>
                AJO only generates insights from actual financial data. Link your first account to receive automated pattern recognition.
              </p>
              <Link
                href="/accounts"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 16px",
                  background: "#FFFFFF",
                  color: "#050505",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <Plus size={14} />
                <span>Connect Account</span>
              </Link>
            </div>
          ) : insights.length === 0 ? (
            <div
              style={{
                background: "#0D0D0D",
                border: "1px solid #1A1A1A",
                borderRadius: "12px",
                padding: "3rem 2rem",
                textAlign: "center",
                maxWidth: "500px",
                margin: "2rem auto",
              }}
            >
              <CheckCircle2 size={24} color="#10B981" style={{ margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#FFFFFF", marginBottom: "6px" }}>
                Your Money Story is Calm
              </h3>
              <p style={{ fontSize: "13px", color: "#71717A", lineHeight: 1.5 }}>
                No unusual spending, spikes, or anomalies detected. As new activity is observed, key patterns will appear here.
              </p>
            </div>
          ) : (
            /* ── PRIORITIZED INSIGHTS FEED ── */
            (() => {
              const totalItems = insights.length;
              const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
              const safePage = Math.min(Math.max(1, currentPage), totalPages);
              const paginatedInsights = insights.slice((safePage - 1) * pageSize, safePage * pageSize);

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {paginatedInsights.map((ins) => {
                    const isHigh = ins.importance === "HIGH" || ins.importance === "CRITICAL";
                    const isPositive = ins.type.includes("INCOME") || ins.type.includes("DECREASE");

                    return (
                      <motion.div
                        key={ins.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          background: "#0D0D0D",
                          border: "1px solid #1A1A1A",
                          borderRadius: "12px",
                          padding: "1.25rem 1.5rem",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "1rem",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            background: "#171717",
                            border: "1px solid #262626",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            color: isHigh ? "#F59E0B" : isPositive ? "#10B981" : "#FFFFFF",
                          }}
                        >
                          {isHigh ? (
                            <AlertTriangle size={16} />
                          ) : isPositive ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <Sparkles size={16} />
                          )}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF" }}>
                              {ins.title}
                            </h3>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 600,
                                padding: "2px 6px",
                                borderRadius: "4px",
                                background: isHigh ? "rgba(245, 158, 11, 0.12)" : isPositive ? "rgba(16, 185, 129, 0.12)" : "#1F1F1F",
                                color: isHigh ? "#F59E0B" : isPositive ? "#10B981" : "#A1A1AA",
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                              }}
                            >
                              {ins.type.replace(/_/g, " ")}
                            </span>
                          </div>

                          <p style={{ fontSize: "13.5px", color: "#A1A1AA", lineHeight: 1.55 }}>
                            {ins.body}
                          </p>

                          <span style={{ fontSize: "11px", color: "#52525B", marginTop: "8px", display: "block" }}>
                            Observed {new Date(ins.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "1rem",
                        padding: "1rem 0.25rem",
                        borderTop: "1px solid #1A1A1A",
                        marginTop: "0.5rem",
                      }}
                    >
                      <span style={{ fontSize: "12.5px", color: "#71717A" }}>
                        Showing{" "}
                        <strong style={{ color: "#EDEDED" }}>
                          {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, totalItems)}
                        </strong>{" "}
                        of <strong style={{ color: "#EDEDED" }}>{totalItems}</strong> observations
                      </span>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentPage((p) => Math.max(1, p - 1));
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          disabled={safePage <= 1}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "6px 12px",
                            background: "#0D0D0D",
                            border: "1px solid #222222",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: safePage <= 1 ? "#3F3F46" : "#EDEDED",
                            cursor: safePage <= 1 ? "not-allowed" : "pointer",
                          }}
                        >
                          <ChevronLeft size={14} />
                          <span>Previous</span>
                        </button>

                        <span style={{ fontSize: "12px", color: "#A1A1AA", padding: "0 6px" }}>
                          Page {safePage} of {totalPages}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setCurrentPage((p) => Math.min(totalPages, p + 1));
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          disabled={safePage >= totalPages}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "6px 12px",
                            background: "#0D0D0D",
                            border: "1px solid #222222",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: safePage >= totalPages ? "#3F3F46" : "#EDEDED",
                            cursor: safePage >= totalPages ? "not-allowed" : "pointer",
                          }}
                        >
                          <span>Next</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="mobile-only">
        <AppBottomBar />
      </div>
    </div>
  );
}
