"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — YOUR NEXT MOVE Component
// Deep Emerald Gradient • Fluid Spring Animations
// ─────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Send,
  Compass,
  CheckCircle2,
  Wallet,
  Tag,
  Users,
  ShieldCheck,
} from "lucide-react";
import type { DeterministicMetrics, Debt, Recommendation } from "@/types/moniepay.types";
import { recordDecisionAction } from "@/lib/intelligence/decisionMemory";

interface NextMoveCardProps {
  metrics: DeterministicMetrics;
  debts: Debt[];
  recommendations: Recommendation[];
  businessName?: string;
  onOpenGbeseBook?: () => void;
  onOpenWithdrawal?: (amount: number) => void;
}

export function NextMoveCard({
  metrics,
  debts,
  recommendations,
  businessName = "Mama Chidi Super Provisions",
  onOpenGbeseBook,
  onOpenWithdrawal,
}: NextMoveCardProps) {
  const [isDone, setIsDone] = useState<string | null>(null);

  const activeCustomerDebts = debts.filter(
    (d) => d.debt_type === "CUSTOMER_CREDIT" && d.status !== "SETTLED" && d.balance_due > 0
  );
  const topDebtor = [...activeCustomerDebts].sort((a, b) => b.balance_due - a.balance_due)[0];

  // Derive simple, concise next move
  let title = "Collect customer gbese before you go buy fresh market.";
  let reason = `Customers dey owe you ₦${metrics.customerDebtTotal.toLocaleString()} wey suppose dey inside your market restock capital.`;
  let actionLabel = topDebtor ? `Remind ${topDebtor.person_name} (₦${topDebtor.balance_due.toLocaleString()})` : "Open Gbese Book";
  let actionType = "COLLECT_DEBT";

  if (metrics.customerDebtTotal < 30000 && metrics.safeWithdrawalAmount >= 20000) {
    title = `You fit safely take ₦${metrics.safeWithdrawalAmount.toLocaleString()} chop moni today with clean mind.`;
    reason = "All shop running expenses and tomorrow restock capital dey fully protected.";
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
          `Good day ${topDebtor.person_name}, kindly remember your balance of ₦${topDebtor.balance_due.toLocaleString()} with ${businessName}. Thank you!`
        );
        window.open(`https://wa.me/${cleanPhone}?text=${waMsg}`, "_blank");
      } else if (onOpenGbeseBook) {
        onOpenGbeseBook();
      }
      recordDecisionAction(
        "rec_collect",
        title,
        `Sent WhatsApp reminder to ${topDebtor?.person_name || "customer"}`,
        `Recover ₦${(topDebtor?.balance_due || 0).toLocaleString()} cash`
      );
    } else if (actionType === "SAFE_WITHDRAWAL") {
      if (onOpenWithdrawal) onOpenWithdrawal(metrics.safeWithdrawalAmount);
      recordDecisionAction(
        "rec_withdraw",
        title,
        `Took ₦${metrics.safeWithdrawalAmount.toLocaleString()} chop money`,
        "Protected restock capital"
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
      className="rounded-[28px] bg-gradient-to-br from-[#022c22]/95 via-[#064e3b]/95 to-[#047857]/95 backdrop-blur-xl p-5 sm:p-6 text-white shadow-[0_16px_40px_-6px_rgba(4,120,87,0.35)] border border-emerald-400/25 relative overflow-hidden"
    >
      {/* Decorative ambient light orbs */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-emerald-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-teal-400/20 blur-2xl" />

      {/* Header Tag */}
      <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/25 shadow-inner">
            <Compass className="h-4 w-4 text-emerald-200" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-emerald-100">
            Wetin You Suppo Do Next (Best Move)
          </span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-400/25 text-emerald-100 border border-emerald-300/40 backdrop-blur-md shadow-xs">
          Priority 1
        </span>
      </div>

      {/* Core Directive Headline */}
      <h3 className="text-base sm:text-lg font-black text-white leading-snug tracking-tight relative z-10">
        {title}
      </h3>

      {/* Single-Sentence Root Cause */}
      <p className="text-xs sm:text-[13px] text-emerald-100/90 font-medium mt-1.5 leading-relaxed relative z-10">
        {reason}
      </p>

      {/* 1-Tap Action Button */}
      <div className="mt-4 flex flex-wrap items-center gap-2.5 relative z-10">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleAction}
          className="px-5 py-3 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="h-4 w-4 text-emerald-800" />
        </motion.button>

        {onOpenGbeseBook && actionType === "COLLECT_DEBT" && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenGbeseBook}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 active:scale-95 transition-all cursor-pointer"
          >
            View All Debts
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {isDone && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3.5 flex items-center gap-2 text-xs font-bold text-emerald-200 bg-black/30 p-2.5 rounded-xl border border-white/15 relative z-10 backdrop-blur-md"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
            <span>{isDone}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
