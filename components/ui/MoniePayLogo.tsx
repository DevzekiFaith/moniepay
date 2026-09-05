"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay Brand Logo System — Original Signature Geometric Emblem
// Clean electric blue/indigo gradient squircle with iconic white "M"
// ─────────────────────────────────────────────────────────────────

import React from "react";

interface MoniePayLogoProps {
  size?: number;
  variant?: "icon" | "horizontal" | "stacked";
  className?: string;
  showTagline?: boolean;
  taglineText?: string;
}

/**
 * Signature Original MoniePay Emblem
 * Electric Blue & Indigo Gradient Squircle with geometric "M"
 */
export function MoniePayEmblem({ size = 36 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.28)}px`,
        background: "linear-gradient(135deg, #4F9CF9 0%, #2563EB 100%)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.35)",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Subtle top light sheen */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "40%",
          background: "linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      <svg
        width={Math.round(size * 0.58)}
        height={Math.round(size * 0.58)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "relative", zIndex: 1 }}
      >
        <path
          d="M4 19V5L12 13L20 5V19"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function MoniePayLogo({
  size = 36,
  variant = "horizontal",
  showTagline = true,
  taglineText = "Money Intelligence",
}: MoniePayLogoProps) {
  if (variant === "icon") {
    return <MoniePayEmblem size={size} />;
  }

  if (variant === "stacked") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0.625rem" }}>
        <MoniePayEmblem size={size * 1.3} />
        <div>
          <h1
            style={{
              fontSize: `${Math.round(size * 0.72)}px`,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
              lineHeight: 1.1,
            }}
          >
            Monie<span style={{ color: "#4F9CF9" }}>Pay</span>
          </h1>
          {showTagline && (
            <p
              style={{
                fontSize: "10.5px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "var(--accent)",
                textTransform: "uppercase",
                marginTop: "3px",
              }}
            >
              {taglineText}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default: Horizontal brand layout
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem" }}>
      <MoniePayEmblem size={size} />
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
          <span
            style={{
              fontSize: `${Math.round(size * 0.44)}px`,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
              lineHeight: 1.1,
            }}
          >
            Monie<span style={{ color: "#4F9CF9" }}>Pay</span>
          </span>
        </div>
        {showTagline && (
          <p
            style={{
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: "var(--text-tertiary)",
              textTransform: "uppercase",
              marginTop: "2px",
              whiteSpace: "nowrap",
            }}
          >
            {taglineText}
          </p>
        )}
      </div>
    </div>
  );
}

// Backwards compatibility
export const AjoPayLogo = MoniePayLogo;
export const AjoPayEmblem = MoniePayEmblem;
