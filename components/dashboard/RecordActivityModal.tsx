"use client";

// ─────────────────────────────────────────────────────────────────
// Monie Lite — Record Live Bank Activity Modal
// Allows logging real-time credits/debits directly to live accounts
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import { X, ArrowUpRight, ArrowDownLeft, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { useNotification } from "@/context/NotificationContext";

interface AccountOption {
  id: string;
  name: string;
  institution?: {
    name: string;
    shortName?: string;
  };
}

interface RecordActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: AccountOption[];
  defaultAccountId?: string;
}

const CATEGORY_OPTIONS = [
  { slug: "food-dining", label: "Food & Dining" },
  { slug: "transportation", label: "Transportation" },
  { slug: "utilities", label: "Utilities & Bills" },
  { slug: "groceries", label: "Groceries & Supermarket" },
  { slug: "shopping", label: "Shopping" },
  { slug: "entertainment", label: "Entertainment" },
  { slug: "housing", label: "Housing & Rent" },
  { slug: "health-medical", label: "Healthcare & Pharmacy" },
  { slug: "income", label: "Income & Salary" },
  { slug: "transfer", label: "Bank Transfer" },
];

export function RecordActivityModal({
  isOpen,
  onClose,
  onSuccess,
  accounts,
  defaultAccountId,
}: RecordActivityModalProps) {
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [merchantName, setMerchantName] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<string>(
    defaultAccountId || (accounts.length > 0 ? accounts[0].id : "")
  );
  const [categorySlug, setCategorySlug] = useState<string>("food-dining");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { notify } = useNotification();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const parsedAmount = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg("Please enter a valid positive amount.");
      return;
    }

    if (!description.trim()) {
      setErrorMsg("Please provide a transaction narration / description.");
      return;
    }

    const accountId = selectedAccount || (accounts.length > 0 ? accounts[0].id : "");
    if (!accountId) {
      setErrorMsg("Please connect a financial account first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          amount: parsedAmount,
          type,
          description: description.trim(),
          merchantName: merchantName.trim() || undefined,
          categorySlug: type === "INCOME" ? "income" : categorySlug,
          date: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to record live activity");
      }

      setSuccessMsg("Live transaction logged and balance updated in real-time!");
      notify(
        type === "INCOME" ? "Live Inflow Processed" : "Live Outflow Processed",
        `${type === "INCOME" ? "+" : "-"}${formatNaira(parsedAmount)} • ${description.trim()}`,
        { type: "success", sendPush: true }
      );
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      console.error("Live transaction recording error:", err);
      setErrorMsg(err.message || "Failed to record live activity");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        className="card animate-fade-up"
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#0D1526",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "18px",
          padding: "1.75rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(79, 156, 249, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="pill pill-positive" style={{ fontSize: "10px", padding: "2px 8px" }}>
                <span className="pulse-dot" style={{ background: "var(--positive)", width: "6px", height: "6px", borderRadius: "50%" }} />
                REAL-TIME INGESTION
              </span>
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "6px", letterSpacing: "-0.01em" }}>
              Record Live Activity
            </h2>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Log real banking activity directly into your live financial picture.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-base)",
              color: "var(--text-secondary)",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              background: "rgba(244, 63, 94, 0.12)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              color: "var(--negative)",
              fontSize: "12.5px",
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              background: "rgba(52, 211, 153, 0.12)",
              border: "1px solid rgba(52, 211, 153, 0.3)",
              color: "var(--positive)",
              fontSize: "12.5px",
              fontWeight: 600,
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          {/* Direction Toggle */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
              Transaction Direction
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setType("EXPENSE")}
                style={{
                  padding: "0.625rem",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  cursor: "pointer",
                  background: type === "EXPENSE" ? "rgba(244, 63, 94, 0.15)" : "var(--bg-elevated)",
                  border: type === "EXPENSE" ? "1.5px solid var(--negative)" : "1px solid var(--border-base)",
                  color: type === "EXPENSE" ? "var(--negative)" : "var(--text-secondary)",
                  transition: "all 0.15s ease",
                }}
              >
                <ArrowUpRight size={16} />
                <span>Outflow / Expense</span>
              </button>

              <button
                type="button"
                onClick={() => setType("INCOME")}
                style={{
                  padding: "0.625rem",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  cursor: "pointer",
                  background: type === "INCOME" ? "rgba(52, 211, 153, 0.15)" : "var(--bg-elevated)",
                  border: type === "INCOME" ? "1.5px solid var(--positive)" : "1px solid var(--border-base)",
                  color: type === "INCOME" ? "var(--positive)" : "var(--text-secondary)",
                  transition: "all 0.15s ease",
                }}
              >
                <ArrowDownLeft size={16} />
                <span>Inflow / Income</span>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
              Amount (₦)
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", fontWeight: 700, color: "var(--text-tertiary)" }}>
                ₦
              </span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: "100%",
                  height: "46px",
                  paddingLeft: "34px",
                  paddingRight: "14px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-base)",
                  borderRadius: "10px",
                  color: "var(--text-primary)",
                  fontSize: "16px",
                  fontWeight: 700,
                  outline: "none",
                }}
                required
              />
            </div>
          </div>

          {/* Account Picker */}
          {accounts.length > 1 && (
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                Target Bank Account
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 12px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-base)",
                  borderRadius: "10px",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.institution?.name || "Live Account"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Narration */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
              Narration / Description
            </label>
            <input
              type="text"
              placeholder={type === "INCOME" ? "e.g. Salary Payment from Company / Client Transfer" : "e.g. SPAR Supermarket Lekki / Uber Ride / Electricity Token"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                height: "42px",
                padding: "0 14px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-base)",
                borderRadius: "10px",
                color: "var(--text-primary)",
                fontSize: "13px",
                outline: "none",
              }}
              required
            />
          </div>

          {/* Category Picker (if expense) */}
          {type === "EXPENSE" && (
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                Category
              </label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 12px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-base)",
                  borderRadius: "10px",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              height: "46px",
              borderRadius: "12px",
              background: type === "INCOME" ? "var(--positive)" : "var(--accent)",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 700,
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "0.5rem",
              boxShadow: type === "INCOME" ? "0 4px 20px rgba(52, 211, 153, 0.35)" : "0 4px 20px rgba(79, 156, 249, 0.35)",
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Ingesting Live Transaction…</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Save &amp; Ingest Live Activity</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
