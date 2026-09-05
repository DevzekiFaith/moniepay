"use client";

// ─────────────────────────────────────────────────────────────────
// AjoPay Brand Logo System
// "Save Small, Grow Big" — Official Emblem & Luxury Dark Vector Mark
// ─────────────────────────────────────────────────────────────────

import React from "react";

interface AjoPayLogoProps {
  size?: number;
  variant?: "icon" | "horizontal" | "stacked";
  useImage?: boolean;
  className?: string;
  showTagline?: boolean;
}

export function AjoPayEmblem({ size = 36 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #6B21A8 0%, #4C1D95 100%)",
        border: "1.5px solid rgba(168, 85, 247, 0.4)",
        boxShadow: "0 0 16px rgba(147, 51, 234, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <svg
        width={Math.round(size * 0.62)}
        height={Math.round(size * 0.62)}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cash Note Emerging */}
        <path
          d="M7 11L14 4L21 11"
          stroke="#34D399"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="9"
          y="6.5"
          width="10"
          height="6.5"
          rx="1"
          fill="#10B981"
          stroke="#6EE7B7"
          strokeWidth="1.2"
        />
        <circle cx="14" cy="9.75" r="1.25" fill="#ECFDF5" />

        {/* Main Wallet Body */}
        <rect
          x="4.5"
          y="10.5"
          width="19"
          height="13.5"
          rx="3.5"
          fill="#059669"
          stroke="#34D399"
          strokeWidth="1.5"
        />

        {/* Wallet Flap & Clasp */}
        <path
          d="M17.5 14H22.5C23.6 14 24.5 14.9 24.5 16V18C24.5 19.1 23.6 20 22.5 20H17.5V14Z"
          fill="#047857"
          stroke="#6EE7B7"
          strokeWidth="1.2"
        />
        <circle cx="21" cy="17" r="1.2" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

export function AjoPayLogo({
  size = 38,
  variant = "horizontal",
  useImage = false,
  showTagline = true,
}: AjoPayLogoProps) {
  if (variant === "icon") {
    if (useImage) {
      return (
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: "0 0 12px rgba(147, 51, 234, 0.35)",
            border: "1.5px solid rgba(168, 85, 247, 0.4)",
            flexShrink: 0,
            background: "#4C1D95",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/ajopay-logo-square.png"
            alt="AjoPay Emblem"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      );
    }
    return <AjoPayEmblem size={size} />;
  }

  if (variant === "stacked") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0.625rem" }}>
        {useImage ? (
          <div
            style={{
              width: `${size * 1.5}px`,
              height: `${size * 1.5}px`,
              borderRadius: "50%",
              overflow: "hidden",
              boxShadow: "0 0 20px rgba(147, 51, 234, 0.4)",
              border: "2px solid rgba(168, 85, 247, 0.4)",
              background: "#4C1D95",
            }}
          >
            <img
              src="/ajopay-logo-square.png"
              alt="AjoPay"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : (
          <AjoPayEmblem size={size * 1.3} />
        )}
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
            Ajo<span style={{ color: "#C084FC" }}>Pay</span>
          </h1>
          {showTagline && (
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "rgba(255, 255, 255, 0.6)",
                textTransform: "uppercase",
                marginTop: "3px",
              }}
            >
              Save Small, Grow Big
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default: Horizontal brand header
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem" }}>
      {useImage ? (
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: "0 0 14px rgba(147, 51, 234, 0.35)",
            border: "1.5px solid rgba(168, 85, 247, 0.4)",
            background: "#4C1D95",
            flexShrink: 0,
          }}
        >
          <img
            src="/ajopay-logo-square.png"
            alt="AjoPay"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ) : (
        <AjoPayEmblem size={size} />
      )}
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
          <span
            style={{
              fontSize: `${Math.round(size * 0.45)}px`,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
              lineHeight: 1.1,
            }}
          >
            Ajo<span style={{ color: "#C084FC" }}>Pay</span>
          </span>
        </div>
        {showTagline && (
          <p
            style={{
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "rgba(255, 255, 255, 0.55)",
              textTransform: "uppercase",
              marginTop: "2px",
              whiteSpace: "nowrap",
            }}
          >
            Save Small, Grow Big
          </p>
        )}
      </div>
    </div>
  );
}
