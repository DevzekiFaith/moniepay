"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Shop Tier & Staff Multi-Attendant Power-Up Modal
// 100% Free Core Ledger Guarantee + Staff Anti-Theft Controls
// Unlocks with 20 Coins or Optional Flutterwave Subscription
// 100% Mobile Responsive • Zero Sparkles (Market & Coin Icons)
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ShieldCheck,
  BadgeCheck,
  Lock,
  X,
  CreditCard,
  ArrowRight,
  Loader2,
  Smartphone,
  Coins,
  Store,
  Users,
  Check,
} from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";
import { useCredits } from "@/context/CreditContext";
import { useToast } from "@/context/NotificationContext";
import { STAFF_MODE_CREDIT_COST } from "@/types/credit.types";
import { playCashChime, triggerCashHapticVibration } from "@/lib/alerts/hapticSoundService";

export function UpgradeModal() {
  const {
    isUpgradeModalOpen,
    closeUpgradeModal,
    modalReason,
    subscription,
    selectedPlan,
    setSelectedPlan,
    isSubscribed,
    initializePayment,
    activateStaffPassWithCoins,
  } = useSubscription();

  const { balance, useCreditsAction, openPurchaseModal } = useCredits();
  const { toast } = useToast();
  const { user } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [isActivatingCoins, setIsActivatingCoins] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock scroll when open
  useEffect(() => {
    if (isUpgradeModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isUpgradeModalOpen]);

  if (!mounted || !isUpgradeModalOpen) return null;

  // 1. Activate Staff Mode using 20 Coins
  const handleActivateWithCoins = async () => {
    if (balance < STAFF_MODE_CREDIT_COST) {
      openPurchaseModal();
      return;
    }

    setIsActivatingCoins(true);
    setErrorMessage(null);

    try {
      const res = await useCreditsAction({
        cost: STAFF_MODE_CREDIT_COST,
        description: "30-Day Staff & Attendant Multi-Device Mode Pass",
      });

      if (res.success) {
        playCashChime();
        triggerCashHapticVibration("cash");
        activateStaffPassWithCoins(30);

        toast(
          "Staff Mode Activated! 🛡️",
          "30-day multi-phone sync and anti-theft apprentice logins unlocked with 20 Coins.",
          { type: "success" }
        );

        closeUpgradeModal();
      } else {
        setErrorMessage(res.error || "Could not activate Staff Mode with coins.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Coin activation failed.");
    } finally {
      setIsActivatingCoins(false);
    }
  };

  // 2. Pay via Flutterwave
  const handlePayFlutterwave = async () => {
    setIsProcessingCard(true);
    setErrorMessage(null);

    try {
      const res = await initializePayment(phoneNumber, selectedPlan);
      if (res.success && res.paymentLink) {
        window.location.href = res.paymentLink;
      } else {
        setErrorMessage(res.error || "Could not start Flutterwave checkout. Please try again.");
        setIsProcessingCard(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Payment initialization failed.");
      setIsProcessingCard(false);
    }
  };

  const amountToPay = selectedPlan === "annual" ? "₦15,000" : "₦1,500";

  const modalContent = (
    <AnimatePresence>
      {isUpgradeModalOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-md p-0 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-modal-title"
        >
          {/* Backdrop dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-transparent"
            onClick={closeUpgradeModal}
          />

          {/* 3D Soft Frosted Card Container */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] rounded-t-[28px] sm:rounded-[32px] overflow-hidden flex flex-col z-20 shadow-[0_24px_60px_rgba(15,23,42,0.4)] dark:shadow-2xl border-t sm:border border-white/80 dark:border-white/10 bg-[#edf3fb] dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Sapphire Banner Header */}
            <div className="bg-[#1e3a8a] px-4 sm:px-5 py-3.5 text-white flex items-center justify-between border-b border-white/10 shrink-0 relative overflow-hidden">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-inner shrink-0">
                  <Store className="h-5 w-5 text-sky-300" />
                </div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-200 text-[9px] sm:text-[9.5px] font-black uppercase tracking-wider">
                    <span>100% Free Core Guarantee</span>
                  </div>
                  <h3 id="upgrade-modal-title" className="text-sm sm:text-base font-black tracking-tight leading-tight text-white mt-0.5 truncate">
                    Shop Tier &amp; Staff Protection
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={closeUpgradeModal}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer backdrop-blur-md border border-white/20 active:scale-95 shrink-0"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body Scroll */}
            <div className="p-3 sm:p-4.5 overflow-y-auto space-y-3 sm:space-y-3.5 flex-1 overscroll-contain">
              {/* Friendly Reassurance Notice */}
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <p className="text-[11.5px] sm:text-xs font-semibold text-blue-950 dark:text-sky-200 leading-relaxed">
                  {modalReason || "MoniePay Core Ledger is 100% Free Forever. Upgrade to Staff & Multi-Attendant Mode for multi-device sync, employee logins, and anti-theft controls."}
                </p>
              </div>

              {/* ── CARD 1: 100% FREE CORE LEDGER ── */}
              <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800/90 border border-emerald-500/30 dark:border-emerald-500/40 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 shrink-0">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                        100% Free Core Ledger
                      </h4>
                      <p className="text-[10px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                        Permanent Lifetime Guarantee • ₦0 Forever
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-black uppercase shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 pt-0.5 text-[11px] sm:text-[11.5px] font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Unlimited voice &amp; text sales entries</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Cash drawer &amp; daily chop-money</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>100% offline mode &amp; auto cloud sync</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Zero data deletion guarantee</span>
                  </div>
                </div>
              </div>

              {/* ── CARD 2: STAFF & ATTENDANT ANTI-THEFT POWER-UP ── */}
              <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800/90 border border-blue-500/30 dark:border-blue-500/40 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs shrink-0">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                          Staff &amp; Attendant Multi-Device Mode
                        </h4>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-black uppercase">
                          Power-Up
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                        Multi-phone apprentice sync &amp; sales-girl theft prevention
                      </p>
                    </div>
                  </div>
                  {isSubscribed && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-black uppercase shrink-0">
                      Unlocked ✓
                    </span>
                  )}
                </div>

                {/* 3 Value Points (Clean Market & Security Icons) */}
                <div className="space-y-1.5 text-[11px] sm:text-[11.5px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50/90 dark:bg-slate-900/60 p-2.5 sm:p-3 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-start gap-2">
                    <Smartphone className="h-3.5 w-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                    <span><strong>Multi-Phone Live Sync:</strong> Apprentice records sales on their phone; your dashboard updates live.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lock className="h-3.5 w-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                    <span><strong>Anti-Theft Drawer Lock:</strong> Staff can record sales, but cannot delete records or see private profit.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Coins className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>+25 Free Monthly Coins:</strong> Included free for certified loan statements &amp; market alerts.</span>
                  </div>
                </div>

                {/* ── OPTION 1: UNLOCK WITH 20 COINS ── */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 dark:text-amber-200">
                      <Coins className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Option 1: Unlock with 20 Coins</span>
                    </div>
                    <span className="text-[10.5px] sm:text-[11px] font-extrabold text-amber-900 dark:text-amber-300">
                      Your Balance: <strong>{balance} Coins</strong>
                    </span>
                  </div>

                  {balance >= STAFF_MODE_CREDIT_COST ? (
                    <button
                      type="button"
                      onClick={handleActivateWithCoins}
                      disabled={isActivatingCoins}
                      className="w-full py-2.5 sm:py-3 px-3 rounded-xl sm:rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98 transition-all disabled:opacity-75"
                    >
                      {isActivatingCoins ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>Activating Staff Pass…</span>
                        </>
                      ) : (
                        <>
                          <Coins className="h-4 w-4" />
                          <span>Activate 30-Day Staff Mode (20 Coins)</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-0.5">
                      <p className="text-[10.5px] sm:text-[11px] text-amber-900 dark:text-amber-200 font-semibold leading-tight">
                        You need {STAFF_MODE_CREDIT_COST - balance} more coins to activate staff mode.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          closeUpgradeModal();
                          openPurchaseModal();
                        }}
                        className="py-2 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0 shadow-xs"
                      >
                        <Coins className="h-3.5 w-3.5" />
                        <span>Get Coins (from ₦200)</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* ── OPTION 2: PAY WITH DEBIT CARD / TRANSFER ── */}
                <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Option 2: Pay with Debit Card / Transfer</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Monthly Plan */}
                    <button
                      type="button"
                      onClick={() => setSelectedPlan("monthly")}
                      className={`p-2.5 sm:p-3 rounded-2xl text-left border cursor-pointer transition-all relative ${
                        selectedPlan === "monthly"
                          ? "bg-blue-50/50 dark:bg-slate-800 border-blue-600 dark:border-blue-500 ring-2 ring-blue-600/20 shadow-xs"
                          : "bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white">Monthly</span>
                        {selectedPlan === "monthly" && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                      </div>
                      <p className="text-xs sm:text-sm font-black text-blue-900 dark:text-blue-300 mt-1">₦1,500</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Billed monthly</p>
                    </button>

                    {/* Annual Plan */}
                    <button
                      type="button"
                      onClick={() => setSelectedPlan("annual")}
                      className={`p-2.5 sm:p-3 rounded-2xl text-left border cursor-pointer transition-all relative ${
                        selectedPlan === "annual"
                          ? "bg-emerald-50/50 dark:bg-slate-800 border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-600/20 shadow-xs"
                          : "bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[8px] font-black uppercase tracking-wider shadow-xs">
                        Save ₦3k
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white">1 Full Year</span>
                        {selectedPlan === "annual" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                      </div>
                      <p className="text-xs sm:text-sm font-black text-emerald-900 dark:text-emerald-300 mt-1">₦15,000</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">2 months free</p>
                    </button>
                  </div>

                  {/* Flutterwave Checkout Button */}
                  <button
                    type="button"
                    onClick={handlePayFlutterwave}
                    disabled={isProcessingCard}
                    className="w-full py-3 px-3 rounded-xl sm:rounded-2xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 transition-all disabled:opacity-75"
                  >
                    {isProcessingCard ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Connecting to Flutterwave…</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 text-white" />
                        <span>Pay {amountToPay} with Flutterwave</span>
                        <ArrowRight className="h-3.5 w-3.5 text-white" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Modal Bottom Status Bar */}
            <div className="p-3 sm:p-3.5 bg-white/90 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-white/10 backdrop-blur-md flex items-center justify-between text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold shrink-0">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Zero Data Deletion • Ledger Free Forever</span>
              </span>
              <button
                type="button"
                onClick={closeUpgradeModal}
                className="font-black text-blue-700 dark:text-sky-300 hover:underline cursor-pointer px-2 py-1"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
