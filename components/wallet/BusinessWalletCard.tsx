"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Sleek Compact Business Wallet Strip
// Minimalist, Clean, Single-Colour UI (Zero Gradients)
// Shows Wallet Balance & 1-Tap Receive Moni (QR & Transfer) Button
// ─────────────────────────────────────────────────────────────────

import React from "react";
import { motion } from "framer-motion";
import { Wallet, QrCode, ArrowDownLeft } from "lucide-react";

interface BusinessWalletCardProps {
  availableBalance?: number;
  onOpenReceiveModal: () => void;
  onOpenWithdrawal?: () => void;
}

export function BusinessWalletCard({
  availableBalance = 125000,
  onOpenReceiveModal,
}: BusinessWalletCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
    >
      {/* Left: Wallet Icon & Available Balance */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Wallet className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Wallet Balance (Direct Receipts)
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight leading-tight">
            ₦{availableBalance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Right: Primary Action Button - Receive Moni (QR & Transfer) */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenReceiveModal}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <QrCode className="h-4 w-4 stroke-[2.5]" />
          <span>Receive Moni (QR & Transfer)</span>
        </button>
      </div>
    </motion.div>
  );
}
