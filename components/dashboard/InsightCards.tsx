"use client";

// ─────────────────────────────────────────────────────────────────
// InsightCards — Proactive Financial Intelligence & Anomaly Alerts
// Clean dark-mode glass styling with subtle alerts
// ─────────────────────────────────────────────────────────────────

import { AlertTriangle, CheckCircle2, BrainCircuit, Sparkles, RefreshCw } from "lucide-react";
import Link from "next/link";

export interface InsightItem {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  importance: "LOW" | "NORMAL" | "HIGH" | "CRITICAL" | string;
  createdAt: string | Date;
}

interface InsightCardsProps {
  insights: InsightItem[];
  onGenerateClick?: () => void;
  isGenerating?: boolean;
}

export function InsightCards({ insights, onGenerateClick, isGenerating }: InsightCardsProps) {
  return (
    <div className="card animate-fade-up" style={{ padding: 0, overflow: "hidden" }}>
      {/* Header */}
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
            <p className="label">Financial Intelligence</p>
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
              Proactive
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
            Pattern recognition &amp; anomaly detection
          </p>
        </div>

        {onGenerateClick && (
          <button
            onClick={onGenerateClick}
            disabled={isGenerating}
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
            <RefreshCw size={12} className={isGenerating ? "animate-spin" : ""} color="var(--accent)" />
            {isGenerating ? "Analyzing…" : "Re-evaluate"}
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {insights.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem 0",
              color: "var(--text-tertiary)",
              fontSize: "13px",
            }}
          >
            <BrainCircuit size={26} color="var(--accent)" style={{ margin: "0 auto 0.5rem", opacity: 0.85 }} />
            <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>All accounts balanced</p>
            <p style={{ fontSize: "12px", marginTop: "4px" }}>Click re-evaluate to scan current ledger for new patterns.</p>
          </div>
        ) : (
          insights.slice(0, 4).map((ins) => {
            const isHigh = ins.importance === "HIGH" || ins.importance === "CRITICAL";
            const isPositive = ins.type.includes("INCOME") || ins.type.includes("DECREASE");

            return (
              <div
                key={ins.id}
                style={{
                  padding: "0.875rem 1rem",
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
                  transition: "border-color 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                  {isHigh ? (
                    <AlertTriangle size={15} color="#FBBF24" style={{ flexShrink: 0, marginTop: "2px" }} />
                  ) : isPositive ? (
                    <CheckCircle2 size={15} color="var(--positive)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  ) : (
                    <Sparkles size={15} color="var(--accent)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  )}
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "3px" }}>
                      {ins.title}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.55 }}>
                      {ins.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {insights.length > 0 && (
          <div style={{ textAlign: "right", marginTop: "0.25rem" }}>
            <Link
              href="/insights"
              style={{
                fontSize: "12px",
                color: "var(--accent)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Explore all intelligence alerts →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
