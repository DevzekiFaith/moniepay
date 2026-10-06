"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Zap,
  ShoppingBag,
  Users,
  PiggyBank,
  HandCoins,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Plus,
} from "lucide-react";
import type { TransactionType, PaymentMethod } from "@/types/moniepay.types";
import { recordOptimisticTransaction } from "@/lib/offline/offlineQueue";

interface TellMoniePayProps {
  onOpenDetailedSheet: (type: TransactionType) => void;
  onActivityRecorded: () => void;
}

export function TellMoniePay({
  onOpenDetailedSheet,
  onActivityRecorded,
}: TellMoniePayProps) {
  const [inputVal, setInputVal] = useState("");
  const [feedback, setFeedback] = useState<{
    amount: number;
    type: string;
    insight: string;
    nextMove: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputVal.trim();
    if (!text) return;

    // Parse amount (support k e.g. 45k -> 45000 or ₦45,000)
    let amount = 0;
    const matchK = text.match(/(\d+(?:\.\d+)?)\s*k\b/i);
    const matchNum = text.match(/(?:₦|ngn)?\s*(\d[\d,]*)/i);

    if (matchK) {
      amount = parseFloat(matchK[1]) * 1000;
    } else if (matchNum) {
      amount = parseFloat(matchNum[1].replace(/,/g, ""));
    }

    if (!amount || amount <= 0) {
      onOpenDetailedSheet("SALE");
      return;
    }

    const lower = text.toLowerCase();
    let type: TransactionType = "SALE";
    let category = "Sales";
    let paymentMethod: PaymentMethod = "CASH";
    let insight = "Added to today's sales.";
    let nextMove = "Drawer cash updated.";

    if (lower.includes("transfer")) paymentMethod = "TRANSFER";
    else if (lower.includes("pos")) paymentMethod = "POS";

    if (lower.includes("owe") || lower.includes("credit") || lower.includes("gbese")) {
      type = "SALE";
      paymentMethod = "CREDIT";
      category = "Customer Credit";
      insight = `₦${amount.toLocaleString()} is trapped with customer.`;
      nextMove = "Follow up before weekend restock.";
    } else if (lower.includes("bought") || lower.includes("buy") || lower.includes("stock") || lower.includes("material")) {
      type = "STOCK_PURCHASE";
      category = "Stock Purchase";
      insight = `Spent ₦${amount.toLocaleString()} on inventory.`;
      nextMove = "Price goods to protect 25% profit margin.";
    } else if (lower.includes("chop") || lower.includes("withdrew") || lower.includes("withdraw") || lower.includes("home")) {
      type = "OWNER_WITHDRAWAL";
      category = "Personal Withdrawal";
      insight = `₦${amount.toLocaleString()} taken out for personal use.`;
      nextMove = "Restock capital remains protected.";
    } else if (lower.includes("paid boy") || lower.includes("assistant") || lower.includes("staff") || lower.includes("wage")) {
      type = "STAFF_PAYMENT";
      category = "Staff Wage";
      insight = `Shop running expense recorded.`;
      nextMove = "Counted under operating costs.";
    } else if (lower.includes("collected") || lower.includes("paid back") || lower.includes("repaid")) {
      type = "DEBT_COLLECTION";
      category = "Debt Repaid";
      insight = `₦${amount.toLocaleString()} recovered into drawer.`;
      nextMove = "Working capital boosted.";
    }

    recordOptimisticTransaction({
      business_id: "biz_default_01",
      type,
      amount,
      payment_method: paymentMethod,
      category,
      description: text,
      transaction_date: new Date().toISOString(),
    });

    setInputVal("");
    setFeedback({
      amount,
      type: type.replace(/_/g, " "),
      insight,
      nextMove,
    });
    onActivityRecorded();

    setTimeout(() => {
      setFeedback(null);
    }, 6000);
  };

  return (
    <div className="rounded-[28px] bg-white border border-emerald-900/10 p-4 sm:p-5 shadow-[0_8px_30px_rgba(5,150,105,0.06)] space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
          <h2 className="text-xs font-black uppercase tracking-wider text-emerald-950">
            Tell MoniePay
          </h2>
        </div>
        <span className="text-[11px] font-bold text-emerald-700">Instant • Works Offline</span>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="e.g. Sold 45k cash, Bought rice 20k, Emeka owes 15k..."
          className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 transition-all"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-sm"
          title="Save Activity"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      {/* Quick 1-Tap Action Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
        <button
          type="button"
          onClick={() => onOpenDetailedSheet("SALE")}
          className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 transition-all"
        >
          <Zap className="h-3.5 w-3.5 text-emerald-700" />
          <span>+ Sold</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenDetailedSheet("STOCK_PURCHASE")}
          className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 transition-all"
        >
          <ShoppingBag className="h-3.5 w-3.5 text-emerald-700" />
          <span>+ Bought Stock</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenDetailedSheet("SALE")}
          className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 transition-all"
        >
          <Users className="h-3.5 w-3.5 text-emerald-700" />
          <span>+ Customer Owes</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenDetailedSheet("DEBT_COLLECTION")}
          className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 transition-all"
        >
          <Plus className="h-3.5 w-3.5 text-emerald-700" />
          <span>+ Collected Debt</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenDetailedSheet("OWNER_WITHDRAWAL")}
          className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 transition-all"
        >
          <PiggyBank className="h-3.5 w-3.5 text-emerald-700" />
          <span>+ Chop Money</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenDetailedSheet("STAFF_PAYMENT")}
          className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 transition-all"
        >
          <HandCoins className="h-3.5 w-3.5 text-emerald-700" />
          <span>+ Paid Staff</span>
        </button>
      </div>

      {/* Immediate MoniePay Understanding & Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="rounded-2xl bg-emerald-700 text-white p-3.5 space-y-1.5 shadow-md shadow-emerald-900/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-200 shrink-0" />
                <span className="text-xs font-black">
                  Recorded ✓ ₦{feedback.amount.toLocaleString()} ({feedback.type})
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-200">Just now</span>
            </div>

            <div className="pt-1 border-t border-emerald-600/60 flex items-start justify-between gap-2 text-xs">
              <p className="text-emerald-100 font-medium">
                {feedback.insight} <span className="font-bold text-white">{feedback.nextMove}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
