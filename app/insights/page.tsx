"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Business Decision Intelligence & Diagnostics Page
// “Know what is happening in your business. Know what to do next.”
// Continuous diagnosis of leaks, pressures, improvements, and safe actions.
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">
                Business Decision Engine
              </h1>
              <p className="text-[11px] text-zinc-400">Continuous business diagnostics</p>
            </div>
          </div>

          {metrics && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {metrics.healthScore}/100 • {metrics.healthStatus}
            </span>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main className="mx-auto max-w-2xl px-4 sm:px-6 pt-5 space-y-4">
        {/* Architecture Reminder Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <BrainCircuit className="h-4 w-4" />
            <span>MoniePay Core Engine</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            <strong className="text-white">CAPTURE → UNDERSTAND → DIAGNOSE → RECOMMEND → TRACK → LEARN</strong>
            <br />
            Every sale, fuel receipt, customer debt, and owner withdrawal feeds into a live understanding of your working capital.
          </p>
        </div>

        {/* Priority Recommendations List */}
        <div className="space-y-3 pt-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Diagnosed Actions For Your Business
          </h2>

          {recommendations.map((rec, idx) => (
            <div
              key={rec.id}
              className={`rounded-2xl border p-4.5 space-y-3 transition-all ${
                idx === 0
                  ? "border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 to-zinc-900/60 shadow-lg shadow-emerald-500/5"
                  : "border-zinc-800 bg-zinc-900/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    idx === 0
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  Priority #{idx + 1}
                </span>

                <span className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  {rec.impact_summary}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white leading-snug">
                  “{rec.title}”
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {rec.description}
                </p>
              </div>

              {/* Action Trigger */}
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Recommended Next Step:</span>
                {rec.action_type === "COLLECT_DEBT" && (
                  <button
                    onClick={() => {
                      if (rec.action_payload?.phone && rec.action_payload?.suggested_message) {
                        const cleanPhone = rec.action_payload.phone.replace(/[^0-9]/g, "");
                        window.open(
                          `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                            rec.action_payload.suggested_message
                          )}`,
                          "_blank"
                        );
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>WhatsApp Debt Reminder</span>
                  </button>
                )}

                {rec.action_type === "SAFE_WITHDRAWAL" && (
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold shadow"
                  >
                    <Wallet className="h-3.5 w-3.5" />
                    <span>Withdraw Safe ₦{rec.action_payload?.safe_amount?.toLocaleString()}</span>
                  </Link>
                )}

                {rec.action_type === "PRICE_ADJUSTMENT" && (
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold shadow"
                  >
                    <Tag className="h-3.5 w-3.5" />
                    <span>Adjust Unit Prices</span>
                  </Link>
                )}

                {rec.action_type === "GENERAL" && (
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Return to Dashboard</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
