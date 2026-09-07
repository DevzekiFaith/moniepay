"use client";

// ─────────────────────────────────────────────────────────────────
// AJO — Money Story
// Plain-English, human explanation of real financial activity.
// Clear, calm, human, neutral, useful. Zero engineering jargon.
// ─────────────────────────────────────────────────────────────────

import { formatNaira } from "@/lib/utils";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

interface MoneyStoryProps {
  topCategoryName?: string;
  topCategoryAmount?: number;
  topMerchantName?: string;
  retentionRate?: number;
  savingsRate?: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
}

export function MoneyStory({
  topCategoryName,
  topCategoryAmount,
  topMerchantName,
  retentionRate,
  savingsRate,
  totalIncome,
  totalExpenses,
  netCashFlow,
}: MoneyStoryProps) {
  const hasData = totalIncome > 0 || totalExpenses > 0;
  if (!hasData) {
    return (
      <div
        style={{
          background: "#0D0D0D",
          border: "1px solid #1A1A1A",
          borderRadius: "12px",
          padding: "1.25rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#71717A", textTransform: "uppercase" }}>
            MONEY STORY
          </span>
          <span style={{ fontSize: "11px", color: "#3F3F46" }}>•</span>
          <span style={{ fontSize: "11.5px", color: "#A1A1AA", fontWeight: 500 }}>
            Live Feed Active
          </span>
        </div>
        <p style={{ fontSize: "13px", color: "#A1A1AA", lineHeight: 1.6, margin: 0 }}>
          Your accounts are connected. As live financial activity occurs, AJO will explain your inflows, outflows, and spending patterns right here.
        </p>
      </div>
    );
  }

  const isSurplus = netCashFlow >= 0;
  const effectiveRate = retentionRate ?? savingsRate ?? (totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpenses) / totalIncome) * 100) : 0);

  return (
    <div
      style={{
        background: "#0D0D0D",
        border: "1px solid #1A1A1A",
        borderRadius: "12px",
        padding: "1.25rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <div>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#71717A", textTransform: "uppercase" }}>
              MONEY STORY
            </span>
            <span style={{ fontSize: "11px", color: "#3F3F46" }}>•</span>
            <span style={{ fontSize: "11.5px", color: "#A1A1AA", fontWeight: 500 }}>
              Intelligence Brief
            </span>
          </div>

          <Link
            href="/insights"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              fontSize: "11.5px",
              color: "#A1A1AA",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <span>Full Insights</span>
            <ArrowRight size={11} />
          </Link>
        </div>

        {/* Narrative */}
        <p style={{ fontSize: "13.5px", color: "#D4D4D8", lineHeight: 1.6, fontWeight: 400 }}>
          You&apos;ve received{" "}
          <span style={{ fontWeight: 600, color: "#10B981" }}>
            +{formatNaira(totalIncome)}
          </span>{" "}
          this period and spent{" "}
          <span style={{ fontWeight: 600, color: "#EDEDED" }}>
            {formatNaira(totalExpenses)}
          </span>
          .{" "}
          {isSurplus ? (
            <>
              You have a positive cash flow of{" "}
              <span style={{ fontWeight: 600, color: "#10B981" }}>
                +{formatNaira(netCashFlow)}
              </span>
              .{" "}
            </>
          ) : (
            <>
              Your spending exceeds inflows by{" "}
              <span style={{ fontWeight: 600, color: "#EF4444" }}>
                {formatNaira(Math.abs(netCashFlow))}
              </span>
              .{" "}
            </>
          )}
          {topCategoryName && topCategoryAmount && (
            <>
              <span style={{ fontWeight: 600, color: "#FFFFFF" }}>{topCategoryName}</span> is currently your largest spending category ({formatNaira(topCategoryAmount)}).{" "}
            </>
          )}
          {topMerchantName && (
            <>
              Your most frequent merchant is{" "}
              <span style={{ fontWeight: 600, color: "#FFFFFF" }}>{topMerchantName}</span>.
            </>
          )}
        </p>
      </div>

      {/* Insight Micro-Chips */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          marginTop: "1rem",
          paddingTop: "0.875rem",
          borderTop: "1px solid #171717",
        }}
      >
        {topCategoryName && (
          <span
            style={{
              fontSize: "11px",
              padding: "3px 8px",
              borderRadius: "6px",
              background: "#141414",
              border: "1px solid #222222",
              color: "#A1A1AA",
            }}
          >
            Primary: <strong style={{ color: "#FFFFFF" }}>{topCategoryName}</strong>
          </span>
        )}
        {topMerchantName && (
          <span
            style={{
              fontSize: "11px",
              padding: "3px 8px",
              borderRadius: "6px",
              background: "#141414",
              border: "1px solid #222222",
              color: "#A1A1AA",
            }}
          >
            Frequent: <strong style={{ color: "#FFFFFF" }}>{topMerchantName}</strong>
          </span>
        )}
        {effectiveRate > 0 && (
          <span
            style={{
              fontSize: "11px",
              padding: "3px 8px",
              borderRadius: "6px",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              color: "#10B981",
              fontWeight: 500,
            }}
          >
            Retention: {Math.round(effectiveRate)}%
          </span>
        )}
      </div>
    </div>
  );
}
