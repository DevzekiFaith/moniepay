"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Business Decision Intelligence OS
// “Tell MoniePay what happened. MoniePay helps you decide what to do next.”
// Daylight Fluid Architecture • Single Green Market Theme
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";

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

export default function MoniePayDashboard() {
  const [business, setBusiness] = useState<Business>(DEFAULT_BUSINESS);
  const [period, setPeriod] = useState<Period>("this_week");
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

  // 1. Initial State Hydration (Cache-first for instant cold start)
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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-44 sm:pb-36 selection:bg-emerald-500/20 selection:text-emerald-950 overflow-x-hidden">
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

      {/* ── DAYLIGHT MAIN CONTENT (Fluid Mobile Container) ── */}
      <main className="relative -mt-6 rounded-t-[36px] bg-slate-50 pt-5 px-3.5 sm:px-6 md:px-8 w-full max-w-4xl mx-auto space-y-5 sm:space-y-6">
        {/* Soft Organic Pill Handle */}
        <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-300/80 mb-2" />

        {/* ── 1. TELL MONIEPAY (Conversational & 1-Tap Capture) ── */}
        <TellMoniePay
          onOpenDetailedSheet={handleOpenRecord}
          onActivityRecorded={refreshTxs}
        />

        {/* ── 2. YOUR NEXT MOVE (The Star Intelligence Recommendation) ── */}
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

        {/* ── 3. DAILY BUSINESS VIEW (Today's Sales, Money Out, Money Available, Customers Owing) ── */}
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

        {/* ── 4. DECISIONS YOU CAN MAKE RIGHT NOW (7 Natural Entry Points) ── */}
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

        {/* ── 5. DECISION MEMORY & LEARNING ── */}
        <DecisionMemoryCard />

        {/* ── 6. LIVE BUSINESS ACTIVITY ── */}
        <section className="pt-3 border-t border-slate-200/80">
          <div className="flex items-center justify-between pb-3 px-1">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Recent Business Activity
              </h2>
            </div>

            <button
              onClick={() => handleOpenRecord("SALE")}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record Sale</span>
            </button>
          </div>

          <RecentActivityList
            transactions={filteredTransactions}
            onOpenRecordModal={() => handleOpenRecord("SALE")}
          />
        </section>
      </main>

      {/* ── FLOATING DAYLIGHT ACTION DOCK ── */}
      <FloatingActionDock
        onOpenRecord={handleOpenRecord}
        onOpenGbese={() => setIsGbeseOpen(true)}
        onOpenWithdrawal={() => {
          setSafeWithdrawalAmount(metrics.safeWithdrawalAmount || 30000);
          setIsWithdrawalOpen(true);
        }}
        onOpenTracker={() => setIsTrackerOpen(true)}
      />

      {/* ── INTERACTIVE BOTTOM SHEETS ── */}
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
