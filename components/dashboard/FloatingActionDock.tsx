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
      <div className="mx-auto flex max-w-sm sm:max-w-md items-center justify-between rounded-[32px] clay-card p-1 sm:p-1.5 pointer-events-auto border border-white/90 dark:border-white/10 shadow-2xl backdrop-blur-2xl">
        {/* 1. TODAY'S PULSE */}
        <button
          type="button"
          onClick={() => {
            if (onTabChange) onTabChange("today");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 sm:px-1 rounded-2xl cursor-pointer active:scale-95 transition-all ${
            activeTab === "today"
              ? "text-blue-700 dark:text-blue-400 font-black"
              : "text-slate-500 dark:text-slate-400 font-medium hover:text-blue-700 dark:hover:text-blue-300"
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === "today"
                ? "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400"
                : "text-slate-400 dark:text-slate-500"
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
          className="flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 sm:px-1 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer active:scale-95 transition-all"
        >
          <div className="p-1 rounded-xl text-slate-400 dark:text-slate-500">
            <Users className="h-4.5 w-4.5 sm:h-5 sm:w-5 stroke-[2.2]" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold mt-0.5">
            Gbese
          </span>
        </button>

        {/* 3. CENTER HERO ACTION: [+ RECORD] */}
        <div className="relative -mt-4 sm:-mt-5 mx-1 flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={() => onOpenRecord("SALE")}
            className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full clay-btn-primary font-black border-3 sm:border-4 border-white dark:border-slate-900 active:scale-90 transition-all cursor-pointer shadow-xl hover:shadow-blue-500/40"
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
          className="flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 sm:px-1 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer active:scale-95 transition-all"
        >
          <div className="p-1 rounded-xl text-slate-400 dark:text-slate-500">
            <Wallet className="h-4.5 w-4.5 sm:h-5 sm:w-5 stroke-[2.2]" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold mt-0.5">
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
              ? "text-blue-700 dark:text-blue-400 font-black"
              : "text-slate-500 dark:text-slate-400 font-medium hover:text-blue-700 dark:hover:text-blue-300"
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              activeTab === "decisions"
                ? "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400"
                : "text-slate-400 dark:text-slate-500"
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
