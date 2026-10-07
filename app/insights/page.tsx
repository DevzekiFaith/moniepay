"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Business Decision Intelligence & Diagnostics Page
// “Know what is happening in your business. Know what to do next.”
// Light & Dark Mode • Modern Navigation Architecture
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store,
  ArrowLeft,
  Send,
  Wallet,
  Tag,
  ShieldCheck,
  AlertTriangle,
  Clock,
  TrendingUp,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Compass,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Recommendation, DeterministicMetrics } from "@/types/moniepay.types";
import { calculateDeterministicMetrics } from "@/lib/intelligence/deterministicEngine";
import { generatePriorityRecommendations } from "@/lib/intelligence/diagnosticEngine";
import {
  getCachedTransactions,
  getCachedDebts,
  getCachedAccounts,
} from "@/lib/offline/offlineQueue";
import {
  DEFAULT_TRANSACTIONS,
  DEFAULT_DEBTS,
  DEFAULT_ACCOUNTS,
  DEFAULT_BUSINESS,
} from "@/lib/data/initialBusinessData";
import { AppSidebar, AppBottomBar, AppMobileHeader } from "@/components/layout/AppNavigation";

export default function InsightsPage() {
  const [metrics, setMetrics] = useState<DeterministicMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    const txs = getCachedTransactions().length > 0 ? getCachedTransactions() : DEFAULT_TRANSACTIONS;
    const debts = getCachedDebts().length > 0 ? getCachedDebts() : DEFAULT_DEBTS;
    const accs = getCachedAccounts().length > 0 ? getCachedAccounts() : DEFAULT_ACCOUNTS;

    const calcMetrics = calculateDeterministicMetrics(txs, debts, accs);
    setMetrics(calcMetrics);

    const recs = generatePriorityRecommendations(calcMetrics, txs, debts, DEFAULT_BUSINESS.name);
    setRecommendations(recs);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500/20 transition-colors">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-12">
        <AppMobileHeader />

        <main className="w-full max-w-3xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="inline-flex md:hidden p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Business Diagnostics
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Understand where your money is going and what to do next.
              </p>
            </div>

            {metrics && (
              <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800 text-blue-900 dark:text-blue-300 text-xs font-black">
                {metrics.healthStatus} ({metrics.healthScore}/100)
              </div>
            )}
          </div>

          {/* Health Overview Card */}
          {metrics && (
            <div className="rounded-[28px] bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] p-5 sm:p-6 text-white shadow-lg space-y-3 relative overflow-hidden">
              <div className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-sky-300/20 blur-xl" />
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-sky-200" />
                <span className="text-xs font-black uppercase tracking-wider text-sky-200">
                  Living Business Condition
                </span>
              </div>
              <p className="text-base sm:text-lg font-black leading-snug">
                {metrics.healthMessage}
              </p>
              <div className="pt-3 border-t border-white/20 grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs">
                  <span className="text-sky-200 text-[11px] block">Safe Chop Money</span>
                  <span className="font-black text-base sm:text-lg">₦{metrics.safeWithdrawalAmount.toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs">
                  <span className="text-sky-200 text-[11px] block">Profit Margin</span>
                  <span className="font-black text-base sm:text-lg">{metrics.profitMarginPercent}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations List */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              Active Intelligence Actions ({recommendations.length})
            </h2>

            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-[24px] bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-2.5 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
                      Priority {rec.priority_rank}
                    </span>
                    <span className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500">Action Recommended</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
                    {rec.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {rec.description}
                  </p>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11.5px] font-bold text-blue-700 dark:text-blue-400">
                      {rec.impact_summary}
                    </span>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1 text-xs font-black text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 active:scale-95 transition-all"
                    >
                      <span>Take Action</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <AppBottomBar />
      </div>
    </div>
  );
}
