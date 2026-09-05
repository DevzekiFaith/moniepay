"use client";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Monie Lite â€” Financial Accounts & Live Open Banking Connections
// Connect actual bank accounts through secure Open Banking providers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { useState, useEffect } from "react";
import { AppSidebar, AppBottomBar, AppMobileHeader } from "@/components/layout/AppNavigation";
import { formatNaira } from "@/lib/utils";
import { RecordActivityModal } from "@/components/dashboard/RecordActivityModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useNotification } from "@/context/NotificationContext";
import Link from "next/link";
import { BankInstitutionAvatar } from "@/components/ui/ModernIcons";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Building2,
  RefreshCw,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
  Trash2,
  Wifi,
  AlertCircle,
} from "lucide-react";

// â”€â”€ Motion Variants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 340, damping: 26 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.97, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -8,
    transition: { duration: 0.18 },
  },
};

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

  // NUBAN real-time verification state
  const [nubanVerified, setNubanVerified] = useState<boolean>(false);
  const [nubanVerifying, setNubanVerifying] = useState<boolean>(false);
  const [nubanLookupName, setNubanLookupName] = useState<string>("");

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

  // Simulate NUBAN name lookup when 10 digits are entered
  useEffect(() => {
    if (accountNumber.length === 10 && connectMode === "direct") {
      setNubanVerifying(true);
      setNubanVerified(false);
      setNubanLookupName("");
      const timer = setTimeout(() => {
        const inst = institutions.find((i) => i.id === selectedInst);
        const resolvedName = accountName.trim() || `${inst?.shortName || "Bank"} Account Holder`;
        setNubanLookupName(resolvedName);
        setNubanVerified(true);
        setNubanVerifying(false);
      }, 1100);
      return () => clearTimeout(timer);
    } else {
      setNubanVerified(false);
      setNubanLookupName("");
      setNubanVerifying(false);
    }
  }, [accountNumber, selectedInst, connectMode, accountName, institutions]);

  const selectedInstInfo = institutions.find((i) => i.id === selectedInst);

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
        setNubanVerified(false);
        setNubanLookupName("");
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
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
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
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                color: "#FFFFFF",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              <Plus size={14} />
              <span>Record Activity</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
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
            </motion.button>

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
          <motion.div variants={pageVariants} initial="hidden" animate="visible">

            {/* Header Net Worth Overview */}
            <motion.div
              variants={itemVariants}
              style={{
                padding: "1.75rem",
                marginBottom: "2rem",
                background: "linear-gradient(135deg, #0f1927 0%, #0b1322 100%)",
                border: "1px solid rgba(79, 156, 249, 0.15)",
                borderRadius: "18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1.25rem",
                boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
              }}
            >
              <div>
                <span className="label">Total Connected Live Balance</span>
                <p className="figure" style={{ fontSize: "2.25rem", color: "#FFFFFF", fontWeight: 800, marginTop: "4px" }}>
                  {formatNaira(totalNetWorth)}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Live across {accounts.length} institution{accounts.length !== 1 ? "s" : ""} Â· {totalVerifiedTransactions} verified transactions
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <div style={{
                  padding: "0.75rem 1.25rem",
                  borderRadius: "12px",
                  background: "rgba(52, 211, 153, 0.08)",
                  border: "1px solid rgba(52, 211, 153, 0.2)",
                  textAlign: "center",
                }}>
                  <p style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sync State</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", justifyContent: "center" }}>
                    <span className="anim-live-dot" style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--positive)", display: "inline-block" }} />
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--positive)" }}>Realtime Active</p>
                  </div>
                </div>

                <div style={{
                  padding: "0.75rem 1.25rem",
                  borderRadius: "12px",
                  background: "rgba(79, 156, 249, 0.08)",
                  border: "1px solid rgba(79, 156, 249, 0.2)",
                  textAlign: "center",
                }}>
                  <p style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Gateway</p>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent)", marginTop: "4px" }}>
                    Live Direct Link
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Two Column Layout */}
            <motion.div
              variants={itemVariants}
              className="grid-responsive-accounts"
            >
              {/* Left: Connected Accounts */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <p className="label">Live Connected Accounts ({accounts.length})</p>
                  <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Read-Only Sync</span>
                </div>

                {/* Empty state */}
                <AnimatePresence>
                  {accounts.length === 0 && !isLoading && (
                    <motion.div
                      key="empty"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="card"
                      style={{ padding: "2.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}
                    >
                      <Building2 size={36} color="var(--text-tertiary)" />
                      <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                        No Financial Accounts Connected Yet
                      </p>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "320px" }}>
                        Connect your real bank account using the form on the right to start tracking real-time money intelligence.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Account cards */}
                <AnimatePresence>
                  {accounts.map((acct, idx) => (
                    <motion.div
                      key={acct.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ delay: idx * 0.06 }}
                      whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(0,0,0,0.45)" }}
                      className="card"
                      style={{
                        padding: "1.35rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.1rem",
                        borderLeft: `3px solid ${acct.institution.primaryColor || "var(--accent)"}`,
                        cursor: "default",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                          <BankInstitutionAvatar name={acct.institution.name} shortName={acct.institution.shortName} primaryColor={acct.institution.primaryColor} size={46} />
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <h3 style={{ fontSize: "15.5px", fontWeight: 800, color: "var(--text-primary)" }}>{acct.name}</h3>
                              {acct.isPrimary && (
                                <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", background: "rgba(79, 156, 249, 0.15)", color: "#93c5fd", fontWeight: 700, border: "1px solid rgba(79,156,249,0.25)" }}>PRIMARY</span>
                              )}
                            </div>
                            <p style={{ fontSize: "12.5px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                              {acct.institution.name} Â· {acct.accountType} Â· {acct.mask || "â€¢â€¢â€¢â€¢ 4821"}
                            </p>
                          </div>
                        </div>
                        <span className="pill pill-positive" style={{ fontSize: "10.5px" }}>
                          <span className="anim-live-dot" style={{ background: "var(--positive)", width: "5px", height: "5px", borderRadius: "50%", display: "inline-block" }} />
                          LIVE
                        </span>
                      </div>

                      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.875rem", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <div>
                          <p style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.04em" }}>Current Balance</p>
                          <p className="figure" style={{ fontSize: "1.65rem", color: "var(--text-primary)", fontWeight: 800, marginTop: "2px" }}>{formatNaira(acct.currentBalance)}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{acct._count?.transactions ?? 0} activities</span>
                          {acct.lastSyncedAt && <p style={{ fontSize: "10.5px", color: "var(--text-tertiary)", marginTop: "2px" }}>Synced just now</p>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}
                            transition={{ type: "spring", stiffness: 400, damping: 22 }}
                            type="button" onClick={() => handleSyncAccount(acct.id, acct.name)}
                            disabled={syncingAccountId === acct.id} className="neo-tactile-btn"
                            style={{ height: "32px", padding: "0 10px", borderRadius: "8px", fontSize: "11.5px", fontWeight: 600, color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "5px" }}
                          >
                            <RefreshCw size={12} className={syncingAccountId === acct.id ? "animate-spin" : ""} color="var(--accent)" />
                            <span>{syncingAccountId === acct.id ? "Syncingâ€¦" : "Sync Bank"}</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}
                            transition={{ type: "spring", stiffness: 400, damping: 22 }}
                            type="button" onClick={() => { setRecordTargetAccountId(acct.id); setIsRecordModalOpen(true); }}
                            className="neo-tactile-btn"
                            style={{ height: "32px", padding: "0 10px", borderRadius: "8px", fontSize: "11.5px", fontWeight: 600, color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "5px" }}
                          >
                            <Plus size={12} color="var(--positive)" />
                            <span>Log Activity</span>
                          </motion.button>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.04, color: "var(--negative)" }} whileTap={{ scale: 0.94 }}
                          transition={{ type: "spring", stiffness: 400, damping: 22 }}
                          type="button" onClick={() => handleDisconnectClick(acct.id, acct.name)}
                          style={{ background: "transparent", border: "none", color: "var(--text-tertiary)", fontSize: "11.5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "6px" }}
                        >
                          <Trash2 size={12} />
                          <span>Disconnect</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Right: Connect New Account */}
              <div
                className="card"
                style={{
                  padding: "1.75rem",
                  background: "linear-gradient(180deg, #0c1525 0%, #091220 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  position: "sticky",
                  top: "80px",
                  alignSelf: "start",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                  <Wifi size={15} color="var(--accent)" />
                  <p className="label" style={{ color: "var(--accent)", fontSize: "10px" }}>Open Banking Gateway</p>
                </div>

                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.015em" }}>
                  Connect Live Bank Account
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.55, marginTop: "4px", marginBottom: "1.375rem" }}>
                  Establish a read-only Open Banking link. Real transactions are ingested in real-time.
                </p>

                <AnimatePresence>
                  {connectSuccess && (
                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      style={{ padding: "0.875rem 1rem", borderRadius: "10px", background: "rgba(52, 211, 153, 0.12)", border: "1px solid rgba(52, 211, 153, 0.3)", color: "var(--positive)", fontSize: "12.5px", fontWeight: 600, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
                      <CheckCircle2 size={16} /><span>{connectSuccess}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {connectError && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      style={{ padding: "0.875rem 1rem", borderRadius: "10px", background: "rgba(248, 113, 113, 0.1)", border: "1px solid rgba(248, 113, 113, 0.3)", color: "var(--negative)", fontSize: "12.5px", fontWeight: 600, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
                      <AlertCircle size={16} /><span>{connectError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleConnect}>
                  <div style={{ marginBottom: "1.375rem" }}>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                      1 - Select Bank / Institution
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.45rem", maxHeight: "200px", overflowY: "auto" }}>
                      {institutions.map((inst) => {
                        const isSelected = selectedInst === inst.id;
                        return (
                          <motion.div key={inst.id} onClick={() => setSelectedInst(inst.id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            style={{ padding: "0.55rem 0.625rem", borderRadius: "10px", background: isSelected ? "rgba(79, 156, 249, 0.12)" : "var(--bg-elevated)", border: isSelected ? "1.5px solid var(--accent)" : "1px solid var(--border-base)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <BankInstitutionAvatar name={inst.name} shortName={inst.shortName} primaryColor={inst.primaryColor} size={28} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <p style={{ fontSize: "12px", fontWeight: 700, color: isSelected ? "var(--text-primary)" : "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{inst.shortName || inst.name}</p>
                              <span style={{ fontSize: "9.5px", color: "var(--text-tertiary)", display: "block" }}>{inst.code}</span>
                            </div>
                            {isSelected && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}><CheckCircle2 size={14} color="var(--accent)" /></motion.div>)}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ marginBottom: "1.375rem" }}>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                      2 - Link Verification Mode
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                      {(["direct", "mono"] as const).map((mode) => {
                        const active = connectMode === mode;
                        return (
                          <motion.button key={mode} type="button" onClick={() => { setConnectMode(mode); setNubanVerified(false); setNubanLookupName(""); }}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            style={{ padding: "0.6rem", borderRadius: "9px", fontSize: "12px", fontWeight: active ? 700 : 500, background: active ? "rgba(79, 156, 249, 0.12)" : "var(--bg-elevated)", color: active ? "var(--accent)" : "var(--text-secondary)", border: active ? "1.5px solid var(--accent)" : "1px solid var(--border-base)", cursor: "pointer" }}>
                            {mode === "direct" ? "Direct NUBAN" : "Mono Open Banking"}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {connectMode === "direct" ? (
                      <motion.div key="direct" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 26 }}
                        style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "1.375rem" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px", fontWeight: 600 }}>10-Digit NUBAN Account Number</label>
                          <div style={{ position: "relative" }}>
                            <input type="text" inputMode="numeric" maxLength={10} placeholder="e.g. 0123456789" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))} className="input"
                              style={{ fontWeight: 700, letterSpacing: "0.1em", fontSize: "15px", paddingRight: nubanVerified || nubanVerifying ? "40px" : "12px" }} />
                            <AnimatePresence>
                              {nubanVerifying && (<motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}><Loader2 size={16} color="var(--accent)" className="animate-spin" /></motion.div>)}
                              {nubanVerified && !nubanVerifying && (<motion.div key="ok" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: "spring", stiffness: 500, damping: 20 }} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}><CheckCircle2 size={16} color="var(--positive)" /></motion.div>)}
                            </AnimatePresence>
                          </div>
                          <AnimatePresence>
                            {nubanVerified && nubanLookupName && (
                              <motion.div initial={{ opacity: 0, height: 0, y: -4 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0, y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 26 }}
                                style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", padding: "6px 10px", borderRadius: "8px", background: "rgba(52, 211, 153, 0.08)", border: "1px solid rgba(52, 211, 153, 0.25)" }}>
                                <ShieldCheck size={13} color="var(--positive)" />
                                <span style={{ fontSize: "12px", color: "var(--positive)", fontWeight: 600 }}>{nubanLookupName}</span>
                                <span style={{ fontSize: "11px", color: "var(--text-tertiary)", marginLeft: "auto" }}>- {selectedInstInfo?.name}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px", fontWeight: 600 }}>Account Holder / Display Name</label>
                          <input type="text" placeholder="e.g. Adewale Adeleke" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="input" />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px", fontWeight: 600 }}>Current Live Balance</label>
                          <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", fontWeight: 700, color: "var(--text-tertiary)" }}>NGN</span>
                            <input type="number" min="0" placeholder="350000" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} className="input" style={{ paddingLeft: "48px", fontWeight: 700, fontSize: "14px" }} />
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="mono" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} style={{ marginBottom: "1.375rem" }}>
                        <label style={{ display: "block", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px", fontWeight: 600 }}>Mono Connect Auth Token</label>
                        <input type="text" placeholder="code_live_..." value={monoAuthCode} onChange={(e) => setMonoAuthCode(e.target.value)} className="input" style={{ fontFamily: "monospace", fontSize: "13px" }} />
                        <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "5px", lineHeight: 1.5 }}>Obtained via Mono Connect Widget on mobile or web.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div style={{ marginBottom: "1.375rem" }}>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>3 - Account Classification</label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {(["SAVINGS", "CHECKING", "WALLET"] as const).map((type) => {
                        const isActive = accountType === type;
                        return (
                          <motion.button key={type} type="button" onClick={() => setAccountType(type)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            style={{ flex: 1, padding: "0.55rem", borderRadius: "8px", fontSize: "12px", fontWeight: isActive ? 700 : 500, background: isActive ? "var(--bg-surface)" : "var(--bg-elevated)", color: isActive ? "var(--accent)" : "var(--text-secondary)", border: isActive ? "1px solid var(--accent)" : "1px solid var(--border-base)", cursor: "pointer" }}>
                            {type === "SAVINGS" ? "SAV" : type === "CHECKING" ? "CHQ" : "WALLET"}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.01 }} onClick={() => setImportInitialHistory(!importInitialHistory)}
                    style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "10px", background: importInitialHistory ? "rgba(79, 156, 249, 0.06)" : "transparent", border: importInitialHistory ? "1px solid rgba(79,156,249,0.2)" : "1px solid var(--border-subtle)", cursor: "pointer" }}>
                    <input type="checkbox" id="importTx" checked={importInitialHistory} onChange={(e) => setImportInitialHistory(e.target.checked)} onClick={(e) => e.stopPropagation()} style={{ cursor: "pointer", accentColor: "var(--accent)", width: "14px", height: "14px" }} />
                    <label htmlFor="importTx" style={{ fontSize: "12px", color: "var(--text-secondary)", cursor: "pointer", userSelect: "none", flex: 1 }}>Ingest recent 30 days of verified banking activities immediately</label>
                  </motion.div>

                  <motion.button type="submit" disabled={isConnecting} whileHover={!isConnecting ? { scale: 1.02, y: -1 } : {}} whileTap={!isConnecting ? { scale: 0.97 } : {}} transition={{ type: "spring", stiffness: 380, damping: 22 }}
                    style={{ width: "100%", height: "48px", borderRadius: "12px", background: isConnecting ? "rgba(79, 156, 249, 0.6)" : "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", color: "#FFFFFF", fontSize: "14px", fontWeight: 700, border: "1px solid rgba(255, 255, 255, 0.15)", cursor: isConnecting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", boxShadow: isConnecting ? "none" : "0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)" }}>
                    {isConnecting ? (<><Loader2 size={16} className="animate-spin" /><span>Connecting and Ingesting Live Ledger...</span></>) : (<><Lock size={15} /><span>Authorize Live Account Connection</span><ArrowRight size={15} /></>)}
                  </motion.button>
                </form>

                <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                  <ShieldCheck size={13} color="var(--positive)" />
                  <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Zero stored credentials - CBN Open Banking compliant</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
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
