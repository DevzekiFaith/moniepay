"use client";

// ─────────────────────────────────────────────────────────────────
// Monie Lite — Financial Accounts & Live Open Banking Connections
// Connect actual bank accounts through secure Open Banking providers
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { AppSidebar, AppBottomBar, AppMobileHeader } from "@/components/layout/AppNavigation";
import { formatNaira } from "@/lib/utils";
import { RecordActivityModal } from "@/components/dashboard/RecordActivityModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useNotification } from "@/context/NotificationContext";
import Link from "next/link";
import { BankInstitutionAvatar } from "@/components/ui/ModernIcons";
import {
  CreditCard,
  Building2,
  RefreshCw,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Loader2,
  Trash2,
  Sparkles,
  Layers,
  Activity,
  Bell,
  BellRing,
} from "lucide-react";

interface Account {
  id: string;
  name: string;
  accountType: string;
  currency: string;
  currentBalance: number;
  syncStatus: string;
  isPrimary: boolean;
  mask?: string;
  lastSyncedAt?: string | Date;
  institution: {
    id: string;
    name: string;
    shortName: string;
    primaryColor?: string;
    code?: string;
  };
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
  const { notify, error, warning } = useNotification();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null);
  
  // Connection Form State
  const [selectedInst, setSelectedInst] = useState<string>("inst_gtb");
  const [accountType, setAccountType] = useState<"SAVINGS" | "CHECKING" | "WALLET">("SAVINGS");
  const [accountName, setAccountName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [initialBalance, setInitialBalance] = useState<string>("350000");
  const [importInitialHistory, setImportInitialHistory] = useState<boolean>(true);
  const [monoAuthCode, setMonoAuthCode] = useState<string>("");
  const [connectMode, setConnectMode] = useState<"direct" | "mono">("direct");
  
  const [connectSuccess, setConnectSuccess] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Live Activity Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordTargetAccountId, setRecordTargetAccountId] = useState<string | undefined>(undefined);

  // Disconnect Confirmation Modal State
  const [confirmDisconnect, setConfirmDisconnect] = useState<{
    isOpen: boolean;
    accountId: string;
    accountName: string;
    isLoading: boolean;
  }>({
    isOpen: false,
    accountId: "",
    accountName: "",
    isLoading: false,
  });

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/accounts");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
        if (data.supportedInstitutions) {
          setInstitutions(data.supportedInstitutions);
        }
      }
    } catch (err) {
      console.error("Failed to load accounts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setConnectSuccess(null);
    setConnectError(null);

    // Basic NUBAN validation if direct mode
    if (connectMode === "direct" && accountNumber.trim().length > 0 && accountNumber.trim().length < 10) {
      const err = "NUBAN Account Number must be 10 digits.";
      setConnectError(err);
      error("Validation Error", err);
      setIsConnecting(false);
      return;
    }

    const parsedBalance = parseFloat(initialBalance.replace(/,/g, ""));

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionId: selectedInst,
          accountType,
          accountName: accountName.trim() || undefined,
          accountNumber: accountNumber.trim() || undefined,
          initialBalance: isNaN(parsedBalance) ? 0 : parsedBalance,
          authCode: connectMode === "mono" ? monoAuthCode.trim() : undefined,
          importInitialHistory,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const connectedName = data.account?.name || accountName || data.account?.institution?.name || "Account";
        setConnectSuccess(
          `Successfully connected ${data.account?.institution?.name || "account"} and ingested ${data.ingestedCount ?? 0} verified live transactions!`
        );
        notify(
          "Bank Account Connected",
          `Live Open Banking connection active for ${connectedName} with ${data.ingestedCount ?? 0} verified transactions.`,
          { type: "success", sendPush: true }
        );
        // Reset form inputs
        setAccountName("");
        setAccountNumber("");
        setInitialBalance("350000");
        setMonoAuthCode("");
        await loadAccounts();
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error || "Failed to connect live account via Open Banking.";
        setConnectError(errMsg);
        error("Connection Failed", errMsg);
      }
    } catch (err) {
      console.error("Connect error:", err);
      const errMsg = "Network error attempting to link account.";
      setConnectError(errMsg);
      error("Connection Error", errMsg);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncAccount = async (accountId: string, accountName?: string) => {
    setSyncingAccountId(accountId);
    try {
      const res = await fetch(`/api/accounts/${accountId}/sync`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        notify(
          "Ledger Synchronized",
          `${accountName || "Account"} refreshed with verified banking records.`,
          { type: "info" }
        );
        await loadAccounts();
      } else {
        error("Sync Failed", "Could not sync account with banking gateway.");
      }
    } catch (err) {
      console.error("Sync error:", err);
      error("Sync Error", "Network error during synchronization.");
    } finally {
      setSyncingAccountId(null);
    }
  };

  const handleDisconnectClick = (accountId: string, accountName: string) => {
    setConfirmDisconnect({
      isOpen: true,
      accountId,
      accountName,
      isLoading: false,
    });
  };

  const handleConfirmDisconnect = async () => {
    const { accountId, accountName } = confirmDisconnect;
    if (!accountId) return;
    setConfirmDisconnect((prev) => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch(`/api/accounts?accountId=${accountId}`, { method: "DELETE" });
      if (res.ok) {
        setConfirmDisconnect({ isOpen: false, accountId: "", accountName: "", isLoading: false });
        await loadAccounts();
        notify(
          "Account Disconnected",
          `Successfully disconnected ${accountName}. Real-time synchronization has been revoked.`,
          { type: "warning", sendPush: true }
        );
      } else {
        const errData = await res.json().catch(() => ({}));
        error("Disconnection Failed", errData.error || "Could not disconnect account.");
        setConfirmDisconnect((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (err) {
      console.error("Disconnect error:", err);
      error("Disconnection Error", "Network error while disconnecting account.");
      setConfirmDisconnect((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const totalNetWorth = accounts.reduce((acc, a) => acc + a.currentBalance, 0);
  const totalVerifiedTransactions = accounts.reduce((acc, a) => acc + (a._count?.transactions || 0), 0);

  return (
    <div className="app-shell" style={{ display: "flex", minHeight: "100dvh", background: "var(--bg-base)" }}>
      {/* Desktop Sidebar */}
      <div className="desktop-only">
        <AppSidebar />
      </div>

      {/* Main Container */}
      <div className="page-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Mobile Animated Header with Hamburger Menu */}
        <AppMobileHeader />

        {/* Top Header (Desktop Only) */}
        <header className="page-header desktop-only">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <h1 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              Accounts
            </h1>
            <span className="pill pill-positive" style={{ fontSize: "10px" }}>
              <span className="pulse-dot" style={{ background: "var(--positive)", width: "5px", height: "5px", borderRadius: "50%" }} />
              Live Feed
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <button
              onClick={() => {
                setRecordTargetAccountId(undefined);
                setIsRecordModalOpen(true);
              }}
              style={{
                height: "36px",
                padding: "0 14px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 700,
                background: "var(--accent)",
                color: "#FFFFFF",
                border: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(79, 156, 249, 0.3)",
              }}
            >
              <Plus size={14} />
              <span>Record Activity</span>
            </button>

            <button
              onClick={loadAccounts}
              className="neo-tactile-btn"
              title="Sync accounts"
              style={{
                height: "36px",
                padding: "0 12px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} color="var(--accent)" />
              <span>Sync</span>
            </button>

            <Link
              href="/profile"
              title="Profile & Settings"
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #38bdf8 0%, #1e40af 100%)",
                border: "1.5px solid rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 700,
                color: "#FFFFFF",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                textDecoration: "none",
              }}
            >
              A
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-body">

          {/* Header Net Worth Overview */}
          <div
            className="card animate-fade-up"
            style={{
              padding: "1.75rem",
              marginBottom: "2rem",
              background: "linear-gradient(135deg, #131d31 0%, #0d1527 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1.25rem",
            }}
          >
            <div>
              <span className="label">Total Connected Live Balance</span>
              <p className="figure" style={{ fontSize: "2.25rem", color: "#FFFFFF", fontWeight: 800, marginTop: "4px" }}>
                {formatNaira(totalNetWorth)}
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Live across {accounts.length} institution{accounts.length !== 1 ? "s" : ""} • {totalVerifiedTransactions} verified ledger transactions
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <div
                style={{
                  padding: "0.75rem 1.25rem",
                  borderRadius: "12px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-base)",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>Sync State</p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px", justifyContent: "center" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--positive)", display: "inline-block", boxShadow: "0 0 8px var(--positive)" }} />
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--positive)" }}>
                    Realtime Active
                  </p>
                </div>
              </div>

              <div
                style={{
                  padding: "0.75rem 1.25rem",
                  borderRadius: "12px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-base)",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>Open Banking Gateway</p>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent)", marginTop: "2px" }}>
                  Live Direct Link
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: "2rem",
              alignItems: "start",
            }}
          >
            {/* Left Column: Connected Accounts List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p className="label">Live Connected Accounts ({accounts.length})</p>
                <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                  Continuous Read-Only Sync
                </span>
              </div>

              {accounts.length === 0 && !isLoading && (
                <div
                  className="card"
                  style={{
                    padding: "2.5rem",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <Building2 size={36} color="var(--text-tertiary)" />
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                    No Financial Accounts Connected Yet
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "320px" }}>
                    Connect your real bank account using the form on the right to start tracking real-time money intelligence.
                  </p>
                </div>
              )}

              {accounts.map((acct) => (
                <div
                  key={acct.id}
                  className="card"
                  style={{
                    padding: "1.35rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.1rem",
                    transition: "border-color 0.15s ease",
                    borderLeft: `4px solid ${acct.institution.primaryColor || "var(--accent)"}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                      <BankInstitutionAvatar
                        name={acct.institution.name}
                        shortName={acct.institution.shortName}
                        primaryColor={acct.institution.primaryColor}
                        size={46}
                      />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <h3 style={{ fontSize: "15.5px", fontWeight: 800, color: "var(--text-primary)" }}>
                            {acct.name}
                          </h3>
                          {acct.isPrimary && (
                            <span
                              style={{
                                fontSize: "10px",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                background: "rgba(79, 156, 249, 0.2)",
                                color: "#93c5fd",
                                fontWeight: 700,
                              }}
                            >
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: "12.5px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                          {acct.institution.name} • {acct.accountType} • {acct.mask || "•••• 4821"}
                        </p>
                      </div>
                    </div>

                    <span className="pill pill-positive" style={{ fontSize: "10.5px" }}>
                      <span className="pulse-dot" style={{ background: "var(--positive)", width: "5px", height: "5px", borderRadius: "50%" }} />
                      LIVE ACTIVE
                    </span>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid var(--border-subtle)",
                      paddingTop: "0.875rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 600 }}>
                        Current Live Balance
                      </p>
                      <p className="figure" style={{ fontSize: "1.65rem", color: "var(--text-primary)", fontWeight: 800, marginTop: "2px" }}>
                        {formatNaira(acct.currentBalance)}
                      </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                        {acct._count?.transactions ?? 0} activities
                      </span>
                      {acct.lastSyncedAt && (
                        <p style={{ fontSize: "10.5px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                          Synced just now
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: "1px solid var(--border-subtle)",
                      paddingTop: "0.75rem",
                    }}
                  >
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => handleSyncAccount(acct.id, acct.name)}
                        disabled={syncingAccountId === acct.id}
                        className="neo-tactile-btn"
                        style={{
                          height: "32px",
                          padding: "0 10px",
                          borderRadius: "8px",
                          fontSize: "11.5px",
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <RefreshCw size={12} className={syncingAccountId === acct.id ? "animate-spin" : ""} color="var(--accent)" />
                        <span>{syncingAccountId === acct.id ? "Syncing…" : "Sync Bank"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRecordTargetAccountId(acct.id);
                          setIsRecordModalOpen(true);
                        }}
                        className="neo-tactile-btn"
                        style={{
                          height: "32px",
                          padding: "0 10px",
                          borderRadius: "8px",
                          fontSize: "11.5px",
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <Plus size={12} color="var(--positive)" />
                        <span>Log Activity</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDisconnectClick(acct.id, acct.name)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-tertiary)",
                        fontSize: "11.5px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 8px",
                      }}
                    >
                      <Trash2 size={12} />
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Connect New Financial Account */}
            <div className="card" style={{ padding: "1.75rem", background: "#0E1628", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <Plus size={18} color="var(--accent)" />
                <p className="label" style={{ color: "var(--accent)" }}>
                  Link Live Financial Institution
                </p>
              </div>

              <h2 style={{ fontSize: "19px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                Connect Live Bank Account
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.55, marginTop: "4px", marginBottom: "1.25rem" }}>
                Establish an automated, read-only Open Banking connection with your live bank. Real transactions are ingested into your ledger in real-time.
              </p>

              {connectSuccess && (
                <div
                  className="animate-fade-up"
                  style={{
                    padding: "0.875rem 1rem",
                    borderRadius: "10px",
                    background: "rgba(52, 211, 153, 0.15)",
                    border: "1px solid rgba(52, 211, 153, 0.35)",
                    color: "var(--positive)",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    marginBottom: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{connectSuccess}</span>
                </div>
              )}

              {connectError && (
                <div
                  className="animate-fade-up"
                  style={{
                    padding: "0.875rem 1rem",
                    borderRadius: "10px",
                    background: "rgba(244, 63, 94, 0.15)",
                    border: "1px solid rgba(244, 63, 94, 0.35)",
                    color: "var(--negative)",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    marginBottom: "1.25rem",
                  }}
                >
                  {connectError}
                </div>
              )}

              <form onSubmit={handleConnect}>
                {/* Institution Selector */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    1. Select Bank / Institution
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                      gap: "0.5rem",
                      maxHeight: "180px",
                      overflowY: "auto",
                      paddingRight: "4px",
                    }}
                  >
                    {institutions.map((inst) => {
                      const isSelected = selectedInst === inst.id;
                      return (
                        <div
                          key={inst.id}
                          onClick={() => setSelectedInst(inst.id)}
                          style={{
                            padding: "0.625rem 0.75rem",
                            borderRadius: "10px",
                            background: isSelected ? "rgba(79, 156, 249, 0.15)" : "var(--bg-elevated)",
                            border: isSelected ? "1.5px solid var(--accent)" : "1px solid var(--border-base)",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.625rem",
                          }}
                        >
                          <BankInstitutionAvatar
                            name={inst.name}
                            shortName={inst.shortName}
                            primaryColor={inst.primaryColor}
                            size={30}
                          />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ fontSize: "12.5px", fontWeight: 700, color: isSelected ? "var(--text-primary)" : "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {inst.shortName || inst.name}
                            </p>
                            <span style={{ fontSize: "10px", color: "var(--text-tertiary)", marginTop: "1px", display: "block" }}>
                              Code: {inst.code}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Connection Mode Selection */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    2. Link Verification Mode
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => setConnectMode("direct")}
                      style={{
                        padding: "0.625rem",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: connectMode === "direct" ? 700 : 500,
                        background: connectMode === "direct" ? "rgba(79, 156, 249, 0.15)" : "var(--bg-elevated)",
                        color: connectMode === "direct" ? "var(--accent)" : "var(--text-secondary)",
                        border: connectMode === "direct" ? "1.5px solid var(--accent)" : "1px solid var(--border-base)",
                        cursor: "pointer",
                      }}
                    >
                      Direct NUBAN Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setConnectMode("mono")}
                      style={{
                        padding: "0.625rem",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: connectMode === "mono" ? 700 : 500,
                        background: connectMode === "mono" ? "rgba(79, 156, 249, 0.15)" : "var(--bg-elevated)",
                        color: connectMode === "mono" ? "var(--accent)" : "var(--text-secondary)",
                        border: connectMode === "mono" ? "1.5px solid var(--accent)" : "1px solid var(--border-base)",
                        cursor: "pointer",
                      }}
                    >
                      Mono Open Banking API
                    </button>
                  </div>
                </div>

                {/* Account Details Inputs */}
                {connectMode === "direct" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "1.25rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "4px", fontWeight: 600 }}>
                        10-Digit NUBAN Account Number
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="e.g. 0123456789"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                        style={{
                          width: "100%",
                          height: "40px",
                          padding: "0 12px",
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-base)",
                          borderRadius: "8px",
                          color: "var(--text-primary)",
                          fontSize: "13.5px",
                          fontWeight: 600,
                          letterSpacing: "0.05em",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "4px", fontWeight: 600 }}>
                        Account Holder / Display Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Adewale Adeleke / Operations Current"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        style={{
                          width: "100%",
                          height: "40px",
                          padding: "0 12px",
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-base)",
                          borderRadius: "8px",
                          color: "var(--text-primary)",
                          fontSize: "13px",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "4px", fontWeight: 600 }}>
                        Current Live Balance (₦)
                      </label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", fontWeight: 700, color: "var(--text-tertiary)" }}>
                          ₦
                        </span>
                        <input
                          type="number"
                          min="0"
                          placeholder="350000"
                          value={initialBalance}
                          onChange={(e) => setInitialBalance(e.target.value)}
                          style={{
                            width: "100%",
                            height: "40px",
                            paddingLeft: "30px",
                            paddingRight: "12px",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-base)",
                            borderRadius: "8px",
                            color: "var(--text-primary)",
                            fontSize: "14px",
                            fontWeight: 700,
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{ display: "block", fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "4px", fontWeight: 600 }}>
                      Mono Connect Auth Token / Code
                    </label>
                    <input
                      type="text"
                      placeholder="code_live_..."
                      value={monoAuthCode}
                      onChange={(e) => setMonoAuthCode(e.target.value)}
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "0 12px",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-base)",
                        borderRadius: "8px",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        fontFamily: "monospace",
                        outline: "none",
                      }}
                    />
                    <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "4px" }}>
                      Obtained via Mono Connect Widget on mobile or web.
                    </p>
                  </div>
                )}

                {/* Account Type Selector */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    3. Account Classification
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {(["SAVINGS", "CHECKING", "WALLET"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAccountType(type)}
                        style={{
                          flex: 1,
                          padding: "0.55rem",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: accountType === type ? 700 : 500,
                          background: accountType === type ? "var(--bg-surface)" : "var(--bg-elevated)",
                          color: accountType === type ? "var(--accent)" : "var(--text-secondary)",
                          border: accountType === type ? "1px solid var(--accent)" : "1px solid var(--border-base)",
                          cursor: "pointer",
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Checkbox: Import Recent Verified Transactions */}
                <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    id="importTx"
                    checked={importInitialHistory}
                    onChange={(e) => setImportInitialHistory(e.target.checked)}
                    style={{ cursor: "pointer", accentColor: "var(--accent)" }}
                  />
                  <label htmlFor="importTx" style={{ fontSize: "12px", color: "var(--text-secondary)", cursor: "pointer" }}>
                    Ingest recent 30 days of verified banking activities immediately
                  </label>
                </div>

                {/* Authorize Button */}
                <button
                  type="submit"
                  disabled={isConnecting}
                  style={{
                    width: "100%",
                    height: "46px",
                    borderRadius: "12px",
                    background: "var(--accent)",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: 700,
                    border: "none",
                    cursor: isConnecting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    boxShadow: "0 4px 20px rgba(79, 156, 249, 0.35)",
                    transition: "opacity 0.15s ease",
                  }}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Connecting &amp; Ingesting Live Ledger…</span>
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      <span>Authorize Live Account Connection</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                <ShieldCheck size={13} color="var(--positive)" />
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                  Zero stored banking credentials • CBN Open Banking compliant
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Mobile Dock */}
      <div className="mobile-only">
        <AppBottomBar />
      </div>

      {/* Record Live Activity Modal */}
      <RecordActivityModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={loadAccounts}
        accounts={accounts}
        defaultAccountId={recordTargetAccountId}
      />

      {/* Neo-tactile Confirmation Dialog for Account Disconnection */}
      <ConfirmModal
        isOpen={confirmDisconnect.isOpen}
        title="Disconnect Financial Account"
        targetName={confirmDisconnect.accountName}
        message={`Are you sure you want to disconnect ${confirmDisconnect.accountName}? This will immediately revoke live Open Banking synchronization and archive local activity feeds.`}
        confirmLabel="Disconnect Account"
        cancelLabel="Keep Connected"
        isDanger={true}
        isLoading={confirmDisconnect.isLoading}
        onConfirm={handleConfirmDisconnect}
        onCancel={() => setConfirmDisconnect({ isOpen: false, accountId: "", accountName: "", isLoading: false })}
      />
    </div>
  );
}
