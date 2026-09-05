"use client";

// ─────────────────────────────────────────────────────────────────
// BillsDue — Upcoming Bills & Recurring Obligations
// Directly inspired by Image 3 Screen 2 "Bills due" cards
// ─────────────────────────────────────────────────────────────────

import { formatNaira } from "@/lib/utils";
import { Plus, Calendar, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ModernMerchantAvatar } from "@/components/ui/ModernIcons";

interface BillItem {
  id: string;
  name: string;
  dueDate: string;
  amount: number;
  iconBg: string;
  iconColor: string;
  initials: string;
  status: "UPCOMING" | "PAID" | "AUTO_PAY";
}

const DEFAULT_BILLS: BillItem[] = [
  {
    id: "b1",
    name: "Spotify Premium",
    dueDate: "12th Sep",
    amount: 1400,
    iconBg: "rgba(29, 185, 84, 0.15)",
    iconColor: "#1DB954",
    initials: "SP",
    status: "AUTO_PAY",
  },
  {
    id: "b2",
    name: "MTN Fiber Internet",
    dueDate: "15th Sep",
    amount: 25000,
    iconBg: "rgba(255, 204, 0, 0.15)",
    iconColor: "#FFCC00",
    initials: "MTN",
    status: "UPCOMING",
  },
  {
    id: "b3",
    name: "Netflix Standard",
    dueDate: "18th Sep",
    amount: 4500,
    iconBg: "rgba(229, 9, 20, 0.15)",
    iconColor: "#E50914",
    initials: "NFLX",
    status: "AUTO_PAY",
  },
  {
    id: "b4",
    name: "Cowrywise Circle",
    dueDate: "25th Sep",
    amount: 50000,
    iconBg: "rgba(79, 156, 249, 0.15)",
    iconColor: "#4F9CF9",
    initials: "CW",
    status: "UPCOMING",
  },
];

interface BillsDueProps {
  bills?: BillItem[];
}

export function BillsDue({ bills = DEFAULT_BILLS }: BillsDueProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="card"
      style={{ padding: "1.5rem", background: "#0D1526" }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div>
          <p className="label">Recurring &amp; Bills Due</p>
          <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
            Predicted from recurring patterns
          </p>
        </div>

        <Link
          href="/activity?filter=TRANSFER"
          className="neo-tactile-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "5px 12px",
            borderRadius: "99px",
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--text-secondary)",
            textDecoration: "none",
          }}
        >
          <Plus size={12} />
          <span>Manage Bills</span>
        </Link>
      </div>

      {/* Bills Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0.875rem",
        }}
      >
        {bills.map((bill) => (
          <div
            key={bill.id}
            style={{
              padding: "1rem",
              borderRadius: "14px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-base)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "0.75rem",
              transition: "transform 0.15s ease, border-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-strong)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-base)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {/* Brand Avatar */}
              <ModernMerchantAvatar
                merchantName={bill.name}
                categoryName="Bills"
                size={38}
                showMicroBadge={false}
              />

              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 7px",
                  borderRadius: "99px",
                  fontWeight: 600,
                  background: bill.status === "AUTO_PAY" ? "rgba(52, 211, 153, 0.12)" : "rgba(249, 115, 22, 0.12)",
                  color: bill.status === "AUTO_PAY" ? "var(--positive)" : "#f97316",
                }}
              >
                {bill.status === "AUTO_PAY" ? "Auto-Pay" : "Due Soon"}
              </span>
            </div>

            <div>
              <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                {bill.name}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px", color: "var(--text-tertiary)", fontSize: "11px" }}>
                <Calendar size={11} />
                <span>{bill.dueDate}</span>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Amount</span>
              <span className="figure" style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                {formatNaira(bill.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
