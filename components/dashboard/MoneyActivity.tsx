"use client";

// ─────────────────────────────────────────────────────────────────
// MoneyActivity — Normalized Transaction Feed & Senders/Receivers
// Framer Motion animated, compact length management with Show More
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import { formatNaira, formatTransactionDate } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Search, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ModernMerchantAvatar } from "@/components/ui/ModernIcons";

export interface TransactionItem {
  id: string;
  amount: number;
  currency: string;
  transactionDate: string | Date;
  description: string;
  merchantName?: string | null;
  normalizedMerchantName?: string | null;
  transactionType: "INCOME" | "EXPENSE" | "TRANSFER" | "REFUND" | string;
  isTransfer: boolean;
  category?: {
    id: string;
    name: string;
    icon?: string | null;
    color?: string | null;
  } | null;
  account?: {
    id: string;
    name: string;
  } | null;
}

interface MoneyActivityProps {
  transactions: TransactionItem[];
  title?: string;
  showViewAll?: boolean;
}

type FilterType = "ALL" | "EXPENSE" | "INCOME" | "TRANSFER";

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All Activity", value: "ALL" },
  { label: "Expenses", value: "EXPENSE" },
  { label: "Inflow", value: "INCOME" },
  { label: "Transfers", value: "TRANSFER" },
];

export function MoneyActivity({
  transactions,
  title = "Senders & Receivers",
  showViewAll = true,
}: MoneyActivityProps) {
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [showExpanded, setShowExpanded] = useState(false);

  const filtered = transactions.filter((tx) => {
    if (filter === "EXPENSE" && (tx.transactionType !== "EXPENSE" || tx.isTransfer)) return false;
    if (filter === "INCOME" && tx.transactionType !== "INCOME" && tx.transactionType !== "REFUND") return false;
    if (filter === "TRANSFER" && !tx.isTransfer && tx.transactionType !== "TRANSFER") return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        tx.description.toLowerCase().includes(q) ||
        (tx.merchantName ?? "").toLowerCase().includes(q) ||
        (tx.normalizedMerchantName ?? "").toLowerCase().includes(q) ||
        (tx.category?.name ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const displayLimit = showExpanded ? 12 : 6;
  const visibleTransactions = filtered.slice(0, displayLimit);

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="card"
      style={{ padding: 0, overflow: "hidden", background: "#0D1526" }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid var(--border-base)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <p className="label">{title}</p>
            <span
              style={{
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "99px",
                background: "var(--bg-elevated)",
                color: "var(--text-secondary)",
                fontWeight: 700,
              }}
            >
              {filtered.length}
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
            Automated normalization across all accounts
          </p>
        </div>

        {showViewAll && (
          <Link
            href="/activity"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              fontSize: "12.5px",
              color: "var(--accent)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          padding: "0.75rem 1.5rem",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-elevated)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        {/* Pills */}
        <div style={{ display: "flex", gap: "4px", overflowX: "auto" }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: "4px 10px",
                borderRadius: "8px",
                fontSize: "11.5px",
                fontWeight: filter === f.value ? 700 : 500,
                color: filter === f.value ? "var(--accent)" : "var(--text-secondary)",
                background: filter === f.value ? "rgba(79, 156, 249, 0.15)" : "transparent",
                border: filter === f.value ? "1px solid rgba(79, 156, 249, 0.3)" : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div style={{ position: "relative", minWidth: "150px" }}>
          <Search size={13} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
          <input
            type="text"
            placeholder="Search entity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "4px 10px 4px 28px",
              fontSize: "12px",
              borderRadius: "8px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-base)",
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Transactions List */}
      <div style={{ padding: "0.25rem 1.25rem" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-tertiary)", fontSize: "13px" }}>
            No transactions match the selected filter.
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {visibleTransactions.map((tx, idx) => {
              const isIncome = tx.transactionType === "INCOME" || tx.transactionType === "REFUND";
              const isTransfer = tx.isTransfer || tx.transactionType === "TRANSFER";
              const displayName = tx.normalizedMerchantName || tx.merchantName || tx.description;
              const dateStr = formatTransactionDate(tx.transactionDate);

              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.18, delay: idx * 0.02 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 0.25rem",
                    borderBottom: "1px solid var(--border-subtle)",
                    borderRadius: "6px",
                  }}
                  whileHover={{ background: "var(--bg-elevated)" }}
                >
                  {/* Left: Avatar + Merchant & Meta */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                    <ModernMerchantAvatar
                      categoryName={tx.category?.name}
                      merchantName={displayName}
                      transactionType={tx.transactionType}
                      isTransfer={isTransfer}
                      size={36}
                    />

                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: "13px",
                          color: "var(--text-primary)",
                          letterSpacing: "-0.01em",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "180px",
                        }}
                        title={displayName}
                      >
                        {displayName}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "1px" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                          {dateStr}
                        </span>
                        {tx.category?.name && (
                          <>
                            <span style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>•</span>
                            <span
                              style={{
                                fontSize: "10px",
                                color: tx.category.color || "var(--text-secondary)",
                                background: "var(--bg-elevated)",
                                padding: "1px 5px",
                                borderRadius: "4px",
                                fontWeight: 600,
                              }}
                            >
                              {tx.category.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Status */}
                  <div style={{ textAlign: "right", flexShrink: 0, paddingLeft: "0.5rem" }}>
                    <p
                      className="figure"
                      style={{
                        fontSize: "13.5px",
                        fontWeight: 700,
                        color: isIncome ? "var(--positive)" : "var(--text-primary)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {isIncome ? `+${formatNaira(tx.amount)}` : `-${formatNaira(tx.amount)}`}
                    </p>
                    <span
                      style={{
                        fontSize: "10px",
                        color: isIncome ? "var(--positive)" : "var(--text-tertiary)",
                        fontWeight: 500,
                      }}
                    >
                      {isIncome ? "Credited" : tx.account?.name ? tx.account.name.split(" ")[0] : "Paid"}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer: Manage Length Controls */}
      <div
        style={{
          padding: "0.75rem 1.25rem",
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--bg-elevated)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {filtered.length > 6 ? (
          <button
            type="button"
            onClick={() => setShowExpanded((prev) => !prev)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--accent)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>{showExpanded ? "Show fewer (6)" : `Show more (top 12)`}</span>
            {showExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        ) : (
          <span style={{ fontSize: "11.5px", color: "var(--text-tertiary)" }}>
            Showing {filtered.length} verified records
          </span>
        )}

        <Link
          href="/activity"
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--text-secondary)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>View All in Ledger</span>
          <ChevronRight size={13} />
        </Link>
      </div>
    </motion.div>
  );
}
