"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Wallet Button
// Strictly the Wallet Icon and "Payments — E Dey Land Soon" Only
// ─────────────────────────────────────────────────────────────────

import React from "react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { useToast } from "@/context/NotificationContext";

interface BusinessWalletCardProps {
  availableBalance?: number;
  onOpenReceiveModal?: () => void;
  onOpenWithdrawal?: () => void;
}

export function BusinessWalletCard({}: BusinessWalletCardProps) {
  const { toast } = useToast();

  const handleClick = () => {
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
      onClick={handleClick}
      className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3 text-left transition-all hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer"
      title="Payments — E Dey Land Soon"
    >
      <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
        <Wallet className="h-5 w-5" />
      </div>

      <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
        Payments — E Dey Land Soon
      </span>
    </motion.button>
  );
}
