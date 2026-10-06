"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — 7 Core Decisions Grid Component
// Spring Tactile Cards • Deep Emerald Answer Drawer
// ─────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiggyBank,
  ShoppingBag,
  Users,
  TrendingUp,
  AlertTriangle,
  Receipt,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  X,
  CreditCard,
  ShieldCheck,
  Compass,
} from "lucide-react";
import type { DeterministicMetrics, Debt } from "@/types/moniepay.types";
import { InfoTooltip } from "@/components/ui/tooltip";

interface QuickDecisionsGridProps {
  metrics: DeterministicMetrics;
  debts?: Debt[];
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
  onAction: () => void;
}

export function QuickDecisionsGrid({
  metrics,
  debts = [],
  onOpenWithdrawal,
  onOpenRestock,
  onOpenGbeseBook,
  onOpenProfitDetail,
}: QuickDecisionsGridProps) {
  const [activeDecision, setActiveDecision] = useState<DecisionDetail | null>(null);

  const supplierDebts = debts.filter((d) => d.debt_type === "SUPPLIER_OBLIGATION" && d.status !== "SETTLED");
  const supplierTotal = supplierDebts.reduce((sum, d) => sum + d.balance_due, 0);

  const customerDebts = debts.filter((d) => d.debt_type === "CUSTOMER_CREDIT" && d.status !== "SETTLED");

  // Define the 7 core trader decision entry points
  const decisions: DecisionDetail[] = [
    {
      id: "withdraw",
      question: "I fit withdraw this moni?",
      verdict: `YES O — ₦${metrics.safeWithdrawalAmount.toLocaleString()} Safe to Chop`,
      statusType: "safe",
      explanation: "Your market capital and shop bills dey safe. This amount na clean profit wey you fit take chop life.",
      nextStep: "Withdraw only this safe amount so tomorrow's market stock no go suffer.",
      buttonLabel: `Take ₦${metrics.safeWithdrawalAmount.toLocaleString()} Safe Chop Moni`,
      onAction: () => {
        setActiveDecision(null);
        if (onOpenWithdrawal) onOpenWithdrawal();
      },
    },
    {
      id: "restock",
      question: "I fit buy new market/stock?",
      verdict: `YES O — ₦${Math.max(0, metrics.liquidCash - metrics.safeWithdrawalAmount).toLocaleString()} Available`,
      statusType: "safe",
      explanation: "You get solid working capital ready for hand to buy wholesale stock without taking loan.",
      nextStep: "Target fast-moving goods with sweet profit margins to maximize quick turnover.",
      buttonLabel: "Plan Restock & Buy Market",
      onAction: () => {
        setActiveDecision(null);
        if (onOpenRestock) onOpenRestock();
      },
    },
    {
      id: "pay_debt",
      question: "I fit pay supplier debt today?",
      verdict: supplierTotal > 0 ? `YES — Pay ₦${Math.min(supplierTotal, metrics.liquidCash).toLocaleString()} Sharp-Sharp` : "NO DEBT OWED",
      statusType: supplierTotal > 0 ? "action_needed" : "safe",
      explanation: supplierTotal > 0
        ? `You owe suppliers ₦${supplierTotal.toLocaleString()}. Clearing this keeps your wholesale trust 100% solid.`
        : "You no dey owe any supplier kobo. Your wholesale name and integrity clean pass mirror!",
      nextStep: supplierTotal > 0 ? "Settle supplier today so they go bring fresh goods immediately." : "Keep this clean record.",
      buttonLabel: supplierTotal > 0 ? "Settle Supplier Gbese" : "Close",
      onAction: () => {
        setActiveDecision(null);
        if (onOpenGbeseBook) onOpenGbeseBook();
      },
    },
    {
      id: "profit",
      question: "Profit dey come out so?",
      verdict: `${metrics.profitMarginPercent}% Margin (₦${metrics.operatingProfit.toLocaleString()} Net Gain)`,
      statusType: metrics.operatingProfit > 0 ? "safe" : "warning",
      explanation: `Calculated after subtracting ₦${metrics.directStockCost.toLocaleString()} goods costs and ₦${metrics.operatingExpenses.toLocaleString()} shop bills.`,
      nextStep: "Your profit dey healthy! Keep recording every small expense to avoid hidden leakage.",
      buttonLabel: "See Full Profit Breakdown",
      onAction: () => {
        setActiveDecision(null);
        if (onOpenProfitDetail) onOpenProfitDetail();
      },
    },
    {
      id: "who_owes",
      question: "Who dey owe my shop gbese?",
      verdict: `₦${metrics.customerDebtTotal.toLocaleString()} Outside (${customerDebts.length} Customers)`,
      statusType: metrics.customerDebtTotal > 0 ? "action_needed" : "safe",
      explanation: "People don take goods on credit and your hard-earned money dey outside. Time to collect am!",
      nextStep: "Send polite reminder to top debtors on WhatsApp before weekend rush.",
      buttonLabel: "Open Debt Book & Send Reminders",
      onAction: () => {
        setActiveDecision(null);
        if (onOpenGbeseBook) onOpenGbeseBook();
      },
    },
    {
      id: "losing_money",
      question: "Where my money dey leak enter?",
      verdict: (metrics.trends?.stockCostGrowthPercent || 0) > 0 ? `Stock Price Up +${metrics.trends.stockCostGrowthPercent}%` : "Zero Leakage",
      statusType: (metrics.trends?.stockCostGrowthPercent || 0) > 10 ? "warning" : "safe",
      explanation: "Supplier price inflation and untracked transport/POS charges na the main place money fit leak.",
      nextStep: "Check wholesale unit prices when buying in bulk and review POS slips every evening.",
      buttonLabel: "Check Money Leakage",
      onAction: () => {
        setActiveDecision(null);
      },
    },
    {
      id: "today_cash",
      question: "Wetin I go do with today cash?",
      verdict: `Lock ₦${Math.round(metrics.liquidCash * 0.7).toLocaleString()} for Stock First`,
      statusType: "safe",
      explanation: `Market golden rule: 70% for stock replenishment, 15% for bills/wages, 15% clean chop moni.`,
      nextStep: "Keep restock money inside bank or safe drawer before taking personal chop money home.",
      buttonLabel: "Lock In Restock Capital",
      onAction: () => {
        setActiveDecision(null);
      },
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-black uppercase tracking-wider text-emerald-950/60">
          Decisions Wey You Fit Take Sharp-Sharp
        </h2>
        <span className="text-[11px] font-bold text-emerald-800">Tap to see answer</span>
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
              className="rounded-[24px] bg-white/80 backdrop-blur-md border border-emerald-950/[0.08] p-3.5 sm:p-4 text-left shadow-[0_4px_20px_rgba(4,120,87,0.04)] hover:border-emerald-500/50 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between min-w-0"
            >
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-500 block leading-tight truncate">
                  {d.question}
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 mt-2 block leading-snug truncate">
                  {d.verdict}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100/80">
                <span className="text-[10px] font-black text-emerald-800">See Action</span>
                <ArrowRight className="h-3 w-3 text-emerald-700" />
              </div>
            </motion.button>
          </InfoTooltip>
        ))}
      </div>

      {/* Interactive Decision Answer Modal */}
      <AnimatePresence>
        {activeDecision && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-md rounded-[28px] bg-white/95 backdrop-blur-xl border border-emerald-900/15 p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setActiveDecision(null)}
                className="absolute right-4 top-4 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
                  Business Decision Intelligence
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  {activeDecision.question}
                </h3>
              </div>

              {/* Big Deep Emerald Verdict Pill */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#047857] text-white shadow-md">
                <span className="text-[10.5px] font-black uppercase tracking-widest text-emerald-300 block mb-0.5">
                  MoniePay Verdict
                </span>
                <p className="text-base sm:text-lg font-black text-white">
                  {activeDecision.verdict}
                </p>
              </div>

              {/* Plain English Explanation */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-extrabold text-slate-700 block">Why:</span>
                  <p className="text-slate-600 font-medium leading-relaxed mt-0.5">
                    {activeDecision.explanation}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-extrabold text-emerald-900 block">Next move:</span>
                  <p className="text-slate-800 font-black leading-relaxed mt-0.5">
                    {activeDecision.nextStep}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={activeDecision.onAction}
                className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm cursor-pointer shadow-md shadow-emerald-900/20"
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
