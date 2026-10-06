"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Business Decision Intelligence & Diagnostics Page
// “Know what is happening in your business. Know what to do next.”
// Daylight Fluid Architecture • Single Green Market Theme
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
    <div className="flex min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500/20">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-10">
        <AppMobileHeader />

        <main className="w-full max-w-3xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="inline-flex md:hidden p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Business Diagnostics
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Understand where your money is going and what to do next.
              </p>
            </div>

            {metrics && (
              <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-black">
                {metrics.healthStatus} ({metrics.healthScore}/100)
              </div>
            )}
          </div>

          {/* Health Overview Card */}
          {metrics && (
            <div className="rounded-[26px] bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 p-5 text-white shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-emerald-200" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
                  Living Business Condition
                </span>
              </div>
              <p className="text-sm sm:text-base font-black leading-snug">
                {metrics.healthMessage}
              </p>
              <div className="pt-2 border-t border-emerald-600/60 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-emerald-200 text-[11px] block">Safe Chop Money</span>
                  <span className="font-black text-sm">₦{metrics.safeWithdrawalAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-emerald-200 text-[11px] block">Profit Margin</span>
                  <span className="font-black text-sm">{metrics.profitMarginPercent}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations List */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 px-1">
              Active Intelligence Actions ({recommendations.length})
            </h2>

            <div className="space-y-2.5">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-[22px] bg-white border border-emerald-900/10 p-4 shadow-xs space-y-2 hover:border-emerald-500 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-black uppercase tracking-wider text-emerald-800 px-2 py-0.5 rounded-full bg-emerald-50">
                      Priority {rec.priority_rank}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">Action Recommended</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                    {rec.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {rec.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800">
                      {rec.impact_summary}
                    </span>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 hover:text-emerald-900"
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
