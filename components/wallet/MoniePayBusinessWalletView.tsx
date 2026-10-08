"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Futuristic Modern Business Wallet System
// High-Aesthetic Cyber-Fintech UI • Solid Accents • Single Colours
// Powered by Flutterwave DVA • Auto-Records All Customer Transfers
// ─────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  QrCode,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Copy,
  Check,
  CheckCircle2,
  ShieldCheck,
  Activity,
  TrendingUp,
  Clock,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/NotificationContext";
import type { BusinessTransaction } from "@/types/moniepay.types";

interface MoniePayBusinessWalletViewProps {
  availableBalance?: number;
  moneyReceived?: number;
  moneySpent?: number;
  todaysCount?: number;
  monthlyVolume?: number;
  recentTransactions?: BusinessTransaction[];
  onOpenReceiveModal: () => void;
  onOpenWithdrawal?: () => void;
  onSimulateTransfer?: (amount: number, senderName: string) => void;
}

export function MoniePayBusinessWalletView({
  availableBalance = 125000,
  moneyReceived = 420000,
  moneySpent = 295000,
  todaysCount = 12,
  monthlyVolume = 1840000,
  recentTransactions = [],
  onOpenReceiveModal,
  onOpenWithdrawal,
  onSimulateTransfer,
}: MoniePayBusinessWalletViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [copied, setCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const businessName = user?.businessName || (user?.name ? `${user.name} Provisions` : "Mama Chidi Provisions");
  const bankName = "Providus Bank";
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

  const handleQuickSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      if (onSimulateTransfer) {
        onSimulateTransfer(25000, "Alhaji Musa");
      }
      toast(
        "⚡ Transfer Auto-Recorded!",
        "+₦25,000 from Alhaji Musa (Providus Bank) has been automatically credited to your wallet and ledger.",
        { type: "success" }
      );
    }, 1000);
  };

  return (
    <section className="space-y-3.5">
      {/* ── 1. FUTURISTIC HERO WALLET HUD ── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0b1329] dark:bg-[#070c1a] text-white border border-slate-800 shadow-2xl space-y-4">
        {/* Top Cyber Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-xs">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white tracking-tight uppercase">
                  MoniePay Business Wallet
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-black tracking-wide">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-950 animate-pulse" />
                  ACTIVE
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-mono">
                FLW-DVA NODE • AUTO-RECONCILER
              </p>
            </div>
          </div>

          {/* 1-Tap Copy Dedicated Providus Account Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono active:scale-95 transition-all cursor-pointer"
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

        {/* ── 2. CORE FINANCIAL METRICS HUD (5 Clean Indicators) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* A. AVAILABLE BALANCE */}
          <div className="sm:col-span-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Available Balance (Settled Moni)
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight mt-1">
                ₦{availableBalance.toLocaleString()}
              </div>
              <p className="text-[10.5px] text-emerald-400 font-semibold mt-0.5">
                Instant Settlement • Available for Safe Chop Moni
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onOpenReceiveModal}
                className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-950 active:scale-95 transition-all cursor-pointer"
              >
                <QrCode className="h-4 w-4 stroke-[2.5]" />
                <span>Receive Moni (QR & Transfer)</span>
              </button>

              {onOpenWithdrawal && (
                <button
                  type="button"
                  onClick={onOpenWithdrawal}
                  className="py-3 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95 transition-all cursor-pointer"
                >
                  <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                  <span>Chop Moni</span>
                </button>
              )}
            </div>
          </div>

          {/* B. MONEY RECEIVED */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/90 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Money Received
              </span>
              <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-white">
              ₦{moneyReceived.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">All customer transfers in</p>
          </div>

          {/* C. MONEY SPENT */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/90 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Money Spent
              </span>
              <ArrowUpRight className="h-4 w-4 text-rose-400" />
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-white">
              ₦{moneySpent.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Stock & shop bills</p>
          </div>

          {/* D. TODAY'S ACTIVITY & THIS MONTH */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/90 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Today / This Month
              </span>
              <Activity className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-black font-mono text-white">
                {todaysCount} sales
              </span>
              <span className="text-xs text-slate-400 font-mono font-bold">
                (₦{(monthlyVolume / 1000).toFixed(0)}k mo.)
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Auto-recorded entries</p>
          </div>
        </div>

        {/* ── 3. REAL-TIME AUTO-RECORDING ASSURANCE STRIP ── */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col xs:flex-row xs:items-center justify-between gap-2 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
            <span>Customer pays &rarr; Webhook verifies &rarr; <strong>Auto-records in ledger</strong></span>
          </span>

          <button
            type="button"
            disabled={isSimulating}
            onClick={handleQuickSimulate}
            className="self-start xs:self-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-300 font-mono text-[10.5px] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isSimulating ? "animate-spin" : ""}`} />
            <span>{isSimulating ? "Receiving..." : "Test +₦25k Webhook"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
