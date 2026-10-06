"use client";

import React from "react";
import {
  Plus,
  Home,
  Users,
  Wallet,
  Clock,
  Sparkles,
  ArrowLeftRight,
} from "lucide-react";
import type { TransactionType } from "@/types/moniepay.types";

interface FloatingActionDockProps {
  onOpenRecord: (type: TransactionType) => void;
  onOpenGbese: () => void;
  onOpenWithdrawal: () => void;
  onOpenTracker?: () => void;
}

export function FloatingActionDock({
  onOpenRecord,
  onOpenGbese,
  onOpenWithdrawal,
  onOpenTracker,
}: FloatingActionDockProps) {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4 sm:px-6 pointer-events-none">
      <div className="mx-auto flex max-w-md items-center justify-between rounded-[28px] bg-white/95 backdrop-blur-xl border border-slate-200/90 p-2 shadow-[0_12px_35px_rgba(15,23,42,0.12)] pointer-events-auto">
        {/* 1. DECISIONS (Home) */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-emerald-800 hover:text-emerald-950 active:scale-95 transition-all"
        >
          <Home className="h-5 w-5 text-emerald-700" />
          <span className="text-[10px] font-bold mt-0.5">Decisions</span>
        </button>

        {/* 2. GBESE BOOK (Customer Debts) */}
        <button
          onClick={onOpenGbese}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-slate-600 hover:text-slate-900 active:scale-95 transition-all"
        >
          <Users className="h-5 w-5 text-amber-600" />
          <span className="text-[10px] font-bold mt-0.5">Gbese</span>
        </button>

        {/* 3. CENTER HERO ACTION: [+ RECORD SALE] (Inspired by FitBite & Image 1 Center Action) */}
        <div className="relative -mt-6 mx-1 flex items-center justify-center">
          <button
            onClick={() => onOpenRecord("SALE")}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-[0_8px_25px_rgba(5,150,105,0.45)] border-4 border-white active:scale-90 transition-all cursor-pointer pulse-action"
            title="Record Sale or Activity"
          >
            <Plus className="h-7 w-7 stroke-[3]" />
          </button>
        </div>

        {/* 4. CHOP MONEY (Safe Owner Withdrawal) */}
        <button
          onClick={onOpenWithdrawal}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-slate-600 hover:text-slate-900 active:scale-95 transition-all"
        >
          <Wallet className="h-5 w-5 text-purple-600" />
          <span className="text-[10px] font-bold mt-0.5">Chop</span>
        </button>

        {/* 5. ACTIVITY / TRACK */}
        <button
          onClick={onOpenTracker ? onOpenTracker : () => onOpenRecord("EXPENSE")}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-slate-600 hover:text-slate-900 active:scale-95 transition-all"
        >
          <Clock className="h-5 w-5 text-blue-600" />
          <span className="text-[10px] font-bold mt-0.5">Track</span>
        </button>
      </div>
    </div>
  );
}
