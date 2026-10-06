"use client";

import React, { useState } from "react";
import {
  Zap,
  ShoppingBag,
  Users,
  PiggyBank,
  HandCoins,
  Send,
  Plus,
  CheckCircle2,
} from "lucide-react";
import type { TransactionType, PaymentMethod } from "@/types/moniepay.types";
import { recordOptimisticTransaction } from "@/lib/offline/offlineQueue";

interface FastInformalCaptureBarProps {
  onOpenDetailedSheet: (type: TransactionType) => void;
  onTransactionSaved: () => void;
}

export function FastInformalCaptureBar({
  onOpenDetailedSheet,
  onTransactionSaved,
}: FastInformalCaptureBarProps) {
  const [quickInput, setQuickInput] = useState("");
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Quick 1-line Natural Language Parser
  // e.g. "Sold 40k cash", "Bought rice 15k transfer", "Emeka owes 30000", "Chop money 10000", "Paid boy 5000"
  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = quickInput.trim();
    if (!text) return;

    // Extract numbers (supporting 'k' for thousands e.g. 40k -> 40000)
    let amount = 0;
    const matchK = text.match(/(\d+(?:\.\d+)?)\s*k\b/i);
    const matchNum = text.match(/(?:₦|ngn)?\s*(\d[\d,]*)/i);

    if (matchK) {
      amount = parseFloat(matchK[1]) * 1000;
    } else if (matchNum) {
      amount = parseFloat(matchNum[1].replace(/,/g, ""));
    }

    if (!amount || amount <= 0) {
      // If no amount detected, open sheet directly
      onOpenDetailedSheet("SALE");
      return;
    }

    const lower = text.toLowerCase();
    let type: TransactionType = "SALE";
    let category = "General Sales";
    let paymentMethod: PaymentMethod = "CASH";

    if (lower.includes("transfer")) paymentMethod = "TRANSFER";
    else if (lower.includes("pos")) paymentMethod = "POS";
    else if (lower.includes("credit") || lower.includes("owe") || lower.includes("gbese")) {
      type = "SALE";
      paymentMethod = "CREDIT";
      category = "Customer Credit";
    }

    if (lower.includes("bought") || lower.includes("buy") || lower.includes("stock") || lower.includes("material")) {
      type = "STOCK_PURCHASE";
      category = "Inventory / Goods";
    } else if (lower.includes("chop") || lower.includes("withdrew") || lower.includes("withdraw") || lower.includes("home")) {
      type = "OWNER_WITHDRAWAL";
      category = "Chop Money / Personal";
    } else if (lower.includes("paid boy") || lower.includes("assistant") || lower.includes("staff") || lower.includes("wage")) {
      type = "STAFF_PAYMENT";
      category = "Shop Assistant";
    } else if (lower.includes("collected") || lower.includes("paid back") || lower.includes("repaid")) {
      type = "DEBT_COLLECTION";
      category = "Debt Repayment";
    } else if (lower.includes("fuel") || lower.includes("generator") || lower.includes("nepa") || lower.includes("rent") || lower.includes("levy")) {
      type = "EXPENSE";
      category = "Shop Operations";
    }

    // Save optimistically to offline queue
    recordOptimisticTransaction({
      business_id: "biz_default_01",
      type,
      amount,
      payment_method: paymentMethod,
      category,
      description: text,
      transaction_date: new Date().toISOString(),
    });

    setQuickInput("");
    setSuccessBanner(`Recorded ₦${amount.toLocaleString()} ${type.replace(/_/g, " ").toLowerCase()}!`);
    onTransactionSaved();
    setTimeout(() => setSuccessBanner(null), 3500);
  };

  return (
    <div className="rounded-[26px] bg-white border border-slate-200/90 p-4 sm:p-5 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-800">
            Fast Informal Activity Capture
          </span>
        </div>
        <span className="text-[11px] font-bold text-emerald-700">Works 100% Offline</span>
      </div>

      {/* Natural Language Quick Input */}
      <form onSubmit={handleQuickSubmit} className="relative">
        <input
          type="text"
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          placeholder="e.g. Sold 40k cash, Emeka owes 15k, Chop money 10k..."
          className="w-full pl-4 pr-11 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-[13px] font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center cursor-pointer transition-colors shadow-sm"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

      {/* 1-Tap Preset Action Chips (Smooth Horizontal Peek on Mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
        <button
          type="button"
          onClick={() => onOpenDetailedSheet("SALE")}
          className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-950 text-xs font-black flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0 shadow-sm"
        >
          <Zap className="h-4 w-4 text-emerald-600" />
          <span>Sold Money</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenDetailedSheet("STOCK_PURCHASE")}
          className="px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-black flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0 shadow-sm"
        >
          <ShoppingBag className="h-4 w-4 text-slate-600" />
          <span>Bought Stock</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenDetailedSheet("SALE")}
          className="px-3.5 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 text-xs font-black flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0 shadow-sm"
        >
          <Users className="h-4 w-4 text-amber-700" />
          <span>Customer Owes</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenDetailedSheet("OWNER_WITHDRAWAL")}
          className="px-3.5 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-950 text-xs font-black flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0 shadow-sm"
        >
          <PiggyBank className="h-4 w-4 text-purple-700" />
          <span>Chop Money</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenDetailedSheet("STAFF_PAYMENT")}
          className="px-3.5 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-950 text-xs font-black flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0 shadow-sm"
        >
          <HandCoins className="h-4 w-4 text-blue-700" />
          <span>Paid Assistant</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenDetailedSheet("DEBT_COLLECTION")}
          className="px-3.5 py-2.5 rounded-2xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-950 text-xs font-black flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0 shadow-sm"
        >
          <Plus className="h-4 w-4 text-teal-700" />
          <span>Collected Debt</span>
        </button>
      </div>

      {successBanner && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}
    </div>
  );
}
