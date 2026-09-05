"use client";

// ─────────────────────────────────────────────────────────────────
// PhysicalCard — Premium Fintech Card & Quick Actions Widget
// Inspired by high-end neo-tactile card visual in Reference UI
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import { formatNaira } from "@/lib/utils";
import { ArrowUpRight, RefreshCw, CreditCard, ShieldCheck, Wifi } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface PhysicalCardProps {
  primaryAccountName?: string;
  primaryBalance?: number;
  secondaryAccountName?: string;
  secondaryBalance?: number;
  userName?: string;
  isSyncing?: boolean;
  onSyncClick?: () => void;
}

export function PhysicalCard({
  primaryAccountName = "GTBank Current",
  primaryBalance = 866400,
  secondaryAccountName = "GTBank Savings",
  secondaryBalance = 350000,
  userName = "Alex Chen",
  isSyncing = false,
  onSyncClick,
}: PhysicalCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("5399 4120 8821 6666");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "1.25rem",
        alignItems: "stretch",
      }}
    >
      {/* ── Virtual / Physical Card ── */}
      <motion.div
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        style={{
          position: "relative",
          borderRadius: "20px",
          padding: "1.5rem 1.75rem",
          background: "linear-gradient(135deg, #131d31 0%, #0d1527 50%, #080f1e 100%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 16px 36px -8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
          overflow: "hidden",
          minHeight: "205px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "#fff",
        }}
      >
        {/* Subtle decorative curved ambient sheen */}
        <div
          style={{
            position: "absolute",
            top: "-40%",
            right: "-20%",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(79, 156, 249, 0.18) 0%, rgba(79, 156, 249, 0) 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-30%",
            left: "-15%",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Top Card Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 2 }}>
          <div>
            <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)" }}>
              Your Primary Card
            </span>
            <p style={{ fontWeight: 600, fontSize: "15px", color: "#F0F6FF", letterSpacing: "-0.01em" }}>
              {primaryAccountName}
            </p>
          </div>

          {/* EMV Chip & Contactless */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Wifi size={18} style={{ transform: "rotate(90deg)", color: "rgba(255,255,255,0.7)" }} />
            <div
              style={{
                width: "36px",
                height: "26px",
                borderRadius: "5px",
                background: "linear-gradient(135deg, #e5a93c 0%, #c48b26 100%)",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.4), 0 1px 3px rgba(0,0,0,0.3)",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                padding: "3px",
                gap: "2px",
                border: "1px solid rgba(255,215,0,0.3)",
              }}
            >
              <div style={{ border: "0.5px solid rgba(0,0,0,0.25)", borderRadius: "2px" }} />
              <div style={{ border: "0.5px solid rgba(0,0,0,0.25)", borderRadius: "2px" }} />
            </div>
          </div>
        </div>

        {/* Card Number & Balance */}
        <div style={{ margin: "1rem 0", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Available Balance
              </p>
              <p style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.03em", color: "#FFFFFF", lineHeight: 1.15 }}>
                {formatNaira(primaryBalance)}
              </p>
            </div>
            <span
              style={{
                fontSize: "10px",
                color: "#93c5fd",
                background: "rgba(59, 130, 246, 0.2)",
                padding: "2px 8px",
                borderRadius: "99px",
                border: "1px solid rgba(147, 197, 253, 0.3)",
                fontWeight: 600,
              }}
            >
              ACTIVE
            </span>
          </div>
        </div>

        {/* Bottom Card Bar: Cardholder, Number & Expiry */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative", zIndex: 2 }}>
          <div>
            <p style={{ fontSize: "9px", color: "var(--text-tertiary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Cardholder
            </p>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0", letterSpacing: "0.02em" }}>
              {userName}
            </p>
          </div>

          <div
            onClick={handleCopy}
            title="Click to copy masked card number"
            style={{ cursor: "pointer", textAlign: "center" }}
          >
            <p style={{ fontSize: "12px", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", color: "#94a3b8" }}>
              •••• 6666
            </p>
            <span style={{ fontSize: "9px", color: copied ? "var(--positive)" : "var(--text-tertiary)" }}>
              {copied ? "Copied!" : "Debit"}
            </span>
          </div>

          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "9px", color: "var(--text-tertiary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Expires
            </p>
            <p style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "#e2e8f0" }}>
              08/28
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Quick Actions & Secondary Account Panel ── */}
      <div
        style={{
          borderRadius: "20px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-base)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span className="label">Linked Accounts &amp; Quick Actions</span>
            <span className="pill pill-positive" style={{ fontSize: "10px" }}>
              <ShieldCheck size={12} /> Bank Grade Encrypted
            </span>
          </div>

          {/* Secondary Account Pill/Card */}
          <div
            style={{
              padding: "0.875rem 1rem",
              borderRadius: "14px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-base)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(52, 211, 153, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--positive)",
                }}
              >
                <CreditCard size={18} />
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {secondaryAccountName}
                </p>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                  High-yield savings
                </p>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                {formatNaira(secondaryBalance)}
              </p>
              <span style={{ fontSize: "10px", color: "var(--positive)", fontWeight: 500 }}>
                +3.5% APY
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={onSyncClick}
            disabled={isSyncing}
            className="neo-tactile-btn"
            style={{
              flex: "1 1 140px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            <RefreshCw size={15} className={isSyncing ? "animate-spin" : ""} color="var(--accent)" />
            {isSyncing ? "Syncing..." : "Sync Bank"}
          </button>

          <Link
            href="/activity"
            style={{
              flex: "1 1 140px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              background: "var(--accent)",
              color: "#FFFFFF",
              fontSize: "13px",
              fontWeight: 600,
              boxShadow: "0 4px 16px rgba(79, 156, 249, 0.3)",
              textDecoration: "none",
              transition: "all 0.15s ease",
            }}
          >
            <span>View Ledger</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
