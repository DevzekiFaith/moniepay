"use client";

// ─────────────────────────────────────────────────────────────────
// Monie Lite — Modern Fintech Iconography System
// Replaces generic lucide/template icons with modern, high-end fintech glyphs
// ─────────────────────────────────────────────────────────────────

import React from "react";
import {
  ShoppingBag,
  UtensilsCrossed,
  Car,
  Briefcase,
  Zap,
  Smartphone,
  Tv,
  Fuel,
  HeartPulse,
  Package,
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  GraduationCap,
  Plane,
  Receipt,
  Coins,
  Coffee,
  Music,
  Film,
  PiggyBank,
  CreditCard,
  Building2,
  Sparkles,
  BrainCircuit,
  Compass,
  WalletCards,
  SlidersHorizontal,
  Fingerprint,
  Radio,
  Layers,
  ShieldCheck,
  LucideIcon,
  Wifi,
} from "lucide-react";

// ── 1. Bespoke Brand Mark Vector (Monie Lite Infinity Node) ─────
export function BrandLogo({ size = 36 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "10px",
        background: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
        border: "1px solid rgba(79, 156, 249, 0.35)",
        boxShadow: "0 0 20px rgba(79, 156, 249, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
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
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="monieGrad1" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="0.5" stopColor="#4F9CF9" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="monieGrad2" x1="6" y1="18" x2="18" y2="6" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A855F7" />
            <stop offset="1" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
        {/* Dynamic interconnected dual nodes */}
        <path
          d="M4 17L8.5 7.5L12 14.5L15.5 7.5L20 17"
          stroke="url(#monieGrad1)"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="8.5" cy="7.5" r="1.5" fill="#38BDF8" />
        <circle cx="15.5" cy="7.5" r="1.5" fill="#38BDF8" />
        <circle cx="12" cy="14.5" r="1.75" fill="url(#monieGrad2)" />
      </svg>
    </div>
  );
}

// ── 2. Modern Navigation Glyphs ──────────────────────────────────
export const ModernNavIcons = {
  Home: ({ size = 18, color = "currentColor", strokeWidth = 2 }: { size?: number; color?: string; strokeWidth?: number }) => (
    <Compass size={size} color={color} strokeWidth={strokeWidth} />
  ),
  Activity: ({ size = 18, color = "currentColor", strokeWidth = 2 }: { size?: number; color?: string; strokeWidth?: number }) => (
    <ArrowLeftRight size={size} color={color} strokeWidth={strokeWidth} />
  ),
  Insights: ({ size = 18, color = "currentColor", strokeWidth = 2 }: { size?: number; color?: string; strokeWidth?: number }) => (
    <BrainCircuit size={size} color={color} strokeWidth={strokeWidth} />
  ),
  Accounts: ({ size = 18, color = "currentColor", strokeWidth = 2 }: { size?: number; color?: string; strokeWidth?: number }) => (
    <WalletCards size={size} color={color} strokeWidth={strokeWidth} />
  ),
  Profile: ({ size = 18, color = "currentColor", strokeWidth = 2 }: { size?: number; color?: string; strokeWidth?: number }) => (
    <SlidersHorizontal size={size} color={color} strokeWidth={strokeWidth} />
  ),
};

// ── 3. Intelligent Merchant & Category Icon Resolver ─────────────
export interface CategoryIconMeta {
  Icon: LucideIcon;
  bg: string;
  color: string;
}

export function getCategoryIconMeta(
  categoryName?: string | null,
  merchantName?: string | null,
  isIncome = false,
  isTransfer = false
): CategoryIconMeta {
  if (isTransfer) {
    return {
      Icon: ArrowLeftRight,
      bg: "rgba(168, 85, 247, 0.15)",
      color: "#C084FC",
    };
  }

  if (isIncome) {
    return {
      Icon: TrendingUp,
      bg: "rgba(52, 211, 153, 0.15)",
      color: "var(--positive)",
    };
  }

  const text = `${categoryName || ""} ${merchantName || ""}`.toLowerCase();

  // Groceries & Supermarkets
  if (text.includes("grocer") || text.includes("shoprite") || text.includes("supermarket") || text.includes("market") || text.includes("spar")) {
    return {
      Icon: ShoppingBag,
      bg: "rgba(52, 211, 153, 0.14)",
      color: "#34D399",
    };
  }

  // Food & Dining / Delivery
  if (text.includes("food") || text.includes("dining") || text.includes("chowdeck") || text.includes("restaurant") || text.includes("cafe") || text.includes("kfc") || text.includes("burger") || text.includes("pizza") || text.includes("domino")) {
    return {
      Icon: UtensilsCrossed,
      bg: "rgba(245, 158, 11, 0.15)",
      color: "#FBBF24",
    };
  }

  // Transportation & Rideshare
  if (text.includes("transport") || text.includes("uber") || text.includes("bolt") || text.includes("ride") || text.includes("taxi") || text.includes("commute")) {
    return {
      Icon: Car,
      bg: "rgba(79, 156, 249, 0.15)",
      color: "#60A5FA",
    };
  }

  // Fuel & Energy
  if (text.includes("fuel") || text.includes("total") || text.includes("totalenergies") || text.includes("gas") || text.includes("petrol") || text.includes("shell") || text.includes("oando")) {
    return {
      Icon: Fuel,
      bg: "rgba(239, 68, 68, 0.14)",
      color: "#F87171",
    };
  }

  // Utilities & Electricity
  if (text.includes("utilit") || text.includes("ikeja") || text.includes("ikedc") || text.includes("ekedc") || text.includes("electric") || text.includes("power") || text.includes("water") || text.includes("waste")) {
    return {
      Icon: Zap,
      bg: "rgba(250, 204, 21, 0.15)",
      color: "#FACC15",
    };
  }

  // Music & Audio Streaming
  if (text.includes("spotify") || text.includes("music") || text.includes("deezer") || text.includes("audiomack") || text.includes("podcast")) {
    return {
      Icon: Music,
      bg: "rgba(29, 185, 84, 0.15)",
      color: "#1DB954",
    };
  }

  // Video Streaming & Entertainment
  if (text.includes("netflix") || text.includes("showmax") || text.includes("prime") || text.includes("dstv") || text.includes("cinema") || text.includes("movie") || text.includes("film")) {
    return {
      Icon: Tv,
      bg: "rgba(229, 9, 20, 0.15)",
      color: "#E50914",
    };
  }

  // Fiber, Internet & Telecom
  if (text.includes("fiber") || text.includes("broadband") || text.includes("wifi") || text.includes("internet")) {
    return {
      Icon: Wifi,
      bg: "rgba(245, 158, 11, 0.15)",
      color: "#F59E0B",
    };
  }

  // Telecom, Airtime & Mobile Data
  if (text.includes("airtime") || text.includes("data") || text.includes("mtn") || text.includes("airtel") || text.includes("glo") || text.includes("9mobile")) {
    return {
      Icon: Smartphone,
      bg: "rgba(251, 191, 36, 0.15)",
      color: "#F59E0B",
    };
  }

  // General Entertainment
  if (text.includes("entertain")) {
    return {
      Icon: Tv,
      bg: "rgba(236, 72, 153, 0.15)",
      color: "#F472B6",
    };
  }

  // Salary, Career & Payroll
  if (text.includes("salary") || text.includes("payroll") || text.includes("techcorp") || text.includes("wages") || text.includes("freelance") || text.includes("contract")) {
    return {
      Icon: Briefcase,
      bg: "rgba(52, 211, 153, 0.15)",
      color: "#10B981",
    };
  }

  // Savings & Investments
  if (text.includes("invest") || text.includes("savings") || text.includes("cowrywise") || text.includes("piggyvest") || text.includes("mutual fund") || text.includes("wealth") || text.includes("circle")) {
    return {
      Icon: PiggyBank,
      bg: "rgba(79, 156, 249, 0.15)",
      color: "#38BDF8",
    };
  }

  // Health & Medical
  if (text.includes("health") || text.includes("pharmacy") || text.includes("hospital") || text.includes("clinic") || text.includes("gym") || text.includes("fitness")) {
    return {
      Icon: HeartPulse,
      bg: "rgba(244, 63, 94, 0.15)",
      color: "#FB7185",
    };
  }

  // Shopping & Retail
  if (text.includes("shop") || text.includes("zara") || text.includes("amazon") || text.includes("jumia") || text.includes("konga") || text.includes("cloth")) {
    return {
      Icon: Package,
      bg: "rgba(168, 85, 247, 0.14)",
      color: "#C084FC",
    };
  }

  // Education & Courses
  if (text.includes("educat") || text.includes("school") || text.includes("course") || text.includes("tuition") || text.includes("udemy") || text.includes("coursera")) {
    return {
      Icon: GraduationCap,
      bg: "rgba(99, 102, 241, 0.15)",
      color: "#818CF8",
    };
  }

  // Travel & Flights
  if (text.includes("travel") || text.includes("flight") || text.includes("airline") || text.includes("hotel") || text.includes("booking") || text.includes("airbnb")) {
    return {
      Icon: Plane,
      bg: "rgba(14, 165, 233, 0.15)",
      color: "#38BDF8",
    };
  }

  // Default Fallback: Clean Receipt/Coins
  return {
    Icon: Receipt,
    bg: "rgba(255, 255, 255, 0.07)",
    color: "var(--text-secondary)",
  };
}

// ── 4. Neo-Tactile Modern Merchant Avatar Component ──────────────
interface ModernMerchantAvatarProps {
  categoryName?: string | null;
  merchantName?: string | null;
  transactionType?: string;
  isTransfer?: boolean;
  size?: number;
  showMicroBadge?: boolean;
}

export function ModernMerchantAvatar({
  categoryName,
  merchantName,
  transactionType = "EXPENSE",
  isTransfer = false,
  size = 38,
  showMicroBadge = true,
}: ModernMerchantAvatarProps) {
  const isIncome = transactionType === "INCOME" || transactionType === "REFUND";
  const { Icon, bg, color } = getCategoryIconMeta(categoryName, merchantName, isIncome, isTransfer);

  return (
    <div style={{ position: "relative", width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
      {/* Icon Capsule */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "11px",
          background: bg,
          border: `1px solid ${color}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
          boxShadow: `0 2px 8px ${color}15`,
        }}
      >
        <Icon size={Math.round(size * 0.48)} strokeWidth={2.2} />
      </div>

      {/* Directional Status Micro-Badge (optional) */}
      {showMicroBadge && (
        <div
          style={{
            position: "absolute",
            bottom: "-2px",
            right: "-2px",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-base)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.6)",
          }}
        >
          {isIncome ? (
            <ArrowUpRight size={9} color="var(--positive)" strokeWidth={2.5} />
          ) : isTransfer ? (
            <ArrowLeftRight size={8} color="#C084FC" strokeWidth={2.5} />
          ) : (
            <ArrowDownLeft size={9} color="var(--negative)" strokeWidth={2.5} />
          )}
        </div>
      )}
    </div>
  );
}

// ── 5. Modern Neo-Tactile Bank Institution Avatar ────────────────
interface BankInstitutionAvatarProps {
  name?: string;
  shortName?: string;
  primaryColor?: string;
  size?: number;
}

export function BankInstitutionAvatar({
  name,
  shortName,
  primaryColor,
  size = 46,
}: BankInstitutionAvatarProps) {
  const label = `${shortName || ""} ${name || ""}`.toLowerCase();

  let bgGradient = "linear-gradient(135deg, rgba(79, 156, 249, 0.22) 0%, rgba(37, 99, 235, 0.1) 100%)";
  let border = "rgba(79, 156, 249, 0.35)";
  let textColor = "#60A5FA";
  let acronym = "BK";

  if (label.includes("gtb") || label.includes("guaranty")) {
    bgGradient = "linear-gradient(135deg, rgba(234, 88, 12, 0.28) 0%, rgba(249, 115, 22, 0.12) 100%)";
    border = "rgba(249, 115, 22, 0.45)";
    textColor = "#FB923C";
    acronym = "GT";
  } else if (label.includes("stanbic")) {
    bgGradient = "linear-gradient(135deg, rgba(29, 78, 216, 0.28) 0%, rgba(59, 130, 246, 0.12) 100%)";
    border = "rgba(59, 130, 246, 0.45)";
    textColor = "#60A5FA";
    acronym = "SB";
  } else if (label.includes("zenith")) {
    bgGradient = "linear-gradient(135deg, rgba(220, 38, 38, 0.28) 0%, rgba(239, 68, 68, 0.12) 100%)";
    border = "rgba(239, 68, 68, 0.45)";
    textColor = "#F87171";
    acronym = "ZN";
  } else if (label.includes("kuda")) {
    bgGradient = "linear-gradient(135deg, rgba(124, 58, 237, 0.28) 0%, rgba(168, 85, 247, 0.12) 100%)";
    border = "rgba(168, 85, 247, 0.45)";
    textColor = "#C084FC";
    acronym = "KD";
  } else if (label.includes("access")) {
    bgGradient = "linear-gradient(135deg, rgba(217, 119, 6, 0.28) 0%, rgba(245, 158, 11, 0.12) 100%)";
    border = "rgba(245, 158, 11, 0.45)";
    textColor = "#FBBF24";
    acronym = "AC";
  } else if (label.includes("moniepoint")) {
    bgGradient = "linear-gradient(135deg, rgba(2, 132, 199, 0.28) 0%, rgba(56, 189, 248, 0.12) 100%)";
    border = "rgba(56, 189, 248, 0.45)";
    textColor = "#38BDF8";
    acronym = "MP";
  } else if (label.includes("opay")) {
    bgGradient = "linear-gradient(135deg, rgba(5, 150, 105, 0.28) 0%, rgba(16, 185, 129, 0.12) 100%)";
    border = "rgba(16, 185, 129, 0.45)";
    textColor = "#34D399";
    acronym = "OP";
  } else if (label.includes("first")) {
    bgGradient = "linear-gradient(135deg, rgba(30, 58, 138, 0.35) 0%, rgba(245, 158, 11, 0.15) 100%)";
    border = "rgba(245, 158, 11, 0.45)";
    textColor = "#FBBF24";
    acronym = "FB";
  } else if (label.includes("uba")) {
    bgGradient = "linear-gradient(135deg, rgba(220, 38, 38, 0.28) 0%, rgba(185, 28, 28, 0.12) 100%)";
    border = "rgba(239, 68, 68, 0.45)";
    textColor = "#F87171";
    acronym = "UB";
  } else if (label.includes("fidelity")) {
    bgGradient = "linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%)";
    border = "rgba(16, 185, 129, 0.4)";
    textColor = "#34D399";
    acronym = "FD";
  }

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "12px",
        background: bgGradient,
        border: `1px solid ${border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
        boxShadow: `0 3px 10px rgba(0,0,0,0.35)`,
      }}
    >
      <span
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontWeight: 900,
          fontSize: `${Math.round(size * 0.35)}px`,
          color: textColor,
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        {acronym}
      </span>
      {/* Subtle indicator beacon */}
      <div
        style={{
          position: "absolute",
          top: "4px",
          right: "4px",
          width: "4px",
          height: "4px",
          borderRadius: "50%",
          background: textColor,
          boxShadow: `0 0 5px ${textColor}`,
        }}
      />
    </div>
  );
}

