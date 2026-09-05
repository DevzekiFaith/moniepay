"use client";

// ─────────────────────────────────────────────────────────────────
// AjoPay — Real-Time Audit Velocity & Cashflow Inspector
// Continuous ledger audit curve, peak anomaly detection,
// and multi-mode audit inspector (Outflow / Inflow / Net Velocity).
// ─────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { formatNaira } from "@/lib/utils";
import {
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
  ShieldAlert,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

type AuditMetricMode = "outflow" | "inflow" | "net";

export function SpendingTrend({
  dailySpend,
  averageDailySpend = 0,
  periodLabel = "Past 14 Days",
}: SpendingTrendProps) {
  const [viewMode, setViewMode] = useState<"curve" | "bars">("curve");
  const [auditMode, setAuditMode] = useState<AuditMetricMode>("outflow");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // If dailySpend has many entries (e.g. 90 days), show last 14; otherwise show all
  const displayed = useMemo(() => {
    if (!dailySpend || dailySpend.length === 0) return [];
    return dailySpend.length > 21 ? dailySpend.slice(-14) : dailySpend;
  }, [dailySpend]);

  // Extract metric value according to active audit mode
  const getMetricValue = (item: DailySpendItem): number => {
    if (auditMode === "outflow") return item.totalOut ?? item.amount ?? 0;
    if (auditMode === "inflow") return item.totalIn ?? 0;
    return item.net ?? ((item.totalIn ?? 0) - (item.totalOut ?? item.amount ?? 0));
  };

  const values = displayed.map(getMetricValue);
  const maxAmount = Math.max(...values.map(Math.abs), 1000);

  // Find peak anomaly
  const peakIndex = values.reduce(
    (maxIdx, val, idx, arr) => (Math.abs(val) > Math.abs(arr[maxIdx]) ? idx : maxIdx),
    0
  );
  const peakDay = displayed[peakIndex];
  const peakValue = peakDay ? getMetricValue(peakDay) : 0;
  const isAnomaly = averageDailySpend > 0 && peakValue > averageDailySpend * 1.6;

  // Active hover item or peak
  const activeIdx = hoveredIndex !== null ? hoveredIndex : peakIndex;
  const activeItem = displayed[activeIdx];
  const activeValue = activeItem ? getMetricValue(activeItem) : 0;

  // Generate SVG curve dimensions
  const svgWidth = 580;
  const svgHeight = 160;
  const paddingX = 24;
  const paddingY = 24;

  const points = useMemo(() => {
    if (displayed.length === 0) return [];
    if (displayed.length === 1) {
      return [
        {
          x: svgWidth / 2,
          y: svgHeight / 2,
          ...displayed[0],
          value: getMetricValue(displayed[0]),
        },
      ];
    }
    return displayed.map((d, i) => {
      const val = getMetricValue(d);
      const x = paddingX + (i / Math.max(1, displayed.length - 1)) * (svgWidth - paddingX * 2);
      // Normalized between 0 and 1
      const normalized = Math.max(0, Math.min(1, Math.abs(val) / maxAmount));
      const y = svgHeight - paddingY - normalized * (svgHeight - paddingY * 2);
      return { x, y, ...d, value: val };
    });
  }, [displayed, maxAmount, auditMode]);

  // Smooth SVG Bezier Path
  const pathD = useMemo(() => {
    if (points.length < 2) return "";
    return points.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.x},${pt.y}`;
      const prev = arr[i - 1];
      const cpX1 = prev.x + (pt.x - prev.x) / 2;
      const cpX2 = prev.x + (pt.x - prev.x) / 2;
      return `${acc} C ${cpX1},${prev.y} ${cpX2},${pt.y} ${pt.x},${pt.y}`;
    }, "");
  }, [points]);

  const areaD = useMemo(() => {
    if (!pathD || points.length < 2) return "";
    return `${pathD} L ${points[points.length - 1]?.x ?? svgWidth},${svgHeight} L ${points[0]?.x ?? 0},${svgHeight} Z`;
  }, [pathD, points]);

  // Mode theme color
  const modeColor =
    auditMode === "outflow"
      ? "#38BDF8"
      : auditMode === "inflow"
      ? "#34D399"
      : "#A78BFA";

  const modeGradientId = `auditGradient-${auditMode}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="card"
      style={{
        padding: 0,
        overflow: "hidden",
        background: "linear-gradient(180deg, rgba(16, 23, 38, 0.8) 0%, rgba(10, 15, 29, 0.95) 100%)",
        border: "1px solid rgba(56, 189, 248, 0.15)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Chart Top Header & Audit Controls */}
      <div
        style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid var(--border-base)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <p className="label" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              Real-Time Audit Velocity
            </p>
            <span
              style={{
                fontSize: "10px",
                padding: "2px 7px",
                borderRadius: "99px",
                background: "rgba(16, 185, 129, 0.12)",
                color: "var(--positive)",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                border: "1px solid rgba(16, 185, 129, 0.25)",
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "var(--positive)",
                  boxShadow: "0 0 6px var(--positive)",
                }}
                className="animate-pulse"
              />
              LIVE LEDGER AUDIT
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
            Continuous ledger inspection &amp; debit velocity ({periodLabel})
          </p>
        </div>

        {/* Audit Mode Selector & View Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          {/* Mode Tabs: Outflow / Inflow / Net */}
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
              onClick={() => setAuditMode("outflow")}
              style={{
                padding: "3px 9px",
                borderRadius: "6px",
                background: auditMode === "outflow" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                color: auditMode === "outflow" ? "#38BDF8" : "var(--text-tertiary)",
                border: "none",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              Debits
            </button>
            <button
              onClick={() => setAuditMode("inflow")}
              style={{
                padding: "3px 9px",
                borderRadius: "6px",
                background: auditMode === "inflow" ? "rgba(52, 211, 153, 0.15)" : "transparent",
                color: auditMode === "inflow" ? "#34D399" : "var(--text-tertiary)",
                border: "none",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              Credits
            </button>
            <button
              onClick={() => setAuditMode("net")}
              style={{
                padding: "3px 9px",
                borderRadius: "6px",
                background: auditMode === "net" ? "rgba(167, 139, 250, 0.15)" : "transparent",
                color: auditMode === "net" ? "#A78BFA" : "var(--text-tertiary)",
                border: "none",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              Net
            </button>
          </div>

          {/* Average Indicator */}
          {averageDailySpend > 0 && auditMode === "outflow" && (
            <div style={{ textAlign: "right", padding: "0 0.5rem", display: "none" }} className="desktop-only">
              <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-tertiary)" }}>
                Avg / Day
              </p>
              <p className="figure" style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
                {formatNaira(averageDailySpend)}
              </p>
            </div>
          )}

          {/* View toggle (Curve vs Bar) */}
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
              title="Audit curve view"
              style={{
                padding: "4px 7px",
                borderRadius: "6px",
                background: viewMode === "curve" ? "var(--bg-surface)" : "transparent",
                color: viewMode === "curve" ? modeColor : "var(--text-tertiary)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <LineChartIcon size={13} />
            </button>
            <button
              onClick={() => setViewMode("bars")}
              title="Ledger bars view"
              style={{
                padding: "4px 7px",
                borderRadius: "6px",
                background: viewMode === "bars" ? "var(--bg-surface)" : "transparent",
                color: viewMode === "bars" ? modeColor : "var(--text-tertiary)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <BarChart3 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Audit Highlights Ribbon */}
      <div
        style={{
          padding: "0.625rem 1.5rem",
          background: "rgba(12, 18, 32, 0.6)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {isAnomaly ? (
            <ShieldAlert size={14} color="#F59E0B" />
          ) : (
            <ShieldCheck size={14} color="#10B981" />
          )}
          <span style={{ color: "var(--text-secondary)" }}>
            {peakDay ? (
              <>
                <strong style={{ color: "var(--text-primary)" }}>Peak {auditMode === "outflow" ? "Debit" : auditMode === "inflow" ? "Credit" : "Net"}:</strong>{" "}
                {formatNaira(peakValue)} on {peakDay.date}
                {isAnomaly && (
                  <span style={{ marginLeft: "6px", color: "#F59E0B", fontWeight: 600 }}>
                    (Audit Anomaly)
                  </span>
                )}
              </>
            ) : (
              "Auditing ledger entries in real time"
            )}
          </span>
        </div>

        {activeItem && (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: modeColor }}>
            {activeItem.label}: {formatNaira(activeValue)}
          </div>
        )}
      </div>

      {/* Chart Canvas Area */}
      <div style={{ padding: "1.25rem 1.5rem" }}>
        {displayed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-tertiary)", fontSize: "13px" }}>
            No ledger transactions detected in this audit interval.
          </div>
        ) : displayed.length === 1 ? (
          /* Single point / Today view */
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: `${modeColor}20`,
                  border: `2px solid ${modeColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: modeColor,
                }}
                className="animate-pulse"
              >
                <Activity size={24} />
              </div>
              <p className="figure" style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>
                {formatNaira(getMetricValue(displayed[0]))}
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Today&apos;s Real-Time {auditMode === "outflow" ? "Debit Volume" : auditMode === "inflow" ? "Inflow Volume" : "Net Movement"}
              </p>
            </div>
          </div>
        ) : viewMode === "curve" ? (
          /* Smooth Wave Audit Curve */
          <div style={{ position: "relative", width: "100%", height: `${svgHeight}px` }}>
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
              style={{ width: "100%", height: "100%", overflow: "visible" }}
            >
              <defs>
                <linearGradient id={modeGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={modeColor} stopOpacity="0.35" />
                  <stop offset="70%" stopColor={modeColor} stopOpacity="0.06" />
                  <stop offset="100%" stopColor={modeColor} stopOpacity="0.0" />
                </linearGradient>
                <filter id="auditCurveGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Area fill */}
              {areaD && <path d={areaD} fill={`url(#${modeGradientId})`} />}

              {/* Curve Stroke */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke={modeColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  filter="url(#auditCurveGlow)"
                />
              )}

              {/* Data points & Interactive hover targets */}
              {points.map((pt, idx) => {
                const isHovered = hoveredIndex === idx;
                const isPeak = idx === peakIndex;
                return (
                  <g key={pt.date}>
                    {/* Vertical drop line on hover or peak */}
                    {(isHovered || isPeak) && (
                      <line
                        x1={pt.x}
                        y1={pt.y}
                        x2={pt.x}
                        y2={svgHeight}
                        stroke={`${modeColor}40`}
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Point Circle */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 7 : isPeak ? 6 : 3.5}
                      fill={isHovered || isPeak ? "#FFFFFF" : modeColor}
                      stroke={modeColor}
                      strokeWidth={isHovered || isPeak ? 3 : 1}
                      style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Floating Scrubber Tooltip */}
            {activeItem && points[activeIdx] && (
              <div
                style={{
                  position: "absolute",
                  left: `${(points[activeIdx].x / svgWidth) * 100}%`,
                  top: `${Math.max(4, (points[activeIdx].y / svgHeight) * 100 - 32)}%`,
                  transform: "translate(-50%, -100%)",
                  padding: "4px 10px",
                  borderRadius: "99px",
                  background: "rgba(10, 15, 29, 0.95)",
                  border: `1.5px solid ${modeColor}80`,
                  boxShadow: `0 4px 16px rgba(0, 0, 0, 0.6), 0 0 10px ${modeColor}40`,
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                <span>{formatNaira(activeValue)}</span>
                <span style={{ fontSize: "9.5px", color: "var(--text-tertiary)", fontWeight: 500 }}>
                  ({activeItem.label})
                </span>
                {activeItem.transactionCount !== undefined && activeItem.transactionCount > 0 && (
                  <span style={{ fontSize: "9px", background: "rgba(255, 255, 255, 0.1)", padding: "1px 5px", borderRadius: "4px" }}>
                    {activeItem.transactionCount} txns
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Bar Chart Mode */
          <div style={{ height: `${svgHeight}px`, display: "flex", alignItems: "flex-end", gap: "6px" }}>
            {displayed.map((day, idx) => {
              const val = getMetricValue(day);
              const heightPercent = Math.max(6, Math.round((Math.abs(val) / maxAmount) * 100));
              const isPeak = idx === peakIndex;
              const isHovered = idx === hoveredIndex;

              return (
                <div
                  key={day.date}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "100%",
                    justifyContent: "flex-end",
                    cursor: "pointer",
                  }}
                  title={`${day.label}: ${formatNaira(val)}`}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${heightPercent}%`,
                      background: isHovered
                        ? "#FFFFFF"
                        : isPeak
                        ? modeColor
                        : `${modeColor}66`,
                      borderRadius: "4px 4px 1px 1px",
                      transition: "all 0.2s ease",
                      boxShadow: isPeak || isHovered ? `0 0 10px ${modeColor}80` : "none",
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* X-Axis Date Labels */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem" }}>
          {displayed.map((day, idx) => {
            const isSelected = idx === activeIdx;
            return (
              <span
                key={day.date}
                style={{
                  fontSize: "10.5px",
                  color: isSelected ? modeColor : "var(--text-tertiary)",
                  fontWeight: isSelected ? 700 : 400,
                  fontFamily: "var(--font-mono)",
                  visibility:
                    displayed.length <= 7 || idx % 2 === 0 || isSelected ? "visible" : "hidden",
                }}
              >
                {day.label}
              </span>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
