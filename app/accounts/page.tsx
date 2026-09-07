"use client";

// ─────────────────────────────────────────────────────────────────
// AJO — Connected Financial Accounts
// Real-time Open Banking connections, provider authorization,
// automated balance sync, and zero manual balance entry.
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { AppSidebar, AppBottomBar, AppMobileHeader } from "@/components/layout/AppNavigation";
import { formatNaira } from "@/lib/utils";
import { useNotification } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { useRealtimeTransactions, dispatchRealtimeUpdate } from "@/hooks/useRealtimeTransactions";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  RefreshCw,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
  Trash2,
  AlertCircle,
  ExternalLink,
  X,
  Zap,
} from "lucide-react";
import Script from "next/script";

interface Account {
  id: string;
  name: string;
  accountType: string;
  currency: string;
  currentBalance: number;
  availableBalance?: number | null;
  syncStatus: string;
  isPrimary: boolean;
  mask?: string | null;
  lastSyncedAt?: string | Date | null;
  institution?: {
    id: string;
    name: string;
    shortName?: string | null;
    primaryColor?: string | null;
    code?: string | null;
  } | null;
  _count?: {
    transactions: number;
  };
}

interface Institution {
  id: string;
  name: string;
  shortName: string;
  code: string;
  country: string;
  primaryColor?: string;
  supportedAccountTypes: string[];
}

export default function AccountsPage() {
  const { user } = useAuth();
  const { notify, error, warning } = useNotification();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [providerName, setProviderName] = useState<string>("Open Banking");
  const [isLiveProvider, setIsLiveProvider] = useState<boolean>(false);

  // Connection Modal State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedInstId, setSelectedInstId] = useState<string>("inst_gtb");
  const [accountType, setAccountType] = useState<"SAVINGS" | "CHECKING" | "WALLET">("SAVINGS");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [importInitialHistory, setImportInitialHistory] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Disconnect Confirmation Modal
  const [disconnectingAccount, setDisconnectingAccount] = useState<Account | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Load Accounts
  const loadAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/accounts");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
        if (data.supportedInstitutions) {
          setInstitutions(data.supportedInstitutions);
        }
        if (data.providerName) setProviderName(data.providerName);
        if (typeof data.isLive === "boolean") setIsLiveProvider(data.isLive);
      }
    } catch (err) {
      console.error("Failed to load accounts:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Real-time updates subscription
  useRealtimeTransactions({
    userId: user?.id,
    onAccountChange: () => loadAccounts(),
    onTransactionChange: () => loadAccounts(),
  });

  // Calculate Net Worth from real accounts
  const totalBalance = accounts.reduce((acc, a) => acc + (a.currentBalance || 0), 0);

  // Launch Official Mono Connect Widget
  const handleOpenMonoWidget = () => {
    const monoKey = process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY;
    if (!monoKey) {
      setConnectError("Mono Public Key not configured. Please use Direct Link below.");
      return;
    }

    if (typeof window === "undefined" || !(window as any).Connect) {
      setConnectError("Mono Connect widget is loading. Please click again in 2 seconds.");
      return;
    }

    setConnectError(null);
    setIsConnecting(true);

    try {
      const monoInstance = new (window as any).Connect({
        key: monoKey,
        onSuccess: async ({ code }: { code: string }) => {
          try {
            const res = await fetch("/api/accounts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                authCode: code,
                institutionId: selectedInstId || "inst_opay",
                importInitialHistory: true,
              }),
            });

            const data = await res.json();
            if (!res.ok) {
              setConnectError(data.error || "Failed to complete Mono authorization exchange.");
              setIsConnecting(false);
              return;
            }

            notify(
              "Account Connected via Mono",
              `Successfully linked ${data.account?.name || "bank account"}. Synchronized ${data.ingestedCount || 0} transactions.`,
              { type: "success" }
            );

            setIsConnectModalOpen(false);
            dispatchRealtimeUpdate("account");
            loadAccounts();
          } catch {
            setConnectError("Network error while completing Mono connection.");
          } finally {
            setIsConnecting(false);
          }
        },
        onClose: () => {
          setIsConnecting(false);
        },
      });

      monoInstance.setup();
      monoInstance.open();
    } catch (err) {
      console.error("Mono Connect launch error:", err);
      setConnectError("Could not launch Mono Connect widget.");
      setIsConnecting(false);
    }
  };

  // Handle Secure Account Connection
  const handleConnectAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectError(null);
    setIsConnecting(true);

    try {
      const parsedBalance = initialBalance.trim() ? parseFloat(initialBalance.replace(/,/g, "")) : 0;
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionId: selectedInstId,
          accountType,
          accountName: accountName.trim() || undefined,
          accountNumber: accountNumber.trim() || undefined,
          initialBalance: isNaN(parsedBalance) ? 0 : parsedBalance,
          importInitialHistory,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setConnectError(data.error || "Failed to establish secure bank connection.");
        return;
      }

      notify(
        "Account Connected",
        `Successfully linked ${data.account?.name || "bank account"}. ${data.ingestedCount || 0} transactions synchronized.`,
        { type: "success" }
      );

      setIsConnectModalOpen(false);
      setAccountName("");
      setAccountNumber("");
      setInitialBalance("");
      setImportInitialHistory(false);
      dispatchRealtimeUpdate("account");
      loadAccounts();
    } catch {
      setConnectError("A network error occurred while connecting. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle Account Synchronization
  const handleSyncAccount = async (accountId: string) => {
    setIsSyncing(accountId);
    try {
      const res = await fetch(`/api/accounts/${accountId}/sync`, { method: "POST" });
      if (res.ok) {
        notify("Account Synchronized", "Your balance and latest transactions are up to date.", { type: "success" });
        dispatchRealtimeUpdate("transaction");
        loadAccounts();
      } else {
        warning("Sync Notice", "Unable to refresh latest provider records right now.");
      }
    } catch {
      error("Sync Error", "Network error while synchronizing with provider.");
    } finally {
      setIsSyncing(null);
    }
  };

  // Handle Account Disconnect
  const handleConfirmDisconnect = async () => {
    if (!disconnectingAccount) return;
    setIsDisconnecting(true);

    try {
      const res = await fetch(`/api/accounts?accountId=${disconnectingAccount.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        notify("Account Disconnected", "The account has been unlinked from AJO.", { type: "info" });
        dispatchRealtimeUpdate("account");
        setDisconnectingAccount(null);
        loadAccounts();
      } else {
        error("Disconnect Failed", "Could not unlink account. Please try again.");
      }
    } catch {
      error("Error", "Network error occurred.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="app-shell" style={{ display: "flex", minHeight: "100dvh", background: "#050505", color: "#EDEDED" }}>
      {/* Desktop Sidebar */}
      <div className="desktop-only">
        <AppSidebar />
      </div>

      {/* Main Page Area */}
      <div className="page-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AppMobileHeader />

        <main className="page-body" style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
          {/* Header Section */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "#71717A", textTransform: "uppercase" }}>
                Financial Institution Connections
              </span>
              <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.03em", color: "#FFFFFF", marginTop: "4px" }}>
                Connected Accounts
              </h1>
              <p style={{ fontSize: "13.5px", color: "#A1A1AA", marginTop: "4px" }}>
                Automated, read-only feeds. AJO receives transactions directly from your financial institutions.
              </p>
            </div>

            <button
              onClick={() => setIsConnectModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                background: "#FFFFFF",
                color: "#050505",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "opacity 0.15s ease",
              }}
            >
              <Plus size={15} />
              <span>Connect Account</span>
            </button>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "45vh", gap: "12px", color: "#71717A" }}>
              <Loader2 size={24} className="animate-spin" />
              <p style={{ fontSize: "13.5px" }}>Loading connected accounts…</p>
            </div>
          ) : accounts.length === 0 ? (
            /* ── ELEGANT EMPTY STATE (Section 27 of Specification) ── */
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "#0A0A0A",
                border: "1px dashed #27272A",
                borderRadius: "16px",
                padding: "4rem 2rem",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                maxWidth: "540px",
                margin: "2rem auto",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "#141414",
                  border: "1px solid #222222",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  color: "#FFFFFF",
                }}
              >
                <Building2 size={24} />
              </div>

              <h2 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", color: "#FFFFFF", marginBottom: "8px" }}>
                YOUR MONEY STORY STARTS HERE
              </h2>
              <p style={{ fontSize: "13.5px", color: "#A1A1AA", lineHeight: 1.6, maxWidth: "420px", marginBottom: "2rem" }}>
                Connect your first account and AJO will automatically understand your income, spending and financial activity without manual entry.
              </p>

              <button
                onClick={() => setIsConnectModalOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  background: "#FFFFFF",
                  color: "#050505",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Plus size={16} />
                <span>Connect Account</span>
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2rem", color: "#52525B", fontSize: "12px" }}>
                <ShieldCheck size={14} color="#10B981" />
                <span>Bank-grade, read-only 256-bit encrypted Open Banking</span>
              </div>
            </motion.div>
          ) : (
            /* ── CONNECTED ACCOUNTS LIST ── */
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Total Net Worth Card */}
              <div
                style={{
                  background: "#0D0D0D",
                  border: "1px solid #1A1A1A",
                  borderRadius: "12px",
                  padding: "1.5rem 1.75rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <span style={{ fontSize: "11.5px", fontWeight: 600, letterSpacing: "0.06em", color: "#71717A", textTransform: "uppercase" }}>
                    Combined Liquid Balance
                  </span>
                  <div style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#FFFFFF", marginTop: "4px" }}>
                    {formatNaira(totalBalance)}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "12px", color: "#A1A1AA" }}>{accounts.length} Active Feeds</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} />
                      <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 500 }}>Live Synchronized</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Cards Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 420px), 1fr))", gap: "1rem" }}>
                {accounts.map((acc) => {
                  const isThisSyncing = isSyncing === acc.id;

                  return (
                    <motion.div
                      key={acc.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: "#0D0D0D",
                        border: "1px solid #1A1A1A",
                        borderRadius: "12px",
                        padding: "1.25rem 1.5rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: "1.25rem",
                        transition: "border-color 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2A2A2A")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1A1A1A")}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "8px",
                              background: "#171717",
                              border: "1px solid #262626",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#FFFFFF",
                            }}
                          >
                            {acc.institution?.shortName?.[0] || acc.name[0] || "B"}
                          </div>
                          <div>
                            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.2 }}>
                              {acc.name}
                            </h3>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                              <span style={{ fontSize: "12px", color: "#71717A" }}>{acc.mask || "•••• 0000"}</span>
                              <span style={{ fontSize: "10px", color: "#52525B" }}>•</span>
                              <span style={{ fontSize: "11px", color: "#A1A1AA" }}>{acc.accountType}</span>
                            </div>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: "6px",
                            background: "rgba(16, 185, 129, 0.1)",
                            color: "#10B981",
                            border: "1px solid rgba(16, 185, 129, 0.2)",
                          }}
                        >
                          Connected
                        </span>
                      </div>

                      {/* Balance Row */}
                      <div>
                        <span style={{ fontSize: "11.5px", color: "#71717A", display: "block" }}>Available Balance</span>
                        <div style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.02em", color: "#FFFFFF", marginTop: "2px" }}>
                          {formatNaira(acc.currentBalance)}
                        </div>
                      </div>

                      {/* Footer Actions & Sync Info */}
                      <div
                        style={{
                          borderTop: "1px solid #171717",
                          paddingTop: "0.875rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "11px", color: "#52525B" }}>
                          {acc.lastSyncedAt
                            ? `Updated ${new Date(acc.lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                            : "Updated just now"}
                        </span>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <button
                            onClick={() => handleSyncAccount(acc.id)}
                            disabled={isThisSyncing}
                            title="Synchronize transactions"
                            style={{
                              padding: "6px 10px",
                              background: "#171717",
                              border: "1px solid #262626",
                              borderRadius: "6px",
                              color: "#A1A1AA",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "11.5px",
                              fontWeight: 500,
                            }}
                          >
                            <RefreshCw size={12} className={isThisSyncing ? "animate-spin" : ""} />
                            <span>{isThisSyncing ? "Syncing…" : "Sync"}</span>
                          </button>

                          <button
                            onClick={() => setDisconnectingAccount(acc)}
                            title="Disconnect account"
                            style={{
                              padding: "6px",
                              background: "transparent",
                              border: "1px solid transparent",
                              borderRadius: "6px",
                              color: "#71717A",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "#EF4444";
                              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "#71717A";
                              e.currentTarget.style.borderColor = "transparent";
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="mobile-only">
        <AppBottomBar />
      </div>

      {/* ── CONNECT ACCOUNT MODAL ── */}
      <AnimatePresence>
        {isConnectModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: "1rem",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              style={{
                width: "100%",
                maxWidth: "460px",
                background: "#0D0D0D",
                border: "1px solid #222222",
                borderRadius: "16px",
                padding: "2rem",
                position: "relative",
              }}
            >
              <button
                onClick={() => setIsConnectModalOpen(false)}
                style={{
                  position: "absolute",
                  top: "1.25rem",
                  right: "1.25rem",
                  background: "transparent",
                  border: "none",
                  color: "#71717A",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "#171717",
                    border: "1px solid #262626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                  }}
                >
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#FFFFFF" }}>Link Financial Account</h3>
                  <p style={{ fontSize: "12px", color: "#71717A" }}>Secure read-only Open Banking connection</p>
                </div>
              </div>

              {connectError && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    borderRadius: "8px",
                    marginBottom: "1.25rem",
                    fontSize: "12.5px",
                    color: "#FCA5A5",
                  }}
                >
                  {connectError}
                </div>
              )}

              {/* Mono Connect Direct Launch Action */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(0, 85, 254, 0.12), rgba(20, 192, 134, 0.08))",
                  border: "1px solid rgba(0, 85, 254, 0.3)",
                  borderRadius: "12px",
                  padding: "1rem",
                  marginBottom: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ShieldCheck size={16} color="#0055FE" />
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#FFFFFF" }}>Live Open Banking (Mono)</span>
                  </div>
                  <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "12px", background: "rgba(20, 192, 134, 0.15)", color: "#14C086", fontWeight: 600 }}>
                    OPay • GTB • Kuda
                  </span>
                </div>
                <p style={{ fontSize: "11.5px", color: "#A1A1AA", lineHeight: 1.4 }}>
                  Connect instantly via Mono's official secure authorization popup. Select OPay, authorize with SMS OTP, and sync your live balance & transactions.
                </p>
                <button
                  type="button"
                  onClick={handleOpenMonoWidget}
                  disabled={isConnecting}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "#0055FE",
                    color: "#FFFFFF",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    border: "none",
                    cursor: isConnecting ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(0, 85, 254, 0.35)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Zap size={14} />
                  {isConnecting ? "Connecting to Mono..." : "Launch Mono Connect (OPay, GTB, Kuda)"}
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" }}>
                <div style={{ flex: 1, height: "1px", background: "#1F1F1F" }} />
                <span style={{ fontSize: "11px", color: "#71717A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Or Direct Setup</span>
                <div style={{ flex: 1, height: "1px", background: "#1F1F1F" }} />
              </div>

              <form onSubmit={handleConnectAccount} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "8px" }}>
                    Select Institution
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "8px",
                      maxHeight: "180px",
                      overflowY: "auto",
                      padding: "4px",
                    }}
                  >
                    {institutions.slice(0, 12).map((inst) => {
                      const isSelected = selectedInstId === inst.id;
                      return (
                        <button
                          key={inst.id}
                          type="button"
                          onClick={() => setSelectedInstId(inst.id)}
                          style={{
                            padding: "10px 8px",
                            background: isSelected ? "#1F1F1F" : "#141414",
                            border: `1px solid ${isSelected ? "#FFFFFF" : "#222222"}`,
                            borderRadius: "8px",
                            color: isSelected ? "#FFFFFF" : "#A1A1AA",
                            fontSize: "12px",
                            fontWeight: isSelected ? 600 : 500,
                            cursor: "pointer",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {inst.shortName || inst.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "8px" }}>
                    Account Type
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    {(["SAVINGS", "CHECKING", "WALLET"] as const).map((type) => {
                      const isSelected = accountType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAccountType(type)}
                          style={{
                            padding: "8px",
                            background: isSelected ? "#1F1F1F" : "#141414",
                            border: `1px solid ${isSelected ? "#FFFFFF" : "#222222"}`,
                            borderRadius: "6px",
                            color: isSelected ? "#FFFFFF" : "#71717A",
                            fontSize: "12px",
                            fontWeight: isSelected ? 600 : 500,
                            cursor: "pointer",
                          }}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Account Nickname */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
                    Account Label <span style={{ color: "#52525B", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Salary Account or Daily Expenses"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      background: "#141414",
                      border: "1px solid #222222",
                      borderRadius: "8px",
                      color: "#FFFFFF",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Account Number & Real Balance */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
                      Account Number <span style={{ color: "#52525B", fontWeight: 400 }}>(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 0123456789"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        background: "#141414",
                        border: "1px solid #222222",
                        borderRadius: "8px",
                        color: "#FFFFFF",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
                      Current Balance (₦)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="e.g. 150000"
                      value={initialBalance}
                      onChange={(e) => setInitialBalance(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        background: "#141414",
                        border: "1px solid #222222",
                        borderRadius: "8px",
                        color: "#FFFFFF",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Clean Ledger Option */}
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", color: "#A1A1AA" }}>
                  <input
                    type="checkbox"
                    checked={!importInitialHistory}
                    onChange={(e) => setImportInitialHistory(!e.target.checked)}
                    style={{ accentColor: "#FFFFFF" }}
                  />
                  <span>Start clean with zero synthetic transactions (live mode)</span>
                </label>

                <div
                  style={{
                    background: "#141414",
                    border: "1px solid #1F1F1F",
                    borderRadius: "8px",
                    padding: "12px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <ShieldCheck size={16} color="#10B981" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <p style={{ fontSize: "11.5px", color: "#A1A1AA", lineHeight: 1.5, margin: 0 }}>
                    AJO uses read-only authorization. We never store banking credentials or execute transfers. Live balances and transactions are automatically retrieved.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isConnecting}
                  style={{
                    marginTop: "0.5rem",
                    padding: "12px",
                    background: "#FFFFFF",
                    color: "#050505",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: isConnecting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Authorizing with {providerName}…</span>
                    </>
                  ) : (
                    <>
                      <span>Establish Connection</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DISCONNECT CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {disconnectingAccount && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: "1rem",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              style={{
                width: "100%",
                maxWidth: "380px",
                background: "#0D0D0D",
                border: "1px solid #222222",
                borderRadius: "16px",
                padding: "1.75rem",
                textAlign: "center",
              }}
            >
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#FFFFFF", marginBottom: "8px" }}>
                Disconnect {disconnectingAccount.name}?
              </h3>
              <p style={{ fontSize: "13px", color: "#A1A1AA", lineHeight: 1.5, marginBottom: "1.5rem" }}>
                This will unlink the account and pause automated transaction synchronization for this feed.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setDisconnectingAccount(null)}
                  disabled={isDisconnecting}
                  style={{
                    padding: "10px",
                    background: "#171717",
                    border: "1px solid #262626",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDisconnect}
                  disabled={isDisconnecting}
                  style={{
                    padding: "10px",
                    background: "#EF4444",
                    border: "none",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: isDisconnecting ? "not-allowed" : "pointer",
                  }}
                >
                  {isDisconnecting ? "Unlinking…" : "Disconnect"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Script src="https://connect.withmono.com/connect.js" strategy="lazyOnload" />
    </div>
  );
}
