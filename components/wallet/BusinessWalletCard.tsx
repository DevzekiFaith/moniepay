"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Dedicated Business Wallet Card
// Modern Solid Single-Colour UI (Zero Gradients) • High-Contrast
// Flutterwave-Powered Auto-Recording • Available Wallet Balance
// ─────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  QrCode,
  Building2,
  Copy,
  Check,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/NotificationContext";

interface BusinessWalletCardProps {
  availableBalance?: number;
  onOpenReceiveModal: () => void;
  onOpenWithdrawal?: () => void;
}

export function BusinessWalletCard({
  availableBalance = 125000,
  onOpenReceiveModal,
  onOpenWithdrawal,
}: BusinessWalletCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const bankName = "Providus Bank";
  // User's dedicated virtual account number
  const accountNumber = user?.id
    ? `99${user.id.replace(/\D/g, "").slice(-8).padStart(8, "20192381")}`
    : "9920192381";

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(accountNumber);
    }
    setCopied(true);
    toast("Account Number Copied!", `${bankName} • ${accountNumber} copied to clipboard.`, {
      type: "success",
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-5 rounded-3xl bg-[#0f172a] dark:bg-[#090d16] text-white border border-slate-800 dark:border-slate-800/80 shadow-xl space-y-4"
    >
      {/* ── SECTION 1: HEADER & DEDICATED ACCOUNT ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Wallet className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white tracking-tight">
                MoniePay Business Wallet
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black tracking-wide">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Dedicated Flutterwave Shop Account
            </p>
          </div>
        </div>

        {/* 1-Tap Copy Providus Account Pill (Solid Single Colour) */}
        <button
          type="button"
          onClick={handleCopy}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-mono active:scale-95 transition-all cursor-pointer"
          title="Click to copy dedicated account number"
        >
          <Building2 className="h-3.5 w-3.5 text-blue-400" />
          <span>
            {bankName} • <strong>{accountNumber}</strong>
          </span>
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-slate-400" />
          )}
        </button>
      </div>

      {/* ── SECTION 2: BALANCE DISPLAY & SETTLEMENT TAG ── */}
      <div className="p-3.5 rounded-2xl bg-slate-800/60 dark:bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Available Wallet Moni (Direct Receipts)
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight mt-0.5">
            ₦{availableBalance.toLocaleString()}
          </div>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-950 border border-slate-700/80 text-[10.5px] font-black text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>Instant Settlement</span>
        </div>
      </div>

      {/* ── SECTION 3: ACTION BUTTONS (Solid Single Colours, No Gradients) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
        {/* Primary Action: Receive Moni (QR & Transfer) - Solid Blue */}
        <button
          type="button"
          onClick={onOpenReceiveModal}
          className="py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-900/30 active:scale-95 transition-all cursor-pointer"
        >
          <QrCode className="h-4 w-4 stroke-[2.5]" />
          <span>Receive Moni (QR & Transfer)</span>
        </button>

        {/* Secondary Action: Chop Moni - Solid Slate */}
        {onOpenWithdrawal ? (
          <button
            type="button"
            onClick={onOpenWithdrawal}
            className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowUpRight className="h-4 w-4 text-emerald-400 stroke-[2.5]" />
            <span>Chop Moni</span>
          </button>
        ) : null}
      </div>

      {/* ── SECTION 4: FOOTER ASSURANCE ── */}
      <div className="flex items-center justify-between text-[10.5px] font-medium text-slate-400 pt-1 border-t border-slate-800/80">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <span>Customer transfer enters ledger <strong>automatically</strong></span>
        </span>
        <span className="text-emerald-400 font-bold hidden xs:inline">
          Zero Manual Typing
        </span>
      </div>
    </motion.div>
  );
}
