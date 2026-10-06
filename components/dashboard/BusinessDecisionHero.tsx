"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Send,
  Wallet,
  TrendingUp,
  Tag,
  ShieldCheck,
  ChevronRight,
  Clock,
  ThumbsUp,
} from "lucide-react";
import type { DeterministicMetrics, Recommendation } from "@/types/moniepay.types";

interface BusinessDecisionHeroProps {
  metrics: DeterministicMetrics;
  recommendations: Recommendation[];
  businessName: string;
  onActionComplete?: (recId: string, actionType: string) => void;
  onOpenGbeseBook?: () => void;
  onOpenWithdrawal?: (safeAmount: number) => void;
}

export function BusinessDecisionHero({
  metrics,
  recommendations,
  businessName,
  onActionComplete,
  onOpenGbeseBook,
  onOpenWithdrawal,
}: BusinessDecisionHeroProps) {
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isActioning, setIsActioning] = useState(false);

  const primaryRec = recommendations[0];

  const handleAction = async () => {
    if (!primaryRec) return;
    setIsActioning(true);

    if (primaryRec.action_type === "COLLECT_DEBT") {
      if (primaryRec.action_payload?.phone && primaryRec.action_payload?.suggested_message) {
        const cleanPhone = primaryRec.action_payload.phone.replace(/[^0-9]/g, "");
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
          primaryRec.action_payload.suggested_message
        )}`;
        window.open(waUrl, "_blank");
      } else if (onOpenGbeseBook) {
        onOpenGbeseBook();
      }
    } else if (primaryRec.action_type === "SAFE_WITHDRAWAL") {
      if (onOpenWithdrawal) {
        onOpenWithdrawal(primaryRec.action_payload?.safe_amount || metrics.safeWithdrawalAmount);
      }
    }

    setTimeout(() => {
      setIsActioning(false);
      setActionSuccess("Action noted! Tracking business impact.");
      if (onActionComplete) {
        onActionComplete(primaryRec.id, primaryRec.action_type);
      }
      setTimeout(() => setActionSuccess(null), 3500);
    }, 500);
  };

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = Math.min(100, Math.max(10, metrics.healthScore));
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <section className="flex flex-col gap-5 sm:gap-6">
      {/* ── THE #1 NORTH-STAR DECISION CARD (FitBite Styled Progress Card) ── */}
      {primaryRec && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-[28px] border border-emerald-200/90 bg-gradient-to-br from-emerald-50 via-lime-50/60 to-white p-5 sm:p-7 shadow-[0_8px_30px_-4px_rgba(16,185,129,0.14)]"
        >
          {/* Subtle decorative radial glow */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-300/25 blur-3xl" />

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 pr-0 sm:pr-4">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/10 text-emerald-800 text-xs font-bold tracking-tight mb-2.5">
                <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
                <span>What to do next today</span>
              </div>

              <h2 className="text-base sm:text-xl font-extrabold text-slate-900 leading-snug tracking-tight">
                “{primaryRec.title}”
              </h2>

              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
                {primaryRec.description}
              </p>
            </div>

            {/* Circular Health Gauge */}
            <div className="relative flex items-center justify-center shrink-0 self-start sm:self-center">
              <svg width="88" height="88" className="transform -rotate-90">
                <circle
                  cx="44"
                  cy="44"
                  r={radius}
                  stroke="#e2e8f0"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="44"
                  cy="44"
                  r={radius}
                  stroke="#10b981"
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black text-slate-900 leading-none">
                  {metrics.healthScore}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 tracking-tight mt-0.5">
                  {metrics.healthStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-4 pt-3.5 border-t border-emerald-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{primaryRec.impact_summary}</span>
            </div>

            <button
              onClick={handleAction}
              disabled={isActioning}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 text-xs sm:text-sm font-bold shadow-[0_6px_20px_-2px_rgba(5,150,105,0.4)] active:scale-95 transition-all cursor-pointer"
            >
              {primaryRec.action_type === "COLLECT_DEBT" && (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send WhatsApp Nudge</span>
                </>
              )}
              {primaryRec.action_type === "SAFE_WITHDRAWAL" && (
                <>
                  <Wallet className="h-4 w-4" />
                  <span>
                    Withdraw Safe ₦{primaryRec.action_payload?.safe_amount?.toLocaleString()}
                  </span>
                </>
              )}
              {primaryRec.action_type === "PRICE_ADJUSTMENT" && (
                <>
                  <Tag className="h-4 w-4" />
                  <span>Review Unit Prices</span>
                </>
              )}
              {primaryRec.action_type === "SUPPLIER_DUE" && (
                <>
                  <Clock className="h-4 w-4" />
                  <span>View Supplier Debts</span>
                </>
              )}
              {primaryRec.action_type === "GENERAL" && (
                <>
                  <ThumbsUp className="h-4 w-4" />
                  <span>Mark Done</span>
                </>
              )}
            </button>
          </div>

          {actionSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3.5 py-2 rounded-xl border border-emerald-300"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{actionSuccess}</span>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ── REAL OPERATING PROFIT BANNER ── */}
      <div className="rounded-[26px] bg-white border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Real Operating Profit</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                metrics.profitMarginPercent >= 20
                  ? "bg-emerald-100 text-emerald-700"
                  : metrics.profitMarginPercent >= 10
                  ? "bg-blue-100 text-blue-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {metrics.profitMarginPercent}% Margin
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            ₦{metrics.operatingProfit.toLocaleString()}
          </div>
        </div>

        {metrics.ownerWithdrawals > 0 && (
          <div className="text-right pl-6 border-l border-slate-100">
            <span className="text-xs font-bold text-slate-400 block">
              Taken Home (Chop)
            </span>
            <span className="text-base sm:text-xl font-black text-slate-700 mt-1 block">
              ₦{metrics.ownerWithdrawals.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
