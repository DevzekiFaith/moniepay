"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Official Brand Identity & Logo
// “Understand your money, no be just to record am.”
// ─────────────────────────────────────────────────────────────────

import React from "react";

interface MoniePayLogoProps {
  size?: number;
  variant?: "icon" | "horizontal" | "stacked";
  className?: string;
  showTagline?: boolean;
}

export function MoniePayMark({ size = 36 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.28)}px`,
      }}
      className="overflow-hidden shadow-xs flex items-center justify-center shrink-0 border border-white/60 dark:border-white/20 bg-blue-950"
      aria-label="MoniePay mark"
    >
      <img
        src="/moniepay-logo-square.png"
        alt="MoniePay"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export function MoniePayLogo({
  size = 36,
  variant = "horizontal",
  className = "",
  showTagline = true,
}: MoniePayLogoProps) {
  if (variant === "icon") {
    return <MoniePayMark size={size} />;
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <MoniePayMark size={size} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            MoniePay
          </span>
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Trader OS
          </span>
        </div>
        {showTagline && (
          <span className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 tracking-normal">
            Understand your money
          </span>
        )}
      </div>
    </div>
  );
}

// Backwards compatibility aliases
export const AjoLogo = MoniePayLogo;
export const AjoMark = MoniePayMark;
export const AjoPayLogo = MoniePayLogo;
export const AjoPayEmblem = MoniePayMark;

export default MoniePayLogo;
