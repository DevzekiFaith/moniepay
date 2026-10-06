"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Brand Identity & Mark
// “Know what is happening in your business. Know what to do next.”
// Fast, modern, high-contrast, designed for Nigeria's informal economy.
// ─────────────────────────────────────────────────────────────────

import React from "react";

interface MoniePayLogoProps {
  size?: number;
  variant?: "icon" | "horizontal" | "stacked";
  className?: string;
  showTagline?: boolean;
  theme?: "dark" | "light" | string;
}

export function AjoMark({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "10px",
        background: "#10b981", // Emerald 500
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        flexShrink: 0,
        boxShadow: "0 2px 10px rgba(16, 185, 129, 0.25)",
      }}
      aria-label="MoniePay mark"
    >
      <span
        style={{
          color: "#09090b",
          fontWeight: 900,
          fontSize: `${Math.round(size * 0.55)}px`,
          fontFamily: "system-ui, sans-serif",
          lineHeight: 1,
        }}
      >
        M
      </span>
    </div>
  );
}

export function AjoLogo({
  size = 32,
  variant = "horizontal",
  className = "",
  showTagline = true,
}: MoniePayLogoProps) {
  if (variant === "icon") {
    return <AjoMark size={size} />;
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <AjoMark size={size} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-base font-black tracking-tight text-white">
            MoniePay
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            OS
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium text-zinc-400 tracking-normal">
            Know what to do next
          </span>
        )}
      </div>
    </div>
  );
}

export default AjoLogo;
