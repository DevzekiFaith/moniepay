"use client";

// ─────────────────────────────────────────────────────────────────
// SpendingTrend — Dynamic Interactive Trend Chart
// Directly inspired by Image 3 Screen 2 smooth curve & peak indicator
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import { formatNaira } from "@/lib/utils";
import { TrendingUp, BarChart3, LineChart as LineChartIcon } from "lucide-react";
import { motion } from "framer-motion";

export interface DailySpendItem {
  date: string;
  amount: number;
  label: string;
}

interface SpendingTrendProps {
  dailySpend: DailySpendItem[];
  averageDailySpend?: number;
}

export function SpendingTrend({ dailySpend, averageDailySpend = 0 }: SpendingTrendProps) {
  const [viewMode, setViewMode] = useState<"curve" | "bars">("curve");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const displayed = dailySpend.slice(-14);
  const maxAmount = Math.max(...displayed.map((d) => d.amount), 1000);

  // Find peak day
  const peakIndex = displayed.reduce(
    (maxIdx, item, idx, arr) => (item.amount > arr[maxIdx].amount ? idx : maxIdx),
    0
  );
  const peakDay = displayed[peakIndex];

  // Generate smooth SVG bezier points
  const svgWidth = 560;
  const svgHeight = 160;
  const paddingX = 20;
  const paddingY = 24;

  const points = displayed.map((d, i) => {
    const x = paddingX + (i / Math.max(1, displayed.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (d.amount / maxAmount) * (svgHeight - paddingY * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[i - 1];
    const cpX1 = prev.x + (pt.x - prev.x) / 2;
    const cpX2 = prev.x + (pt.x - prev.x) / 2;
    return `${acc} C ${cpX1},${prev.y} ${cpX2},${pt.y} ${pt.x},${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1]?.x ?? svgWidth},${svgHeight} L ${points[0]?.x ?? 0},${svgHeight} Z`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="card"
      style={{ padding: 0, overflow: "hidden", background: "#0D1526" }}
    >
      {/* Chart Header */}
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
            <p className="label">Spending Trend</p>
            <span
              style={{
                fontSize: "10px",
                padding: "2px 6px",
                borderRadius: "4px",
                background: "rgba(79, 156, 249, 0.12)",
                color: "var(--accent)",
                fontWeight: 600,
              }}
            >
              Past 14 Days
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
            Daily cashflow &amp; expenses pattern
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {averageDailySpend > 0 && (
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-tertiary)" }}>
                Avg / Day
              </p>
              <p className="figure" style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                {formatNaira(averageDailySpend)}
              </p>
            </div>
          )}

          {/* View toggle */}
          <div
            style={{
              display: "flex",
              background: "var(--bg-elevated)",
              padding: "2px",
              borderRadius: "8px",
              border: "1px solid var(--border-base)",
            }}
          >
            <button
              onClick={() => setViewMode("curve")}
              title="Smooth curve view"
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                background: viewMode === "curve" ? "var(--bg-surface)" : "transparent",
                color: viewMode === "curve" ? "var(--accent)" : "var(--text-tertiary)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <LineChartIcon size={14} />
            </button>
            <button
              onClick={() => setViewMode("bars")}
              title="Bar chart view"
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                background: viewMode === "bars" ? "var(--bg-surface)" : "transparent",
                color: viewMode === "bars" ? "var(--accent)" : "var(--text-tertiary)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <BarChart3 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ padding: "1.25rem 1.5rem" }}>
        {displayed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-tertiary)", fontSize: "13px" }}>
            No trend data available for this range.
          </div>
        ) : viewMode === "curve" ? (
          /* Smooth Wave Line Chart (Image 3) */
          <div style={{ position: "relative", width: "100%", height: `${svgHeight}px` }}>
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
              style={{ width: "100%", height: "100%", overflow: "visible" }}
            >
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F9CF9" stopOpacity="0.32" />
                  <stop offset="70%" stopColor="#4F9CF9" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#4F9CF9" stopOpacity="0.0" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Area fill */}
              <path d={areaD} fill="url(#trendGradient)" />

              {/* Smooth curve stroke */}
              <path
                d={pathD}
                fill="none"
                stroke="#4F9CF9"
                strokeWidth="2.5"
                strokeLinecap="round"
                filter="url(#glow)"
              />

              {/* Peak Point Glowing Marker (Image 3 feature) */}
              {peakDay && points[peakIndex] && (
                <g>
                  {/* Dashed vertical drop line */}
                  <line
                    x1={points[peakIndex].x}
                    y1={points[peakIndex].y}
                    x2={points[peakIndex].x}
                    y2={svgHeight}
                    stroke="rgba(79, 156, 249, 0.35)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  {/* Glowing outer pulse */}
                  <circle
                    cx={points[peakIndex].x}
                    cy={points[peakIndex].y}
                    r="8"
                    fill="rgba(79, 156, 249, 0.25)"
                  />
                  {/* Center dot */}
                  <circle
                    cx={points[peakIndex].x}
                    cy={points[peakIndex].y}
                    r="4.5"
                    fill="#FFFFFF"
                    stroke="#4F9CF9"
                    strokeWidth="2.5"
                  />
                </g>
              )}
            </svg>

            {/* Peak Floating Tooltip Pill (Image 3 style) */}
            {peakDay && points[peakIndex] && (
              <div
                style={{
                  position: "absolute",
                  left: `${(points[peakIndex].x / svgWidth) * 100}%`,
                  top: `${Math.max(0, (points[peakIndex].y / svgHeight) * 100 - 32)}%`,
                  transform: "translate(-50%, -100%)",
                  padding: "4px 10px",
                  borderRadius: "99px",
                  background: "rgba(12, 18, 32, 0.9)",
                  border: "1px solid rgba(79, 156, 249, 0.4)",
                  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.5)",
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  pointerEvents: "none",
                }}
              >
                <span>{formatNaira(peakDay.amount)}</span>
                <span style={{ fontSize: "9px", color: "var(--text-secondary)", fontWeight: 500 }}>
                  ({peakDay.label})
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Bar Chart View */
          <div style={{ height: `${svgHeight}px`, display: "flex", alignItems: "flex-end", gap: "6px" }}>
            {displayed.map((day, idx) => {
              const heightPercent = Math.max(6, Math.round((day.amount / maxAmount) * 100));
              const isPeak = idx === peakIndex;
              return (
                <div
                  key={day.date}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "100%",
                    justifyContent: "flex-end",
                  }}
                  title={`${day.label}: ${formatNaira(day.amount)}`}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${heightPercent}%`,
                      background: isPeak ? "var(--accent)" : "rgba(79, 156, 249, 0.4)",
                      borderRadius: "4px 4px 1px 1px",
                      transition: "all 0.2s ease",
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* X-Axis Dates */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem" }}>
          {displayed.map((day, idx) => (
            <span
              key={day.date}
              style={{
                fontSize: "10.5px",
                color: idx === peakIndex ? "var(--accent)" : "var(--text-tertiary)",
                fontWeight: idx === peakIndex ? 600 : 400,
                fontFamily: "var(--font-mono)",
                visibility: idx % 2 === 0 || idx === peakIndex ? "visible" : "hidden",
              }}
            >
              {day.label}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
