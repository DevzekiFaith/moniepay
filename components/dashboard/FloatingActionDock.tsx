"use client";

import React from "react";
import {
  Plus,
  Home,
  Users,
  Wallet,
  Clock,
  HelpCircle,
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
    <div className="fixed bottom-3 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none">
      <div className="mx-auto flex max-w-sm sm:max-w-md items-center justify-between rounded-[26px] bg-white/95 backdrop-blur-xl border border-emerald-900/10 p-1.5 sm:p-2 shadow-[0_12px_36px_rgba(4,120,87,0.16)] pointer-events-auto">
        {/* 1. TODAY'S PULSE */}
        <button
          type="button"
          onClick={() => {
            if (onTabChange) onTabChange("today");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl cursor-pointer active:scale-95 transition-all ${
            activeTab === "today" ? "text-emerald-950 font-black" : "text-slate-500 font-medium hover:text-emerald-800"
          }`}
        >
          <Home className={`h-5 w-5 ${activeTab === "today" ? "text-emerald-700 stroke-[2.5]" : "text-slate-400"}`} />
          <span className="text-[10px] mt-0.5">Today</span>
        </button>

        {/* 2. GBESE BOOK (Customer Debts) */}
        <button
          type="button"
          onClick={onOpenGbese}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-slate-500 hover:text-emerald-800 cursor-pointer active:scale-95 transition-all"
        >
          <Users className="h-5 w-5 text-slate-500" />
          <span className="text-[10px] font-medium mt-0.5">Gbese</span>
        </button>

        {/* 3. CENTER HERO ACTION: [+ RECORD] */}
        <div className="relative -mt-5 mx-1 flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={() => onOpenRecord("SALE")}
            className="flex h-13 w-13 items-center justify-center rounded-full bg-emerald-700 hover:bg-emerald-600 text-white font-black shadow-[0_8px_24px_rgba(4,120,87,0.4)] border-4 border-white active:scale-90 transition-all cursor-pointer pulse-action"
            title="Record Sale or Activity"
          >
            <Plus className="h-6 w-6 stroke-[3]" />
          </button>
        </div>

        {/* 4. CHOP MONEY (Safe Withdrawal) */}
        <button
          type="button"
          onClick={onOpenWithdrawal}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-slate-500 hover:text-emerald-800 cursor-pointer active:scale-95 transition-all"
        >
          <Wallet className="h-5 w-5 text-slate-500" />
          <span className="text-[10px] font-medium mt-0.5">Chop</span>
        </button>

        {/* 5. 7 DECISIONS */}
        <button
          type="button"
          onClick={() => {
            if (onTabChange) onTabChange("decisions");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl cursor-pointer active:scale-95 transition-all ${
            activeTab === "decisions" ? "text-emerald-950 font-black" : "text-slate-500 font-medium hover:text-emerald-800"
          }`}
        >
          <HelpCircle className={`h-5 w-5 ${activeTab === "decisions" ? "text-emerald-700 stroke-[2.5]" : "text-slate-400"}`} />
          <span className="text-[10px] mt-0.5">Decisions</span>
        </button>
      </div>
    </div>
  );
}
