"use client";

// ─────────────────────────────────────────────────────────────────
// AppNavigation — MoniePay Responsive Navigation Architecture
// Desktop Sidebar + Modern Animated Hamburger Drawer + Mobile Dock
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoniePayLogo } from "@/components/ui/MoniePayLogo";
import { useAuth } from "@/context/AuthContext";
import { LogoutModal } from "@/components/ui/LogoutModal";
import {
  Compass,
  ArrowLeftRight,
  BrainCircuit,
  WalletCards,
  SlidersHorizontal,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const NAV_ITEMS = [
  { label: "Home",      href: "/",         icon: Compass           },
  { label: "Activity",  href: "/activity",  icon: ArrowLeftRight    },
  { label: "Insights",  href: "/insights",  icon: BrainCircuit      },
  { label: "Accounts",  href: "/accounts",  icon: WalletCards       },
  { label: "Profile",   href: "/profile",   icon: SlidersHorizontal },
];

// ── Animated Hamburger Button Component ──────────────────────────
export function AnimatedHamburgerButton({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onClick={onClick}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      style={{
        width: "42px",
        height: "42px",
        borderRadius: "12px",
        background: isOpen ? "rgba(79, 156, 249, 0.14)" : "var(--bg-elevated)",
        border: `1px solid ${isOpen ? "rgba(79, 156, 249, 0.35)" : "var(--border-base)"}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        cursor: "pointer",
        padding: 0,
        position: "relative",
        transition: "background 0.2s ease, border-color 0.2s ease",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* Top line */}
      <span
        style={{
          width: "19px",
          height: "2px",
          background: isOpen ? "var(--accent)" : "var(--text-primary)",
          borderRadius: "2px",
          transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease",
          transformOrigin: "center",
          transform: isOpen ? "translateY(7px) rotate(45deg)" : "none",
        }}
      />
      {/* Middle line */}
      <span
        style={{
          width: "19px",
          height: "2px",
          background: isOpen ? "var(--accent)" : "var(--text-primary)",
          borderRadius: "2px",
          transition: "opacity 0.2s ease, transform 0.2s ease",
          opacity: isOpen ? 0 : 1,
          transform: isOpen ? "scaleX(0)" : "scaleX(1)",
        }}
      />
      {/* Bottom line */}
      <span
        style={{
          width: "19px",
          height: "2px",
          background: isOpen ? "var(--accent)" : "var(--text-primary)",
          borderRadius: "2px",
          transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease",
          transformOrigin: "center",
          transform: isOpen ? "translateY(-7px) rotate(-45deg)" : "none",
        }}
      />
    </motion.button>
  );
}

// ── Mobile Animated Navigation Header & Drawer ───────────────────
export function AppMobileHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Top Header Bar */}
      <header
        className="mobile-only"
        style={{
          height: "58px",
          background: "rgba(12, 18, 32, 0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-base)",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1rem",
          position: "sticky",
          top: 0,
          zIndex: 45,
          width: "100%",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <MoniePayLogo size={32} showTagline={false} />
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <Link
            href="/profile"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)",
              border: "1.5px solid rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 700,
              color: "#FFFFFF",
              textDecoration: "none",
            }}
          >
            {user?.name ? user.name[0].toUpperCase() : "A"}
          </Link>

          {/* Animated Hamburger Trigger */}
          <AnimatedHamburgerButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
        </div>
      </header>

      {/* Animated Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(7, 11, 20, 0.75)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                zIndex: 55,
              }}
            />

            {/* Slide-Down Glassmorphic Drawer */}
            <motion.div
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{
                position: "fixed",
                top: "58px",
                left: "12px",
                right: "12px",
                maxWidth: "480px",
                margin: "0 auto",
                background: "rgba(15, 23, 42, 0.95)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "20px",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.85)",
                zIndex: 60,
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.1rem",
              }}
            >
              {/* User Identity Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid var(--border-base)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #38bdf8 0%, #1e40af 100%)",
                      border: "1.5px solid rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                  >
                    {user?.name ? user.name[0].toUpperCase() : "A"}
                  </div>
                  <div>
                    <p style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                      {user?.name || "Alex Chen"}
                    </p>
                    <p style={{ fontSize: "11.5px", color: "var(--text-tertiary)" }}>
                      {user?.email || "alex.chen@moniepay.app"}
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "3px 8px",
                    borderRadius: "99px",
                    background: "rgba(52, 211, 153, 0.12)",
                    border: "1px solid rgba(52, 211, 153, 0.25)",
                    fontSize: "10.5px",
                    color: "var(--positive)",
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: "var(--positive)",
                    }}
                  />
                  Live Sync
                </span>
              </div>

              {/* Navigation Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.href}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ x: 2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.75rem 1rem",
                          borderRadius: "12px",
                          fontSize: "14px",
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? "#FFFFFF" : "var(--text-secondary)",
                          background: isActive ? "rgba(79, 156, 249, 0.15)" : "transparent",
                          border: isActive ? "1px solid rgba(79, 156, 249, 0.3)" : "1px solid transparent",
                          textDecoration: "none",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                          <Icon
                            size={18}
                            color={isActive ? "var(--accent)" : "var(--text-secondary)"}
                            strokeWidth={isActive ? 2.3 : 1.8}
                          />
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight size={15} color="var(--text-tertiary)" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Drawer Bottom Actions: Sign Out */}
              <div style={{ borderTop: "1px solid var(--border-base)", paddingTop: "0.875rem" }}>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  onClick={() => {
                    setIsOpen(false);
                    setIsLogoutOpen(true);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.75rem",
                    borderRadius: "12px",
                    background: "rgba(37, 99, 235, 0.12)",
                    border: "1px solid rgba(79, 156, 249, 0.25)",
                    color: "var(--accent)",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out of MoniePay</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
            <MoniePayLogo size={36} showTagline={true} />
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

          {/* Monie AI Assistant Banner */}
          <div
            style={{
              marginTop: "1.25rem",
              padding: "0.875rem",
              borderRadius: "14px",
              background: "linear-gradient(135deg, rgba(124, 58, 237, 0.14) 0%, rgba(37, 99, 235, 0.08) 100%)",
              border: "1px solid rgba(124, 58, 237, 0.28)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={13} color="#A78BFA" />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#EDE9FE" }}>
                  Monie AI Copilot
                </span>
              </div>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  padding: "1px 5px",
                  borderRadius: "4px",
                  background: "rgba(52, 211, 153, 0.15)",
                  color: "var(--positive)",
                  border: "1px solid rgba(52, 211, 153, 0.3)",
                }}
              >
                LIVE
              </span>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-tertiary)", margin: 0, lineHeight: 1.45 }}>
              Ask anything about your money, food spending, or bills.
            </p>
          </div>
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
                  background: "linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "12px",
                  flexShrink: 0,
                }}
              >
                {user?.name ? user.name[0].toUpperCase() : "A"}
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
                  <span style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>Supabase Live</span>
                </div>
              </div>
            </Link>

            {/* Quick Logout Button */}
            <button
              type="button"
              onClick={() => setIsLogoutOpen(true)}
              title="Log out of MoniePay"
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
      className="mobile-only"
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
