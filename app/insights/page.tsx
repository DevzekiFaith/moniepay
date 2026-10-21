"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Business Decision Intelligence & Diagnostics Page
// Free Basic Living Condition + Paid In-Depth Business Insight
// Simple Prepaid Insight Credits (5 credits per deep diagnosis)
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Store,
  ArrowLeft,
  Coins,
  ShieldCheck,
  AlertTriangle,
  Clock,
  TrendingUp,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Compass,
  Sparkles,
  PieChart,
  ArrowDownRight,
  ArrowUpRight,
  AlertCircle,
  FileText,
  RotateCw,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Recommendation, DeterministicMetrics, BusinessTransaction, Debt, BusinessAccount } from "@/types/moniepay.types";
import { calculateDeterministicMetrics } from "@/lib/intelligence/deterministicEngine";
import { generatePriorityRecommendations } from "@/lib/intelligence/diagnosticEngine";
import { useAuth } from "@/context/AuthContext";
import { useCredits } from "@/context/CreditContext";
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
import { CreditBalancePill } from "@/components/credits/CreditBalancePill";
import { PaidInsightResult } from "@/types/credit.types";

export default function InsightsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const {
    balance,
    costPerInsight,
    openPurchaseModal,
    requestPaidInsight,
    verifyCreditPayment,
  } = useCredits();

  const currentBizId = user?.id
    ? user.id === "user_owner_01"
      ? "biz_mamachidi_01"
      : `biz_${user.id}`
    : DEFAULT_BUSINESS.id;
  const isDemoShop = !user || user.id === "user_owner_01" || currentBizId === "biz_mamachidi_01";
  const businessName = user?.businessName || (user?.name ? `${user.name} Provisions` : DEFAULT_BUSINESS.name);

  const [metrics, setMetrics] = useState<DeterministicMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activeTxs, setActiveTxs] = useState<BusinessTransaction[]>([]);
  const [activeDebts, setActiveDebts] = useState<Debt[]>([]);
  const [activeAccs, setActiveAccs] = useState<BusinessAccount[]>([]);

  // Paid Insight State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentReport, setCurrentReport] = useState<PaidInsightResult | null>(null);
  const [pastReports, setPastReports] = useState<PaidInsightResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Initial Data Load
  useEffect(() => {
    const cachedTxs = getCachedTransactions(currentBizId);
    const txs = cachedTxs.length > 0 ? cachedTxs : isDemoShop ? DEFAULT_TRANSACTIONS : [];
    setActiveTxs(txs);

    const cachedDebts = getCachedDebts(currentBizId);
    const debts = cachedDebts.length > 0 ? cachedDebts : isDemoShop ? DEFAULT_DEBTS : [];
    setActiveDebts(debts);

    const cachedAccs = getCachedAccounts(currentBizId);
    const accs = cachedAccs.length > 0 ? cachedAccs : isDemoShop ? DEFAULT_ACCOUNTS : [];
    setActiveAccs(accs);

    const calcMetrics = calculateDeterministicMetrics(txs, debts, accs);
    setMetrics(calcMetrics);

    const recs = generatePriorityRecommendations(calcMetrics, txs, debts, businessName);
    setRecommendations(recs);
  }, [currentBizId, isDemoShop, businessName]);

  // 2. Fetch past reports from server
  useEffect(() => {
    const fetchPastReports = async () => {
      try {
        const res = await fetch("/api/credits/insight");
        if (res.ok) {
          const data = await res.json();
          if (data?.reports && Array.isArray(data.reports)) {
            setPastReports(data.reports);
            if (!currentReport && data.reports.length > 0) {
              setCurrentReport(data.reports[0]);
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch past reports:", err);
      }
    };
    fetchPastReports();
  }, [currentReport]);

  // 3. Handle Flutterwave Checkout Callback
  useEffect(() => {
    const statusParam = searchParams.get("credit_status");
    const txRef = searchParams.get("tx_ref");
    const packId = searchParams.get("pack_id") || undefined;
    const transactionId = searchParams.get("transaction_id") || undefined;

    if (statusParam === "callback" && (txRef || transactionId)) {
      verifyCreditPayment(transactionId, txRef || undefined, packId);
      // Clean URL params cleanly
      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [searchParams, verifyCreditPayment]);

  // 4. Handle Insight Request
  const handleStartInsight = () => {
    setErrorMsg(null);
    if (balance < costPerInsight) {
      openPurchaseModal();
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleConfirmGeneration = async () => {
    setIsConfirmModalOpen(false);
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await requestPaidInsight({
        transactions: activeTxs,
        debts: activeDebts,
        accounts: activeAccs,
        businessName,
      });

      if (res.success && res.report) {
        setCurrentReport(res.report);
        setPastReports((prev) => [res.report!, ...prev.filter((r) => r.id !== res.report!.id)]);
      } else {
        setErrorMsg(res.error || "Could not complete diagnosis.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500/20 transition-colors">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-12">
        <AppMobileHeader />

        <main className="w-full max-w-3xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-5">
          {/* Top Header */}
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
                Understand spending patterns, detect cash leaks & protect your profit.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <CreditBalancePill />
              {metrics && (
                <div className="hidden sm:inline-flex px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800 text-blue-900 dark:text-blue-300 text-xs font-black">
                  {metrics.healthStatus} ({metrics.healthScore}/100)
                </div>
              )}
            </div>
          </div>

          {/* ── PAID FEATURE: Deep Business Diagnostic CTA Card ── */}
          <div className="rounded-[28px] bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent border border-amber-200 dark:border-amber-900/50 p-4 sm:p-6 shadow-xs relative overflow-hidden space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                    Paid Diagnostic
                  </span>
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    Cost: {costPerInsight} Credits
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  In-Depth Financial Diagnosis & Cash Leaks Audit
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                  Analyzes your recorded income and expenses to explain spending patterns, detect potential cash leaks (uncollected debts, over-withdrawals, carton markup gaps), and provide a concrete action plan.
                </p>
              </div>

              <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                <button
                  onClick={handleStartInsight}
                  disabled={isGenerating}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <BrainCircuit className="h-4 w-4" />
                  <span>{isGenerating ? "Analyzing Numbers..." : `Run Diagnosis (${costPerInsight} Credits)`}</span>
                </button>

                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Balance: {balance} credits
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-medium">
                {errorMsg}
              </div>
            )}
          </div>

          {/* ── Generated Paid Report Display ── */}
          {currentReport && (
            <div className="rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
                      Diagnosis Report
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • {new Date(currentReport.generatedAt).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {currentReport.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    {currentReport.metricsSnapshot.transactionCount} transactions analyzed
                  </span>
                  {currentReport.creditsCost > 0 && (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                      {currentReport.creditsCost} Credits Paid
                    </span>
                  )}
                </div>
              </div>

              {/* Status Notice if Insufficient Data */}
              {currentReport.status === "INSUFFICIENT_DATA" ? (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-black text-xs sm:text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Insufficient Data to Diagnose Spending Patterns</span>
                  </div>
                  <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed font-medium">
                    {currentReport.summary}
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold pt-1">
                    ✓ Zero credits were deducted from your balance.
                  </p>
                </div>
              ) : (
                <>
                  {/* Executive Summary */}
                  <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 block">
                      Executive Financial Summary
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      {currentReport.summary}
                    </p>

                    <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10.5px] text-slate-400 block">Total Revenue</span>
                        <span className="font-black text-slate-900 dark:text-white">
                          ₦{currentReport.metricsSnapshot.totalRevenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10.5px] text-slate-400 block">Operating Profit</span>
                        <span className="font-black text-slate-900 dark:text-white">
                          ₦{currentReport.metricsSnapshot.operatingProfit.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10.5px] text-slate-400 block">Profit Margin</span>
                        <span className="font-black text-slate-900 dark:text-white">
                          {currentReport.metricsSnapshot.profitMarginPercent}%
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-[10.5px] text-slate-400 block">Customer Debt</span>
                        <span className="font-black text-slate-900 dark:text-white">
                          ₦{currentReport.metricsSnapshot.customerDebtTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 1. Spending Patterns Breakdown */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <PieChart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        1. Spending Patterns & Outflow Breakdown
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentReport.spendingPatterns.map((pat, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-black text-slate-900 dark:text-white">
                              {pat.category}
                            </span>
                            <span className="font-bold text-blue-700 dark:text-blue-400">
                              {pat.percentageOfExpenses}% of spend
                            </span>
                          </div>
                          <div className="text-base font-black text-slate-900 dark:text-white">
                            ₦{pat.amount.toLocaleString()}
                          </div>
                          <p className="text-[11.5px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                            {pat.observation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Potential Cash Leaks */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        2. Potential Cash Leaks Detected
                      </h4>
                    </div>

                    <div className="space-y-2.5">
                      {currentReport.cashLeaks.map((leak, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                              {leak.title}
                            </span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                leak.severity === "HIGH"
                                  ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                                  : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                              }`}
                            >
                              {leak.severity} Severity
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                            {leak.description}
                          </p>

                          <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                            <span className="text-amber-600 dark:text-amber-400">Fix Action:</span>
                            <span>{leak.fixAction}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Practical Areas for Improvement */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        3. Practical Action Steps for Improvement
                      </h4>
                    </div>

                    <div className="space-y-2.5">
                      {currentReport.improvements.map((imp) => (
                        <div
                          key={imp.step}
                          className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 space-y-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10.5px] font-black shrink-0">
                              {imp.step}
                            </span>
                            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                              {imp.title}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pl-7">
                            {imp.recommendation}
                          </p>

                          <div className="pl-7 pt-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                            Expected outcome: {imp.expectedOutcome}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Free Basic Living Condition Overview ── */}
          {metrics && (
            <div className="space-y-3 pt-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                Living Business Condition (Free Pulse)
              </h2>

              <div className="rounded-[28px] bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] p-5 sm:p-6 text-white shadow-lg space-y-3 relative overflow-hidden">
                <div className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-sky-300/20 blur-xl" />
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-sky-200" />
                  <span className="text-xs font-black uppercase tracking-wider text-sky-200">
                    Live Status
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
            </div>
          )}

          {/* ── Past Reports History List ── */}
          {pastReports.length > 1 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                Past Generated Financial Diagnoses
              </h3>
              <div className="space-y-2">
                {pastReports.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setCurrentReport(r)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                      currentReport?.id === r.id
                        ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500 font-bold"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <span className="font-black text-slate-900 dark:text-white block">
                          {r.title}
                        </span>
                        <span className="text-[10.5px] text-slate-400">
                          {new Date(r.generatedAt).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400">
                      View Report →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <AppBottomBar />
      </div>

      {/* Confirmation Modal Before Deducting Credits */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Confirm Diagnostic
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Business Diagnostic Analysis
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Cost:</span>
                <span className="font-black text-amber-600 dark:text-amber-400">
                  {costPerInsight} Credits
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Your Balance:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {balance} Credits
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Balance After:</span>
                <span className="font-black text-slate-900 dark:text-white">
                  {balance - costPerInsight} Credits
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              • Credits are only deducted if the diagnosis succeeds.
              <br />
              • If your recorded data is insufficient, 0 credits will be charged.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmGeneration}
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-xs"
              >
                Confirm ({costPerInsight} Credits)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
