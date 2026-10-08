"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — YOUR NEXT MOVE Component
// Single Solid Color • Authentic Nigerian Informal Market Lingo
// Real-time Actionable Recommendation (Zero Gradients • No Stars)
// ─────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Compass,
  CheckCircle2,
} from "lucide-react";
import type { DeterministicMetrics, Debt, Recommendation, TradeType } from "@/types/moniepay.types";
import { recordDecisionAction } from "@/lib/intelligence/decisionMemory";
import { getLiveMarketDecisionInsight } from "@/lib/intelligence/marketIntelligence";

interface NextMoveCardProps {
  metrics: DeterministicMetrics;
  debts: Debt[];
  recommendations: Recommendation[];
  tradeType?: TradeType;
  businessName?: string;
  onOpenGbeseBook?: () => void;
  onOpenWithdrawal?: (amount: number) => void;
}

export function NextMoveCard({
  metrics,
  debts,
  tradeType = "retail_provisions",
  businessName = "Mama Chidi Provisions",
  onOpenGbeseBook,
  onOpenWithdrawal,
}: NextMoveCardProps) {
  const [isDone, setIsDone] = useState<string | null>(null);

  const activeCustomerDebts = debts.filter(
    (d) => d.debt_type === "CUSTOMER_CREDIT" && d.status !== "SETTLED" && d.balance_due > 0
  );
  const topDebtor = [...activeCustomerDebts].sort((a, b) => b.balance_due - a.balance_due)[0];
  const liveMarket = getLiveMarketDecisionInsight(tradeType);

  // Derive simple, authentic informal Nigerian market next move
  let title = "Collect customer gbese before you go buy fresh market.";
  let reason = `Customers dey owe you ₦${metrics.customerDebtTotal.toLocaleString()} wey suppose dey inside your market restock capital.`;
  let actionLabel = topDebtor ? `Remind ${topDebtor.person_name} (₦${topDebtor.balance_due.toLocaleString()})` : "Open Gbese Book";
  let actionType = "COLLECT_DEBT";

  if (liveMarket.trend === "UP") {
    title = liveMarket.headline;
    reason = liveMarket.explanation;
    actionLabel = "Plan Bulk Restock Now";
    actionType = "MARKET_SPIKE";
  } else if (metrics.customerDebtTotal < 30000 && metrics.safeWithdrawalAmount >= 20000) {
    title = `You fit safely take ₦${metrics.safeWithdrawalAmount.toLocaleString()} chop moni today with clean mind.`;
    reason = "All your wholesale restock capital and shop running costs dey 100% safe.";
    actionLabel = `Take ₦${metrics.safeWithdrawalAmount.toLocaleString()} Safe Chop Moni`;
    actionType = "SAFE_WITHDRAWAL";
  } else if (metrics.profitMarginPercent < 15 && metrics.directStockCost > metrics.totalRevenue * 0.6) {
    title = "Add ₦200 on top fast-moving goods to protect your daily profit.";
    reason = "Wholesalers from market don increase their carton price this week.";
    actionLabel = "Adjust Prices Sharp-Sharp";
    actionType = "PRICE_ADJUSTMENT";
  }

  const handleAction = () => {
    if (actionType === "COLLECT_DEBT") {
      if (topDebtor?.phone) {
        const cleanPhone = topDebtor.phone.replace(/[^0-9]/g, "");
        const waMsg = encodeURIComponent(
          `Good day ${topDebtor.person_name}, hope work dey go well. Abeg kindly remember your balance of ₦${topDebtor.balance_due.toLocaleString()} with ${businessName}. We need am for fresh market restock tomorrow. Thank you and God bless your hustle!`
        );
        window.open(`https://wa.me/${cleanPhone}?text=${waMsg}`, "_blank");
      } else if (onOpenGbeseBook) {
        onOpenGbeseBook();
      }
      recordDecisionAction(
        "rec_collect",
        title,
        `Send WhatsApp reminder give ${topDebtor?.person_name || "customer"}`,
        `Recover ₦${(topDebtor?.balance_due || 0).toLocaleString()} put back into cash drawer`
      );
    } else if (actionType === "SAFE_WITHDRAWAL") {
      if (onOpenWithdrawal) onOpenWithdrawal(metrics.safeWithdrawalAmount);
      recordDecisionAction(
        "rec_withdraw",
        title,
        `Take ₦${metrics.safeWithdrawalAmount.toLocaleString()} safe chop moni for house`,
        "Protected restock capital 100% intact"
      );
    } else {
      if (onOpenGbeseBook) onOpenGbeseBook();
    }

    setIsDone("Action don record! MoniePay don update your shop memory.");
    setTimeout(() => setIsDone(null), 4000);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="rounded-[24px] sm:rounded-[28px] bg-blue-600 dark:bg-blue-700 p-4 sm:p-5 md:p-6 text-white shadow-md border border-blue-500 relative overflow-hidden"
    >
      {/* Header Tag */}
      <div className="flex items-center justify-between gap-2 mb-2.5 relative z-10">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg sm:rounded-xl bg-white/20 border border-white/20 shrink-0">
            <Compass className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
          </div>
          <span className="sm:hidden text-[10px] font-black uppercase tracking-wider text-blue-100 truncate">
            Wetin You Suppose Do Next
          </span>
          <span className="hidden sm:inline text-[11px] font-black uppercase tracking-widest text-blue-100 truncate">
            Wetin You Suppose Do Next (Market Best Move)
          </span>
        </div>
        <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30 shrink-0">
          Priority 1
        </span>
      </div>

      {/* Core Directive Headline in Informal Nigerian Market Language */}
      <h3 className="text-sm sm:text-base md:text-lg font-black text-white leading-snug tracking-tight relative z-10">
        {title}
      </h3>

      {/* Single-Sentence Root Cause */}
      <p className="text-[11.5px] sm:text-xs md:text-[13px] text-blue-100 font-medium mt-1.5 leading-relaxed relative z-10">
        {reason}
      </p>

      {/* 1-Tap Action Button */}
      <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-2.5 relative z-10">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleAction}
          className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-100 text-blue-900 font-black text-xs sm:text-sm shadow-sm active:scale-95 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-900" />
        </motion.button>

        {onOpenGbeseBook && actionType === "COLLECT_DEBT" && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenGbeseBook}
            className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11.5px] sm:text-xs border border-white/20 active:scale-95 transition-all cursor-pointer"
          >
            Open Gbese Book
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {isDone && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3.5 flex items-center gap-2 text-xs font-bold text-white bg-slate-900/60 p-2.5 rounded-xl border border-white/20 relative z-10"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{isDone}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
