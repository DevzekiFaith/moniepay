"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Ultra-Minimalist Wallet Balance Strip
// Just a Wallet Icon & Total in the Wallet • Payments Coming Soon (Vernacular)
// ─────────────────────────────────────────────────────────────────

import React from "react";
import { motion } from "framer-motion";
import { Wallet, Clock } from "lucide-react";
import { useToast } from "@/context/NotificationContext";

interface BusinessWalletCardProps {
  availableBalance?: number;
  onOpenReceiveModal?: () => void;
  onOpenWithdrawal?: () => void;
}

export function BusinessWalletCard({
  availableBalance = 125000,
}: BusinessWalletCardProps) {
  const { toast } = useToast();

  const handleDisabledClick = () => {
    toast(
      "Payments — E Dey Land Soon!",
      "Customer direct transfer and QR code auto-recording dey land very soon for all shop owners.",
      { type: "info" }
    );
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleDisabledClick}
      className="w-full p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 text-left transition-all hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer group"
      title="Payments — E Dey Land Soon"
    >
      {/* Wallet Icon + Total beside it */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="h-11 w-11 rounded-2xl bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <Wallet className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider leading-none">
              Total for Wallet
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight leading-tight mt-0.5">
            ₦{availableBalance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Vernacular 'Payments — Coming Soon' Badge */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black shrink-0">
        <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        <span>Payments — E Dey Land Soon</span>
      </div>
    </motion.button>
  );
}
