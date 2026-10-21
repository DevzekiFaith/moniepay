"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Dedicated Staff Mode & Anti-Theft Power-Up Screen
// 100% Free Core Ledger Guarantee + Staff Multi-Device Controls
// Unlock with 20 Coins or Optional Flutterwave Subscription
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Smartphone,
  Coins,
  Users,
  Lock,
  Sparkles,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";
import { useCredits } from "@/context/CreditContext";
import { useToast } from "@/context/NotificationContext";
import { triggerInstallPrompt } from "@/components/pwa/InstallAppBanner";
import { BillingCycle } from "@/types/subscription.types";
import { STAFF_MODE_CREDIT_COST } from "@/types/credit.types";
import { CreditPurchaseModal } from "@/components/credits/CreditPurchaseModal";
import { playCashChime, triggerCashHapticVibration } from "@/lib/alerts/hapticSoundService";
import Link from "next/link";

function UpgradeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    subscription,
    selectedPlan,
    setSelectedPlan,
    isSubscribed,
    initializePayment,
    verifyPayment,
    refreshSubscription,
    activateStaffPassWithCoins,
  } = useSubscription();

  const { balance, useCreditsAction, openPurchaseModal } = useCredits();

  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [isActivatingCoins, setIsActivatingCoins] = useState(false);
  const [verifyingStatus, setVerifyingStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const verifiedOnceRef = React.useRef(false);

  // Handle Flutterwave return callback
  useEffect(() => {
    const txRef = searchParams?.get("tx_ref");
    const transactionId = searchParams?.get("transaction_id") || searchParams?.get("id");
    const statusParam = searchParams?.get("status");

    if ((transactionId || (statusParam === "successful" && txRef)) && !verifiedOnceRef.current) {
      verifiedOnceRef.current = true;
      const handleVerify = async () => {
        setVerifyingStatus("Verifying your payment with Flutterwave…");
        setIsProcessingCard(true);

        const res = await verifyPayment(transactionId || "", txRef || "");
        setIsProcessingCard(false);

        if (res.success) {
          setVerifyingStatus(null);
          setSuccessMessage("Staff Mode Activated! Multi-phone sync and anti-theft controls are now active.");
          await refreshSubscription();
        } else {
          setVerifyingStatus(null);
          setErrorMessage(res.message || "Payment verification could not be completed. Please contact support.");
        }
      };

      handleVerify();
    }
  }, [searchParams, verifyPayment, refreshSubscription]);

  // 1. Activate Staff Mode with 20 Coins
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

        setSuccessMessage("Staff Mode Activated! 🛡️ 30-day multi-phone sync and anti-theft apprentice logins unlocked with 20 Coins.");
        toast(
          "Staff Mode Activated! 🛡️",
          "30-day multi-phone sync and anti-theft apprentice logins unlocked with 20 Coins.",
          { type: "success" }
        );
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
  const handleCheckoutFlutterwave = async () => {
    setIsProcessingCard(true);
    setErrorMessage(null);

    const res = await initializePayment(undefined, selectedPlan);
    if (res.success && res.paymentLink) {
      window.location.href = res.paymentLink;
    } else {
      setErrorMessage(res.error || "Failed to initialize Flutterwave checkout.");
      setIsProcessingCard(false);
    }
  };

  const amountToPay = selectedPlan === "annual" ? "₦15,000" : "₦1,500";
  const planPeriodText = selectedPlan === "annual" ? "/ 12 months" : "/ month";

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden bg-[#edf3fb] dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500/20 selection:text-blue-950 dark:selection:text-white transition-colors">
      {/* ── AMBIENT 3D BACKGROUND ORBS ── */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-300/30 to-indigo-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-tl from-blue-400/25 to-sky-200/20 blur-3xl" />

      {/* ── MAIN CONTAINER ── */}
      <div className="relative w-full max-w-xl my-4 sm:my-6 z-10 space-y-4">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between px-1">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/70 hover:bg-white dark:bg-slate-900/70 dark:hover:bg-slate-900 border border-white/80 dark:border-white/10 text-xs font-black text-slate-700 dark:text-slate-200 transition-all shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Shop</span>
          </Link>

          <button
            type="button"
            onClick={triggerInstallPrompt}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 text-xs font-black text-blue-900 dark:text-blue-300 transition-all shadow-2xs cursor-pointer"
          >
            <Smartphone className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Install App 📲</span>
          </button>
        </div>

        {/* ── HERO BANNER CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="clay-card p-4 sm:p-6 space-y-4 relative overflow-hidden"
        >
          {/* Ambient light bar */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400" />

          {/* Header Row */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-[20px] clay-icon-box p-1 shrink-0 shadow-[0_10px_25px_rgba(154,180,214,0.45)]">
              <div className="h-full w-full rounded-[16px] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white">
                <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7 text-sky-300" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50/90 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[10.5px] font-black uppercase tracking-wide">
                <span>Shop Plan &amp; Anti-Theft Controls</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mt-0.5">
                Staff &amp; Multi-Attendant Mode
              </h1>
            </div>
          </div>

          {/* Status Alert Banner */}
          {verifyingStatus ? (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs font-bold flex items-center gap-3 animate-pulse">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin shrink-0" />
              <span>{verifyingStatus}</span>
            </div>
          ) : successMessage ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{successMessage}</p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 mt-2 text-emerald-800 dark:text-emerald-300 font-black underline hover:no-underline"
                >
                  <span>Go to Shop Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : errorMessage ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : null}

          {/* ── SECTION 1: 100% FREE CORE LEDGER GUARANTEE ── */}
          <div className="p-4 rounded-3xl bg-white/90 dark:bg-slate-800/90 border border-emerald-500/30 dark:border-emerald-500/40 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    100% Free Core Ledger Active
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    Permanent Lifetime Guarantee • ₦0 Forever
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-950 dark:text-emerald-300 border border-emerald-400/40 text-[10px] font-black uppercase">
                Active ✓
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
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

          {/* ── SECTION 2: STAFF & ATTENDANT ANTI-THEFT POWER-UP ── */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1e3a8a]/10 via-[#1d4ed8]/5 to-transparent dark:from-blue-950/40 dark:via-slate-800/60 border border-blue-500/30 dark:border-blue-500/40 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Staff &amp; Attendant Multi-Device Mode</span>
                    <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-extrabold uppercase">
                      Power-Up
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    Multi-phone apprentice sync &amp; sales-girl theft prevention
                  </p>
                </div>
              </div>
              {isSubscribed && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-950 dark:text-emerald-300 border border-emerald-400/40 text-[10px] font-black uppercase">
                  Unlocked ✓
                </span>
              )}
            </div>

            {/* Benefits */}
            <div className="space-y-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <Smartphone className="h-3.5 w-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <span><strong>Multi-Phone Live Sync:</strong> Apprentice records sales on their phone; your dashboard updates live.</span>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="h-3.5 w-3.5 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <span><strong>Anti-Theft Drawer Lock:</strong> Staff can record sales, but cannot delete records or see private profit.</span>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>+25 Free Monthly Coins:</strong> Included free for certified loan statements &amp; market alerts.</span>
              </div>
            </div>

            {/* ── UNLOCK OPTION 1: 20 COINS (RECOMMENDED) ── */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 dark:border-amber-700/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 dark:text-amber-200">
                  <Coins className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Option 1: Unlock with 20 Coins (30-Day Pass)</span>
                </div>
                <span className="text-[10.5px] font-extrabold text-amber-900 dark:text-amber-300">
                  Your Balance: {balance} Coins
                </span>
              </div>

              {balance >= STAFF_MODE_CREDIT_COST ? (
                <button
                  type="button"
                  onClick={handleActivateWithCoins}
                  disabled={isActivatingCoins}
                  className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98 transition-all disabled:opacity-75"
                >
                  {isActivatingCoins ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
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
                  <p className="text-[10.5px] text-amber-900/90 dark:text-amber-200/90 font-medium">
                    You need {STAFF_MODE_CREDIT_COST - balance} more coins to activate staff mode.
                  </p>
                  <button
                    type="button"
                    onClick={openPurchaseModal}
                    className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all shrink-0"
                  >
                    <Coins className="h-3 w-3" />
                    <span>Get Coins (from ₦200)</span>
                  </button>
                </div>
              )}
            </div>

            {/* ── UNLOCK OPTION 2: FLUTTERWAVE SUBSCRIPTION ── */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2.5">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                <span>Option 2: Pay with Debit Card / Transfer</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlan("monthly")}
                  className={`p-2.5 rounded-2xl text-left border cursor-pointer transition-all ${
                    selectedPlan === "monthly"
                      ? "bg-white dark:bg-slate-800 border-blue-600 dark:border-blue-500 ring-2 ring-blue-600/20 shadow-xs"
                      : "bg-white/60 dark:bg-slate-800/40 border-white/80 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-900 dark:text-white">Monthly</span>
                    {selectedPlan === "monthly" && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />}
                  </div>
                  <p className="text-xs sm:text-sm font-black text-blue-900 dark:text-blue-300 mt-0.5">₦1,500</p>
                  <p className="text-[9.5px] text-slate-500 font-medium">Dey renew monthly</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlan("annual")}
                  className={`p-2.5 rounded-2xl text-left border cursor-pointer transition-all relative ${
                    selectedPlan === "annual"
                      ? "bg-white dark:bg-slate-800 border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-600/20 shadow-xs"
                      : "bg-white/60 dark:bg-slate-800/40 border-white/80 dark:border-slate-700"
                  }`}
                >
                  <span className="absolute -top-1.5 right-2 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[8px] font-black uppercase">
                    Save ₦3k
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-900 dark:text-white">1 Full Year</span>
                    {selectedPlan === "annual" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                  </div>
                  <p className="text-xs sm:text-sm font-black text-emerald-900 dark:text-emerald-300 mt-0.5">₦15,000</p>
                  <p className="text-[9.5px] text-slate-500 font-medium">2 months free</p>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCheckoutFlutterwave}
                disabled={isProcessingCard}
                className="w-full py-3 px-4 rounded-xl sm:rounded-2xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 transition-all disabled:opacity-75"
              >
                {isProcessingCard ? (
                  <>
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
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
        </motion.div>

        {/* Feature Highlights Grid */}
        <div className="clay-card p-4 sm:p-5 space-y-3">
          <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 tracking-wide uppercase">
            Everything Inside Staff &amp; Attendant Mode:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              {
                icon: <Lock className="h-4 w-4 text-blue-600 dark:text-sky-400" />,
                title: "Anti-Theft Staff Logins",
                desc: "Sales boys and girls can record sales, but cannot view total profit, bank balance, or delete entries.",
              },
              {
                icon: <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
                title: "Multi-Phone Simultaneous Sync",
                desc: "Run your shop across owner phone, attendant phone, and counter tablet together in real-time.",
              },
              {
                icon: <BadgeCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />,
                title: "Priority Auto-Reconciliation",
                desc: "Direct virtual account transfer matching with zero cashier errors.",
              },
              {
                icon: <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
                title: "+25 Free Monthly Decision Coins",
                desc: "Bundled coins for certified loan statements, wholesale depot arbitrage, and deep diagnostics.",
              },
            ].map((f, i) => (
              <div key={i} className="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-white/90 dark:border-slate-700 shadow-2xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-white dark:bg-slate-900 shadow-2xs flex items-center justify-center shrink-0">
                    {f.icon}
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">{f.title}</h4>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Credit Purchase Modal for Coin Top-up */}
      <CreditPurchaseModal />
    </div>
  );
}

export default function UpgradePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#edf3fb] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <UpgradeContent />
    </React.Suspense>
  );
}
