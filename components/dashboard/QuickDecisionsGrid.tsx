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
      question: "Can I withdraw this money?",
      verdict: `YES — ₦${metrics.safeWithdrawalAmount.toLocaleString()} Safe`,
      statusType: "safe",
      explanation: "Restock capital and shop running costs are protected. This portion is safe chop money.",
      nextStep: "Withdraw only this amount so you don't eat into tomorrow's inventory capital.",
      buttonLabel: `Take ₦${metrics.safeWithdrawalAmount.toLocaleString()} Safe Chop Money`,
      onAction: () => {
        setActiveDecision(null);
        if (onOpenWithdrawal) onOpenWithdrawal();
      },
    },
    {
      id: "restock",
      question: "Can I restock?",
      verdict: `READY — ₦${Math.max(0, metrics.liquidCash - metrics.safeWithdrawalAmount).toLocaleString()} Available`,
      statusType: "safe",
      explanation: "You have working cash ready for inventory purchase without taking high-interest loans.",
      nextStep: "Target fast-moving items with margins above 20% to maximize turnover.",
      buttonLabel: "Plan Restock Purchase",
      onAction: () => {
        setActiveDecision(null);
        if (onOpenRestock) onOpenRestock();
      },
    },
    {
      id: "pay_debt",
      question: "Can I pay this debt?",
      verdict: supplierTotal > 0 ? `YES — Pay ₦${Math.min(supplierTotal, metrics.liquidCash).toLocaleString()}` : "NO DEBT OWED",
      statusType: supplierTotal > 0 ? "action_needed" : "safe",
      explanation: supplierTotal > 0
        ? `You owe suppliers ₦${supplierTotal.toLocaleString()}. Clearing this protects wholesale credit terms.`
        : "You have zero pending supplier debt. Your wholesale reputation is pristine.",
      nextStep: supplierTotal > 0 ? "Pay supplier today to keep your supply line open." : "Maintain this clean record.",
      buttonLabel: supplierTotal > 0 ? "Settle Supplier Gbese" : "Close",
      onAction: () => {
        setActiveDecision(null);
        if (onOpenGbeseBook) onOpenGbeseBook();
      },
    },
    {
      id: "profit",
      question: "Am I actually making profit?",
      verdict: `${metrics.profitMarginPercent}% Margin (₦${metrics.operatingProfit.toLocaleString()} Net)`,
      statusType: metrics.operatingProfit > 0 ? "safe" : "warning",
      explanation: `Calculated after subtracting ₦${metrics.directStockCost.toLocaleString()} stock costs and ₦${metrics.operatingExpenses.toLocaleString()} shop overhead.`,
      nextStep: "Your margins are healthy. Keep tracking every small expense to avoid hidden leakage.",
      buttonLabel: "View Profit Breakdown",
      onAction: () => {
        setActiveDecision(null);
        if (onOpenProfitDetail) onOpenProfitDetail();
      },
    },
    {
      id: "who_owes",
      question: "Who owes me money?",
      verdict: `₦${metrics.customerDebtTotal.toLocaleString()} Owed (${customerDebts.length} Customers)`,
      statusType: metrics.customerDebtTotal > 0 ? "action_needed" : "safe",
      explanation: "Customers have taken goods on credit. This cash is currently locked outside your business.",
      nextStep: "Follow up with top debtors via WhatsApp before the weekend.",
      buttonLabel: "Open Customer Credit Book",
      onAction: () => {
        setActiveDecision(null);
        if (onOpenGbeseBook) onOpenGbeseBook();
      },
    },
    {
      id: "losing_money",
      question: "Where am I losing money?",
      verdict: (metrics.trends?.stockCostGrowthPercent || 0) > 0 ? `Stock Costs Up +${metrics.trends.stockCostGrowthPercent}%` : "Low Cost Leakage",
      statusType: (metrics.trends?.stockCostGrowthPercent || 0) > 10 ? "warning" : "safe",
      explanation: "Supplier price inflation and untracked transport/POS charges are your primary cost leakages.",
      nextStep: "Check wholesale unit prices when buying in bulk and review POS slip reconciliations.",
      buttonLabel: "Review Leakage Diagnostics",
      onAction: () => {
        setActiveDecision(null);
      },
    },
    {
      id: "today_cash",
      question: "What to do with today's cash?",
      verdict: `Keep ₦${Math.round(metrics.liquidCash * 0.7).toLocaleString()} in Drawer`,
      statusType: "safe",
      explanation: `Rule of thumb: 70% for stock replenishment, 15% for bills/wages, 15% safe withdrawal.`,
      nextStep: "Lock restock money in safe drawer or bank before taking personal money home.",
      buttonLabel: "Set Aside Restock Capital",
      onAction: () => {
        setActiveDecision(null);
      },
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Decisions You Can Make Right Now
        </h2>
        <span className="text-[11px] font-bold text-emerald-800">Tap to answer</span>
      </div>

      {/* Decision Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {decisions.map((d) => (
          <InfoTooltip key={d.id} content={`Tap to see why: ${d.explanation}`}>
            <motion.button
              type="button"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveDecision(d)}
              className="rounded-[24px] bg-white border border-emerald-950/[0.08] p-3.5 sm:p-4 text-left shadow-[0_4px_16px_rgba(15,23,42,0.03)] hover:border-emerald-500/50 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between min-w-0"
            >
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-500 block leading-tight truncate">
                  {d.question}
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 mt-2 block leading-snug truncate">
                  {d.verdict}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-md rounded-[28px] bg-white border border-emerald-900/10 p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden"
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
