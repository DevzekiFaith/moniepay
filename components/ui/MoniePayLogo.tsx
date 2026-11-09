"use client";

// ─────────────────────────────────────────────────────────────────
// LisaPay — Official Brand Identity & Logo
// "Understand your money, no be just to record am."
// ─────────────────────────────────────────────────────────────────

import React, { useState } from "react";

interface LisaPayLogoProps {
  size?: number;
  variant?: "icon" | "horizontal" | "stacked";
  className?: string;
  showTagline?: boolean;
}

export type MoniePayLogoProps = LisaPayLogoProps;

export function LisaPayMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.26)}px`,
      }}
      className={`relative overflow-hidden shadow-md flex items-center justify-center shrink-0 border border-blue-500/30 dark:border-white/20 bg-[#061129] select-none transition-transform hover:scale-105 active:scale-95 ${className}`}
      aria-label="LisaPay mark"
    >
      {!imgError ? (
        <img
          src="/lisapay-logo-square.png"
          alt="LisaPay"
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
          {/* Letter L Pillar with Shop Foundation */}
          <path
            d="M30 38 V78 H74 V66 H44 V38 H30 Z"
            fill="#ffffff"
          />
          {/* Solid Gold Naira Coin */}
          <circle cx="62" cy="50" r="13" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
          <text
            x="62"
            y="55.5"
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

export function LisaPayLogo({
  size = 36,
  variant = "horizontal",
  className = "",
  showTagline = true,
}: LisaPayLogoProps) {
  if (variant === "icon") {
    return <LisaPayMark size={size} />;
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LisaPayMark size={size} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            LisaPay
          </span>
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300 border border-blue-200/80 dark:border-blue-800">
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
export const MoniePayLogo = LisaPayLogo;
export const MoniePayMark = LisaPayMark;
export const AjoLogo = LisaPayLogo;
export const AjoMark = LisaPayMark;
export const AjoPayLogo = LisaPayLogo;
export const AjoPayEmblem = LisaPayMark;

export default LisaPayLogo;
