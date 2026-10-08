"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Ultra-Minimalist Wallet Balance Strip
// Just a Wallet Icon & Total in the Wallet • 1-Tap Opens QR & Details
// ─────────────────────────────────────────────────────────────────

import React from "react";
import { motion } from "framer-motion";
import { Wallet, QrCode, ChevronRight } from "lucide-react";

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
    <motion.button
      type="button"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onOpenReceiveModal}
      className="w-full p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 text-left transition-all hover:border-blue-500/50 dark:hover:border-blue-500/50 cursor-pointer group"
      title="Click to view QR Code & Shop Account Details"
    >
      {/* Wallet Icon + Total beside it */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="h-11 w-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
          <Wallet className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider leading-none">
            Total in Wallet
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight leading-tight mt-0.5">
            ₦{availableBalance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* QR Code & Open Details Hint */}
      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0">
        <span className="text-xs font-bold hidden xs:inline">QR Details</span>
        <QrCode className="h-5 w-5" />
        <ChevronRight className="h-4 w-4" />
      </div>
    </motion.button>
  );
}
