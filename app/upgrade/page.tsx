"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay Plus — Dedicated Upgrade & Subscription Screen
// 7-day Free Trial • ₦1,500/Month or ₦15,000/Year
// 3-day Grace Period • Zero Data Deletion Guarantee
// Soft 3D Frosted Ice-Glass Aesthetics
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  CheckCircle2,
  Zap,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Loader2,
  AlertCircle,
  Clock,
  BarChart3,
  ArrowLeft,
  Store,
  Receipt,
  HelpCircle,
  Download,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";
import { triggerInstallPrompt } from "@/components/pwa/InstallAppBanner";
import { BillingCycle } from "@/types/subscription.types";
import Link from "next/link";

function UpgradeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const {
    subscription,
    selectedPlan,
    setSelectedPlan,
    trialDaysLeft,
    graceDaysLeft,
    isTrialActive,
    isSubscribed,
    isGracePeriodActive,
    isExpired,
    initializePayment,
    verifyPayment,
    refreshSubscription,
    simulateTestPayment,
  } = useSubscription();

  const [isProcessing, setIsProcessing] = useState(false);
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
        setIsProcessing(true);

        const res = await verifyPayment(transactionId || "", txRef || "");
        setIsProcessing(false);

        if (res.success) {
          setVerifyingStatus(null);
          setSuccessMessage("Your MoniePay Plus subscription is now active! All shop features are unlocked.");
          await refreshSubscription();
        } else {
          setVerifyingStatus(null);
          setErrorMessage(res.message || "Payment verification could not be completed. Please contact support.");
        }
      };

      handleVerify();
    }
  }, [searchParams, verifyPayment, refreshSubscription]);

  const handleCheckout = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    const res = await initializePayment(undefined, selectedPlan);
    if (res.success && res.paymentLink) {
      window.location.href = res.paymentLink;
    } else {
      setErrorMessage(res.error || "Failed to initialize Flutterwave checkout.");
      setIsProcessing(false);
    }
  };

  const amountToPay = selectedPlan === "annual" ? "₦15,000" : "₦1,500";
  const planPeriodText = selectedPlan === "annual" ? "/ 12 months" : "/ month";

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#edf3fb] selection:bg-blue-500/20">
      {/* ── AMBIENT 3D BACKGROUND ORBS ── */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-300/30 to-indigo-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-tl from-blue-400/25 to-sky-200/20 blur-3xl" />
      <div className="pointer-events-none absolute top-12 left-1/4 h-32 w-32 rounded-full bg-white/40 shadow-[10px_10px_30px_rgba(160,185,218,0.4)] backdrop-blur-xl border border-white/80 float-3d" />

      {/* ── MAIN CONTAINER ── */}
      <div className="relative w-full max-w-lg my-6 z-10 space-y-4">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between px-1">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/60 hover:bg-white/90 border border-white/80 text-xs font-black text-slate-700 transition-all shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Shop</span>
          </Link>

          <button
            type="button"
            onClick={triggerInstallPrompt}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-black text-blue-900 transition-all shadow-2xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-blue-600" />
            <span>Install App 📲</span>
          </button>
        </div>

        {/* ── HERO BANNER CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="clay-card p-5 sm:p-6 space-y-4 relative overflow-hidden"
        >
          {/* Ambient light bar */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400" />

          {/* Header Row */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] clay-icon-box p-1 shrink-0 shadow-[0_10px_25px_rgba(154,180,214,0.45)]">
              <div className="h-full w-full rounded-[18px] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white">
                <BadgeCheck className="h-7 w-7 text-sky-300" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50/90 border border-blue-200 text-blue-700 text-[10.5px] font-black uppercase tracking-wide">
                <span>Shop Intelligence Plan</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                MoniePay Plus
              </h1>
            </div>
          </div>

          {/* Status Alert Banner */}
          {verifyingStatus ? (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center gap-3 animate-pulse">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin shrink-0" />
              <span>{verifyingStatus}</span>
            </div>
          ) : successMessage ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{successMessage}</p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 mt-2 text-emerald-800 font-black underline hover:no-underline"
                >
                  <span>Go to Shop Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : errorMessage ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : isExpired ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-rose-950">Your MoniePay Plus has expired.</p>
                <p className="font-semibold text-rose-800 mt-0.5">
                  Renew for ₦1,500/month or ₦15,000/year to continue recording sales and tracking debt.
                </p>
              </div>
            </div>
          ) : isGracePeriodActive ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-amber-950">Grace Period Active: {graceDaysLeft} Days Left</p>
                <p className="font-semibold text-amber-800 mt-0.5">
                  Full features are open for 3 days to renew your subscription.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-white/70 border border-white/90 shadow-2xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-3 w-3 rounded-full ${
                    isSubscribed
                      ? "bg-emerald-500"
                      : isTrialActive
                      ? "bg-blue-600 animate-pulse"
                      : "bg-rose-500"
                  }`}
                />
                <div>
                  <p className="text-xs font-black text-slate-900">
                    {isSubscribed
                      ? "Active MoniePay Plus Subscription"
                      : isTrialActive
                      ? `7-Day Free Trial: ${trialDaysLeft} days left`
                      : "Subscription Expired"}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {isSubscribed
                      ? `Renews: ${
                          subscription?.subscriptionEndsAt
                            ? new Date(subscription.subscriptionEndsAt).toLocaleDateString("en-NG", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "Active"
                        }`
                      : isTrialActive
                      ? "Enjoying full shop intelligence during your 7-day trial."
                      : "Renew for ₦1,500/mo or ₦15,000/yr to continue."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── PLAN SELECTOR TABS (Monthly vs Annual) ── */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider px-1">
              Select Your Plan:
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Monthly Plan */}
              <button
                type="button"
                onClick={() => setSelectedPlan("monthly")}
                className={`p-3.5 rounded-2xl text-left transition-all relative border cursor-pointer ${
                  selectedPlan === "monthly"
                    ? "bg-white border-blue-600 shadow-[0_8px_20px_rgba(37,99,235,0.15)] ring-2 ring-blue-600/30"
                    : "bg-white/60 border-white/80 hover:bg-white/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">Monthly Plan</span>
                  {selectedPlan === "monthly" && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                </div>
                <p className="text-base font-black text-blue-900 mt-1">₦1,500</p>
                <p className="text-[10.5px] text-slate-500 font-medium">Renews every month</p>
              </button>

              {/* Annual Plan */}
              <button
                type="button"
                onClick={() => setSelectedPlan("annual")}
                className={`p-3.5 rounded-2xl text-left transition-all relative border cursor-pointer ${
                  selectedPlan === "annual"
                    ? "bg-white border-emerald-600 shadow-[0_8px_20px_rgba(5,150,105,0.15)] ring-2 ring-emerald-600/30"
                    : "bg-white/60 border-white/80 hover:bg-white/80"
                }`}
              >
                <span className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                  Save ₦3,000
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">Annual Plan</span>
                  {selectedPlan === "annual" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                </div>
                <p className="text-base font-black text-emerald-900 mt-1">₦15,000</p>
                <p className="text-[10.5px] text-slate-500 font-medium">Renews every 12 months</p>
              </button>
            </div>
          </div>

          {/* Pricing Box (Solid Sapphire Blue) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#1e3a8a] text-white shadow-md space-y-2 text-center relative overflow-hidden">
            <p className="text-[11px] text-blue-200 font-bold uppercase tracking-wider">
              {selectedPlan === "annual" ? "Annual Plan • 2 Months Free" : "Monthly Plan • Cancel Anytime"}
            </p>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-4xl font-black text-white tracking-tight">{amountToPay}</span>
              <span className="text-sm font-bold text-blue-200">{planPeriodText}</span>
            </div>
            <p className="text-xs text-blue-100 max-w-sm mx-auto font-medium leading-relaxed">
              No hidden deductions. Instant bank transfer, debit card, or USSD via Flutterwave.
            </p>
          </div>

          {/* Zero Data Deletion Guarantee */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold leading-relaxed">
              <strong>Zero Data Deletion:</strong> Your past transactions, debt sheet, and drawer balance stay safe in your account. No data is ever deleted because of subscription expiry.
            </p>
          </div>

          {/* Primary Action Button (Solid Blue) */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full py-4 rounded-2xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75 shadow-md active:scale-98"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 text-white animate-spin" />
                <span>Opening Flutterwave…</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 text-white" />
                <span>Pay {amountToPay} with Flutterwave</span>
                <ArrowRight className="h-4 w-4 text-white" />
              </>
            )}
          </button>
        </motion.div>

        {/* Feature Highlights Grid */}
        <div className="clay-card p-5 space-y-3">
          <h3 className="text-xs font-black text-slate-700 tracking-wide uppercase">
            What MoniePay Plus Unlocks for Your Shop:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                icon: <Zap className="h-4 w-4 text-emerald-600" />,
                title: "Sharp-Sharp Recording",
                desc: "Record all transactions with voice & typing in seconds.",
              },
              {
                icon: <TrendingUp className="h-4 w-4 text-blue-600" />,
                title: "Daily Pulse & Net Profit",
                desc: "Calculate safe personal withdrawals & true profits.",
              },
              {
                icon: <MessageSquare className="h-4 w-4 text-amber-600" />,
                title: "Gbese Debt Reminders",
                desc: "Auto-generate polite WhatsApp recovery messages.",
              },
              {
                icon: <BarChart3 className="h-4 w-4 text-indigo-600" />,
                title: "7 Market Decisions",
                desc: "Wholesale restock advice and price movement alerts.",
              },
            ].map((f, i) => (
              <div key={i} className="p-3 rounded-2xl bg-white/70 border border-white/90 shadow-2xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-white shadow-2xs flex items-center justify-center shrink-0">
                    {f.icon}
                  </div>
                  <h4 className="text-xs font-black text-slate-900">{f.title}</h4>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#edf3fb]">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <UpgradeContent />
    </React.Suspense>
  );
}
