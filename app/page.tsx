"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Business Decision Intelligence OS
// “Tell MoniePay what happened. MoniePay helps you decide what to do next.”
// Daylight Fluid Architecture • Single Green Market Theme • Framer Motion
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
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
  Search,
  SlidersHorizontal,
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
import { SubscriptionBannerCard } from "@/components/dashboard/SubscriptionBannerCard";
import { BusinessWalletCard } from "@/components/wallet/BusinessWalletCard";
import { ReceiveMoneyModal } from "@/components/wallet/ReceiveMoneyModal";
import { LiveMarketFeedCard } from "@/components/intelligence/LiveMarketFeedCard";
import { useToast } from "@/context/NotificationContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";

type Period = "today" | "this_week" | "this_month";
type MainTab = "today" | "decisions" | "activity";

export default function MoniePayDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { requireSubscription } = useSubscription();
  const [business, setBusiness] = useState<Business>(DEFAULT_BUSINESS);

  // Synchronize business with authenticated user profile
  useEffect(() => {
    if (user?.businessName || user?.name) {
      setBusiness((prev) => ({
        ...prev,
        name: user.businessName || (user.name ? `${user.name} Provisions` : prev.name),
        market_location: user.marketLocation || prev.market_location,
      }));
    }
  }, [user]);
  const [period, setPeriod] = useState<Period>("this_week");
  const [activeTab, setActiveTab] = useState<MainTab>("today");
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Tab switch handler with instant toast
  const handleTabChange = (tabId: MainTab) => {
    if (tabId === activeTab) return;
    setActiveTab(tabId);
    if (tabId === "today") {
      toast("Today's View", "Shop pulse, available cash & wetin you suppose do next.", { type: "info" });
    } else if (tabId === "decisions") {
      toast("7 Market Decisions", "Wholesaler price alerts & stock restocking advice.", { type: "info" });
    } else if (tabId === "activity") {
      toast("Activity Log", "Transactions, cash flow & money records.", { type: "info" });
    }
  };

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
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(125000);
  const [safeWithdrawalAmount, setSafeWithdrawalAmount] = useState(40000);

  // Activity Tab Search & Filter State
  const [activitySearch, setActivitySearch] = useState("");
  const [activityFilterType, setActivityFilterType] = useState("ALL");

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

  // 2b. Activity Tab Specific Filter & Search
  const activityTabTransactions = useMemo(() => {
    return filteredTransactions.filter((tx) => {
      const q = activitySearch.toLowerCase();
      const matchesSearch =
        !q ||
        (tx.description?.toLowerCase() || "").includes(q) ||
        (tx.category?.toLowerCase() || "").includes(q) ||
        (tx.type?.toLowerCase() || "").includes(q) ||
        (tx.payment_method?.toLowerCase() || "").includes(q);

      const matchesType =
        activityFilterType === "ALL" ||
        (activityFilterType === "SALE" && tx.type === "SALE" && tx.payment_method !== "CREDIT") ||
        (activityFilterType === "CREDIT" && (tx.payment_method === "CREDIT" || tx.type === "DEBT_COLLECTION" || tx.category?.toLowerCase().includes("credit"))) ||
        (activityFilterType === "STOCK" && tx.type === "STOCK_PURCHASE") ||
        (activityFilterType === "EXPENSE" && (tx.type === "EXPENSE" || tx.type === "STAFF_PAYMENT")) ||
        (activityFilterType === "WITHDRAWAL" && tx.type === "OWNER_WITHDRAWAL");

      return matchesSearch && matchesType;
    });
  }, [filteredTransactions, activitySearch, activityFilterType]);

  // 3. Deterministic Business Intelligence Calculation
  const metrics = useMemo(() => {
    return calculateDeterministicMetrics(filteredTransactions, debts, accounts);
  }, [filteredTransactions, debts, accounts]);

  // 4. Diagnostic & Recommendation Engine
  const recommendations = useMemo(() => {
    return generatePriorityRecommendations(metrics, filteredTransactions, debts, business.name);
  }, [metrics, filteredTransactions, debts, business.name]);

  const handleOpenRecord = (type: TransactionType = "SALE") => {
    requireSubscription(() => {
      setRecordInitialType(type);
      setIsRecordOpen(true);
    }, "Sharp-Sharp Recording");
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

  const handleSimulateIncomingTransfer = (amount: number, senderName: string) => {
    const txId = `tx_auto_${Date.now()}`;
    const newTx: BusinessTransaction = {
      id: txId,
      client_tx_id: txId,
      business_id: business.id,
      type: "SALE",
      amount: amount,
      category: "Shop Sale (Auto-Transfer)",
      description: `Direct Transfer from ${senderName} (Providus Bank)`,
      payment_method: "TRANSFER",
      transaction_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      metadata: {
        receipt_reference: `FLW-${Date.now().toString().slice(-6)}`,
        source_channel: "IN_PERSON",
      },
    };

    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    setCachedTransactions(updatedTxs);
    setWalletBalance((prev) => prev + amount);
  };

  const refreshTxs = () => {
    const cachedTxs = getCachedTransactions();
    if (cachedTxs.length > 0) setTransactions(cachedTxs);
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 pb-28 sm:pb-32 selection:bg-blue-500/20 selection:text-blue-950 dark:selection:text-white overflow-x-hidden transition-colors">
      {/* ── TOP HEADER (Daylight vs. Night Market Theme) ── */}
      <DaylightHeader
        business={business}
        isOnline={isOnline}
        isSyncing={isSyncing}
        onManualSync={handleManualSync}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenReceiveMoney={() => setIsReceiveOpen(true)}
        activePeriod={period}
        onChangePeriod={setPeriod}
      />

      {/* ── DAYLIGHT MAIN CONTAINER (Fluid Mobile Frame) ── */}
      <main className="relative -mt-4 rounded-t-[32px] bg-[#edf3fb] dark:bg-slate-900/95 pt-3 px-3 sm:px-5 md:px-8 w-full max-w-3xl mx-auto space-y-4 border-t border-transparent dark:border-white/10 transition-colors">
        {/* Soft Drag Handle */}
        <div className="mx-auto h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700 mb-1" />

        {/* ── INTERACTIVE TAB SWITCHER (3D Soft Glass Sliding Pill) ── */}
        <div className="flex rounded-2xl clay-card-sm p-1 relative">
          {(
            [
              { id: "today", label: "Today's View", icon: Store },
              { id: "decisions", label: "7 Decisions", icon: HelpCircle },
              { id: "activity", label: "Activity Log", icon: Clock },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs md:text-sm font-black transition-colors cursor-pointer z-10 ${
                  isActive ? "text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#3b82f6] via-[#2563eb] to-[#1d4ed8] shadow-[0_6px_18px_rgba(37,99,235,0.42)] z-[-1]"
                  />
                )}
                <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
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

              {/* 1b. MONIEPAY BUSINESS WALLET (Minimalist Icon & Balance • 1-Tap Opens QR & Details) */}
              <BusinessWalletCard
                availableBalance={walletBalance}
                onOpenReceiveModal={() => setIsReceiveOpen(true)}
              />

              {/* 1c. MONIEPAY PLUS & FREE TRIAL DAYS REMAINING CARD */}
              <SubscriptionBannerCard />

              {/* 2. YOUR NEXT MOVE (The Single Priority Recommendation) */}
              <NextMoveCard
                metrics={metrics}
                debts={debts}
                recommendations={recommendations}
                tradeType={business.trade_type}
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
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleOpenRecord("SALE")}
                  className="py-3 px-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Record Sale</span>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setIsGbeseOpen(true)}
                  className="py-3 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 hover:border-emerald-600 dark:hover:border-emerald-500 text-slate-800 dark:text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Users className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Gbese Book ({debts.filter(d => d.status !== "SETTLED").length})</span>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setSafeWithdrawalAmount(metrics.safeWithdrawalAmount || 30000);
                    setIsWithdrawalOpen(true);
                  }}
                  className="col-span-2 sm:col-span-1 py-3 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 hover:border-emerald-600 dark:hover:border-emerald-500 text-slate-800 dark:text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Wallet className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Take Chop Money</span>
                </motion.button>
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
              {/* 1. Live Market Readings & Commodity Price Movements */}
              <LiveMarketFeedCard
                tradeType={business.trade_type}
                marketLocation={business.market_location}
              />

              {/* 2. 7 Core Trader Decisions in Authentic Informal Market Voice */}
              <QuickDecisionsGrid
                metrics={metrics}
                debts={debts}
                tradeType={business.trade_type}
                onOpenWithdrawal={() => {
                  setSafeWithdrawalAmount(metrics.safeWithdrawalAmount || 30000);
                  setIsWithdrawalOpen(true);
                }}
                onOpenRestock={() => handleOpenRecord("STOCK_PURCHASE")}
                onOpenGbeseBook={() => setIsGbeseOpen(true)}
                onOpenProfitDetail={() => handleOpenRecord("SALE")}
              />

              {/* 3. Decision Memory Tracking */}
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
              {/* Header & Quick Action */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">
                    Live Market Activity
                  </h2>
                  <p className="text-[10px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    Search and filter your shop transactions.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href="/activity"
                    className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <SlidersHorizontal className="h-3 w-3 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <span className="hidden min-[360px]:inline">All Filters</span>
                    <span className="inline min-[360px]:hidden">Filters</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleOpenRecord("SALE")}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Record</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  placeholder="Search goods, sales, or customer name..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                />
                {activitySearch && (
                  <button
                    type="button"
                    onClick={() => setActivitySearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Quick Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
                {[
                  { id: "ALL", label: "All Records" },
                  { id: "SALE", label: "Sales (Cash In)" },
                  { id: "CREDIT", label: "Customer Gbese" },
                  { id: "STOCK", label: "Restock Goods" },
                  { id: "EXPENSE", label: "Expenses & Fuel" },
                  { id: "WITHDRAWAL", label: "Chop Money" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActivityFilterType(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                      activityFilterType === f.id
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Filter Count & Reset */}
              {(activitySearch || activityFilterType !== "ALL") && (
                <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <span>Found {activityTabTransactions.length} matching records</span>
                  <button
                    type="button"
                    onClick={() => {
                      setActivitySearch("");
                      setActivityFilterType("ALL");
                    }}
                    className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Activity List */}
              <RecentActivityList
                transactions={activityTabTransactions}
                onOpenRecordModal={() => handleOpenRecord("SALE")}
              />

              {/* View Full Dedicated Activity Link */}
              <div className="pt-2 text-center">
                <Link
                  href="/activity"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-emerald-500 text-slate-800 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-400 text-xs font-black shadow-xs transition-all cursor-pointer"
                >
                  <span>Open Full Activity Page & Pagination</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
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

      <ReceiveMoneyModal
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
        onSimulateIncomingTransfer={handleSimulateIncomingTransfer}
      />
    </div>
  );
}
