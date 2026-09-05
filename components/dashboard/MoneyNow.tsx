"use client";

// ─────────────────────────────────────────────────────────────────
// MoneyNow — North Star Metric Panel
// Three questions answered instantly with tactile Framer Motion physics:
//   1. How much do I have?
//   2. How much came in?
//   3. How much went out?
// ─────────────────────────────────────────────────────────────────

import { formatNaira } from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import { motion } from "framer-motion";

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
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.25rem",
      }}
    >
      {/* ─ Card 1: Total Balance ─ */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ y: -4, scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 350, damping: 22, delay: 0.04 }}
        className="card"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(26, 34, 54, 0.6) 0%, rgba(17, 24, 39, 0.95) 100%)",
        }}
      >
        {/* Crisp accent top indicator strip (no blurry glow) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, #4F9CF9 0%, #2563eb 100%)",
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
              flexShrink: 0,
            }}
            className="animate-pulse"
          />
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            {accountCount > 0 ? `${accountCount} connected accounts synced` : "Synced across accounts"}
          </span>
        </div>
      </motion.div>

      {/* ─ Card 2: Income ─ */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ y: -4, scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 350, damping: 22, delay: 0.08 }}
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
      </motion.div>

      {/* ─ Card 3: Expenses ─ */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ y: -4, scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 350, damping: 22, delay: 0.12 }}
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
      </motion.div>
    </div>
  );
}
