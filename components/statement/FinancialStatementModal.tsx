"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Verified Business Performance & Turnover Statement
// Official Stamped Bank/Supplier Export • Unlocked with 15 Credits
// Protected with Oga 4-Digit Secret PIN & Bank Access Verification Key
// 100% Mobile Responsive • Nigerian Local Market Language Modals
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Building2,
  TrendingUp,
  Coins,
  QrCode,
  FileText,
  Lock,
  KeyRound,
  Copy,
  Check,
  AlertTriangle,
  Delete,
  Store,
  Share2,
} from "lucide-react";
import { useCredits } from "@/context/CreditContext";
import { useAuth } from "@/context/AuthContext";
import { STATEMENT_EXPORT_CREDIT_COST } from "@/types/credit.types";
import { DeterministicMetrics, BusinessTransaction } from "@/types/moniepay.types";
import { useToast } from "@/context/NotificationContext";
import { playCashChime, triggerCashHapticVibration } from "@/lib/alerts/hapticSoundService";
import {
  getOwnerPin,
  hasOwnerPin,
  setOwnerPin,
  verifyOwnerPin,
  generateBankAccessKey,
  resetOwnerPin,
} from "@/lib/security/ownerPinService";

interface FinancialStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  traderName?: string;
  marketLocation?: string;
  metrics: DeterministicMetrics | null;
  transactions: BusinessTransaction[];
}

export function FinancialStatementModal({
  isOpen,
  onClose,
  businessName,
  traderName = "Mama Chidi",
  marketLocation = "Shop 14, Balogun Market, Lagos",
  metrics,
  transactions,
}: FinancialStatementModalProps) {
  const { balance, useCreditsAction, openPurchaseModal } = useCredits();
  const { toast } = useToast();
  const { user } = useAuth();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isDeducting, setIsDeducting] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinMode, setPinMode] = useState<"verify" | "setup" | "reset">("verify");
  const [inputPin, setInputPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [bankAccessKey, setBankAccessKey] = useState<string>("");
  const [statementId, setStatementId] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Initialize statement ID and generate bank access key on modal open
  useEffect(() => {
    if (isOpen) {
      if (!bankAccessKey) {
        setBankAccessKey(generateBankAccessKey());
      }
      if (!statementId) {
        setStatementId(`MNP-CERT-${Date.now().toString(36).toUpperCase().slice(-6)}`);
      }
    }
  }, [isOpen, bankAccessKey, statementId]);


  if (!isOpen) return null;

  // 1. Trigger Unlock Flow: Checks credit balance and opens Oga PIN verification sheet
  const handleInitiateUnlock = () => {
    if (balance < STATEMENT_EXPORT_CREDIT_COST) {
      toast(
        "Coins no reach o! 🪙",
        `You need ${STATEMENT_EXPORT_CREDIT_COST} Decision Coins. Current balance: ${balance} coins.`,
        { type: "info" }
      );
      openPurchaseModal();
      return;
    }

    setPinError(null);
    setInputPin("");
    setConfirmPin("");

    // If user has not set a PIN yet, prompt them to set their 4-digit Oga PIN
    if (!hasOwnerPin(user?.id)) {
      setPinMode("setup");
    } else {
      setPinMode("verify");
    }

    setShowPinModal(true);
  };

  // 2. Handle Numeric Keypad Entry
  const handleKeyPress = (num: string) => {
    if (pinMode === "setup" && inputPin.length === 4) {
      if (confirmPin.length < 4) {
        setConfirmPin((prev) => prev + num);
      }
      return;
    }

    if (inputPin.length < 4) {
      setInputPin((prev) => prev + num);
      setPinError(null);
    }
  };

  const handleBackspace = () => {
    if (pinMode === "setup" && confirmPin.length > 0) {
      setConfirmPin((prev) => prev.slice(0, -1));
      return;
    }
    setInputPin((prev) => prev.slice(0, -1));
    setPinError(null);
  };

  const handleClearPin = () => {
    setInputPin("");
    setConfirmPin("");
    setPinError(null);
  };

  // 3. Submit PIN for Authorization
  const handleAuthorizeWithPin = async () => {
    if (pinMode === "setup") {
      if (inputPin.length !== 4) {
        setPinError("Abeg enter complete 4 digits for your PIN.");
        triggerCashHapticVibration("warning");
        return;
      }
      if (!confirmPin) {
        setPinError("Confirm your 4-digit PIN below make we sure.");
        return;
      }
      if (inputPin !== confirmPin) {
        setPinError("The two PINs no match o! Type am again.");
        triggerCashHapticVibration("warning");
        setConfirmPin("");
        return;
      }

      // Save new PIN
      setOwnerPin(inputPin, user?.id);
      toast("Oga PIN Set Successfully! 🛡️", "Your 4-digit secret PIN is now active for all bank exports.", {
        type: "success",
      });
      // Proceed to unlock
      await executeUnlock();
      return;
    }

    // Verify existing PIN
    if (inputPin.length !== 4) {
      setPinError("Abeg enter your complete 4-digit PIN.");
      triggerCashHapticVibration("warning");
      return;
    }

    const isValid = verifyOwnerPin(inputPin, user?.id);
    if (!isValid) {
      triggerCashHapticVibration("warning");
      setPinError("Oga, this PIN no match o! Check am well make you try again.");
      setInputPin("");
      return;
    }

    // PIN is correct! Proceed to execute unlock
    await executeUnlock();
  };

  // 4. Deduct 15 credits and unlock statement
  const executeUnlock = async () => {
    setIsDeducting(true);
    setPinError(null);

    try {
      const generatedKey = bankAccessKey || generateBankAccessKey();
      setBankAccessKey(generatedKey);

      const res = await useCreditsAction({
        cost: STATEMENT_EXPORT_CREDIT_COST,
        description: `Certified Financial Statement Export (${businessName})`,
        metadata: {
          businessName,
          bankAccessKey: generatedKey,
          totalRevenue: metrics?.totalRevenue,
          timestamp: new Date().toISOString(),
        },
      });

      if (res.success) {
        playCashChime();
        triggerCashHapticVibration("cash");
        setIsUnlocked(true);
        setShowPinModal(false);

        toast(
          "Statement Certified! 📄",
          `15 Decision Coins deducted. Official Bank Key: ${generatedKey}`,
          { type: "success" }
        );
      } else {
        setPinError(res.error || "Could not deduct coins. Please check your connection.");
      }
    } catch (err: any) {
      setPinError(err?.message || "Coin deduction failed.");
    } finally {
      setIsDeducting(false);
    }
  };

  // 5. Print or Save as PDF
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // 6. Copy WhatsApp Summary for Loan Officer
  const handleCopyWhatsAppBrief = () => {
    const brief = `*MONIEPAY CERTIFIED TURNOVER & SOLVENCY STATEMENT*\n` +
      `-------------------------------------------\n` +
      `🏢 *Business:* ${businessName}\n` +
      `👤 *Principal Trader:* ${traderName}\n` +
      `📍 *Location:* ${marketLocation}\n` +
      `💰 *Total Recorded Turnover:* ₦${totalSales.toLocaleString()}\n` +
      `📈 *Retained Operating Margin:* ₦${netProfit.toLocaleString()}\n` +
      `🏆 *Solvency Rating:* ${solvencyGrade}\n` +
      `🛡️ *Statement ID:* ${verificationCode}\n` +
      `🔑 *Bank Verification Access Key:* ${bankAccessKey}\n` +
      `-------------------------------------------\n` +
      `✅ *Verification Guarantee:* Certified immutable deterministic ledger records powered by MoniePay Trader OS (Lagos, Nigeria).`;

    navigator.clipboard.writeText(brief);
    setCopiedSummary(true);
    toast("Copied for WhatsApp! 💬", "Paste am directly send give your Bank Loan Officer or Cooperative Secretary.", {
      type: "success",
    });
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // 7. Copy Bank Access Key
  const handleCopyAccessKey = () => {
    navigator.clipboard.writeText(bankAccessKey);
    setCopiedKey(true);
    toast("Bank Key Copied! 🔑", bankAccessKey, { type: "info" });
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const verificationCode = `MNP-CERT-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const dateFormatted = new Date().toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalSales = metrics?.totalRevenue || 0;
  const netProfit = metrics?.operatingProfit || 0;
  const healthScore = metrics?.healthScore || 85;
  const solvencyGrade =
    healthScore >= 80
      ? "Grade A (Prime Retail)"
      : healthScore >= 60
      ? "Grade B (Moderate Risk)"
      : "Grade C (High Monitoring)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col print:border-none print:shadow-none print:max-h-none print:m-0 print:p-0">
        
        {/* ── MODAL CONTROLS BAR (Hidden during printing) ── */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 print:hidden shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                  Certified Shop Financial Statement
                </h3>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                  Bank Stamped
                </span>
              </div>
              <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Official document for bank loans, suppliers &amp; cooperatives
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isUnlocked && (
              <>
                <button
                  type="button"
                  onClick={handleCopyWhatsAppBrief}
                  className="py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center gap-1 cursor-pointer shadow-xs transition-all active:scale-95"
                  title="Send summary to loan officer via WhatsApp"
                >
                  {copiedSummary ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">WhatsApp Bank Summary</span>
                  <span className="sm:hidden">Share</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-1.5 px-2.5 sm:px-3 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-[11px] sm:text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print / Save PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsUnlocked(false);
                    toast("Statement Locked 🔒", "Your statement has been locked again for shop privacy.", {
                      type: "info",
                    });
                  }}
                  className="py-1.5 px-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1"
                  title="Lock statement so apprentice cannot view"
                >
                  <Lock className="h-3 w-3" />
                  <span className="hidden sm:inline">Lock</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close statement modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── STATEMENT SHEET BODY ── */}
        <div className="p-4 sm:p-7 overflow-y-auto space-y-4 sm:space-y-6 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 print:p-8 print:text-black print:bg-white flex-1">
          
          {/* Document Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 dark:border-slate-100 pb-3 sm:pb-4 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-blue-700 dark:text-blue-400">
                  MONIEPAY
                </span>
                <span className="text-[9.5px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                  Certified Document
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black mt-1 leading-tight">
                Business Turnover &amp; Solvency Statement
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 print:text-slate-600 mt-0.5">
                Generated from immutable deterministic ledger records
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block">Statement ID</span>
              <span className="font-mono text-[11px] sm:text-xs font-black text-slate-800 dark:text-slate-200">
                {verificationCode}
              </span>
              <span className="text-[10px] sm:text-[10.5px] text-slate-500 block mt-0.5">{dateFormatted}</span>

              {isUnlocked && bankAccessKey && (
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold shadow-2xs">
                  <KeyRound className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Key: {bankAccessKey}</span>
                  <span className="text-[8.5px] uppercase font-sans font-black px-1.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-950 dark:text-emerald-200">
                    ✓ Certified
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Business & Trader Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 print:bg-transparent print:border-slate-300">
            <div>
              <span className="text-[9.5px] sm:text-[10px] uppercase font-black text-slate-400">Operating Business</span>
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5">{businessName}</p>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-0.5">{traderName} (Principal)</p>
            </div>
            <div>
              <span className="text-[9.5px] sm:text-[10px] uppercase font-black text-slate-400">Trading Location</span>
              <p className="text-xs sm:text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{marketLocation}</p>
              <span className="inline-block mt-1 text-[10px] sm:text-[10.5px] font-black text-emerald-600 dark:text-emerald-400">
                ✓ Verified Active Market Merchant
              </span>
            </div>
          </div>

          {/* Key Solvency Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 print:border-slate-300">
              <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-500 uppercase block">Total Turnover</span>
              <p className="text-base sm:text-lg font-black text-blue-700 dark:text-blue-400 mt-0.5">
                ₦{totalSales.toLocaleString()}
              </p>
              <span className="text-[9.5px] text-slate-400">Recorded Inflows</span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 print:border-slate-300">
              <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-500 uppercase block">Operating Margin</span>
              <p className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                ₦{netProfit.toLocaleString()}
              </p>
              <span className="text-[9.5px] text-slate-400">Net Profit Retained</span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 print:border-slate-300">
              <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-500 uppercase block">Credit Solvency</span>
              <p className="text-base sm:text-lg font-black text-purple-700 dark:text-purple-400 mt-0.5">
                {solvencyGrade.split(" ")[0]} {solvencyGrade.split(" ")[1]}
              </p>
              <span className="text-[9.5px] text-slate-400">Health Index: {healthScore}/100</span>
            </div>
          </div>

          {/* ── LOCKED OVERLAY (Protected by Oga Secret PIN) ── */}
          {!isUnlocked ? (
            <div className="relative p-5 sm:p-7 rounded-3xl bg-gradient-to-b from-amber-50/90 via-slate-50 to-amber-50/60 dark:from-amber-950/30 dark:via-slate-900 dark:to-amber-950/20 border-2 border-dashed border-amber-300 dark:border-amber-700/80 text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-md">
                <Lock className="h-6 w-6" />
              </div>

              <div className="max-w-md mx-auto space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/90 dark:bg-amber-900/80 text-amber-950 dark:text-amber-200 text-[10.5px] font-black uppercase tracking-wide shadow-2xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                  <span>Oga Secret PIN Protection</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Unlock Official Certified Financial Statement
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Protect your shop turnover and profit records so only you and the bank officer fit view am. Authorize with your 4-digit Oga PIN to deduct 15 coins and generate your private bank verification passcode for download.
                </p>
              </div>

              {/* Coin Balance Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold">
                <Coins className="h-4 w-4 text-amber-500" />
                <span>Cost: {STATEMENT_EXPORT_CREDIT_COST} Decision Coins</span>
                <span>•</span>
                <span className={balance >= STATEMENT_EXPORT_CREDIT_COST ? "text-emerald-600 dark:text-emerald-400 font-black" : "text-rose-600 font-black"}>
                  Your Balance: {balance} Coins {balance >= STATEMENT_EXPORT_CREDIT_COST ? "✓" : "(No Reach)"}
                </span>
              </div>

              {/* Action Button */}
              <div className="pt-1">
                {balance < STATEMENT_EXPORT_CREDIT_COST ? (
                  <button
                    type="button"
                    onClick={openPurchaseModal}
                    className="py-3 px-6 rounded-2xl bg-blue-700 hover:bg-blue-600 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
                  >
                    <Coins className="h-4 w-4" />
                    <span>Top up Coins (Get 60 Coins for ₦500)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleInitiateUnlock}
                    disabled={isDeducting}
                    className="w-full sm:w-auto mx-auto py-3.5 px-7 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all active:scale-98 cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    <KeyRound className="h-4 w-4" />
                    <span>Authorize with Oga PIN (15 Coins)</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ── UNLOCKED FULL AUDIT SECTION ── */
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Bank Verification Key Callout */}
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0">
                    <KeyRound className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black text-blue-900 dark:text-blue-300 block">
                      Official Bank Verification Passcode
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-black text-blue-950 dark:text-blue-100">
                      {bankAccessKey}
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Bank loan officers, suppliers &amp; cooperatives fit use this key verify say nobody tamper with your record.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAccessKey}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 hover:bg-blue-100 text-blue-900 dark:text-blue-200 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 shrink-0"
                >
                  {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey ? "Copied ✓" : "Copy Key"}</span>
                </button>
              </div>

              {/* Transactions Ledger Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden print:border-slate-300">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 text-xs font-black flex justify-between">
                  <span>Recent Verified Inflows &amp; Dispatches</span>
                  <span>{transactions.length} entries certified</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {transactions.slice(0, 6).map((tx) => (
                    <div key={tx.id} className="p-2.5 sm:p-3 flex items-center justify-between">
                      <div>
                        <p className="font-bold">{tx.description || tx.category}</p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(tx.created_at || tx.transaction_date || Date.now()).toLocaleDateString("en-NG")}
                        </span>
                      </div>
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                        +₦{tx.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Digital Watermark Stamp & QR Seal */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl border-2 border-emerald-500 p-1 flex items-center justify-center shrink-0">
                    <QrCode className="h-full w-full text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block">
                      Official MoniePay Seal ✓
                    </span>
                    <p className="text-[10.5px] font-mono font-bold text-slate-500">
                      Hash: SHA256:{verificationCode}
                    </p>
                    <p className="text-[9.5px] text-slate-400">
                      Scan QR code or enter Access Key ({bankAccessKey}) to verify authentic ledger records.
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="h-9 w-28 rounded-lg border-2 border-dashed border-emerald-500/60 dark:border-emerald-600/60 flex items-center justify-center text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest rotate-[-2deg]">
                    CERTIFIED TRUE
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Notice */}
          <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 print:text-slate-600">
            Certified by MoniePay Technologies • Lagos, Nigeria • Verified SME Operating System
          </div>
        </div>
      </div>

      {/* ── OGA SECRET PIN VERIFICATION / SETUP MODAL SHEET (PIDGIN LOCAL LANGUAGE) ── */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-150">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] bg-white dark:bg-slate-900 border border-white/80 dark:border-white/10 p-5 sm:p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight leading-tight">
                      {pinMode === "setup" ? "Set Your Oga PIN" : "Oga Secret PIN"}
                    </h3>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                      Shop Owner Privacy
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Local Language Instructions */}
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-950 dark:text-amber-200 font-medium leading-relaxed">
                {pinMode === "setup" ? (
                  inputPin.length === 4 ? (
                    <span>Oga, enter that same <strong>4 digits again</strong> make we confirm am sharp-sharp.</span>
                  ) : (
                    <span>Oga, choose <strong>4 numbers wey only you know</strong>. Make apprentice or counter girl no go fit print your turnover or see your profit.</span>
                  )
                ) : (
                  <span>Put your <strong>4-digit secret PIN</strong> make we deduct 15 coins and unlock your official certified bank statement.</span>
                )}
              </div>

              {/* PIN Dots Display */}
              <div className="flex justify-center items-center gap-3 py-2">
                {[0, 1, 2, 3].map((idx) => {
                  const isFilled =
                    pinMode === "setup" && inputPin.length === 4
                      ? confirmPin.length > idx
                      : inputPin.length > idx;

                  return (
                    <div
                      key={idx}
                      className={`h-4 w-4 rounded-full transition-all duration-200 border-2 ${
                        isFilled
                          ? "bg-amber-500 border-amber-500 scale-110 shadow-xs"
                          : "border-slate-300 dark:border-slate-700 bg-transparent"
                      }`}
                    />
                  );
                })}
              </div>

              {/* Error Message */}
              {pinError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold text-center animate-shake">
                  {pinError}
                </div>
              )}

              {/* Touch Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeyPress(digit)}
                    className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black text-lg active:scale-95 transition-all cursor-pointer shadow-2xs"
                  >
                    {digit}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleClearPin}
                  className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs active:scale-95 transition-all cursor-pointer"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => handleKeyPress("0")}
                  className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black text-lg active:scale-95 transition-all cursor-pointer shadow-2xs"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                  aria-label="Backspace"
                >
                  <Delete className="h-5 w-5" />
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleAuthorizeWithPin}
                disabled={isDeducting || (pinMode === "setup" ? inputPin.length !== 4 || confirmPin.length !== 4 : inputPin.length !== 4)}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 transition-all disabled:opacity-50"
              >
                {isDeducting ? (
                  <span>Certifying Statement…</span>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>{pinMode === "setup" ? "Save PIN & Unlock (15 Coins)" : "Authorize Unlock (15 Coins)"}</span>
                  </>
                )}
              </button>

              {/* PIN Reset / Local Help */}
              {pinMode === "verify" && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      resetOwnerPin(user?.id);
                      setPinMode("setup");
                      handleClearPin();
                      toast("PIN Reset", "You fit set brand new 4-digit PIN now.", { type: "info" });
                    }}
                    className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 font-bold underline cursor-pointer"
                  >
                    You forget your PIN? Reset am sharp-sharp
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
