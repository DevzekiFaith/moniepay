"use client";

// ─────────────────────────────────────────────────────────────────
// MoneyNow — North Star Metric Panel
// Three questions answered instantly:
//   1. How much do I have?
//   2. How much came in?
//   3. How much went out?
// ─────────────────────────────────────────────────────────────────

import { formatNaira } from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft, Wallet, ShieldCheck } from "lucide-react";

interface MoneyNowProps {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  periodLabel?: string;
  accountCount?: number;
}

export function MoneyNow({
  totalBalance,
  totalIncome,
  totalExpenses,
  netCashFlow,
  periodLabel = "This Month",
  accountCount = 2,
}: MoneyNowProps) {
  const isPositive = netCashFlow >= 0;

  return (
    <div
      className="animate-fade-up"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.25rem",
      }}
    >
      {/* ─ Card 1: Total Balance ─ */}
      <div
        className="card"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(26, 34, 54, 0.6) 0%, rgba(17, 24, 39, 0.95) 100%)",
        }}
      >
        {/* Subtle accent top glow strip */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, #4F9CF9 0%, #2563eb 100%)",
            boxShadow: "0 0 12px rgba(79, 156, 249, 0.5)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <p className="label">How much do I have?</p>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: "rgba(79, 156, 249, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent)",
            }}
          >
            <Wallet size={16} />
          </div>
        </div>

        <p
          className="figure"
          style={{ fontSize: "2.125rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1.1 }}
        >
          {formatNaira(totalBalance)}
        </p>

        <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              display: "inline-block",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--positive)",
              boxShadow: "0 0 8px rgba(52, 211, 153, 0.6)",
              flexShrink: 0,
            }}
            className="animate-pulse"
          />
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            {accountCount > 0 ? `${accountCount} connected accounts synced` : "Synced across accounts"}
          </span>
        </div>
      </div>

      {/* ─ Card 2: Income ─ */}
      <div
        className="card"
        style={{
          background: "linear-gradient(180deg, rgba(26, 34, 54, 0.4) 0%, rgba(17, 24, 39, 0.9) 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <p className="label">How much came in?</p>
          <span className="pill pill-positive" style={{ fontSize: "11px" }}>
            {periodLabel}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: "0.375rem" }}>
          <ArrowUpRight size={18} color="var(--positive)" style={{ flexShrink: 0, transform: "translateY(2px)" }} />
          <p
            className="figure"
            style={{ fontSize: "2.125rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--positive)", lineHeight: 1.1 }}
          >
            +{formatNaira(totalIncome)}
          </p>
        </div>

        <p style={{ marginTop: "0.75rem", fontSize: "12px", color: "var(--text-secondary)" }}>
          Direct deposits, refunds &amp; incoming transfers
        </p>
      </div>

      {/* ─ Card 3: Expenses ─ */}
      <div
        className="card"
        style={{
          background: "linear-gradient(180deg, rgba(26, 34, 54, 0.4) 0%, rgba(17, 24, 39, 0.9) 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <p className="label">How much went out?</p>
          <span
            className={`pill ${isPositive ? "pill-positive" : "pill-negative"}`}
            style={{ fontSize: "11px", whiteSpace: "nowrap" }}
          >
            {isPositive ? `+${formatNaira(netCashFlow)} net surplus` : `${formatNaira(Math.abs(netCashFlow))} deficit`}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: "0.375rem" }}>
          <ArrowDownLeft size={18} color="var(--negative)" style={{ flexShrink: 0, transform: "translateY(2px)" }} />
          <p
            className="figure"
            style={{ fontSize: "2.125rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1.1 }}
          >
            {formatNaira(totalExpenses)}
          </p>
        </div>

        <p style={{ marginTop: "0.75rem", fontSize: "12px", color: "var(--text-secondary)" }}>
          Actual spend (internal transfers excluded)
        </p>
      </div>
    </div>
  );
}
