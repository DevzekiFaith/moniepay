"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Wallet Button (Payments — E Dey Land Soon)
// Just the Wallet Icon & 'Payments — E Dey Land Soon' Only
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

export function BusinessWalletCard({}: BusinessWalletCardProps) {
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
      className="w-full p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 text-left transition-all hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer group"
      title="Payments — E Dey Land Soon"
    >
      {/* Wallet Icon + Payments — E Dey Land Soon Only */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <Wallet className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight block">
            Payments — E Dey Land Soon
          </span>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mt-0.5">
            Customer direct transfer & QR payment
          </span>
        </div>
      </div>

      {/* Status Chip */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold shrink-0">
        <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
        <span>Soon</span>
      </div>
    </motion.button>
  );
}
