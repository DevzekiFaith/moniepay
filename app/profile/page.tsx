"use client";

// ─────────────────────────────────────────────────────────────────
// AJO — Personal Money Intelligence
// User Profile, Security Architecture & Intelligence Configuration
// Minimalist, black, white, neutral. Zero rainbow gradients.
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import { AppSidebar, AppBottomBar, AppMobileHeader } from "@/components/layout/AppNavigation";
import { useNotification } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { LogoutModal } from "@/components/ui/LogoutModal";
import {
  ShieldCheck,
  Lock,
  Bell,
  BellRing,
  Sliders,
  CheckCircle2,
  Building2,
  SlidersHorizontal,
  LogOut,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const {
    notify,
    warning,
    requestPushPermission,
    pushPermission,
    isPushSupported,
  } = useNotification();

  const { user, logout } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  // Intelligence Preferences
  const [currency, setCurrency] = useState("NGN (₦)");
  const [anomalyDetection, setAnomalyDetection] = useState(true);
  const [autoCategorization, setAutoCategorization] = useState(true);
  const [excludeInternalTransfers, setExcludeInternalTransfers] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Notification Preferences
  const [notifyTransactions, setNotifyTransactions] = useState(true);
  const [notifySync, setNotifySync] = useState(true);
  const [notifyAnomaly, setNotifyAnomaly] = useState(true);
  const [notifySound, setNotifySound] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    notify("Preferences Saved", "Your money intelligence and notification settings have been updated.", {
      type: "success",
    });
    setTimeout(() => setSavedSuccess(false), 2200);
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

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100dvh",
        background: "#050505",
        color: "#EDEDED",
        fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
      }}
    >
      {/* Desktop Sidebar Navigation */}
      <div className="desktop-only">
        <AppSidebar />
      </div>

      {/* Main Container */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Mobile Header */}
        <AppMobileHeader />

        {/* Desktop Sticky Header */}
        <header
          className="desktop-only"
          style={{
            height: "64px",
            borderBottom: "1px solid #141414",
            background: "rgba(5, 5, 5, 0.8)",
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
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "#71717A", textTransform: "uppercase" }}>
              AJO
            </span>
            <span style={{ color: "#27272A" }}>/</span>
            <h1 style={{ fontSize: "15px", fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.01em" }}>
              Profile &amp; Settings
            </h1>
          </div>

          <button
            type="button"
            onClick={handleSave}
            style={{
              height: "36px",
              padding: "0 14px",
              borderRadius: "8px",
              fontSize: "12.5px",
              fontWeight: 600,
              color: savedSuccess ? "#10B981" : "#050505",
              background: savedSuccess ? "rgba(16, 185, 129, 0.12)" : "#FFFFFF",
              border: savedSuccess ? "1px solid rgba(16, 185, 129, 0.3)" : "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 size={13} color="#10B981" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </header>

        {/* Content Body */}
        <main
          className="page-body"
          style={{
            maxWidth: "1100px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          {/* Identity Header Card */}
          <div
            style={{
              background: "#0D0D0D",
              border: "1px solid #1F1F1F",
              borderRadius: "14px",
              padding: "1.75rem",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              {/* Minimalist Monochrome Avatar */}
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "12px",
                  background: "#141414",
                  border: "1px solid #27272A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  flexShrink: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                {user?.avatarLetter || (user?.name?.[0] || "M").toUpperCase()}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
                    {user?.name || "Verified Member"}
                  </h2>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: "rgba(16, 185, 129, 0.12)",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      color: "#34D399",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <ShieldCheck size={11} />
                    Verified Identity
                  </span>
                </div>
                <p style={{ fontSize: "12.5px", color: "#71717A", marginTop: "3px" }}>
                  {user?.email || "Connected Identity"} • AJO Personal Money Intelligence
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              {/* Mobile Save Button */}
              <button
                type="button"
                onClick={handleSave}
                className="mobile-only"
                style={{
                  height: "34px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: savedSuccess ? "#10B981" : "#050505",
                  background: savedSuccess ? "rgba(16, 185, 129, 0.12)" : "#FFFFFF",
                  border: savedSuccess ? "1px solid rgba(16, 185, 129, 0.3)" : "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                }}
              >
                {savedSuccess ? <CheckCircle2 size={13} color="#10B981" /> : null}
                <span>{savedSuccess ? "Saved!" : "Save"}</span>
              </button>

              <Link
                href="/accounts"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "#EDEDED",
                  background: "#141414",
                  border: "1px solid #27272A",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                <Building2 size={13} color="#A1A1AA" />
                <span>Connected Accounts</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsLogoutOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "#F87171",
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* 4-Section Settings Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
              gap: "1.5rem",
              alignItems: "start",
            }}
          >
            {/* 1. Money Intelligence Preferences */}
            <div
              style={{
                background: "#0D0D0D",
                border: "1px solid #1F1F1F",
                borderRadius: "14px",
                padding: "1.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
                <SlidersHorizontal size={15} color="#A1A1AA" />
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#71717A", textTransform: "uppercase" }}>
                  Intelligence Controls
                </span>
              </div>

              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#FFFFFF", marginBottom: "0.5rem" }}>
                Financial Behavioral Engine
              </h3>
              <p style={{ fontSize: "12.5px", color: "#71717A", lineHeight: 1.5, marginBottom: "1.25rem" }}>
                Controls how AJO interprets your transactions, normalizes merchants, and detects patterns.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {/* Operating Currency */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#A1A1AA", marginBottom: "6px", fontWeight: 500 }}>
                    Primary Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    style={{
                      width: "100%",
                      height: "38px",
                      padding: "0 0.75rem",
                      borderRadius: "8px",
                      background: "#141414",
                      border: "1px solid #27272A",
                      color: "#FFFFFF",
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

                {/* Auto Categorization Toggle */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#EDEDED" }}>
                      Merchant Cleaning &amp; Categorization
                    </p>
                    <p style={{ fontSize: "11.5px", color: "#71717A", marginTop: "2px" }}>
                      Normalizes raw descriptions (e.g. UBER *TRIP &rarr; Uber)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoCategorization(!autoCategorization)}
                    style={{
                      width: "40px",
                      height: "22px",
                      borderRadius: "99px",
                      background: autoCategorization ? "#EDEDED" : "#1F1F1F",
                      border: "1px solid #27272A",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: autoCategorization ? "20px" : "2px",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: autoCategorization ? "#050505" : "#71717A",
                        transition: "left 0.2s ease",
                      }}
                    />
                  </button>
                </div>

                {/* Anomaly Detection Toggle */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#EDEDED" }}>
                      Spending Spike &amp; Anomaly Alerts
                    </p>
                    <p style={{ fontSize: "11.5px", color: "#71717A", marginTop: "2px" }}>
                      Highlights category increases exceeding 30%
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnomalyDetection(!anomalyDetection)}
                    style={{
                      width: "40px",
                      height: "22px",
                      borderRadius: "99px",
                      background: anomalyDetection ? "#EDEDED" : "#1F1F1F",
                      border: "1px solid #27272A",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: anomalyDetection ? "20px" : "2px",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: anomalyDetection ? "#050505" : "#71717A",
                        transition: "left 0.2s ease",
                      }}
                    />
                  </button>
                </div>

                {/* Transfer Exclusion Toggle */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#EDEDED" }}>
                      Internal Transfer Reconciliation
                    </p>
                    <p style={{ fontSize: "11.5px", color: "#71717A", marginTop: "2px" }}>
                      Excludes inter-account transfers from spending calculations
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExcludeInternalTransfers(!excludeInternalTransfers)}
                    style={{
                      width: "40px",
                      height: "22px",
                      borderRadius: "99px",
                      background: excludeInternalTransfers ? "#EDEDED" : "#1F1F1F",
                      border: "1px solid #27272A",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: excludeInternalTransfers ? "20px" : "2px",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: excludeInternalTransfers ? "#050505" : "#71717A",
                        transition: "left 0.2s ease",
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Real-Time Push & Device Alerts */}
            <div
              style={{
                background: "#0D0D0D",
                border: "1px solid #1F1F1F",
                borderRadius: "14px",
                padding: "1.5rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <BellRing size={15} color="#A1A1AA" />
                  <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#71717A", textTransform: "uppercase" }}>
                    Device Alerts
                  </span>
                </div>

                {pushPermission === "granted" ? (
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: "rgba(16, 185, 129, 0.12)",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      color: "#34D399",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10B981" }} />
                    Active
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 500,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: "#141414",
                      border: "1px solid #27272A",
                      color: "#71717A",
                    }}
                  >
                    Off
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#FFFFFF", marginBottom: "0.5rem" }}>
                Push Notifications
              </h3>
              <p style={{ fontSize: "12.5px", color: "#71717A", lineHeight: 1.5, marginBottom: "1.25rem" }}>
                Real-time notifications whenever inflow arrives, transactions process, or accounts synchronize.
              </p>

              {/* Master Push Action Box */}
              <div
                style={{
                  padding: "0.875rem 1rem",
                  borderRadius: "10px",
                  background: "#141414",
                  border: "1px solid #27272A",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <p style={{ fontSize: "12.5px", fontWeight: 600, color: "#FFFFFF" }}>
                    Desktop &amp; Device Alerts
                  </p>
                  <p style={{ fontSize: "11px", color: "#71717A", marginTop: "2px" }}>
                    {pushPermission === "granted"
                      ? "Permission active on this browser"
                      : "Permission required for system notifications"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTogglePush}
                  style={{
                    height: "32px",
                    padding: "0 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    background: pushPermission === "granted" ? "rgba(16, 185, 129, 0.12)" : "#FFFFFF",
                    color: pushPermission === "granted" ? "#34D399" : "#050505",
                    border: pushPermission === "granted" ? "1px solid rgba(16, 185, 129, 0.3)" : "none",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                >
                  <Bell size={12} />
                  <span>{pushPermission === "granted" ? "Configured" : "Enable Alerts"}</span>
                </button>
              </div>

              {/* Granular Notification Channels */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#EDEDED" }}>
                      Transaction Activity
                    </p>
                    <p style={{ fontSize: "11.5px", color: "#71717A" }}>
                      Instant alert on credits and debits
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyTransactions(!notifyTransactions)}
                    style={{
                      width: "40px",
                      height: "22px",
                      borderRadius: "99px",
                      background: notifyTransactions ? "#EDEDED" : "#1F1F1F",
                      border: "1px solid #27272A",
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
                        background: notifyTransactions ? "#050505" : "#71717A",
                        transition: "left 0.2s ease",
                      }}
                    />
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#EDEDED" }}>
                      Account Feed Synchronization
                    </p>
                    <p style={{ fontSize: "11.5px", color: "#71717A" }}>
                      Notify when background sync finishes
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifySync(!notifySync)}
                    style={{
                      width: "40px",
                      height: "22px",
                      borderRadius: "99px",
                      background: notifySync ? "#EDEDED" : "#1F1F1F",
                      border: "1px solid #27272A",
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
                        background: notifySync ? "#050505" : "#71717A",
                        transition: "left 0.2s ease",
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Open Banking Security & Architecture */}
            <div
              style={{
                background: "#0D0D0D",
                border: "1px solid #1F1F1F",
                borderRadius: "14px",
                padding: "1.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
                <Lock size={15} color="#A1A1AA" />
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#71717A", textTransform: "uppercase" }}>
                  Security &amp; Privacy
                </span>
              </div>

              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#FFFFFF", marginBottom: "0.5rem" }}>
                Read-Only Open Banking Guarantee
              </h3>
              <p style={{ fontSize: "12.5px", color: "#71717A", lineHeight: 1.55, marginBottom: "1.25rem" }}>
                AJO operates strictly on read-only financial observation feeds. AJO never possesses payment, transfer, or withdrawal authority.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div
                  style={{
                    padding: "0.875rem 1rem",
                    borderRadius: "10px",
                    background: "#141414",
                    border: "1px solid #27272A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "12.5px", fontWeight: 600, color: "#FFFFFF" }}>
                      Zero Credential Storage
                    </p>
                    <p style={{ fontSize: "11px", color: "#71717A" }}>
                      Banking passwords and PINs are never handled or stored
                    </p>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#34D399" }}>
                    Guaranteed
                  </span>
                </div>

                <div
                  style={{
                    padding: "0.875rem 1rem",
                    borderRadius: "10px",
                    background: "#141414",
                    border: "1px solid #27272A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "12.5px", fontWeight: 600, color: "#FFFFFF" }}>
                      Row-Level Security (RLS)
                    </p>
                    <p style={{ fontSize: "11px", color: "#71717A" }}>
                      Strict database partitioning per authenticated user
                    </p>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#34D399" }}>
                    Enforced
                  </span>
                </div>

                <div
                  style={{
                    padding: "0.875rem 1rem",
                    borderRadius: "10px",
                    background: "#141414",
                    border: "1px solid #27272A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "12.5px", fontWeight: 600, color: "#FFFFFF" }}>
                      Deterministic SHA-256 Deduplication
                    </p>
                    <p style={{ fontSize: "11px", color: "#71717A" }}>
                      Fingerprinted hashes prevent double-counting
                    </p>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#34D399" }}>
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Active Session & Termination */}
            <div
              style={{
                background: "#0D0D0D",
                border: "1px solid #1F1F1F",
                borderRadius: "14px",
                padding: "1.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
                <ShieldCheck size={15} color="#A1A1AA" />
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#71717A", textTransform: "uppercase" }}>
                  Session State
                </span>
              </div>

              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#FFFFFF", marginBottom: "0.5rem" }}>
                Active Identity Session
              </h3>
              <p style={{ fontSize: "12.5px", color: "#71717A", lineHeight: 1.5, marginBottom: "1.25rem" }}>
                Signed in as <strong style={{ color: "#FFFFFF" }}>{user?.email || "member@ajo.app"}</strong>. Signing out terminates your local session and secures read-only token handshakes.
              </p>

              <div
                style={{
                  padding: "0.875rem 1rem",
                  borderRadius: "10px",
                  background: "#141414",
                  border: "1px solid #27272A",
                  marginBottom: "1.25rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11.5px", color: "#71717A" }}>Session ID</span>
                  <span style={{ fontSize: "11.5px", color: "#A1A1AA", fontFamily: "monospace" }}>
                    {user?.id ? `${user.id.slice(0, 12)}…` : "Active"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11.5px", color: "#71717A" }}>Status</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#34D399" }}>
                    Authenticated &amp; Verified
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLogoutOpen(true)}
                style={{
                  width: "100%",
                  height: "40px",
                  borderRadius: "8px",
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "#F87171",
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.16)";
                  e.currentTarget.style.borderColor = "#F87171";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                  e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.25)";
                }}
              >
                <LogOut size={14} />
                <span>Sign Out of AJO</span>
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

      {/* Mobile Bottom Bar */}
      <div className="mobile-only">
        <AppBottomBar />
      </div>
    </div>
  );
}
