"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Dedicated Business Wallet & Instant Receive Money Card
// Displayed prominently on the Main Dashboard for Informal Traders
// Flutterwave-Powered Auto-Recording • Available Wallet Balance
// ─────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  QrCode,
  ArrowDownLeft,
  Building2,
  Copy,
  Check,
  CheckCircle2,
  Zap,
  ArrowUpRight,
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

  const businessName = user?.businessName || (user?.name ? `${user.name} Provisions` : "Mama Chidi Provisions");
  const bankName = "Providus Bank";
  const accountNumber = user?.id ? `99${user.id.replace(/\D/g, "").slice(-8).padStart(8, "201928")}` : "9920192841";

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(accountNumber);
    }
    setCopied(true);
    toast("Account Number Copied!", `${accountNumber} (${bankName}) copied to clipboard.`, {
      type: "success",
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0c2340] via-[#102a4e] to-[#1a365d] text-white border border-cyan-500/30 shadow-[0_12px_36px_rgba(12,35,64,0.25)] relative overflow-hidden space-y-3.5"
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-blue-500/15 blur-2xl" />

      {/* Top Header Row: MoniePay Business Wallet Badge & Dedicated Account */}
      <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white tracking-tight flex items-center gap-1.5">
              MoniePay Business Wallet
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9.5px] font-black">
                Active
              </span>
            </h3>
            <p className="text-[10px] text-cyan-200/80 font-medium">
              Dedicated Flutterwave Shop Account
            </p>
          </div>
        </div>

        {/* 1-Tap Copy Account Badge */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-mono text-cyan-200 active:scale-95 transition-all cursor-pointer"
          title="Click to copy dedicated account number"
        >
          <Building2 className="h-3.5 w-3.5 text-cyan-400" />
          <span>{bankName} • <strong>{accountNumber}</strong></span>
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-cyan-300" />
          )}
        </button>
      </div>

      {/* Middle Row: Available Balance & Auto-Recording Info */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1 border-t border-white/10 relative z-10">
        <div>
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-cyan-200/90 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Available Wallet Moni (Direct Receipts)
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
              ₦{availableBalance.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-cyan-300/80">
              Instant Settlement
            </span>
          </div>
        </div>

        {/* Big Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenReceiveModal}
            className="flex-1 sm:flex-none py-2.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <QrCode className="h-4 w-4 stroke-[2.5]" />
            <span>Receive Moni (QR & Transfer)</span>
          </button>

          {onOpenWithdrawal && (
            <button
              type="button"
              onClick={onOpenWithdrawal}
              className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 active:scale-95 transition-all cursor-pointer"
              title="Safe Chop Money & Withdrawals"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>Chop Moni</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Footer Note: Auto-Records guarantee */}
      <div className="pt-1.5 flex items-center justify-between text-[10.5px] text-cyan-200/90 font-medium relative z-10 border-t border-white/5">
        <span className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span>Customer transfer enters ledger <strong>automatically</strong> with receipt</span>
        </span>
        <span className="text-[9.5px] font-bold text-emerald-300 hidden xs:inline">
          Zero Manual Typing ⚡
        </span>
      </div>
    </motion.div>
  );
}
