"use client";

import React from "react";
import { Calendar, TrendingUp } from "lucide-react";

export function MarketDayStrip() {
  const days = [
    { label: "M", date: "06", name: "Mon", status: "Active Market" },
    { label: "T", date: "07", name: "Tue", status: "Normal" },
    { label: "W", date: "08", name: "Wed", status: "Restock Day" },
    { label: "T", date: "09", name: "Thu", status: "Normal" },
    { label: "F", date: "10", name: "Fri", status: "Restock Delivery" },
    { label: "S", date: "11", name: "Sat", status: "Peak Market Day" },
    { label: "S", date: "12", name: "Sun", status: "Half Day" },
  ];

  const activeIndex = 0;

  return (
    <div className="rounded-[26px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 p-4 sm:p-5 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] dark:shadow-xl">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
          <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Market Rhythm • October 2026</span>
        </div>
        <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800 px-2.5 py-1 rounded-full">
          Today: Active Trading
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
        {days.map((d, i) => {
          const isToday = i === activeIndex;
          const isPeak = d.name === "Sat";
          return (
            <div
              key={i}
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all ${
                isToday
                  ? "bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30 scale-[1.04]"
                  : isPeak
                  ? "bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <span className="text-[10px] font-bold opacity-80">{d.label}</span>
              <span className="text-sm sm:text-base font-black mt-0.5">{d.date}</span>
              {isPeak && (
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" title="Peak Day" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
