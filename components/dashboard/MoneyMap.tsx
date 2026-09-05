"use client";

// ─────────────────────────────────────────────────────────────────
// MoneyMap — Category Spending Breakdown
// Single accent color with proportional horizontal bars
// ─────────────────────────────────────────────────────────────────

import { formatNaira } from "@/lib/utils";
import { motion } from "framer-motion";
import { getCategoryIconMeta } from "@/components/ui/ModernIcons";

export interface CategorySpend {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color?: string;
  transactionCount: number;
}

interface MoneyMapProps {
  categories: CategorySpend[];
  totalExpenses: number;
}

export function MoneyMap({ categories, totalExpenses }: MoneyMapProps) {
  const topCategories = categories.slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="card"
      style={{ padding: 0, overflow: "hidden", background: "#0D1526" }}
    >
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
          <p className="label">Where Your Money Went</p>
          <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
            Automated category intelligence
          </p>
        </div>
        {totalExpenses > 0 && (
          <span className="figure" style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
            {formatNaira(totalExpenses)} total
          </span>
        )}
      </div>

      <div style={{ padding: "1.25rem 1.5rem" }}>
        {topCategories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-tertiary)", fontSize: "13px" }}>
            No categorized expenses yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            {topCategories.map((cat, idx) => {
              const opacity = 1 - idx * 0.12;
              const barWidth = Math.min(100, Math.max(4, cat.percentage));
              const { Icon, bg, color } = getCategoryIconMeta(cat.categoryName);

              return (
                <div key={cat.categoryId}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "6px",
                          background: bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: color,
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={12} strokeWidth={2.4} />
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {cat.categoryName}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span className="figure" style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                        {cat.percentage.toFixed(1)}%
                      </span>
                      <span className="figure" style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", minWidth: "80px", textAlign: "right" }}>
                        {formatNaira(cat.amount)}
                      </span>
                    </div>
                  </div>
                  {/* Proportional bar with Framer Motion */}
                  <div
                    style={{
                      height: "6px",
                      background: "var(--bg-elevated)",
                      borderRadius: "99px",
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.65, delay: idx * 0.08, ease: "easeOut" }}
                      style={{
                        height: "100%",
                        background: "var(--accent)",
                        opacity,
                        borderRadius: "99px",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
