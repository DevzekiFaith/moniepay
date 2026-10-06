"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay Plus — Upgrade & Subscription Modal
// 7-day Free Trial • ₦1,500/Month Flutterwave Checkout
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
} from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";

export function UpgradeModal() {
  const {
    isUpgradeModalOpen,
    closeUpgradeModal,
    modalReason,
    subscription,
    trialDaysLeft,
    isTrialActive,
    isSubscribed,
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
      const res = await initializePayment(phoneNumber);
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
            className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[90vh] rounded-t-[36px] sm:rounded-[36px] overflow-hidden flex flex-col z-20 shadow-[0_24px_60px_rgba(154,180,214,0.45)] border-t sm:border border-white/70 backdrop-blur-2xl bg-[#edf3fb]/95 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Electric Sapphire Glass Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 px-5 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between border-b border-white/10 shrink-0 relative overflow-hidden">
              {/* Ambient light glow */}
              <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-blue-500/25 blur-2xl" />

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
              {/* Context / Reason Notice if triggered by feature gate */}
              {modalReason && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
                  <Clock className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-amber-950 leading-relaxed">
                    {modalReason}
                  </p>
                </div>
              )}

              {/* Trial Status Strip */}
              <div className="p-3.5 rounded-2xl bg-white/70 border border-white/90 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`h-3 w-3 rounded-full ${isSubscribed ? "bg-emerald-500" : isTrialActive ? "bg-blue-600 animate-pulse" : "bg-rose-500"}`} />
                  <div>
                    <p className="text-xs font-black text-slate-900">
                      {isSubscribed
                        ? "MoniePay Plus Active"
                        : isTrialActive
                        ? `7-Day Free Trial (${trialDaysLeft} days left)`
                        : "7-Day Free Trial Don Expire"}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {isSubscribed
                        ? `Renew date: ${subscription?.subscriptionEndsAt ? new Date(subscription.subscriptionEndsAt).toLocaleDateString("en-NG") : "Active"}`
                        : isTrialActive
                        ? "Full decision features unlocked for you."
                        : "Subscribe to continue recording & getting alerts."}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-blue-900 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-xl">
                    ₦1,500 / mo
                  </span>
                </div>
              </div>

              {/* Price Hero Card */}
              <div className="clay-card p-4 sm:p-5 text-center space-y-2 relative overflow-hidden">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-900 text-[11px] font-black">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  <span>Simple Flat Price • No Hidden Charges</span>
                </div>

                <div className="flex items-baseline justify-center gap-1.5 pt-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    ₦1,500
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-500">
                    / every month
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                  Protect your market profit, track who dey owe you gbese, and know exactly what to restock.
                </p>
              </div>

              {/* Benefits Checklist */}
              <div className="space-y-2.5 pt-1">
                <h4 className="text-xs font-black text-slate-700 tracking-wide uppercase px-1">
                  Wetin You Dey Get Inside MoniePay Plus:
                </h4>

                <div className="space-y-2">
                  {[
                    {
                      icon: <Zap className="h-4 w-4 text-emerald-600" />,
                      title: "Sharp-Sharp Recording (Voice & Text)",
                      desc: "Record all sales, expenses & stock purchases without any daily limit.",
                    },
                    {
                      icon: <TrendingUp className="h-4 w-4 text-blue-600" />,
                      title: "Daily Profit & Available Cash Calculation",
                      desc: "Know your exact drawer cash, safe personal allowance & real market profit.",
                    },
                    {
                      icon: <MessageSquare className="h-4 w-4 text-amber-600" />,
                      title: "One-Tap WhatsApp Debt Pings (Gbese Reminder)",
                      desc: "Send polite automated WhatsApp reminders to customers who owe you money.",
                    },
                    {
                      icon: <TrendingUp className="h-4 w-4 text-indigo-600" />,
                      title: "7 Market Decisions & Wholesaler Price Alerts",
                      desc: "Get real-time market price movements and clear advice on when to buy stock.",
                    },
                    {
                      icon: <ShieldCheck className="h-4 w-4 text-slate-700" />,
                      title: "100% Data Protection Guarantee",
                      desc: "Your past transaction records and customer list dey safe forever even if your sub pauses.",
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
                  Secured by Flutterwave
                </span>

                {/* Developer Simulation Toggle */}
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
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
