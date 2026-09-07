"use client";

// ─────────────────────────────────────────────────────────────────
// AJO — Record Live Financial Activity Modal
// Allows direct manual recording and smart bank alert pasting.
// Every transaction is processed through the live Intelligence Engine.
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Loader2,
  FileText,
  Sparkles,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useNotification } from "@/context/NotificationContext";
import { dispatchRealtimeUpdate } from "@/hooks/useRealtimeTransactions";

interface AccountOption {
  id: string;
  name: string;
  accountType: string;
  currentBalance: number;
}

interface RecordActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialAccountId?: string;
}

export function RecordActivityModal({
  isOpen,
  onClose,
  onSuccess,
  initialAccountId,
}: RecordActivityModalProps) {
  const { notify, error: notifyError } = useNotification();

  const [tab, setTab] = useState<"direct" | "paste">("direct");
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(initialAccountId || "");
  const [type, setType] = useState<"EXPENSE" | "INCOME" | "TRANSFER">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pasteContent, setPasteContent] = useState("");
  const [parsedPreview, setParsedPreview] = useState<{
    amount: number;
    type: "EXPENSE" | "INCOME" | "TRANSFER";
    description: string;
  } | null>(null);

  // Load user accounts
  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => {
        const list = data.accounts || [];
        setAccounts(list);
        if (list.length > 0 && !selectedAccountId) {
          setSelectedAccountId(initialAccountId || list[0].id);
        }
      })
      .catch(() => {});
  }, [isOpen, initialAccountId, selectedAccountId]);

  // Parse pasted bank alert SMS/email text
  const handleParsePaste = (text: string) => {
    setPasteContent(text);
    if (!text.trim()) {
      setParsedPreview(null);
      return;
    }

    const lower = text.toLowerCase();
    const isCredit = lower.includes("credit") || lower.includes("inflow") || lower.includes("received");
    const isTransfer = lower.includes("transfer to") || lower.includes("tfr to");

    // Extract amount: match ₦, N, NGN, or pure numbers with commas
    const amountMatch = text.match(/(?:(?:ngn|n|₦)\s*)?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i);
    let parsedAmt = 0;
    if (amountMatch && amountMatch[1]) {
      parsedAmt = parseFloat(amountMatch[1].replace(/,/g, ""));
    }

    // Extract description / narration
    let desc = "Bank Activity";
    const descMatch = text.match(/(?:desc|narration|for|details|ref)[:\s-]+([^|\n\r]+)/i);
    if (descMatch && descMatch[1]) {
      desc = descMatch[1].trim();
    } else {
      // Fallback: take first 60 characters
      desc = text.slice(0, 60).replace(/[\n\r]/g, " ").trim();
    }

    const parsedType: "EXPENSE" | "INCOME" | "TRANSFER" = isTransfer
      ? "TRANSFER"
      : isCredit
      ? "INCOME"
      : "EXPENSE";

    setParsedPreview({
      amount: parsedAmt > 0 ? parsedAmt : 0,
      type: parsedType,
      description: desc || "Bank Transaction",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAccountId) {
      notifyError("No Account Selected", "Please connect or select an account first.");
      return;
    }

    let finalAmount = 0;
    let finalType = type;
    let finalDesc = description.trim();
    let finalMerchant = merchantName.trim();

    if (tab === "paste") {
      if (!parsedPreview || parsedPreview.amount <= 0) {
        notifyError("Invalid Paste", "Could not detect a valid amount from the pasted alert.");
        return;
      }
      finalAmount = parsedPreview.amount;
      finalType = parsedPreview.type;
      finalDesc = parsedPreview.description;
    } else {
      const parsed = parseFloat(amount.replace(/,/g, ""));
      if (isNaN(parsed) || parsed <= 0) {
        notifyError("Invalid Amount", "Please enter a valid amount greater than 0.");
        return;
      }
      if (!finalDesc) {
        notifyError("Missing Description", "Please provide a transaction description or narration.");
        return;
      }
      finalAmount = parsed;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: selectedAccountId,
          amount: finalAmount,
          type: finalType,
          description: finalDesc,
          merchantName: finalMerchant || undefined,
          date: date ? new Date(date).toISOString() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        notifyError("Failed to Record", data.error || "Could not save transaction.");
        return;
      }

      notify(
        "Live Activity Ingested",
        `Recorded ₦${finalAmount.toLocaleString("en-NG", { minimumFractionDigits: 2 })} • ${finalDesc}`,
        { type: "success" }
      );

      // Reset form
      setAmount("");
      setDescription("");
      setMerchantName("");
      setPasteContent("");
      setParsedPreview(null);

      dispatchRealtimeUpdate("transaction");
      dispatchRealtimeUpdate("account");

      if (onSuccess) onSuccess();
      onClose();
    } catch {
      notifyError("Network Error", "Unable to record transaction at this time.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.78)",
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
              maxWidth: "480px",
              background: "#0D0D0D",
              border: "1px solid #222222",
              borderRadius: "16px",
              padding: "1.75rem",
              position: "relative",
              color: "#EDEDED",
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
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

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" }}>
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
                <Plus size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#FFFFFF" }}>Record Financial Activity</h3>
                <p style={{ fontSize: "12px", color: "#71717A" }}>
                  Directly ingested into AJO Intelligence Engine
                </p>
              </div>
            </div>

            {/* Mode Switcher: Direct vs Paste Bank Alert */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                background: "#141414",
                padding: "3px",
                borderRadius: "8px",
                border: "1px solid #1F1F1F",
                marginBottom: "1.25rem",
              }}
            >
              <button
                type="button"
                onClick={() => setTab("direct")}
                style={{
                  padding: "7px 0",
                  fontSize: "12px",
                  fontWeight: tab === "direct" ? 600 : 500,
                  color: tab === "direct" ? "#FFFFFF" : "#71717A",
                  background: tab === "direct" ? "#222222" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <span>Direct Entry</span>
              </button>
              <button
                type="button"
                onClick={() => setTab("paste")}
                style={{
                  padding: "7px 0",
                  fontSize: "12px",
                  fontWeight: tab === "paste" ? 600 : 500,
                  color: tab === "paste" ? "#FFFFFF" : "#71717A",
                  background: tab === "paste" ? "#222222" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Sparkles size={13} color="#34D399" />
                <span>Paste Bank Alert</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Account Selector */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
                  Destination Account
                </label>
                {accounts.length === 0 ? (
                  <div
                    style={{
                      padding: "10px 12px",
                      background: "#141414",
                      border: "1px solid #222222",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      color: "#71717A",
                    }}
                  >
                    No account found. Please link an account in{" "}
                    <a href="/accounts" style={{ color: "#FFFFFF", textDecoration: "underline" }}>
                      Accounts
                    </a>{" "}
                    first.
                  </div>
                ) : (
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
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
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} • ₦{acc.currentBalance.toLocaleString()}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {tab === "direct" ? (
                <>
                  {/* Transaction Type */}
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
                      Activity Type
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                      {[
                        { label: "Expense", val: "EXPENSE", icon: ArrowUpRight, col: "#F87171" },
                        { label: "Income", val: "INCOME", icon: ArrowDownLeft, col: "#34D399" },
                        { label: "Transfer", val: "TRANSFER", icon: ArrowLeftRight, col: "#60A5FA" },
                      ].map((item) => {
                        const isSelected = type === item.val;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => setType(item.val as any)}
                            style={{
                              padding: "8px",
                              background: isSelected ? "#1F1F1F" : "#141414",
                              border: `1px solid ${isSelected ? "#FFFFFF" : "#222222"}`,
                              borderRadius: "6px",
                              color: isSelected ? "#FFFFFF" : "#71717A",
                              fontSize: "12px",
                              fontWeight: isSelected ? 600 : 500,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                            }}
                          >
                            <Icon size={13} color={item.col} />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Amount & Date */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
                        Amount (₦)
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="1"
                        placeholder="e.g. 15000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
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
                        Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 10px",
                          background: "#141414",
                          border: "1px solid #222222",
                          borderRadius: "8px",
                          color: "#FFFFFF",
                          fontSize: "12px",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* Description & Narration */}
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
                      Bank Narration / Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. POS/PURCHASE/SPAR LEKKI or SALARY CREDIT"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
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

                  {/* Optional Merchant Name */}
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
                      Merchant / Beneficiary <span style={{ color: "#52525B", fontWeight: 400 }}>(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SPAR Nigeria or TotalEnergies"
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
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
                </>
              ) : (
                /* Paste Bank Alert Mode */
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#A1A1AA", marginBottom: "6px" }}>
                    Paste Bank Alert SMS or Email Notification
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Paste bank notification here, e.g.:
Debit: N15,000.00
Acct: **1234
Desc: POS/WEB/CHOPCHOP DELI
Date: 07-Sep-2026"
                    value={pasteContent}
                    onChange={(e) => handleParsePaste(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "#141414",
                      border: "1px solid #222222",
                      borderRadius: "8px",
                      color: "#FFFFFF",
                      fontSize: "12.5px",
                      fontFamily: "monospace",
                      outline: "none",
                      resize: "vertical",
                    }}
                  />

                  {/* Parsed Live Preview */}
                  {parsedPreview && (
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "10px 12px",
                        background: "#18181B",
                        border: "1px solid #27272A",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ color: "#71717A", fontWeight: 600 }}>Detected Details:</span>
                        <span
                          style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: 700,
                            background: parsedPreview.type === "INCOME" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                            color: parsedPreview.type === "INCOME" ? "#34D399" : "#F87171",
                          }}
                        >
                          {parsedPreview.type}
                        </span>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
                        ₦{parsedPreview.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ color: "#A1A1AA", marginTop: "2px" }}>
                        {parsedPreview.description}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || accounts.length === 0}
                style={{
                  marginTop: "0.5rem",
                  padding: "11px",
                  background: "#FFFFFF",
                  color: "#050505",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: isSubmitting || accounts.length === 0 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  opacity: isSubmitting || accounts.length === 0 ? 0.6 : 1,
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Processing through AJO Engine…</span>
                  </>
                ) : (
                  <>
                    <span>Record Activity</span>
                    <CheckCircle2 size={14} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
