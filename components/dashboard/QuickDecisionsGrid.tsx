"use client";

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
} from "lucide-react";
import type { DeterministicMetrics, Debt } from "@/types/moniepay.types";

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
      explanation: "Restock capital and shop expenses are protected. This portion is safe chop money.",
      nextStep: "Withdraw only this amount so you don't eat into tomorrow's goods capital.",
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
      explanation: "You have working cash ready for inventory purchase without needing high-interest loans.",
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
        : "You have zero pending supplier debt. Your credit rating with wholesalers is pristine.",
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
      verdict: metrics.trends?.stockCostGrowthPercent > 0 ? `Stock Costs Up +${metrics.trends.stockCostGrowthPercent}%` : "Low Cost Leakage",
      statusType: (metrics.trends?.stockCostGrowthPercent || 0) > 10 ? "warning" : "safe",
      explanation: "Supplier price inflation and untracked small transport/pos charges are your primary cost leakages.",
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
      explanation: `Rule of thumb for your market: 70% for stock replenishment, 15% for bills/wages, 15% safe withdrawal.`,
      nextStep: "Lock restock money in bank or safe drawer before taking personal money home.",
      buttonLabel: "Set Aside Restock Capital",
      onAction: () => {
        setActiveDecision(null);
      },
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
          Decisions You Can Make Right Now
        </h2>
        <span className="text-[11px] font-bold text-emerald-700">Tap to answer</span>
      </div>

      {/* Decision Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {decisions.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setActiveDecision(d)}
            className="rounded-[22px] bg-white border border-emerald-900/10 p-3.5 sm:p-4 text-left shadow-[0_3px_12px_rgba(5,150,105,0.04)] hover:border-emerald-500 hover:shadow-md cursor-pointer active:scale-[0.98] transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-slate-500 block leading-tight">
                {d.question}
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900 mt-2 block leading-snug">
                {d.verdict}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[10px] font-black text-emerald-700">See Action</span>
              <ArrowRight className="h-3 w-3 text-emerald-700" />
            </div>
          </button>
        ))}
      </div>

      {/* Interactive Decision Answer Modal */}
      <AnimatePresence>
        {activeDecision && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-[28px] bg-white border border-emerald-900/10 p-5 sm:p-6 shadow-2xl space-y-4 relative"
            >
              <button
                type="button"
                onClick={() => setActiveDecision(null)}
                className="absolute right-4 top-4 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                  Business Decision Intelligence
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  {activeDecision.question}
                </h3>
              </div>

              {/* Big Verdict Pill */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 block mb-0.5">
                  MoniePay Verdict
                </span>
                <p className="text-base font-black text-emerald-900">
                  {activeDecision.verdict}
                </p>
              </div>

              {/* Plain English Explanation */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-extrabold text-slate-700 block">Why:</span>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    {activeDecision.explanation}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-extrabold text-emerald-900 block">Next move:</span>
                  <p className="text-slate-800 font-bold leading-relaxed">
                    {activeDecision.nextStep}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={activeDecision.onAction}
                className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm cursor-pointer active:scale-95 transition-all shadow-md shadow-emerald-900/20"
              >
                {activeDecision.buttonLabel}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
