"use client";

// ─────────────────────────────────────────────────────────────────
// AJO — Where Your Money Went
// Minimalist, restrained category breakdown with proportional bars.
// ─────────────────────────────────────────────────────────────────

import { formatNaira } from "@/lib/utils";

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
  const topCategories = categories.slice(0, 5);

  return (
    <div
      style={{
        background: "#0D0D0D",
        border: "1px solid #1A1A1A",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid #171717",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#71717A", textTransform: "uppercase" }}>
            WHERE YOUR MONEY WENT
          </span>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF", marginTop: "2px" }}>
            Category Distribution
          </h3>
        </div>
        {totalExpenses > 0 && (
          <span style={{ fontSize: "12.5px", color: "#A1A1AA", fontWeight: 600 }}>
            {formatNaira(totalExpenses)} total
          </span>
        )}
      </div>

      <div style={{ padding: "1.25rem 1.5rem" }}>
        {topCategories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem 0", color: "#71717A", fontSize: "13px" }}>
            No categorized expenses for this period.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {topCategories.map((cat) => {
              const barWidth = Math.min(100, Math.max(3, cat.percentage));

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
                    <span style={{ fontSize: "13.5px", fontWeight: 500, color: "#EDEDED" }}>
                      {cat.categoryName}
                    </span>

                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#FFFFFF" }}>
                        {formatNaira(cat.amount)}
                      </span>
                      <span style={{ fontSize: "11.5px", color: "#71717A", minWidth: "32px", textAlign: "right" }}>
                        {Math.round(cat.percentage)}%
                      </span>
                    </div>
                  </div>

                  {/* Minimal Proportional Bar */}
                  <div
                    style={{
                      height: "4px",
                      background: "#1A1A1A",
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${barWidth}%`,
                        background: "#EDEDED",
                        borderRadius: "2px",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
