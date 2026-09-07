"use client";

// ─────────────────────────────────────────────────────────────────
// AJO — Spending Trend
// Minimalist, restrained visual trend of daily financial activity.
// Clear, calm, human language. Zero engineering jargon.
// ─────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { formatNaira } from "@/lib/utils";

export interface DailySpendItem {
  date: string;
  amount: number;
  totalIn?: number;
  totalOut?: number;
  net?: number;
  transactionCount?: number;
  label: string;
}

interface SpendingTrendProps {
  dailySpend: DailySpendItem[];
  averageDailySpend?: number;
  periodLabel?: string;
}

export function SpendingTrend({
  dailySpend,
  averageDailySpend = 0,
  periodLabel = "Past 14 Days",
}: SpendingTrendProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const displayed = useMemo(() => {
    if (!dailySpend || dailySpend.length === 0) return [];
    return dailySpend.length > 21 ? dailySpend.slice(-14) : dailySpend;
  }, [dailySpend]);

  const values = displayed.map((d) => d.totalOut ?? d.amount ?? 0);
  const maxAmount = Math.max(...values, 1000);

  const svgWidth = 500;
  const svgHeight = 90;
  const paddingX = 14;
  const paddingY = 12;

  const points = useMemo(() => {
    if (displayed.length === 0) return [];
    if (displayed.length === 1) {
      return [{ x: svgWidth / 2, y: svgHeight / 2, ...displayed[0], val: values[0] }];
    }
    return displayed.map((d, i) => {
      const val = values[i];
      const x = paddingX + (i / (displayed.length - 1)) * (svgWidth - paddingX * 2);
      const ratio = val / maxAmount;
      const y = svgHeight - paddingY - ratio * (svgHeight - paddingY * 2);
      return { x, y, ...d, val };
    });
  }, [displayed, values, maxAmount]);

  const pathD = useMemo(() => {
    if (points.length < 2) return "";
    return points.reduce((acc, p, i, arr) => {
      if (i === 0) return `M ${p.x},${p.y}`;
      const prev = arr[i - 1];
      const cpX = (prev.x + p.x) / 2;
      return `${acc} C ${cpX},${prev.y} ${cpX},${p.y} ${p.x},${p.y}`;
    }, "");
  }, [points]);

  const activeIdx = hoveredIndex !== null ? hoveredIndex : points.length - 1;
  const activeItem = points[activeIdx];

  return (
    <div
      style={{
        background: "#0D0D0D",
        border: "1px solid #1A1A1A",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid #171717",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#71717A", textTransform: "uppercase" }}>
            SPENDING TREND
          </span>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF", marginTop: "2px" }}>
            Daily Outflow ({periodLabel})
          </h3>
        </div>

        {averageDailySpend > 0 && (
          <span style={{ fontSize: "12px", color: "#A1A1AA" }}>
            Daily avg: <strong style={{ color: "#FFFFFF" }}>{formatNaira(averageDailySpend)}</strong>
          </span>
        )}
      </div>

      {/* Chart Body */}
      <div style={{ padding: "1.25rem 1.5rem 1rem" }}>
        {points.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem 0", color: "#71717A", fontSize: "13px" }}>
            No spending activity recorded for this period.
          </div>
        ) : (
          <div>
            {/* Active Day Readout */}
            <div style={{ marginBottom: "0.75rem", display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "19px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
                {activeItem ? formatNaira(activeItem.val) : "₦0"}
              </span>
              <span style={{ fontSize: "11.5px", color: "#71717A" }}>
                {activeItem?.date ? new Date(activeItem.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : ""}
              </span>
            </div>

            {/* SVG Visual Curve */}
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              style={{ width: "100%", height: "auto", overflow: "visible" }}
            >
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}

              {/* Point Markers */}
              {points.map((p, idx) => {
                const isActive = idx === activeIdx;
                return (
                  <g
                    key={p.date}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isActive ? 4 : 2}
                      fill={isActive ? "#FFFFFF" : "#52525B"}
                    />
                    <rect
                      x={p.x - 12}
                      y={0}
                      width={24}
                      height={svgHeight}
                      fill="transparent"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Date Labels Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
              <span style={{ fontSize: "11px", color: "#52525B" }}>
                {points[0]?.date ? new Date(points[0].date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}
              </span>
              <span style={{ fontSize: "11px", color: "#52525B" }}>
                {points[points.length - 1]?.date ? new Date(points[points.length - 1].date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
