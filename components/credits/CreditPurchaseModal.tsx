"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Insight Credits Purchase & Audit History Modal
// Simple Prepaid Monetisation Engine
// Test packs: ₦100 (10 credits) | ₦500 (60 credits) | ₦1,000 (140 credits)
// ─────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  X,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  HelpCircle,
  ExternalLink,
  Zap,
} from "lucide-react";
import { useCredits } from "@/context/CreditContext";
import { CREDIT_PACKS, INSIGHT_CREDIT_COST, CreditPack } from "@/types/credit.types";

export function CreditPurchaseModal() {
  const {
    balance,
    costPerInsight,
    packs,
    transactions,
    isPurchaseModalOpen,
    closePurchaseModal,
    purchasePack,
    simulateCreditPurchase,
  } = useCredits();

  const [activeTab, setActiveTab] = useState<"packs" | "history">("packs");
  const [selectedPackId, setSelectedPackId] = useState<CreditPack["id"]>("pack_60");
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isPurchaseModalOpen) return null;

  const selectedPack = packs.find((p) => p.id === selectedPackId) || packs[1];

  const handleCheckout = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const result = await purchasePack(selectedPack.id, phone);
      if (result.success && result.paymentLink) {
        window.location.href = result.paymentLink;
      } else {
        setErrorMessage(result.error || "Could not launch checkout.");
        setIsProcessing(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
      setIsProcessing(false);
    }
  };

  const handleSimulate = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await simulateCreditPurchase(selectedPack.id);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                Insight Credits
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pay only when you request a business diagnosis
              </p>
            </div>
          </div>

          <button
            onClick={closePurchaseModal}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Balance Highlight Banner */}
        <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-b border-amber-100 dark:border-amber-950/40 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
              Available Balance
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {balance.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                credits
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
              Flexible Utility
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-700 dark:text-amber-400 justify-end">
              <span>5cr Diagnosis</span>
              <span>•</span>
              <span>2cr Debt Ping</span>
              <span>•</span>
              <span>15cr PDF</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs font-black px-4 pt-2">
          <button
            onClick={() => setActiveTab("packs")}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeTab === "packs"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Buy Credit Packs
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeTab === "history"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Usage & Purchase History ({transactions.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === "packs" ? (
            <div className="space-y-4">
              <div className="space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Select a Credit Pack
                </label>

                <div className="grid grid-cols-1 gap-2.5">
                  {packs.map((pack) => {
                    const isSelected = selectedPackId === pack.id;
                    return (
                      <div
                        key={pack.id}
                        onClick={() => setSelectedPackId(pack.id)}
                        className={`relative p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-amber-50/80 dark:bg-amber-950/30 border-amber-500 shadow-xs ring-1 ring-amber-500/30"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              {pack.label}
                            </span>
                            {pack.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                                {pack.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            ₦{pack.priceNgn.toLocaleString()}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                          <span>{pack.description}</span>
                          <span className="font-bold text-amber-700 dark:text-amber-400">
                            {pack.credits} Credits
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Phone input optional */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="080 1234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 transition-colors"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Guarantees */}
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 p-3 space-y-1.5 text-[11.5px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Fair Pricing Guarantee</span>
                </div>
                <p className="leading-relaxed">
                  • Credits never expire.
                  <br />
                  • Deducted only after a diagnostic is generated successfully.
                  <br />
                  • Basic access (recording money, viewing history) is always 100% free.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 shadow-md shadow-amber-500/20"
                >
                  <Coins className="h-4 w-4" />
                  <span>
                    {isProcessing
                      ? "Connecting..."
                      : `Pay ₦${selectedPack.priceNgn.toLocaleString()} for ${selectedPack.credits} Credits`}
                  </span>
                </button>

                {/* Instant Test Mode Simulator for Quick Verification */}
                <button
                  type="button"
                  onClick={handleSimulate}
                  disabled={isProcessing}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <span>Simulate Instant Test Credit ({selectedPack.credits} Credits)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Clock className="h-8 w-8 text-slate-400 mx-auto opacity-40" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    No credit transactions recorded yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((t) => {
                    const isCredit = t.credits > 0;
                    return (
                      <div
                        key={t.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 ${
                              isCredit
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownRight className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <span className="font-black text-slate-900 dark:text-white block leading-tight">
                              {t.description}
                            </span>
                            <span className="text-[10.5px] text-slate-400">
                              {new Date(t.createdAt).toLocaleDateString("en-NG", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`font-black ${
                              isCredit
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {isCredit ? `+${t.credits}` : t.credits}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            Bal: {t.balanceAfter}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
