"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Financial Audit Executive Summary
// Plain-English forensic audit narrative synthesizing ledger flow.
// ─────────────────────────────────────────────────────────────────

import { formatNaira } from "@/lib/utils";
import { ShieldCheck, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { motion } from "framer-motion";

interface MoneyStoryProps {
  topCategoryName?: string;
  topCategoryAmount?: number;
  topMerchantName?: string;
  retentionRate?: number; // replaced savingsRate with audit retention rate
  savingsRate?: number; // backwards compatibility
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
}

export function MoneyStory({
  topCategoryName,
  topCategoryAmount,
  topMerchantName,
  retentionRate,
  savingsRate = 0,
  totalIncome,
  totalExpenses,
  netCashFlow,
}: MoneyStoryProps) {
  const rate = retentionRate ?? savingsRate;
  const isSurplus = netCashFlow > 0;
  const hasData = totalIncome > 0 || totalExpenses > 0;

  if (!hasData) return null;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      className="card"
      style={{
        borderLeft: "3.5px solid var(--accent)",
        padding: "1.25rem 1.5rem",
        background: "linear-gradient(180deg, rgba(26, 34, 54, 0.5) 0%, rgba(17, 24, 39, 0.85) 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
        {/* Audit Shield Icon */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: "1px",
          }}
        >
          <ShieldCheck size={18} color="var(--positive)" />
        </div>

        {/* Narrative */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem", flexWrap: "wrap", gap: "6px" }}>
            <p className="label" style={{ color: "var(--accent-text)", fontWeight: 700 }}>
              Financial Audit Executive Summary
            </p>
            <span
              style={{
                fontSize: "10.5px",
                padding: "2px 7px",
                borderRadius: "4px",
                background: "rgba(56, 189, 248, 0.12)",
                color: "var(--accent)",
                fontWeight: 600,
              }}
            >
              Continuous Reconciled Ledger
            </span>
          </div>

          <p style={{ fontSize: "14.5px", color: "var(--text-primary)", lineHeight: 1.7, fontWeight: 400 }}>
            Audit verified{" "}
            <span className="figure amount-positive" style={{ fontWeight: 600 }}>
              +{formatNaira(totalIncome)}
            </span>{" "}
            in inflows and audited{" "}
            <span className="figure amount-negative" style={{ fontWeight: 600 }}>
              {formatNaira(totalExpenses)}
            </span>{" "}
            in verified debits across all connected accounts.{" "}
            {isSurplus ? (
              <>
                Net ledger retention is{" "}
                <span className="figure" style={{ fontWeight: 600, color: "var(--positive)" }}>
                  {Math.round(rate)}%
                </span>
                , preserving an audited surplus of{" "}
                <span className="figure" style={{ fontWeight: 600, color: "var(--positive)" }}>
                  {formatNaira(netCashFlow)}
                </span>
                .
              </>
            ) : (
              <>
                Debit volume exceeded inflows by{" "}
                <span className="figure" style={{ fontWeight: 600, color: "var(--negative)" }}>
                  {formatNaira(Math.abs(netCashFlow))}
                </span>
                , triggering cashflow audit alerts.
              </>
            )}
          </p>

          {topCategoryName && topCategoryAmount ? (
            <p style={{ marginTop: "0.5rem", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Primary debit concentration flagged in{" "}
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{topCategoryName}</span>
              {" "}at{" "}
              <span className="figure" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                {formatNaira(topCategoryAmount)}
              </span>
              {topMerchantName ? (
                <>
                  , led by activity with{" "}
                  <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{topMerchantName}</span>.
                </>
              ) : "."}
            </p>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
