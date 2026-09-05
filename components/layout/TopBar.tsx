"use client";

// ─────────────────────────────────────────────
// Unified TopBar Component
// ─────────────────────────────────────────────

import { RefreshCw, Bell } from "lucide-react";
import Link from "next/link";

interface TopBarProps {
  title?: string;
  badge?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function TopBar({
  title = "Overview",
  badge,
  onRefresh,
  isRefreshing = false,
}: TopBarProps) {
  return (
    <header
      style={{
        height: "64px",
        borderBottom: "1px solid var(--border-base)",
        background: "rgba(17, 24, 39, 0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <h1 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          {title}
        </h1>
        {badge && (
          <span className="pill pill-positive" style={{ fontSize: "10.5px" }}>
            {badge}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
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
        )}

        <Link
          href="/insights"
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
          <Bell size={15} />
        </Link>

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
          A
        </Link>
      </div>
    </header>
  );
}
