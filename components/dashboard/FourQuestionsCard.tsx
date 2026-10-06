"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Send,
  Wallet,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import type { DeterministicMetrics, Debt } from "@/types/moniepay.types";
import { diagnoseFourQuestions } from "@/lib/intelligence/deterministicEngine";
import { recordDecisionAction } from "@/lib/intelligence/decisionMemory";

interface FourQuestionsCardProps {
  metrics: DeterministicMetrics;
  debts: Debt[];
  businessName?: string;
  onOpenGbeseBook?: () => void;
  onOpenWithdrawal?: (amount: number) => void;
}

export function FourQuestionsCard({
  metrics,
  debts,
  businessName = "Mama Chidi Super Provisions",
  onOpenGbeseBook,
  onOpenWithdrawal,
}: FourQuestionsCardProps) {
  const [actionDone, setActionDone] = useState<string | null>(null);

  const diagnosis = diagnoseFourQuestions(metrics, debts, businessName);

  const handleExecuteAction = () => {
    const { whatToDoNow } = diagnosis;

    if (whatToDoNow.actionType === "COLLECT_DEBT") {
      if (whatToDoNow.payload?.phone && whatToDoNow.payload?.suggested_message) {
        const cleanPhone = whatToDoNow.payload.phone.replace(/[^0-9]/g, "");
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
          whatToDoNow.payload.suggested_message
        )}`;
        window.open(waUrl, "_blank");
      } else if (onOpenGbeseBook) {
        onOpenGbeseBook();
      }
      recordDecisionAction(
        "rec_debt_collect",
        whatToDoNow.actionTitle,
        `Sent WhatsApp debt reminder to ${whatToDoNow.payload?.person_name || "customer"}`,
        `Recover ₦${(whatToDoNow.payload?.balance_due || 0).toLocaleString()} into cash drawer`
      );
    } else if (whatToDoNow.actionType === "SAFE_WITHDRAWAL") {
      if (onOpenWithdrawal) {
        onOpenWithdrawal(whatToDoNow.payload?.safe_amount || metrics.safeWithdrawalAmount);
      }
      recordDecisionAction(
        "rec_safe_withdrawal",
        whatToDoNow.actionTitle,
        `Withdrew safe allowance of ₦${(whatToDoNow.payload?.safe_amount || 0).toLocaleString()}`,
        "Restock capital left 100% intact"
      );
    } else {
      if (onOpenGbeseBook) onOpenGbeseBook();
    }

    setActionDone("Action tracked! Decision memory updated.");
    setTimeout(() => setActionDone(null), 4000);
  };

  return (
    <section className="rounded-[28px] bg-white border border-slate-200/90 shadow-[0_6px_30px_-4px_rgba(15,23,42,0.06)] overflow-hidden">
      {/* ── CARD HEADER: THE ADVISOR PROMISE ── */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 px-5 sm:px-6 py-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
            <Lightbulb className="h-4 w-4 text-emerald-300" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 block leading-none">
              Daily Business Intelligence
            </span>
            <h2 className="text-sm font-black text-white leading-tight mt-0.5">
              The 4 Questions That Matter Today
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10.5px] font-bold text-emerald-200">
          <span>Health: {diagnosis.howAmIDoing.healthScore}/100</span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* ── QUESTION 1: HOW IS MY BUSINESS DOING? ── */}
        <div className="space-y-1.5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
              1
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              How is my business doing?
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {diagnosis.howAmIDoing.headline}
          </h3>
          <p className="text-xs sm:text-[13px] text-slate-600 font-medium leading-relaxed">
            {diagnosis.howAmIDoing.detail}
          </p>
        </div>

        {/* ── QUESTION 2: WHAT CHANGED? ── */}
        <div className="space-y-1.5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
              2
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              What changed?
            </span>
          </div>
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            {diagnosis.whatChanged.headline}
          </h3>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700">
            <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
            <span>{diagnosis.whatChanged.metricComparison}</span>
          </div>
        </div>

        {/* ── QUESTION 3: WHY DID IT CHANGE? ── */}
        <div className="space-y-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
              3
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Why did it change?
            </span>
          </div>
          <p className="text-xs sm:text-[13px] font-bold text-slate-800">
            {diagnosis.whyItChanged.primaryReason}
          </p>
          <ul className="space-y-1.5 pl-1">
            {diagnosis.whyItChanged.contributingFactors.map((factor, i) => (
              <li key={i} className="flex items-start gap-2 text-xs font-medium text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── QUESTION 4: WHAT SHOULD I DO NOW? (THE PRIMARY ACTION) ── */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-black">
              4
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700">
              What should I do right now?
            </span>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 border border-emerald-200/80 p-4 sm:p-5">
            <h4 className="text-sm sm:text-base font-black text-slate-900">
              {diagnosis.whatToDoNow.actionTitle}
            </h4>
            <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
              {diagnosis.whatToDoNow.actionDetail}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExecuteAction}
                className="px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white text-xs font-black shadow-md shadow-emerald-700/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>{diagnosis.whatToDoNow.primaryActionLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {onOpenGbeseBook && (
                <button
                  type="button"
                  onClick={onOpenGbeseBook}
                  className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer transition-all"
                >
                  View All Debts
                </button>
              )}
            </div>

            <AnimatePresence>
              {actionDone && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-800"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{actionDone}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
