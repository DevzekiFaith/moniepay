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
          <rect width="100" height="100" rx="26" fill="#07122b" />
          {/* Shop Canopy Roof */}
          <path
            d="M18 36 C18 24, 30 20, 50 20 C70 20, 82 24, 82 36 L78 44 C76 46, 72 46, 70 44 C68 46, 64 46, 62 44 C60 46, 56 46, 54 44 C52 46, 48 46, 46 44 C44 46, 40 46, 38 44 C36 46, 32 46, 30 44 L26 44 C24 46, 20 46, 18 44 Z"
            fill="url(#canopyGrad)"
          />
          {/* Letter M Shop Pillars */}
          <path
            d="M24 46 V80 H34 V58 L50 72 L66 58 V80 H76 V46"
            stroke="url(#mGrad)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Gold Naira Coin */}
          <circle cx="50" cy="68" r="14" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
          <text
            x="50"
            y="73.5"
            textAnchor="middle"
            fill="#78350f"
            fontSize="14"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            ₦
          </text>
          <defs>
            <linearGradient id="canopyGrad" x1="18" y1="20" x2="82" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38bdf8" />
              <stop offset="0.5" stopColor="#0ea5e9" />
              <stop offset="1" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="mGrad" x1="24" y1="46" x2="76" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0284c7" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
          </defs>
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
