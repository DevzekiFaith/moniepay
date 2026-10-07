"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Official Brand Identity & Logo
// "Understand your money, no be just to record am."
// ─────────────────────────────────────────────────────────────────

import React, { useState } from "react";

interface MoniePayLogoProps {
  size?: number;
  variant?: "icon" | "horizontal" | "stacked";
  className?: string;
  showTagline?: boolean;
}

export function MoniePayMark({ size = 36 }: { size?: number }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.26)}px`,
      }}
      className="relative overflow-hidden shadow-md flex items-center justify-center shrink-0 border border-emerald-500/30 dark:border-white/20 bg-[#061129] select-none transition-transform hover:scale-105 active:scale-95"
      aria-label="MoniePay mark"
    >
      {!imgError ? (
        <img
          src="/moniepay-logo-square.png"
          alt="MoniePay"
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        /* Dynamic SVG Vector Fallback */
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="100" height="100" rx="26" fill="#0c2356" />
          {/* Shop Canopy Roof */}
          <path
            d="M22 34 L30 24 H70 L78 34 L76 39 H24 Z"
            fill="#ffffff"
          />
          {/* Letter M Pillars */}
          <path
            d="M25 39 V78 H38 V56 L50 68 L62 56 V78 H75 V39"
            fill="#ffffff"
          />
          {/* Solid Gold Naira Coin */}
          <circle cx="50" cy="66" r="13" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
          <text
            x="50"
            y="71.5"
            textAnchor="middle"
            fill="#78350f"
            fontSize="13"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            ₦
          </text>
        </svg>
      )}
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
          <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            MoniePay
          </span>
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
            Lite
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
