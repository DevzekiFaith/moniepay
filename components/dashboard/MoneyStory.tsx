"use client";

// ─────────────────────────────────────────────────────────────────
// MoneyStory — Plain-English Financial Narrative
// "Spend your money. We'll keep track of the story."
// ─────────────────────────────────────────────────────────────────

import { formatNaira } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface MoneyStoryProps {
  topCategoryName?: string;
  topCategoryAmount?: number;
  topMerchantName?: string;
  savingsRate?: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
}

export function MoneyStory({
  topCategoryName,
  topCategoryAmount,
  topMerchantName,
  savingsRate = 0,
  totalIncome,
  totalExpenses,
  netCashFlow,
}: MoneyStoryProps) {
  const isSurplus = netCashFlow > 0;
  const hasData = totalIncome > 0 || totalExpenses > 0;

  if (!hasData) return null;

  return (
    <div
      className="card animate-fade-up"
      style={{ borderLeft: "3px solid var(--accent)", paddingLeft: "1.25rem" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
        {/* Icon */}
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "var(--accent-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: "2px",
          }}
        >
          <Sparkles size={14} color="var(--accent-text)" />
        </div>

        {/* Narrative */}
        <div style={{ flex: 1 }}>
          <p className="label" style={{ marginBottom: "0.5rem", color: "var(--accent-text)" }}>
            The story of your money
          </p>
          <p style={{ fontSize: "15px", color: "var(--text-primary)", lineHeight: 1.7, fontWeight: 400 }}>
            You brought in{" "}
            <span className="figure amount-positive" style={{ fontWeight: 600 }}>
              +{formatNaira(totalIncome)}
            </span>{" "}
            and spent{" "}
            <span className="figure amount-negative" style={{ fontWeight: 600 }}>
              {formatNaira(totalExpenses)}
            </span>
            .{" "}
            {isSurplus ? (
              <>
                You kept{" "}
                <span className="figure" style={{ fontWeight: 600, color: "var(--positive)" }}>
                  {Math.round(savingsRate)}%
                </span>{" "}
                of what came in — a healthy cushion of{" "}
                <span className="figure" style={{ fontWeight: 600, color: "var(--positive)" }}>
                  {formatNaira(netCashFlow)}
                </span>
                .
              </>
            ) : (
              <>
                Spending exceeded inflow by{" "}
                <span className="figure" style={{ fontWeight: 600, color: "var(--negative)" }}>
                  {formatNaira(Math.abs(netCashFlow))}
                </span>
                .
              </>
            )}
          </p>

          {topCategoryName && topCategoryAmount ? (
            <p style={{ marginTop: "0.5rem", fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Your largest spend area was{" "}
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{topCategoryName}</span>
              {" "}at{" "}
              <span className="figure" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                {formatNaira(topCategoryAmount)}
              </span>
              {topMerchantName ? (
                <>
                  , led by activity at{" "}
                  <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{topMerchantName}</span>.
                </>
              ) : "."}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
