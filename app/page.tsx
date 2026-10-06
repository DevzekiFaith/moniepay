"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Business Decision Intelligence OS
// “Know what is happening in your business. Know what to do next.”
// Flexible, Expansive, Airy Daylight Container Architecture
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from "react";
import { Plus, ArrowRight, ShieldCheck, Store } from "lucide-react";

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
import { BusinessDecisionHero } from "@/components/dashboard/BusinessDecisionHero";
import { MarketDayStrip } from "@/components/dashboard/MarketDayStrip";
import { CoreQuestionsGrid } from "@/components/dashboard/CoreQuestionsGrid";
import { LiquidAccountsDeck } from "@/components/dashboard/LiquidAccountsDeck";
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-44 sm:pb-36 selection:bg-emerald-500/20 selection:text-emerald-950">
      {/* ── TOP EXPANSIVE HERO BANNER (Daylight Gradient) ── */}
      <DaylightHeader
        business={business}
        isOnline={isOnline}
        isSyncing={isSyncing}
        onManualSync={handleManualSync}
        onOpenTracker={() => setIsTrackerOpen(true)}
        activePeriod={period}
        onChangePeriod={setPeriod}
      />

      {/* ── FLEXIBLE, EXPANSIVE CONTAINER (Smooth Curved Transition) ── */}
      <main className="relative -mt-6 rounded-t-[32px] sm:rounded-t-[40px] bg-slate-50 pt-6 px-4 sm:px-8 w-full max-w-5xl lg:max-w-6xl mx-auto space-y-7 sm:space-y-9">
        {/* Soft Organic Pill Bar */}
        <div className="mx-auto h-1.5 w-14 rounded-full bg-slate-300/80 mb-1" />

        {/* ── RESPONSIVE DYNAMIC GRID: DECISION ENGINE & CORE NUMBERS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* LEFT COLUMN: THE DECISION HERO & MARKET MOMENTUM (58% width on large screens) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            {/* The #1 Priority Action Card & Health Gauge */}
            <BusinessDecisionHero
              metrics={metrics}
              recommendations={recommendations}
              businessName={business.name}
              onOpenGbeseBook={() => setIsGbeseOpen(true)}
              onOpenWithdrawal={(safeAmt) => {
                setSafeWithdrawalAmount(safeAmt);
                setIsWithdrawalOpen(true);
              }}
              onActionComplete={() => {
                triggerBackgroundSync();
              }}
            />

            {/* 7-Day Market Rhythm Strip */}
            <MarketDayStrip />
          </div>

          {/* RIGHT COLUMN: CORE FINANCIAL QUESTIONS & ACCOUNTS DECK (42% width on large screens) */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-7">
            {/* 4 Core Financial Questions Grid */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Business Flow Summary
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Live Balances
                </span>
              </div>
              <CoreQuestionsGrid
                metrics={metrics}
                onOpenGbeseBook={() => setIsGbeseOpen(true)}
                onOpenCashDetail={() => setIsWithdrawalOpen(true)}
                onOpenRevenueDetail={() => handleOpenRecord("SALE")}
                onOpenCostsDetail={() => handleOpenRecord("EXPENSE")}
              />
            </div>

            {/* Liquid Cash & POS Accounts Deck (Horizontal card peek inspired by Image 1) */}
            <LiquidAccountsDeck
              accounts={accounts}
              onOpenWithdrawal={() => {
                setSafeWithdrawalAmount(metrics.safeWithdrawalAmount || 30000);
                setIsWithdrawalOpen(true);
              }}
            />
          </div>
        </div>

        {/* ── FULL-WIDTH EXPANSIVE SECTION: LIVE BUSINESS ACTIVITY TIMELINE ── */}
        <section className="pt-2 sm:pt-4 border-t border-slate-200/70">
          <div className="flex items-center justify-between pb-3 px-1">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                Live Business Activity
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every sale, fuel receipt, restock, and apprentice wage recorded
              </p>
            </div>

            <button
              onClick={() => handleOpenRecord("SALE")}
              className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Record Sale</span>
            </button>
          </div>

          <RecentActivityList
            transactions={filteredTransactions}
            onOpenRecordModal={() => handleOpenRecord("SALE")}
          />
        </section>
      </main>

      {/* ── FLOATING DAYLIGHT ACTION DOCK (Inspired by Image 1 & 2) ── */}
      <FloatingActionDock
        onOpenRecord={handleOpenRecord}
        onOpenGbese={() => setIsGbeseOpen(true)}
        onOpenWithdrawal={() => {
          setSafeWithdrawalAmount(metrics.safeWithdrawalAmount || 30000);
          setIsWithdrawalOpen(true);
        }}
        onOpenTracker={() => setIsTrackerOpen(true)}
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
