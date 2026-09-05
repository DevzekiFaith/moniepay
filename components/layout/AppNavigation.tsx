"use client";

// ─────────────────────────────────────────────────────────────────
// AppNavigation — Premium Desktop Sidebar & Floating Neo-Tactile Mobile Dock
// Directly inspired by Reference UI navigation architecture
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AjoPayLogo } from "@/components/ui/AjoPayLogo";
import { useAuth } from "@/context/AuthContext";
import { LogoutModal } from "@/components/ui/LogoutModal";
import {
  Compass,
  ArrowLeftRight,
  BrainCircuit,
  WalletCards,
  SlidersHorizontal,
  LogOut,
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Home",      href: "/",         icon: Compass           },
  { label: "Activity",  href: "/activity",  icon: ArrowLeftRight    },
  { label: "Insights",  href: "/insights",  icon: BrainCircuit      },
  { label: "Accounts",  href: "/accounts",  icon: WalletCards       },
  { label: "Profile",   href: "/profile",   icon: SlidersHorizontal },
];

// ── Desktop Sidebar ───────────────────────────────────────────────
export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <>
      <aside
        style={{
          width: "230px",
          minHeight: "100dvh",
          borderRight: "1px solid var(--border-base)",
          background: "var(--bg-surface)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "1.75rem 1.125rem",
          position: "sticky",
          top: 0,
          flexShrink: 0,
          zIndex: 40,
        }}
      >
        {/* Brand mark */}
        <div>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              paddingLeft: "0.25rem",
              marginBottom: "2.25rem",
              textDecoration: "none",
            }}
          >
            <AjoPayLogo size={36} useImage={true} showTagline={true} />
          </Link>

          {/* Navigation links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {NAV_ITEMS.map((item) => {
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
                    padding: "0.625rem 0.875rem",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    background: isActive ? "rgba(79, 156, 249, 0.12)" : "transparent",
                    border: isActive ? "1px solid rgba(79, 156, 249, 0.2)" : "1px solid transparent",
                    transition: "all 0.15s ease",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "var(--bg-elevated)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Icon
                      size={16}
                      color={isActive ? "var(--accent)" : "var(--text-secondary)"}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <span
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "var(--accent)",
                        boxShadow: "0 0 8px var(--accent)",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Refined Minimalist Footer: User Identity & Quick Logout */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Link
              href="/profile"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.5rem 0.625rem",
                textDecoration: "none",
                borderRadius: "12px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-base)",
                transition: "all 0.15s ease",
                minWidth: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-strong)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-base)";
              }}
            >
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "12px",
                  flexShrink: 0,
                }}
              >
                {user?.avatarLetter || "A"}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.name || "Alex Chen"}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                  <span
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: "var(--positive)",
                      boxShadow: "0 0 6px var(--positive)",
                      display: "inline-block",
                    }}
                  />
                  <span style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>Live Sync</span>
                </div>
              </div>
            </Link>

            {/* Quick Logout Button */}
            <button
              type="button"
              onClick={() => setIsLogoutOpen(true)}
              title="Log out of AjoPay"
              style={{
                width: "36px",
                height: "44px",
                borderRadius: "10px",
                background: "rgba(244, 63, 94, 0.08)",
                border: "1px solid rgba(244, 63, 94, 0.2)",
                color: "var(--negative)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(244, 63, 94, 0.2)";
                e.currentTarget.style.borderColor = "var(--negative)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(244, 63, 94, 0.08)";
                e.currentTarget.style.borderColor = "rgba(244, 63, 94, 0.2)";
              }}
            >
              <LogOut size={15} />
            </button>
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

// ── Floating Neo-Tactile Mobile Dock ─────────────────────────────
export function AppBottomBar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: "max(12px, env(safe-area-inset-bottom, 12px))",
        left: "12px",
        right: "12px",
        maxWidth: "440px",
        margin: "0 auto",
        height: "58px",
        background: "rgba(13, 21, 38, 0.94)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "20px",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 50,
      }}
    >
      {NAV_ITEMS.map((item) => {
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
              gap: "3px",
              padding: "6px 10px",
              color: isActive ? "#FFFFFF" : "var(--text-tertiary)",
              textDecoration: "none",
              transition: "all 0.15s ease",
              position: "relative",
            }}
          >
            <Icon
              size={17}
              color={isActive ? "var(--accent)" : "var(--text-secondary)"}
              strokeWidth={isActive ? 2.3 : 1.7}
            />
            <span style={{ fontSize: "10px", fontWeight: isActive ? 700 : 500, letterSpacing: "0.01em" }}>
              {item.label}
            </span>

            {isActive && (
              <span
                style={{
                  position: "absolute",
                  bottom: "2px",
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  boxShadow: "0 0 6px var(--accent)",
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
