"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay Plus — Dedicated Upgrade & Subscription Screen
// 7-day Free Trial • ₦1,500/Month Flutterwave Integration
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
} from "lucide-react";
import { motion } from "framer-motion";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

function UpgradeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const {
    subscription,
    trialDaysLeft,
    isTrialActive,
    isSubscribed,
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

  // Handle Flutterwave return callback
  useEffect(() => {
    const txRef = searchParams?.get("tx_ref");
    const transactionId = searchParams?.get("transaction_id") || searchParams?.get("id");
    const statusParam = searchParams?.get("status");

    if (transactionId || (statusParam === "successful" && txRef)) {
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

    const res = await initializePayment();
    if (res.success && res.paymentLink) {
      window.location.href = res.paymentLink;
    } else {
      setErrorMessage(res.error || "Failed to initialize Flutterwave checkout.");
      setIsProcessing(false);
    }
  };

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

          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            MoniePay Subscription
          </span>
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
                MoniePay Plus — ₦1,500/Month
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
                      : "Your 7-Day Free Trial Don Finish"}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {isSubscribed
                      ? "Full access unlocked. Thank you for supporting MoniePay!"
                      : isTrialActive
                      ? "Enjoying full shop intelligence during your trial period."
                      : "Subscribe now to keep recording & protecting your profit."}
                  </p>
                </div>
              </div>

              <span className="text-xs font-black text-blue-900 bg-blue-100/70 border border-blue-200 px-2.5 py-1 rounded-xl">
                ₦1,500 / mo
              </span>
            </div>
          )}

          {/* Pricing Box */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 text-white shadow-[0_12px_32px_rgba(30,58,138,0.3)] space-y-2 text-center relative overflow-hidden">
            <p className="text-[11px] text-blue-200 font-bold uppercase tracking-wider">
              Unlimited Shop Power • All Features Included
            </p>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-4xl font-black text-white tracking-tight">₦1,500</span>
              <span className="text-sm font-bold text-blue-200">/ 30 days</span>
            </div>
            <p className="text-xs text-blue-100 max-w-sm mx-auto font-medium leading-relaxed">
              No contracts, no hidden deductions. Securely processed by Flutterwave.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-2.5 pt-1">
            <h3 className="text-xs font-black text-slate-700 tracking-wider uppercase px-1">
              Everything Included in MoniePay Plus:
            </h3>

            <div className="space-y-2">
              {[
                {
                  icon: <Zap className="h-4 w-4 text-emerald-600" />,
                  title: "Sharp-Sharp Recording (Voice & Text)",
                  desc: "Unlimited recording of daily cash in/out, shop expenses & supplier restock.",
                },
                {
                  icon: <TrendingUp className="h-4 w-4 text-blue-600" />,
                  title: "Real Daily Profit & Available Cash Calculation",
                  desc: "Clear daily position: know your drawer cash, safe personal chop money & true profit.",
                },
                {
                  icon: <MessageSquare className="h-4 w-4 text-amber-600" />,
                  title: "Automated WhatsApp Debt Reminders (Gbese Ping)",
                  desc: "Collect pending money from customers fast with respectful, one-tap WhatsApp messages.",
                },
                {
                  icon: <BarChart3 className="h-4 w-4 text-indigo-600" />,
                  title: "7 Market Decisions & Wholesaler Price Alerts",
                  desc: "Know whether to buy stock today or wait, with real-time price trend alerts.",
                },
                {
                  icon: <ShieldCheck className="h-4 w-4 text-slate-700" />,
                  title: "100% Data Protection Guarantee",
                  desc: "Your records are never deleted. You always retain access to all past transactions.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white/60 border border-white/80 shadow-2xs flex items-start gap-3"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/90 border border-white shadow-2xs shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 leading-tight">{item.title}</p>
                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods Supported */}
          <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 text-center space-y-1.5">
            <p className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
              Pay with your preferred Nigerian payment method:
            </p>
            <p className="text-xs font-semibold text-slate-600">
              💳 Debit Card (Mastercard, Visa, Verve) • 🏦 Bank Transfer • 📱 USSD • 👛 Barter
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl clay-btn-primary font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75 shadow-[0_12px_28px_rgba(37,99,235,0.35)]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                  <span>Connecting to Flutterwave…</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 text-white" />
                  <span>Pay ₦1,500 with Flutterwave</span>
                  <ArrowRight className="h-4 w-4 text-white" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-[11px] px-1 text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Secured by Flutterwave (256-bit Encryption)
              </span>

              <button
                type="button"
                onClick={() => simulateTestPayment("activate")}
                className="text-blue-700 font-bold hover:underline cursor-pointer"
              >
                [Simulate Test Pay]
              </button>
            </div>
          </div>
        </motion.div>

        {/* Minimal Footer */}
        <p className="text-[10.5px] text-slate-400 font-bold text-center tracking-widest uppercase">
          MONIEPAY PLUS • EMPOWERING NIGERIAN TRADERS
        </p>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#edf3fb]">
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
        </div>
      }
    >
      <UpgradeContent />
    </React.Suspense>
  );
}
