"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Send,
  Wallet,
  Zap,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Layers,
  HelpCircle,
  PhoneCall,
  BadgeCheck,
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
  const [activeTab, setActiveTab] = useState<0 | 1 | 2 | 3>(3); // Default to "What Should I Do Now?"
  const [actionDone, setActionDone] = useState<string | null>(null);
  const [isActioning, setIsActioning] = useState(false);

  const diagnosis = diagnoseFourQuestions(metrics, debts, businessName);

  const handleExecuteAction = () => {
    setIsActioning(true);
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

    setTimeout(() => {
      setIsActioning(false);
      setActionDone("Action tracked! Decision memory updated.");
      setTimeout(() => setActionDone(null), 4000);
    }, 400);
  };

  const tabs = [
    { id: 0, label: "1. How Shop Dey Go", tag: `${diagnosis.howAmIDoing.healthScore}/100` },
    { id: 1, label: "2. Wetin Change", tag: `+${metrics.trends.salesGrowthPercent}%` },
    { id: 2, label: "3. Why E Change", tag: "Reason" },
    { id: 3, label: "4. Wetin You Go Do", tag: "Sharp Action", isPrimary: true },
  ];

  return (
    <section className="clay-card overflow-hidden">
      {/* ── TOP HERO HEADER: SLEEK SAPPHIRE & COBALT GLASS WITH HEALTH PULSE ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 p-5 sm:p-6 text-white border-b border-white/10">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/25 blur-2xl" />
        <div className="pointer-events-none absolute left-1/3 bottom-0 h-28 w-28 rounded-full bg-sky-400/15 blur-xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-inner shrink-0">
              <BadgeCheck className="h-6 w-6 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                  Shop Decision Intelligence
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-400/20 border border-blue-300/30 text-[9.5px] font-black text-blue-200 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-300 animate-pulse" />
                  Live Market Advisor
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                4 Questions Wey Go Make Your Shop Profit Grow
              </h2>
            </div>
          </div>

          {/* Quick Health Vitality Pill */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/15 shadow-sm">
            <Activity className="h-4 w-4 text-emerald-400" />
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-200/90 block leading-none">
                Vitality Index
              </span>
              <span className="text-xs font-black text-white leading-tight">
                {diagnosis.howAmIDoing.healthScore} • {diagnosis.howAmIDoing.healthStatus}
              </span>
            </div>
          </div>
        </div>

        {/* ── MOBILE-FLUID QUESTION SELECTOR TABS ── */}
        <div className="relative mt-5 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-white text-blue-950 shadow-md shadow-black/20 scale-[1.02]"
                    : "bg-white/10 text-white/90 hover:bg-white/15"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[9.5px] font-black px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? tab.isPrimary
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-200 text-slate-800"
                      : "bg-white/15 text-white"
                  }`}
                >
                  {tab.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── INTERACTIVE TAB CONTENT VIEWPORT ── */}
      <div className="p-5 sm:p-6">
        <AnimatePresence mode="wait">
          {/* TAB 0: HOW AM I DOING? */}
          {activeTab === 0 && (
            <motion.div
              key="tab-0"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Question 1: Overall Vitality
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug tracking-tight">
                {diagnosis.howAmIDoing.headline}
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                {diagnosis.howAmIDoing.detail}
              </p>

              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
                  <span className="text-[10px] font-extrabold text-emerald-700 uppercase block">Revenue</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 block">₦{metrics.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
                  <span className="text-[10px] font-extrabold text-blue-700 uppercase block">True Profit</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 block">₦{metrics.operatingProfit.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-100 text-center">
                  <span className="text-[10px] font-extrabold text-teal-700 uppercase block">Spendable Cash</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 block">₦{metrics.liquidCash.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 1: WHAT CHANGED? */}
          {activeTab === 1 && (
            <motion.div
              key="tab-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-xs font-extrabold text-blue-800 uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Question 2: Trend Divergence
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug tracking-tight">
                {diagnosis.whatChanged.headline}
              </h3>

              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/70 flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600 shrink-0" />
                <span className="text-xs sm:text-[13px] font-bold text-slate-800">
                  {diagnosis.whatChanged.metricComparison}
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                MoniePay calculates both growth in top-line sales and growth in retained cash to see if you are keeping more or losing margin.
              </p>
            </motion.div>
          )}

          {/* TAB 2: WHY DID IT CHANGE? */}
          {activeTab === 2 && (
            <motion.div
              key="tab-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-800 uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Question 3: Root Cause Analysis
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug tracking-tight">
                {diagnosis.whyItChanged.primaryReason}
              </h3>

              <div className="space-y-2 pt-1">
                {diagnosis.whyItChanged.contributingFactors.map((factor, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3"
                  >
                    <span className="h-5 w-5 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 leading-snug">
                      {factor}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: WHAT SHOULD I DO NOW? (THE STAR DECISION) */}
          {activeTab === 3 && (
            <motion.div
              key="tab-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                  <Zap className="h-4 w-4 text-emerald-600" />
                  <span>Question 4: Recommended Move Today</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black">
                  Highest Leverage
                </span>
              </div>

              {/* Elevated Action Card */}
              <div className="rounded-[24px] bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 text-white shadow-[0_8px_24px_rgba(5,150,105,0.25)] relative overflow-hidden">
                <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 bg-white/10 rounded-full blur-2xl" />

                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  {diagnosis.whatToDoNow.actionTitle}
                </h3>
                <p className="text-xs sm:text-[13px] text-emerald-100/90 font-medium mt-1.5 leading-relaxed">
                  {diagnosis.whatToDoNow.actionDetail}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleExecuteAction}
                    disabled={isActioning}
                    className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-emerald-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-80"
                  >
                    <span>{diagnosis.whatToDoNow.primaryActionLabel}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  {onOpenGbeseBook && (
                    <button
                      type="button"
                      onClick={onOpenGbeseBook}
                      className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 active:scale-95 transition-all cursor-pointer"
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
                      className="mt-3.5 flex items-center gap-2 text-xs font-bold text-emerald-200 bg-black/20 p-2.5 rounded-xl border border-white/15"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
                      <span>{actionDone}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
