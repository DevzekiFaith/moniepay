"use client";

// ─────────────────────────────────────────────────────────────────
// AJO — Responsive Navigation Architecture
// Desktop Sidebar + Mobile Header + Mobile Dock
// Minimalist, black, white, neutral aesthetics.
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AjoLogo } from "@/components/ui/AjoLogo";
import { useAuth } from "@/context/AuthContext";
import { LogoutModal } from "@/components/ui/LogoutModal";
import {
  Home,
  ArrowLeftRight,
  BrainCircuit,
  Building2,
  SlidersHorizontal,
  LogOut,
  LogIn,
  User,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [
      { label: "Home", href: "/", icon: Home, description: "Balance & Money Story" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "Activity", href: "/activity", icon: ArrowLeftRight, description: "Financial Timeline" },
      { label: "Insights", href: "/insights", icon: BrainCircuit, description: "Pattern Explanations" },
      { label: "Accounts", href: "/accounts", icon: Building2, description: "Connected Bank Feeds" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { label: "Profile & Settings", href: "/profile", icon: SlidersHorizontal, description: "Security & Alerts" },
    ],
  },
];

// Flat list for mobile navigation
export const MOBILE_NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Activity", href: "/activity", icon: ArrowLeftRight },
  { label: "Insights", href: "/insights", icon: BrainCircuit },
  { label: "Accounts", href: "/accounts", icon: Building2 },
  { label: "Profile", href: "/profile", icon: User },
];

// ── Mobile Header ─────────────────────────────────────────────────
export function AppMobileHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <>
      <header
        className="mobile-only"
        style={{
          height: "56px",
          background: "rgba(8, 8, 8, 0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #171717",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.25rem",
          position: "sticky",
          top: 0,
          zIndex: 45,
          width: "100%",
          display: "flex",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <AjoLogo size={28} showTagline={false} />
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Link
                href="/profile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  background: "#141414",
                  border: "1px solid #222222",
                  color: "#EDEDED",
                  fontSize: "12px",
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "4px",
                    background: "#222222",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  {user.avatarLetter || "A"}
                </div>
                <span style={{ maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.name?.split(" ")[0] || "Profile"}
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setIsLogoutOpen(true)}
                style={{
                  background: "#141414",
                  border: "1px solid #222222",
                  borderRadius: "6px",
                  padding: "5px 7px",
                  color: "#71717A",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Sign out"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              style={{
                background: "#FFFFFF",
                color: "#050505",
                borderRadius: "6px",
                padding: "5px 12px",
                fontSize: "12px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={() => {
          setIsLogoutOpen(false);
          logout();
        }}
        userName={user?.name}
      />
    </>
  );
}

// ── Desktop Sidebar ───────────────────────────────────────────────
export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <>
      <aside
        style={{
          width: "256px",
          height: "100dvh",
          background: "#070707",
          borderRight: "1px solid #141414",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "1.5rem 1.125rem 1.25rem",
          position: "sticky",
          top: 0,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          {/* Brand Header */}
          <div style={{ paddingLeft: "6px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <AjoLogo size={32} showTagline={true} />
            </Link>

            {/* Read-Only Status Indicator */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "3px 8px",
                borderRadius: "6px",
                background: "#0F0F0F",
                border: "1px solid #1A1A1A",
                width: "fit-content",
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "#10B981",
                  boxShadow: "0 0 8px rgba(16, 185, 129, 0.6)",
                }}
              />
              <span style={{ fontSize: "10.5px", fontWeight: 500, color: "#71717A" }}>
                Read-Only Feed Active
              </span>
            </div>
          </div>

          {/* Grouped Navigation Sections */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* 1. Overview */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#52525B", paddingLeft: "10px", marginBottom: "4px" }}>
                Overview
              </span>
              <Link
                href="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: pathname === "/" ? 600 : 500,
                  color: pathname === "/" ? "#FFFFFF" : "#A1A1AA",
                  background: pathname === "/" ? "#141414" : "transparent",
                  border: pathname === "/" ? "1px solid #222222" : "1px solid transparent",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Home size={15} color={pathname === "/" ? "#FFFFFF" : "#71717A"} strokeWidth={pathname === "/" ? 2.2 : 1.8} />
                  <span>Home</span>
                </div>
                {pathname === "/" && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#FFFFFF" }} />}
              </Link>
            </div>

            {/* 2. Intelligence */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#52525B", paddingLeft: "10px", marginBottom: "4px" }}>
                Intelligence
              </span>
              {[
                { label: "Activity", href: "/activity", icon: ArrowLeftRight },
                { label: "Insights", href: "/insights", icon: BrainCircuit },
                { label: "Accounts", href: "/accounts", icon: Building2 },
              ].map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "#FFFFFF" : "#A1A1AA",
                      background: isActive ? "#141414" : "transparent",
                      border: isActive ? "1px solid #222222" : "1px solid transparent",
                      textDecoration: "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Icon size={15} color={isActive ? "#FFFFFF" : "#71717A"} strokeWidth={isActive ? 2.2 : 1.8} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#FFFFFF" }} />}
                  </Link>
                );
              })}
            </div>

            {/* 3. Profile Reference & Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#52525B", paddingLeft: "10px", marginBottom: "4px" }}>
                Profile &amp; Settings
              </span>

              {/* Profile Link Button */}
              <Link
                href="/profile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: pathname === "/profile" ? 600 : 500,
                  color: pathname === "/profile" ? "#FFFFFF" : "#A1A1AA",
                  background: pathname === "/profile" ? "#141414" : "transparent",
                  border: pathname === "/profile" ? "1px solid #222222" : "1px solid transparent",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <User size={15} color={pathname === "/profile" ? "#FFFFFF" : "#71717A"} strokeWidth={pathname === "/profile" ? 2.2 : 1.8} />
                  <span>Profile &amp; Preferences</span>
                </div>
                {pathname === "/profile" && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#FFFFFF" }} />}
              </Link>

              {/* Sign In & User Actions placed directly under Profile Reference */}
              {user ? (
                <div
                  style={{
                    marginTop: "4px",
                    background: "#0D0D0D",
                    border: "1px solid #1A1A1A",
                    borderRadius: "10px",
                    padding: "8px 10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <Link
                    href="/profile"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      minWidth: 0,
                      flex: 1,
                      textDecoration: "none",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "6px",
                        background: "#1C1C1E",
                        border: "1px solid #27272A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        fontWeight: 700,
                        fontSize: "11px",
                        flexShrink: 0,
                      }}
                    >
                      {user.avatarLetter || "A"}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#EDEDED",
                          lineHeight: 1.2,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {user.name || "Member"}
                      </p>
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#71717A",
                          display: "block",
                          marginTop: "1px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {user.email}
                      </span>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsLogoutOpen(true)}
                    title="Sign out of AJO"
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "6px",
                      background: "transparent",
                      border: "1px solid transparent",
                      color: "#71717A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <LogOut size={13} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  style={{
                    marginTop: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    background: "#FFFFFF",
                    color: "#050505",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "opacity 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <LogIn size={13} />
                  <span>Sign In to AJO</span>
                </Link>
              )}
            </div>
          </nav>
        </div>

        {/* Footer: Security Guarantee */}
        <div style={{ borderTop: "1px solid #141414", paddingTop: "0.875rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#52525B", fontSize: "11px", paddingLeft: "6px" }}>
            <ShieldCheck size={13} color="#10B981" />
            <span>256-Bit Read-Only Security</span>
          </div>
        </div>
      </aside>

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={() => {
          setIsLogoutOpen(false);
          logout();
        }}
        userName={user?.name}
      />
    </>
  );
}

// ── Mobile Bottom Bar ─────────────────────────────────────────────
export function AppBottomBar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: "max(12px, env(safe-area-inset-bottom, 12px))",
        left: "12px",
        right: "12px",
        maxWidth: "460px",
        margin: "0 auto",
        height: "54px",
        background: "rgba(10, 10, 10, 0.96)",
        backdropFilter: "blur(20px)",
        border: "1px solid #1F1F1F",
        borderRadius: "14px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 50,
      }}
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
              padding: "6px 10px",
              color: isActive ? "#FFFFFF" : "#71717A",
              textDecoration: "none",
              transition: "all 0.15s ease",
            }}
          >
            <Icon
              size={16}
              color={isActive ? "#FFFFFF" : "#71717A"}
              strokeWidth={isActive ? 2.2 : 1.8}
            />
            <span style={{ fontSize: "10px", fontWeight: isActive ? 700 : 500 }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
