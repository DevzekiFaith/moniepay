"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Business Decision Intelligence OS
// “Tell MoniePay what happened. MoniePay helps you decide what to do next.”
// Daylight Fluid Architecture • Single Green Market Theme • Framer Motion
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Store,
  HelpCircle,
  Clock,
  Home,
  CheckCircle2,
  Users,
  Wallet,
  ArrowRight,
} from "lucide-react";

// Types
import type {
  Business,
  BusinessAccount,
  BusinessTransaction,
  Debt,
  TransactionType,
} from "@/types/moniepay.types";

// Baseline Data
import {
  DEFAULT_BUSINESS,
  DEFAULT_ACCOUNTS,
  DEFAULT_DEBTS,
  DEFAULT_TRANSACTIONS,
} from "@/lib/data/initialBusinessData";

// Engines
import { calculateDeterministicMetrics } from "@/lib/intelligence/deterministicEngine";
import { generatePriorityRecommendations } from "@/lib/intelligence/diagnosticEngine";
import {
  getCachedTransactions,
  setCachedTransactions,
  getCachedDebts,
  setCachedDebts,
  getCachedAccounts,
  setCachedAccounts,
  triggerBackgroundSync,
} from "@/lib/offline/offlineQueue";

// Components
import { DaylightHeader } from "@/components/dashboard/DaylightHeader";
import { TellMoniePay } from "@/components/dashboard/TellMoniePay";
import { NextMoveCard } from "@/components/dashboard/NextMoveCard";
import { DailyBusinessPulse } from "@/components/dashboard/DailyBusinessPulse";
import { QuickDecisionsGrid } from "@/components/dashboard/QuickDecisionsGrid";
import { DecisionMemoryCard } from "@/components/dashboard/DecisionMemoryCard";
import { RecentActivityList } from "@/components/dashboard/RecentActivityList";
import { InstantRecordSheet } from "@/components/dashboard/InstantRecordSheet";
import { GbeseDebtSheet } from "@/components/dashboard/GbeseDebtSheet";
import { DecisionTrackerSheet } from "@/components/dashboard/DecisionTrackerSheet";
import { SafeWithdrawalModal } from "@/components/dashboard/SafeWithdrawalModal";
import { FloatingActionDock } from "@/components/dashboard/FloatingActionDock";

type Period = "today" | "this_week" | "this_month";
type MainTab = "today" | "decisions" | "activity";

export default function MoniePayDashboard() {
  const [business, setBusiness] = useState<Business>(DEFAULT_BUSINESS);
  const [period, setPeriod] = useState<Period>("this_week");
  const [activeTab, setActiveTab] = useState<MainTab>("today");
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Core Data States
  const [transactions, setTransactions] = useState<BusinessTransaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [accounts, setAccounts] = useState<BusinessAccount[]>([]);

  // Sheet / Modal States
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [recordInitialType, setRecordInitialType] = useState<TransactionType>("SALE");
  const [isGbeseOpen, setIsGbeseOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [safeWithdrawalAmount, setSafeWithdrawalAmount] = useState(40000);

  // 1. Initial State Hydration
  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    const handleOnline = () => {
      setIsOnline(true);
      triggerBackgroundSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const cachedTxs = getCachedTransactions();
    if (cachedTxs.length > 0) {
      setTransactions(cachedTxs);
    } else {
      setTransactions(DEFAULT_TRANSACTIONS);
      setCachedTransactions(DEFAULT_TRANSACTIONS);
    }

    const cachedDebts = getCachedDebts();
    if (cachedDebts.length > 0) {
      setDebts(cachedDebts);
    } else {
      setDebts(DEFAULT_DEBTS);
      setCachedDebts(DEFAULT_DEBTS);
    }

    const cachedAccs = getCachedAccounts();
    if (cachedAccs.length > 0) {
      setAccounts(cachedAccs);
    } else {
      setAccounts(DEFAULT_ACCOUNTS);
      setCachedAccounts(DEFAULT_ACCOUNTS);
    }

    const handleTxRecorded = (e: any) => {
      if (e?.detail?.transaction) {
        setTransactions((prev) => [e.detail.transaction, ...prev]);
      }
    };

    window.addEventListener("moniepay:transaction-recorded", handleTxRecorded);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("moniepay:transaction-recorded", handleTxRecorded);
    };
  }, []);

  // 2. Filter Transactions by Period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - 7 * 86400000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return transactions.filter((tx) => {
      const txTime = new Date(tx.transaction_date).getTime();
      if (period === "today") return txTime >= todayStart;
      if (period === "this_week") return txTime >= weekStart;
      return txTime >= monthStart;
    });
  }, [transactions, period]);

  // 3. Deterministic Business Intelligence Calculation
  const metrics = useMemo(() => {
    return calculateDeterministicMetrics(filteredTransactions, debts, accounts);
  }, [filteredTransactions, debts, accounts]);

  // 4. Diagnostic & Recommendation Engine
  const recommendations = useMemo(() => {
    return generatePriorityRecommendations(metrics, filteredTransactions, debts, business.name);
  }, [metrics, filteredTransactions, debts, business.name]);

  const handleOpenRecord = (type: TransactionType = "SALE") => {
    setRecordInitialType(type);
    setIsRecordOpen(true);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await triggerBackgroundSync();
    setTimeout(() => setIsSyncing(false), 500);
  };

  const handleDebtSettled = (debtId: string, amount: number) => {
    setDebts((prev) =>
      prev.map((d) =>
        d.id === debtId
          ? {
              ...d,
              balance_due: 0,
              amount_paid: Number(d.amount_paid) + amount,
              status: "SETTLED" as const,
            }
          : d
      )
    );
  };

  const refreshTxs = () => {
    const cachedTxs = getCachedTransactions();
    if (cachedTxs.length > 0) setTransactions(cachedTxs);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 sm:pb-32 selection:bg-emerald-500/20 selection:text-emerald-950 overflow-x-hidden">
      {/* ── TOP HEADER (Unified Emerald Theme) ── */}
      <DaylightHeader
        business={business}
        isOnline={isOnline}
        isSyncing={isSyncing}
        onManualSync={handleManualSync}
        onOpenTracker={() => setIsTrackerOpen(true)}
        activePeriod={period}
        onChangePeriod={setPeriod}
      />

      {/* ── DAYLIGHT MAIN CONTAINER (Fluid Mobile Frame) ── */}
      <main className="relative -mt-4 rounded-t-[32px] bg-slate-50 pt-3 px-3 sm:px-5 md:px-8 w-full max-w-3xl mx-auto space-y-4">
        {/* Soft Drag Handle */}
        <div className="mx-auto h-1 w-10 rounded-full bg-slate-300 mb-1" />

        {/* ── INTERACTIVE TAB SWITCHER (Reduces steps & organizes views) ── */}
        <div className="flex rounded-2xl bg-white border border-emerald-900/10 p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("today")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === "today"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Store className="h-3.5 w-3.5" />
            <span>Today's View</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("decisions")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === "decisions"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>7 Decisions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("activity")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === "activity"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Activity Log</span>
          </button>
        </div>

        {/* ── TAB CONTENT WITH FRAMER MOTION TRANSITIONS ── */}
        <AnimatePresence mode="wait">
          {activeTab === "today" && (
            <motion.div
              key="tab-today"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {/* 1. TELL MONIEPAY (Voice, Text & Instant Feedback) */}
              <TellMoniePay
                onOpenDetailedSheet={handleOpenRecord}
                onActivityRecorded={refreshTxs}
              />

              {/* 2. YOUR NEXT MOVE (The Single Star Recommendation) */}
              <NextMoveCard
                metrics={metrics}
                debts={debts}
                recommendations={recommendations}
                businessName={business.name}
                onOpenGbeseBook={() => setIsGbeseOpen(true)}
                onOpenWithdrawal={(safeAmt) => {
                  setSafeWithdrawalAmount(safeAmt);
                  setIsWithdrawalOpen(true);
                }}
              />

              {/* 3. DAILY BUSINESS VIEW (Today's Sales, Money Out, Money Available, Customers Owing) */}
              <DailyBusinessPulse
                metrics={metrics}
                onOpenGbeseBook={() => setIsGbeseOpen(true)}
                onOpenWithdrawal={() => {
                  setSafeWithdrawalAmount(metrics.safeWithdrawalAmount || 30000);
                  setIsWithdrawalOpen(true);
                }}
                onOpenSales={() => handleOpenRecord("SALE")}
                onOpenCosts={() => handleOpenRecord("EXPENSE")}
              />

              {/* Quick Actions Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenRecord("SALE")}
                  className="py-3 px-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Record Sale</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsGbeseOpen(true)}
                  className="py-3 px-3 rounded-2xl bg-white border border-emerald-900/10 hover:border-emerald-600 text-slate-800 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-xs"
                >
                  <Users className="h-4 w-4 text-emerald-700" />
                  <span>Gbese Book ({debts.filter(d => d.status !== "SETTLED").length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSafeWithdrawalAmount(metrics.safeWithdrawalAmount || 30000);
                    setIsWithdrawalOpen(true);
                  }}
                  className="col-span-2 sm:col-span-1 py-3 px-3 rounded-2xl bg-white border border-emerald-900/10 hover:border-emerald-600 text-slate-800 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-xs"
                >
                  <Wallet className="h-4 w-4 text-emerald-700" />
                  <span>Take Chop Money</span>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "decisions" && (
            <motion.div
              key="tab-decisions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {/* 7 Core Trader Decisions */}
              <QuickDecisionsGrid
                metrics={metrics}
                debts={debts}
                onOpenWithdrawal={() => {
                  setSafeWithdrawalAmount(metrics.safeWithdrawalAmount || 30000);
                  setIsWithdrawalOpen(true);
                }}
                onOpenRestock={() => handleOpenRecord("STOCK_PURCHASE")}
                onOpenGbeseBook={() => setIsGbeseOpen(true)}
                onOpenProfitDetail={() => handleOpenRecord("SALE")}
              />

              {/* Decision Memory Tracking */}
              <DecisionMemoryCard />
            </motion.div>
          )}

          {activeTab === "activity" && (
            <motion.div
              key="tab-activity"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Live Business Activity
                </h2>
                <button
                  type="button"
                  onClick={() => handleOpenRecord("SALE")}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Transaction</span>
                </button>
              </div>

              <RecentActivityList
                transactions={filteredTransactions}
                onOpenRecordModal={() => handleOpenRecord("SALE")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── FLOATING DAYLIGHT ACTION DOCK ── */}
      <FloatingActionDock
        onOpenRecord={handleOpenRecord}
        onOpenGbese={() => setIsGbeseOpen(true)}
        onOpenWithdrawal={() => {
          setSafeWithdrawalAmount(metrics.safeWithdrawalAmount || 30000);
          setIsWithdrawalOpen(true);
        }}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as MainTab)}
      />

      {/* ── INTERACTIVE MODALS & BOTTOM SHEETS ── */}
      <InstantRecordSheet
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        accounts={accounts}
        businessId={business.id}
        initialType={recordInitialType}
      />

      <GbeseDebtSheet
        isOpen={isGbeseOpen}
        onClose={() => setIsGbeseOpen(false)}
        debts={debts}
        businessName={business.name}
        businessId={business.id}
        onDebtSettled={handleDebtSettled}
      />

      <DecisionTrackerSheet
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        businessName={business.name}
      />

      <SafeWithdrawalModal
        isOpen={isWithdrawalOpen}
        onClose={() => setIsWithdrawalOpen(false)}
        safeAmount={safeWithdrawalAmount}
        businessId={business.id}
      />
    </div>
  );
}
