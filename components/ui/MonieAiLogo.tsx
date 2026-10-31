"use client";

// ─────────────────────────────────────────────────────────────────
// Monie AI Brand Logo System — Unified Geometric Intelligence Emblem
// Electric Blue & Indigo Gradient Squircle with BrainCircuit Intelligence Emblem (Zero Sparkles)
// Strictly adheres to MoniePay's brand color system (no variant colors)
// ─────────────────────────────────────────────────────────────────

import React from "react";
import { BrainCircuit } from "lucide-react";

interface MonieAiLogoProps {
  size?: number;
  showTagline?: boolean;
  taglineText?: string;
  className?: string;
}

/**
 * Signature Geometric Monie AI Emblem
 * Electric Blue & Indigo Gradient Squircle with BrainCircuit Intelligence Icon (Zero Sparkles)
 */
export function MonieAiEmblem({ size = 36 }: { size?: number }) {
  const iconSize = Math.max(16, Math.round(size * 0.58));

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.28)}px`,
        background: "linear-gradient(135deg, #4F9CF9 0%, #2563EB 100%)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.35)",
        border: "1px solid rgba(255, 255, 255, 0.22)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Subtle light sheen */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "42%",
          background: "linear-gradient(180deg, rgba(255, 255, 255, 0.28) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Clean Neural BrainCircuit Intelligence Icon - Zero Sparkles */}
      <BrainCircuit
        size={iconSize}
        className="text-white relative z-10 drop-shadow-xs"
        strokeWidth={2.2}
      />
    </div>
  );
}

/**
 * Full Monie AI Logo with Typography
 */
export function MonieAiLogo({
  size = 36,
  showTagline = true,
  taglineText = "Financial Intelligence Copilot",
  className = "",
}: MonieAiLogoProps) {
  const fontSize = Math.round(size * 0.46);
  const taglineSize = Math.max(9.5, Math.round(size * 0.26));

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: `${Math.round(size * 0.28)}px`,
        userSelect: "none",
      }}
    >
      <MonieAiEmblem size={size} />

      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "5px" }}>
          <span
            style={{
              fontSize: `${fontSize}px`,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
              lineHeight: 1.1,
            }}
          >
            Monie
          </span>
          <span
            style={{
              fontSize: `${fontSize}px`,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              background: "linear-gradient(90deg, #4F9CF9 0%, #38BDF8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.1,
            }}
          >
            AI
          </span>
        </div>

        {showTagline && (
          <span
            style={{
              fontSize: `${taglineSize}px`,
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.45)",
              letterSpacing: "0.02em",
              marginTop: "2px",
              lineHeight: 1.2,
            }}
          >
            {taglineText}
          </span>
        )}
      </div>
    </div>
  );
}
