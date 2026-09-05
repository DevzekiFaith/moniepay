"use client";

// ─────────────────────────────────────────────────────────────────
// Monie Lite — User Profile & Security Configuration
// Manage personal money preferences, push notifications & Open Banking consent
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import { AppSidebar, AppBottomBar } from "@/components/layout/AppNavigation";
import { useNotification } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { LogoutModal } from "@/components/ui/LogoutModal";
import {
  User,
  ShieldCheck,
  Lock,
  Key,
  Bell,
  BellRing,
  Sliders,
  CheckCircle2,
  ExternalLink,
  WalletCards,
  Building2,
  Database,
  Smartphone,
  Sparkles,
  Volume2,
  AlertTriangle,
  Send,
  LogOut,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const {
    notify,
    warning,
    success,
    requestPushPermission,
    pushPermission,
    isPushSupported,
  } = useNotification();

  const { user, logout } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const [currency, setCurrency] = useState("NGN (₦)");
  const [anomalyDetection, setAnomalyDetection] = useState(true);
  const [autoCategorization, setAutoCategorization] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Notification Preferences
  const [notifyTransactions, setNotifyTransactions] = useState(true);
  const [notifySync, setNotifySync] = useState(true);
  const [notifyAnomaly, setNotifyAnomaly] = useState(true);
  const [notifySound, setNotifySound] = useState(true);

  const handleSave = () => {
    setSavedSuccess(true);
    notify("Preferences Saved", "Your security and notification settings have been updated.", {
      type: "success",
    });
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTogglePush = async () => {
    if (!isPushSupported) {
      warning("Push Not Supported", "This browser does not support native desktop push notifications.");
      return;
    }

    if (pushPermission !== "granted") {
      const granted = await requestPushPermission();
      if (granted) {
        notify(
          "Push Notifications Enabled",
          "Real-time notifications are now active for live account updates and transactions.",
          { type: "push", sendPush: true }
        );
      } else {
        warning(
          "Permission Denied",
          "Push notifications are blocked in your browser settings. Please permit notifications to receive alerts."
        );
      }
    } else {
      notify(
        "Push Notifications Active",
        "Push notifications are already configured and delivering real-time updates.",
        { type: "push", sendPush: true }
      );
    }
  };

  const handleTestPush = () => {
    if (pushPermission === "granted") {
      notify(
        "🔔 Monie Lite Live Alert",
        "₦250,000 received from Techcorp Ltd • Stanbic IBTC",
        { type: "push", sendPush: true }
      );
    } else {
      notify(
        "🔔 Monie Lite In-App Alert",
        "Enable browser push notifications above to receive native alerts on your desktop.",
        { type: "info", sendPush: false }
      );
    }
  };

  return (
    <div className="app-shell" style={{ display: "flex", minHeight: "100dvh", background: "var(--bg-base)" }}>
      {/* Desktop Sidebar */}
      <div className="desktop-only">
        <AppSidebar />
      </div>

      {/* Main Container */}
      <div className="page-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Header */}
        <header
          style={{
            height: "64px",
            borderBottom: "1px solid var(--border-base)",
            background: "rgba(17, 24, 39, 0.75)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 2rem",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <h1 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              Profile &amp; Settings
            </h1>
            <span className="pill pill-positive" style={{ fontSize: "10px" }}>
              <ShieldCheck size={11} /> Verified Account
            </span>
          </div>

          <button
            onClick={handleSave}
            className="neo-tactile-btn"
            style={{
              height: "36px",
              padding: "0 14px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#FFFFFF",
              background: "var(--accent)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              border: "none",
              cursor: "pointer",
            }}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 size={13} />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </header>

        {/* Main Body */}
        <main
          className="page-body"
          style={{
            flex: 1,
            padding: "2rem 2.25rem 7rem",
            maxWidth: "1140px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          {/* User Identity Header Card */}
          <div
            className="card animate-fade-up"
            style={{
              padding: "1.75rem",
              marginBottom: "1.75rem",
              background: "linear-gradient(135deg, #131d31 0%, #0d1527 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
                  border: "2px solid rgba(255, 255, 255, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
                  flexShrink: 0,
                }}
              >
                {user?.avatarLetter || "A"}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h2 style={{ fontSize: "18.5px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                    {user?.name || "Alex Chen"}
                  </h2>
                  <span
                    style={{
                      fontSize: "10.5px",
                      padding: "2px 8px",
                      borderRadius: "99px",
                      background: "rgba(52, 211, 153, 0.15)",
                      color: "var(--positive)",
                      fontWeight: 600,
                    }}
                  >
                    {user?.plan || "PRO TIER"}
                  </span>
                </div>
                <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  {user?.email || "alex.chen@ajopay.app"} • AjoPay Member
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
              <Link
                href="/accounts"
                className="neo-tactile-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  textDecoration: "none",
                }}
              >
                <WalletCards size={14} color="var(--accent)" />
                <span>Manage Connected Banks</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsLogoutOpen(true)}
                className="neo-tactile-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--negative)",
                  background: "rgba(244, 63, 94, 0.08)",
                  border: "1px solid rgba(244, 63, 94, 0.25)",
                  cursor: "pointer",
                }}
              >
                <LogOut size={13} />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Settings Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "1.5rem",
              alignItems: "start",
            }}
          >
            {/* Card 1: Real-Time Push Notifications & Device Alerts */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "rgba(168, 85, 247, 0.15)",
                      color: "#C084FC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <BellRing size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                      Push Notifications
                    </h3>
                    <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                      Real-time desktop &amp; mobile alerts
                    </p>
                  </div>
                </div>

                {pushPermission === "granted" ? (
                  <span className="pill pill-positive" style={{ fontSize: "10px" }}>
                    <span className="pulse-dot" style={{ background: "var(--positive)", width: "5px", height: "5px", borderRadius: "50%" }} />
                    Active
                  </span>
                ) : pushPermission === "denied" ? (
                  <span className="pill pill-negative" style={{ fontSize: "10px" }}>
                    Blocked
                  </span>
                ) : (
                  <span className="pill pill-neutral" style={{ fontSize: "10px" }}>
                    Off
                  </span>
                )}
              </div>

              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: "1.25rem" }}>
                Deliver instant system notifications when incoming funds arrive, cards charge, or bank accounts synchronize.
              </p>

              {/* Master Push Action Box */}
              <div
                style={{
                  padding: "1rem",
                  borderRadius: "12px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-base)",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                    Browser Desktop Alerts
                  </p>
                  <p style={{ fontSize: "11.5px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                    {pushPermission === "granted"
                      ? "Push permission granted on this browser"
                      : pushPermission === "denied"
                      ? "Notifications blocked in browser settings"
                      : "Permission required to display desktop alerts"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTogglePush}
                  style={{
                    height: "34px",
                    padding: "0 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    background: pushPermission === "granted" ? "rgba(52, 211, 153, 0.15)" : "var(--accent)",
                    color: pushPermission === "granted" ? "var(--positive)" : "#FFFFFF",
                    border: pushPermission === "granted" ? "1px solid rgba(52, 211, 153, 0.3)" : "none",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    flexShrink: 0,
                  }}
                >
                  <Bell size={13} />
                  <span>{pushPermission === "granted" ? "Enabled" : "Enable Push"}</span>
                </button>
              </div>

              {/* Granular Notification Channels */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {/* 1. Transaction Alerts */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Live Transaction Alerts
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                      Real-time alert on inflow deposits and outflows
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyTransactions(!notifyTransactions)}
                    style={{
                      width: "40px",
                      height: "22px",
                      borderRadius: "99px",
                      background: notifyTransactions ? "var(--accent)" : "var(--bg-elevated)",
                      border: "1px solid var(--border-base)",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: notifyTransactions ? "20px" : "2px",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "#FFFFFF",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                        transition: "left 0.2s ease",
                      }}
                    />
                  </button>
                </div>

                {/* 2. Sync Alerts */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Open Banking Ledger Sync
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                      Notify when accounts finish background synchronization
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifySync(!notifySync)}
                    style={{
                      width: "40px",
                      height: "22px",
                      borderRadius: "99px",
                      background: notifySync ? "var(--accent)" : "var(--bg-elevated)",
                      border: "1px solid var(--border-base)",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: notifySync ? "20px" : "2px",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "#FFFFFF",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                        transition: "left 0.2s ease",
                      }}
                    />
                  </button>
                </div>

                {/* 3. Anomaly Alerts */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Spending Velocity &amp; Anomaly
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                      Instant alert on abnormal charges or spikes
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyAnomaly(!notifyAnomaly)}
                    style={{
                      width: "40px",
                      height: "22px",
                      borderRadius: "99px",
                      background: notifyAnomaly ? "var(--accent)" : "var(--bg-elevated)",
                      border: "1px solid var(--border-base)",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: notifyAnomaly ? "20px" : "2px",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "#FFFFFF",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                        transition: "left 0.2s ease",
                      }}
                    />
                  </button>
                </div>

                {/* 4. Acoustic Audio Feedback */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Tactile Audio Chime
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                      Play subtle synthesizer chime on alert
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifySound(!notifySound)}
                    style={{
                      width: "40px",
                      height: "22px",
                      borderRadius: "99px",
                      background: notifySound ? "var(--accent)" : "var(--bg-elevated)",
                      border: "1px solid var(--border-base)",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: notifySound ? "20px" : "2px",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "#FFFFFF",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                        transition: "left 0.2s ease",
                      }}
                    />
                  </button>
                </div>
              </div>

              {/* Test Alert Button */}
              <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
                <button
                  type="button"
                  onClick={handleTestPush}
                  className="neo-tactile-btn"
                  style={{
                    width: "100%",
                    height: "38px",
                    borderRadius: "10px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                >
                  <Send size={13} color="var(--accent)" />
                  <span>Send Test Push Notification</span>
                </button>
              </div>
            </div>

            {/* Card 2: Security & Open Banking Credentials */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.5rem" }}>
                <Lock size={16} color="var(--accent)" />
                <p className="label" style={{ color: "var(--accent)" }}>
                  Data Privacy &amp; Security Architecture
                </p>
              </div>

              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.75rem" }}>
                Zero Credential Storage Guarantee
              </h3>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                Monie Lite establishes tokenized read-only connections directly with licensed Open Banking providers. Your banking PINs, login passwords, and biometric credentials never touch our servers.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div
                  style={{
                    padding: "0.875rem 1rem",
                    borderRadius: "12px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-base)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Open Banking Token Sync
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                      OAuth2 256-bit automated refresh
                    </p>
                  </div>
                  <span className="pill pill-positive" style={{ fontSize: "10px" }}>
                    Active
                  </span>
                </div>

                <div
                  style={{
                    padding: "0.875rem 1rem",
                    borderRadius: "12px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-base)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Row-Level Security (RLS)
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                      Isolated PostgreSQL ledger partitions
                    </p>
                  </div>
                  <span className="pill pill-positive" style={{ fontSize: "10px" }}>
                    Enforced
                  </span>
                </div>

                <div
                  style={{
                    padding: "0.875rem 1rem",
                    borderRadius: "12px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-base)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Automatic Deduplication
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                      SHA-256 fingerprinting on raw feed
                    </p>
                  </div>
                  <span className="pill pill-positive" style={{ fontSize: "10px" }}>
                    Enabled
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Financial Intelligence Configuration */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.5rem" }}>
                <Sliders size={16} color="var(--accent)" />
                <p className="label" style={{ color: "var(--accent)" }}>
                  Intelligence &amp; Categorization
                </p>
              </div>

              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.75rem" }}>
                Engine Behavioral Preferences
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1rem" }}>
                {/* Currency selector */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: 600 }}>
                    Operating Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 0.875rem",
                      borderRadius: "10px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-base)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  >
                    <option value="NGN (₦)">NGN (₦) — Nigerian Naira</option>
                    <option value="USD ($)">USD ($) — US Dollar</option>
                    <option value="GBP (£)">GBP (£) — British Pound</option>
                    <option value="EUR (€)">EUR (€) — Euro</option>
                  </select>
                </div>

                {/* Toggle: Anomaly Detection */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Proactive Anomaly Alerts
                    </p>
                    <p style={{ fontSize: "11.5px", color: "var(--text-tertiary)" }}>
                      Notify if spending in any category spikes by &gt;30%
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnomalyDetection(!anomalyDetection)}
                    style={{
                      width: "44px",
                      height: "24px",
                      borderRadius: "99px",
                      background: anomalyDetection ? "var(--accent)" : "var(--bg-elevated)",
                      border: "1px solid var(--border-base)",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: anomalyDetection ? "22px" : "2px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: "#FFFFFF",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                        transition: "left 0.2s ease",
                      }}
                    />
                  </button>
                </div>

                {/* Toggle: Auto Categorization */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Automated Merchant Categorization
                    </p>
                    <p style={{ fontSize: "11.5px", color: "var(--text-tertiary)" }}>
                      Clean raw merchant text (e.g. UBER *TRIP &rarr; Uber)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoCategorization(!autoCategorization)}
                    style={{
                      width: "44px",
                      height: "24px",
                      borderRadius: "99px",
                      background: autoCategorization ? "var(--accent)" : "var(--bg-elevated)",
                      border: "1px solid var(--border-base)",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: autoCategorization ? "22px" : "2px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: "#FFFFFF",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                        transition: "left 0.2s ease",
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 4: Account Session & Secure Logout */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.5rem" }}>
                <LogOut size={16} color="var(--negative)" />
                <p className="label" style={{ color: "var(--negative)" }}>
                  Account Session &amp; Device
                </p>
              </div>

              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.75rem" }}>
                Active Login Session
              </h3>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                You are currently signed in as <strong style={{ color: "var(--text-primary)" }}>{user?.email || "alex.chen@ajopay.app"}</strong> on this browser. Logging out will close active real-time ledger tunnels.
              </p>

              <button
                type="button"
                onClick={() => setIsLogoutOpen(true)}
                style={{
                  width: "100%",
                  height: "44px",
                  borderRadius: "12px",
                  background: "rgba(244, 63, 94, 0.1)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  color: "var(--negative)",
                  fontSize: "13px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(244, 63, 94, 0.2)";
                  e.currentTarget.style.borderColor = "var(--negative)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(244, 63, 94, 0.1)";
                  e.currentTarget.style.borderColor = "rgba(244, 63, 94, 0.3)";
                }}
              >
                <LogOut size={15} />
                <span>Log Out of AjoPay</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={() => {
          setIsLogoutOpen(false);
          logout();
        }}
        userName={user?.name}
      />

      {/* Floating Mobile Dock */}
      <div className="mobile-only">
        <AppBottomBar />
      </div>
    </div>
  );
}
