"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — 7 Core Decisions Grid Component
// Live Informal Market Decision Intelligence • Solid Colors • Zero Gradients
// Authentic Nigerian Market Trader Lingo & Actionable Guidance
// ─────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  X,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Building2,
  Users,
  Wallet,
  ShoppingBag,
} from "lucide-react";
import type { DeterministicMetrics, Debt, TradeType } from "@/types/moniepay.types";
import { InfoTooltip } from "@/components/ui/tooltip";
import { getLiveMarketDecisionInsight } from "@/lib/intelligence/marketIntelligence";

interface QuickDecisionsGridProps {
  metrics: DeterministicMetrics;
  debts?: Debt[];
  tradeType?: TradeType;
  onOpenWithdrawal?: () => void;
  onOpenRestock?: () => void;
  onOpenGbeseBook?: () => void;
  onOpenProfitDetail?: () => void;
}

interface DecisionDetail {
  id: string;
  question: string;
  verdict: string;
  statusType: "safe" | "action_needed" | "warning";
  explanation: string;
  nextStep: string;
  buttonLabel: string;
  badge?: string;
  onAction: () => void;
}

export function QuickDecisionsGrid({
  metrics,
  debts = [],
  tradeType = "retail_provisions",
  onOpenWithdrawal,
  onOpenRestock,
  onOpenGbeseBook,
  onOpenProfitDetail,
}: QuickDecisionsGridProps) {
  const [activeDecision, setActiveDecision] = useState<DecisionDetail | null>(null);

  const supplierDebts = debts.filter((d) => d.debt_type === "SUPPLIER_OBLIGATION" && d.status !== "SETTLED");
  const supplierTotal = supplierDebts.reduce((sum, d) => sum + d.balance_due, 0);

  const customerDebts = debts.filter((d) => d.debt_type === "CUSTOMER_CREDIT" && d.status !== "SETTLED");
  const liveMarket = getLiveMarketDecisionInsight(tradeType);

  // The 7 Core Trader Decisions in Authentic Informal Nigerian Market Language
  const decisions: DecisionDetail[] = [
    {
      id: "withdraw",
      question: "I fit withdraw chop moni today?",
      verdict: `YES O — ₦${metrics.safeWithdrawalAmount.toLocaleString()} Safe to Chop`,
      statusType: "safe",
      explanation: "Your shop capital, wholesaler money, and NEPA/fuel bills dey intact. This ₦" + metrics.safeWithdrawalAmount.toLocaleString() + " na clean gain wey you fit take chop life without shaking your business.",
      nextStep: "Withdraw only this exact amount make tomorrow morning restock money no go suffer.",
      buttonLabel: `Collect ₦${metrics.safeWithdrawalAmount.toLocaleString()} Safe Chop Moni`,
      onAction: () => {
        setActiveDecision(null);
        if (onOpenWithdrawal) onOpenWithdrawal();
      },
    },
    {
      id: "restock",
      question: "I fit buy new market/stock now?",
      verdict: `YES O — ₦${Math.max(0, metrics.liquidCash - metrics.safeWithdrawalAmount).toLocaleString()} Working Capital Ready`,
      statusType: "safe",
      explanation: `You get ₦${Math.max(0, metrics.liquidCash - metrics.safeWithdrawalAmount).toLocaleString()} cash on hand ready to clear fresh wholesale cart cash-down with zero loan interest.`,
      nextStep: "Rush target fast-moving goods wey customers dey ask every day (Rice, Sugar, Oil, Indomie).",
      buttonLabel: "Plan Wholesale Restock",
      badge: "Cash Ready",
      onAction: () => {
        setActiveDecision(null);
        if (onOpenRestock) onOpenRestock();
      },
    },
    {
      id: "market_reading",
      question: "Wetin wholesalers dey talk about price?",
      verdict: liveMarket.verdict,
      statusType: liveMarket.trend === "UP" ? "warning" : "safe",
      explanation: liveMarket.explanation,
      nextStep: liveMarket.headline,
      buttonLabel: "Check Depot Price Ticker",
      badge: "Live Reading",
      onAction: () => {
        setActiveDecision(null);
        if (onOpenRestock) onOpenRestock();
      },
    },
    {
      id: "pay_debt",
      question: "I fit clear my supplier debt today?",
      verdict: supplierTotal > 0 ? `YES — Settle ₦${Math.min(supplierTotal, metrics.liquidCash).toLocaleString()} Sharp-Sharp` : "NO DEBT OWED",
      statusType: supplierTotal > 0 ? "action_needed" : "safe",
      explanation: supplierTotal > 0
        ? `You dey owe wholesaler ₦${supplierTotal.toLocaleString()}. If you clear am today, they go give you fresh high-demand stock with 2% cash discount.`
        : "You no dey owe any wholesaler kobo! Your business name for market clean pass new naira note.",
      nextStep: supplierTotal > 0 ? "Pay supplier right now make your supply line no jam hold-up." : "Keep this clean record.",
      buttonLabel: supplierTotal > 0 ? "Settle Supplier Debt" : "Close",
      onAction: () => {
        setActiveDecision(null);
        if (onOpenGbeseBook) onOpenGbeseBook();
      },
    },
    {
      id: "profit",
      question: "Profit dey real or my money dey sink?",
      verdict: `${metrics.profitMarginPercent}% Net Margin (₦${metrics.operatingProfit.toLocaleString()} Gain)`,
      statusType: metrics.operatingProfit > 0 ? "safe" : "warning",
      explanation: `Calculated after removing ₦${metrics.directStockCost.toLocaleString()} goods cost and ₦${metrics.operatingExpenses.toLocaleString()} gen fuel, transport, and shop bills.`,
      nextStep: "Your gain dey very sweet and healthy! Continue recording small-small cash so leakage no go enter.",
      buttonLabel: "See Full Profit Record",
      onAction: () => {
        setActiveDecision(null);
        if (onOpenProfitDetail) onOpenProfitDetail();
      },
    },
    {
      id: "who_owes",
      question: "Who dey hold my shop gbese outside?",
      verdict: `₦${metrics.customerDebtTotal.toLocaleString()} Outside (${customerDebts.length} People)`,
      statusType: metrics.customerDebtTotal > 0 ? "action_needed" : "safe",
      explanation: "Customers don pack goods go house and your sweat dey outside. Time don reach to collect your money back!",
      nextStep: "Send friendly WhatsApp reminder slip give them before weekend market rush.",
      buttonLabel: "Open Gbese Book & Send Slip",
      badge: metrics.customerDebtTotal > 0 ? "Collect Moni" : undefined,
      onAction: () => {
        setActiveDecision(null);
        if (onOpenGbeseBook) onOpenGbeseBook();
      },
    },
    {
      id: "today_cash",
      question: "Wetin I suppose do with today cash?",
      verdict: `Lock ₦${Math.round(metrics.liquidCash * 0.7).toLocaleString()} for Stock First`,
      statusType: "safe",
      explanation: "Market golden rule: Keep 70% for stock replenishment, 15% for shop bills, and 15% for personal feeding. No carry stock money take solve family emergency.",
      nextStep: "Transfer the restock money keep inside dedicated MoniePay account before closing shop.",
      buttonLabel: "Keep Capital Safe",
      onAction: () => {
        setActiveDecision(null);
      },
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          7 Market Decisions Wey You Fit Take Sharp-Sharp
        </h2>
        <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400">Tap card to see verdict</span>
      </div>

      {/* Decision Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {decisions.map((d) => (
          <InfoTooltip key={d.id} content={`Wetin make us talk so: ${d.explanation}`}>
            <motion.button
              type="button"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveDecision(d)}
              className="rounded-[22px] sm:rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 text-left shadow-sm hover:border-blue-500/60 dark:hover:border-blue-500/60 cursor-pointer transition-all flex flex-col justify-between min-w-0 group"
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] sm:text-[10.5px] font-bold text-slate-500 dark:text-slate-400 block leading-tight line-clamp-1">
                    {d.question}
                  </span>
                  {d.badge && (
                    <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[9px] font-black shrink-0">
                      {d.badge}
                    </span>
                  )}
                </div>

                <span className="text-xs sm:text-[13px] font-black text-slate-900 dark:text-white mt-1 block leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {d.verdict}
                </span>
              </div>

              <div className="mt-2.5 flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black text-blue-700 dark:text-blue-400">See Answer</span>
                <ArrowRight className="h-3 w-3 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </motion.button>
          </InfoTooltip>
        ))}
      </div>

      {/* Interactive Decision Answer Modal */}
      <AnimatePresence>
        {activeDecision && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-md rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden text-slate-900 dark:text-slate-100"
            >
              <button
                type="button"
                onClick={() => setActiveDecision(null)}
                className="absolute right-4 top-4 h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  MoniePay Market Verdict
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                  {activeDecision.question}
                </h3>
              </div>

              {/* Solid Blue / Slate Verdict Box (Single Colour) */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-300 block mb-1">
                  Wetin MoniePay Talk
                </span>
                <p className="text-base sm:text-lg font-black text-white leading-snug">
                  {activeDecision.verdict}
                </p>
              </div>

              {/* Plain Informal Market Explanation (Pidgin) */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-black text-slate-800 dark:text-slate-200 block">Why we talk so:</span>
                  <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-0.5">
                    {activeDecision.explanation}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-black text-blue-700 dark:text-blue-400 block">Wetin you suppose do next:</span>
                  <p className="text-slate-900 dark:text-white font-extrabold leading-relaxed mt-0.5">
                    {activeDecision.nextStep}
                  </p>
                </div>
              </div>

              {/* Action Button (Solid Blue) */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={activeDecision.onAction}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm cursor-pointer shadow-sm active:scale-98 transition-all"
              >
                {activeDecision.buttonLabel}
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
