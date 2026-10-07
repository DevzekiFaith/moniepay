"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay Plus — Upgrade & Subscription Modal
// 7-day Free Trial • ₦1,500/Month or ₦15,000/Year
// 3-day Grace Period • Zero Data Deletion Guarantee
// Soft 3D Frosted Ice-Glass Design System
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Zap,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  BadgeCheck,
  Lock,
  X,
  CreditCard,
  ArrowRight,
  Loader2,
  Clock,
  Radio,
  ExternalLink,
  Store,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";
import { BillingCycle } from "@/types/subscription.types";

export function UpgradeModal() {
  const {
    isUpgradeModalOpen,
    closeUpgradeModal,
    modalReason,
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
    simulateTestPayment,
  } = useSubscription();

  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handlePay = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await initializePayment(phoneNumber, selectedPlan);
      if (res.success && res.paymentLink) {
        // Redirect user to Flutterwave hosted checkout
        window.location.href = res.paymentLink;
      } else {
        setErrorMessage(res.error || "Could not start Flutterwave checkout. Please try again.");
        setIsProcessing(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Payment initialization failed.");
      setIsProcessing(false);
    }
  };

  const amountToPay = selectedPlan === "annual" ? "₦15,000" : "₦1,500";
  const planPeriodText = selectedPlan === "annual" ? "/ 12 months" : "/ month";

  const modalContent = (
    <AnimatePresence>
      {isUpgradeModalOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto"
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

          {/* 3D Soft Frosted Ice Card Container */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative w-full sm:max-w-lg max-h-[94vh] sm:max-h-[92vh] rounded-t-[36px] sm:rounded-[36px] overflow-hidden flex flex-col z-20 shadow-[0_24px_60px_rgba(154,180,214,0.45)] border-t sm:border border-white/70 backdrop-blur-2xl bg-[#edf3fb]/95 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Sapphire Banner (Solid Blue) */}
            <div className="bg-[#1e3a8a] px-5 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between border-b border-white/10 shrink-0 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-inner shrink-0">
                  <ShieldCheck className="h-6 w-6 text-sky-300" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-200 text-[10px] font-black uppercase tracking-wider">
                    <span>Trader Power Plan</span>
                  </div>
                  <h3 id="upgrade-modal-title" className="text-base sm:text-lg font-black tracking-tight leading-tight text-white mt-0.5">
                    MoniePay Plus
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={closeUpgradeModal}
                className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer backdrop-blur-md border border-white/20 active:scale-95 shrink-0"
                aria-label="Close modal"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body Scroll */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Context / Reason Notice if triggered by feature gate or expired */}
              {isExpired ? (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-rose-950">
                      Your MoniePay Plus has expired.
                    </p>
                    <p className="text-[11.5px] font-semibold text-rose-800 mt-0.5 leading-relaxed">
                      Renew for ₦1,500/month or ₦15,000/year to continue recording sales, tracking debt, and receiving smart advice.
                    </p>
                  </div>
                </div>
              ) : isGracePeriodActive ? (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                  <Clock className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-amber-950">
                      Grace Period Active: {graceDaysLeft} {graceDaysLeft === 1 ? "Day" : "Days"} Left
                    </p>
                    <p className="text-[11.5px] font-semibold text-amber-900 mt-0.5 leading-relaxed">
                      All your features remain open! Renew now to avoid any restriction after the 3-day grace period.
                    </p>
                  </div>
                </div>
              ) : modalReason ? (
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-start gap-2.5">
                  <Clock className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-blue-950 leading-relaxed">
                    {modalReason}
                  </p>
                </div>
              ) : null}

              {/* Status Strip */}
              <div className="p-3.5 rounded-2xl bg-white/70 border border-white/90 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      isSubscribed
                        ? "bg-emerald-500"
                        : isGracePeriodActive
                        ? "bg-amber-500 animate-pulse"
                        : isTrialActive
                        ? "bg-blue-600 animate-pulse"
                        : "bg-rose-500"
                    }`}
                  />
                  <div>
                    <p className="text-xs font-black text-slate-900">
                      {isSubscribed
                        ? `${subscription?.planName || "MoniePay Plus Active"}`
                        : isGracePeriodActive
                        ? `3-Day Grace Period (${graceDaysLeft} days left)`
                        : isTrialActive
                        ? `7-Day Free Trial (${trialDaysLeft} days left)`
                        : "Subscription Expired (Read-Only)"}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {isSubscribed
                        ? `Next Renewal: ${
                            subscription?.subscriptionEndsAt
                              ? new Date(subscription.subscriptionEndsAt).toLocaleDateString("en-NG", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "Active"
                          }`
                        : isGracePeriodActive
                        ? "Full access open for 3 days to renew."
                        : isTrialActive
                        ? "Full MoniePay Plus access during your 7-day trial."
                        : "Renew for ₦1,500/month or ₦15,000/year to continue."}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── PLAN SELECTOR TABS (Monthly vs Annual) ── */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider px-1">
                  Choose Your Subscription Plan:
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Monthly Plan Card */}
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
                      <span className="text-xs font-black text-slate-900">Monthly</span>
                      {selectedPlan === "monthly" && (
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-base font-black text-blue-900 mt-1">₦1,500</p>
                    <p className="text-[10.5px] text-slate-500 font-medium">Renews every month</p>
                  </button>

                  {/* Annual Plan Card */}
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
                      <span className="text-xs font-black text-slate-900">12 Months</span>
                      {selectedPlan === "annual" && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-base font-black text-emerald-900 mt-1">₦15,000</p>
                    <p className="text-[10.5px] text-slate-500 font-medium">Renews every 12 months</p>
                  </button>
                </div>
              </div>

              {/* Price Hero Summary Card */}
              <div className="clay-card p-4 sm:p-5 text-center space-y-2 relative overflow-hidden">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-900 text-[11px] font-black">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  <span>
                    {selectedPlan === "annual"
                      ? "Annual Plan • 2 Months Free Included"
                      : "Simple Flat Price • No Hidden Charges"}
                  </span>
                </div>

                <div className="flex items-baseline justify-center gap-1.5 pt-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {amountToPay}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-500">
                    {planPeriodText}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                  Protect your market profit, track customer credit (gbese), and receive intelligent shop advice.
                </p>
              </div>

              {/* Benefits Checklist */}
              <div className="space-y-2.5 pt-1">
                <h4 className="text-xs font-black text-slate-700 tracking-wide uppercase px-1">
                  Everything Included in MoniePay Plus:
                </h4>

                <div className="space-y-2">
                  {[
                    {
                      icon: <Zap className="h-4 w-4 text-emerald-600" />,
                      title: "Sharp-Sharp Recording (Voice & Text)",
                      desc: "Record unlimited sales, operating expenses & restock purchases.",
                    },
                    {
                      icon: <TrendingUp className="h-4 w-4 text-blue-600" />,
                      title: "Daily Business Pulse & Available Cash",
                      desc: "Know your exact drawer cash, safe chop money allowance & true net profit.",
                    },
                    {
                      icon: <MessageSquare className="h-4 w-4 text-amber-600" />,
                      title: "One-Tap WhatsApp Debt Pings (Gbese Sheet)",
                      desc: "Send polite automated WhatsApp reminders to customers owing you money.",
                    },
                    {
                      icon: <TrendingUp className="h-4 w-4 text-indigo-600" />,
                      title: "7 Market Decisions & Wholesaler Price Alerts",
                      desc: "Real-time wholesale price tracking and intelligent advice on when to buy stock.",
                    },
                    {
                      icon: <ShieldCheck className="h-4 w-4 text-slate-700" />,
                      title: "Data Stays Safe Guarantee (Zero Deletion)",
                      desc: "All transactions and account history stay stored safely forever even after expiry.",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-white/60 border border-white/80 shadow-2xs flex items-start gap-3"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/80 border border-white shadow-2xs shrink-0 mt-0.5">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 leading-tight">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Safety Notice Box */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <p className="text-[11px] font-semibold text-emerald-950 leading-relaxed">
                  <strong>Zero Data Deletion:</strong> We never delete your sales history, ledger records, or customer balances. When you pay, full access is instantly restored.
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              {/* Supported Payment Channels */}
              <div className="p-3 rounded-2xl bg-slate-100/70 border border-slate-200/60 text-center space-y-1.5">
                <p className="text-[10.5px] font-black text-slate-600 uppercase tracking-wider">
                  Supported Flutterwave Payment Methods:
                </p>
                <p className="text-[11px] font-semibold text-slate-700">
                  💳 Debit Cards (Mastercard, Visa, Verve) • 🏦 Instant Bank Transfer • 📱 USSD • 👛 Barter
                </p>
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="p-4 sm:p-5 bg-[#edf3fb]/90 border-t border-white/70 backdrop-blur-md space-y-2.5 shrink-0">
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75 shadow-md active:scale-98"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                    <span>Connecting to Flutterwave…</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 text-white" />
                    <span>Pay {amountToPay} with Flutterwave</span>
                    <ArrowRight className="h-4 w-4 text-white" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center text-[11px] px-1 text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Secured by Flutterwave (256-bit Bank-Grade Encryption)
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
