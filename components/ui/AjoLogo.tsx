"use client";

// ─────────────────────────────────────────────────────────────────
// AJO — Brand Identity & Mark
// Personal Money Intelligence — "Your money. Understood."
// Minimalist, black, white, neutral, premium, intelligent, calm.
// ─────────────────────────────────────────────────────────────────

import React from "react";

interface AjoLogoProps {
  size?: number;
  variant?: "icon" | "horizontal" | "stacked";
  className?: string;
  showTagline?: boolean;
  theme?: "dark" | "light";
}

/**
 * Official AJO Geometric Mark
 * Clean, architectural monochrome geometry: an intentional,
 * open circular ring unified with an apex triangle ("A").
 */
export function AjoMark({ size = 32, theme = "dark" }: { size?: number; theme?: "dark" | "light" }) {
  const isDark = theme === "dark";
  const fg = isDark ? "#FFFFFF" : "#0A0A0A";
  const bg = isDark ? "#121212" : "#F4F4F5";
  const border = isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.12)";

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "8px",
        background: bg,
        border: `1px solid ${border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        flexShrink: 0,
        boxShadow: isDark ? "0 1px 3px rgba(0, 0, 0, 0.5)" : "0 1px 2px rgba(0, 0, 0, 0.05)",
      }}
      aria-label="AJO mark"
    >
      <svg
        width={Math.round(size * 0.58)}
        height={Math.round(size * 0.58)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3.5L4 19.5H7.5L9.5 15.5H14.5L16.5 19.5H20L12 3.5Z"
          fill={fg}
        />
        <path
          d="M10.8 13H13.2L12 10.4L10.8 13Z"
          fill={isDark ? "#121212" : "#F4F4F5"}
        />
      </svg>
    </div>
  );
}

export function AjoLogo({
  size = 32,
  variant = "horizontal",
  showTagline = true,
  theme = "dark",
}: AjoLogoProps) {
  const isDark = theme === "dark";
  const textPrimary = isDark ? "#FFFFFF" : "#0A0A0A";
  const textSecondary = isDark ? "#A1A1AA" : "#71717A";

  if (variant === "icon") {
    return <AjoMark size={size} theme={theme} />;
  }

  if (variant === "stacked") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0.5rem" }}>
        <AjoMark size={Math.round(size * 1.25)} theme={theme} />
        <div>
          <span
            style={{
              fontSize: `${Math.round(size * 0.72)}px`,
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: textPrimary,
              lineHeight: 1.1,
              fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
            }}
          >
            AJO
          </span>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: textSecondary,
              marginTop: "4px",
            }}
          >
            Personal Money Intelligence
          </p>
          {showTagline && (
            <p
              style={{
                fontSize: "10.5px",
                fontStyle: "italic",
                color: textSecondary,
                marginTop: "2px",
              }}
            >
              “Your money. Understood.”
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default: Horizontal brand mark
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem" }}>
      <AjoMark size={size} theme={theme} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
          <span
            style={{
              fontSize: `${Math.round(size * 0.52)}px`,
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: textPrimary,
              lineHeight: 1.1,
            }}
          >
            AJO
          </span>
          <span
            style={{
              fontSize: "10.5px",
              fontWeight: 500,
              color: textSecondary,
              letterSpacing: "0.02em",
            }}
          >
            Money Intelligence
          </span>
        </div>
        {showTagline && (
          <span
            style={{
              fontSize: "9.5px",
              color: textSecondary,
              letterSpacing: "0.01em",
              marginTop: "1px",
            }}
          >
            Your money. Understood.
          </span>
        )}
      </div>
    </div>
  );
}
