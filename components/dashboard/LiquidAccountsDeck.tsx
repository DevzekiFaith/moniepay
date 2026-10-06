"use client";

import React from "react";
import {
  Wallet,
  CreditCard,
  Building2,
  Smartphone,
  ArrowUpRight,
  Plus,
  ShieldCheck,
} from "lucide-react";
import type { BusinessAccount } from "@/types/moniepay.types";

interface LiquidAccountsDeckProps {
  accounts: BusinessAccount[];
  onOpenWithdrawal?: () => void;
  onOpenAddAccount?: () => void;
}

export function LiquidAccountsDeck({
  accounts,
  onOpenWithdrawal,
  onOpenAddAccount,
}: LiquidAccountsDeckProps) {
  const getAccountVisuals = (type: BusinessAccount["account_type"], name: string) => {
    if (type === "CASH") {
      return {
        bg: "bg-emerald-500",
        lightBg: "bg-emerald-50 border-emerald-100",
        text: "text-emerald-800",
        icon: <Wallet className="h-5 w-5 text-white" />,
        badge: "Cash at Hand",
      };
    }
    if (name.toLowerCase().includes("opay")) {
      return {
        bg: "bg-blue-600",
        lightBg: "bg-blue-50 border-blue-100",
        text: "text-blue-800",
        icon: <Smartphone className="h-5 w-5 text-white" />,
        badge: "OPay POS",
      };
    }
    if (name.toLowerCase().includes("moniepoint")) {
      return {
        bg: "bg-indigo-600",
        lightBg: "bg-indigo-50 border-indigo-100",
        text: "text-indigo-800",
        icon: <CreditCard className="h-5 w-5 text-white" />,
        badge: "Moniepoint",
      };
    }
    return {
      bg: "bg-slate-700",
      lightBg: "bg-slate-50 border-slate-200",
      text: "text-slate-800",
      icon: <Building2 className="h-5 w-5 text-white" />,
      badge: "Commercial Bank",
    };
  };

  const totalLiquid = accounts.reduce((s, a) => s + Number(a.current_balance || 0), 0);

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-500">
            Cash Stores & POS Terminals
          </h3>
          <p className="text-xs text-slate-400">Total liquid: ₦{totalLiquid.toLocaleString()}</p>
        </div>

        {onOpenWithdrawal && (
          <button
            onClick={onOpenWithdrawal}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 active:scale-95 transition-transform"
          >
            <span>Safe Chop Money</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Horizontal Swipeable Card Deck with Organic Peek (Directly Inspired by Image 1) */}
      <div className="flex gap-3.5 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
        {accounts.map((acc) => {
          const visual = getAccountVisuals(acc.account_type, acc.name);
          return (
            <div
              key={acc.id}
              className="snap-start shrink-0 w-[240px] sm:w-[260px] rounded-[24px] bg-white border border-slate-200/90 p-4 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] hover:shadow-[0_10px_25px_-3px_rgba(15,23,42,0.1)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${visual.bg} shadow-md shadow-slate-900/10`}
                  >
                    {visual.icon}
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${visual.lightBg} ${visual.text} border`}
                  >
                    {visual.badge}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-600 truncate">{acc.name}</h4>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  ₦{Number(acc.current_balance).toLocaleString()}
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{acc.account_number ? `•• ${acc.account_number.slice(-4)}` : "Drawer"}</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Ready
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
