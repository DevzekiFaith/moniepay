"use client";

import React from "react";
import {
  Plus,
  LayoutDashboard,
  Users,
  Wallet,
  BrainCircuit,
} from "lucide-react";
import type { TransactionType } from "@/types/moniepay.types";

interface FloatingActionDockProps {
  onOpenRecord: (type: TransactionType) => void;
  onOpenGbese: () => void;
  onOpenWithdrawal: () => void;
  onOpenTracker?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function FloatingActionDock({
  onOpenRecord,
  onOpenGbese,
  onOpenWithdrawal,
  onOpenTracker,
  activeTab = "today",
  onTabChange,
}: FloatingActionDockProps) {
  return (
    <div className="fixed bottom-2.5 sm:bottom-4 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
      <div className="mx-auto flex max-w-sm sm:max-w-md items-center justify-between rounded-[32px] clay-card p-1 sm:p-1.5 pointer-events-auto border border-white/90 dark:border-white/15 shadow-2xl backdrop-blur-2xl">
        {/* 1. TODAY'S PULSE */}
        <button
          type="button"
          onClick={() => {
            if (onTabChange) onTabChange("today");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 sm:px-1 rounded-2xl cursor-pointer active:scale-95 transition-all ${
            activeTab === "today"
              ? "text-blue-700 dark:text-sky-300 font-black"
              : "text-slate-600 dark:text-slate-400 font-semibold hover:text-blue-700 dark:hover:text-sky-200"
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              activeTab === "today"
                ? "bg-blue-100 dark:bg-blue-600/30 text-blue-700 dark:text-sky-300 shadow-xs"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5 sm:h-5 sm:w-5 stroke-[2.2]" />
          </div>
          <span className="text-[9px] sm:text-[10px] mt-0.5 font-bold">
            Pulse
          </span>
        </button>

        {/* 2. GBESE BOOK (Customer Debts) */}
        <button
          type="button"
          onClick={onOpenGbese}
          className="flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 sm:px-1 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 cursor-pointer active:scale-95 transition-all font-semibold group"
        >
          <div className="p-1.5 rounded-xl text-amber-600 dark:text-amber-400 group-hover:bg-amber-100/70 dark:group-hover:bg-amber-950/50 transition-colors">
            <Users className="h-4.5 w-4.5 sm:h-5 sm:w-5 stroke-[2.2]" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold mt-0.5 text-slate-700 dark:text-slate-300 group-hover:text-amber-700 dark:group-hover:text-amber-300">
            Gbese
          </span>
        </button>

        {/* 3. CENTER HERO ACTION: [+ RECORD] */}
        <div className="relative -mt-4 sm:-mt-5 mx-1 flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={() => onOpenRecord("SALE")}
            className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 text-white font-black border-3 sm:border-4 border-white dark:border-slate-900 active:scale-90 transition-all cursor-pointer shadow-xl shadow-blue-600/40 hover:shadow-blue-500/60"
            title="Record Sale, Restock or Expense"
            aria-label="Record Sale, Restock or Expense"
          >
            <Plus className="h-5 w-5 sm:h-6 sm:w-6 stroke-[3]" />
          </button>
        </div>

        {/* 4. CHOP MONEY (Safe Withdrawal) */}
        <button
          type="button"
          onClick={onOpenWithdrawal}
          className="flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 sm:px-1 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 cursor-pointer active:scale-95 transition-all font-semibold group"
        >
          <div className="p-1.5 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100/70 dark:group-hover:bg-emerald-950/50 transition-colors">
            <Wallet className="h-4.5 w-4.5 sm:h-5 sm:w-5 stroke-[2.2]" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold mt-0.5 text-slate-700 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
            Chop
          </span>
        </button>

        {/* 5. 7 DECISIONS & INTELLIGENCE */}
        <button
          type="button"
          onClick={() => {
            if (onTabChange) onTabChange("decisions");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 sm:px-1 rounded-2xl cursor-pointer active:scale-95 transition-all ${
            activeTab === "decisions"
              ? "text-blue-700 dark:text-sky-300 font-black"
              : "text-slate-600 dark:text-slate-400 font-semibold hover:text-blue-700 dark:hover:text-sky-200"
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              activeTab === "decisions"
                ? "bg-blue-100 dark:bg-blue-600/30 text-blue-700 dark:text-sky-300 shadow-xs"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <BrainCircuit className="h-4.5 w-4.5 sm:h-5 sm:w-5 stroke-[2.2]" />
          </div>
          <span className="text-[9px] sm:text-[10px] mt-0.5 font-bold">
            Decisions
          </span>
        </button>
      </div>
    </div>
  );
}

export default FloatingActionDock;
