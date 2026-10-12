"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Live Nigeria Market & Depot Price Radar Ticker Tape
// 100% Mobile Responsive across All Screen Sizes (320px to 4K)
// CSS Gradient Masking • Natural Pause on Hover / Touch • Industry Standard
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import {
  getBaseDepotTickerItems,
  getMarketDepotTickerItems,
  DepotTickerItem,
} from "@/lib/intelligence/marketIntelligence";

interface MarketDepotTickerBarProps {
  onOpenFeed?: () => void;
}

export function MarketDepotTickerBar({ onOpenFeed }: MarketDepotTickerBarProps) {
  // Always initialize with deterministic base items to guarantee 100% identical SSR & client hydration
  const [tickerItems, setTickerItems] = useState<DepotTickerItem[]>(getBaseDepotTickerItems);

  useEffect(() => {
    // Safely hydrate any client-stored or dynamic prices after mount
    setTickerItems(getMarketDepotTickerItems());

    const handleUpdate = () => setTickerItems(getMarketDepotTickerItems());
    window.addEventListener("moniepay:market-feed-updated", handleUpdate);
    return () => {
      window.removeEventListener("moniepay:market-feed-updated", handleUpdate);
    };
  }, []);

  if (!tickerItems || tickerItems.length === 0) return null;

  return (
    <div
      onClick={onOpenFeed}
      className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-white/10 shadow-2xs hover:shadow-xs transition-all py-1.5 sm:py-2 px-2 sm:px-3 flex items-center gap-1.5 sm:gap-2.5 cursor-pointer select-none text-slate-900 dark:text-slate-100"
    >
      {/* ── FIXED LEFT LIVE BADGE (COMPACT ON MOBILE, FULL ON SM) ── */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pr-1.5 sm:pr-2.5 border-r border-slate-200 dark:border-slate-800 z-10 bg-white/95 dark:bg-slate-900/95">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 whitespace-nowrap">
          <span className="hidden min-[360px]:inline">Live </span>Depot Radar
        </span>
      </div>

      {/* ── CONTINUOUS TICKER TAPE WITH FLUID MASK-IMAGE EDGE FADES ── */}
      <div className="relative flex-1 overflow-hidden whitespace-nowrap [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)]">
        <div className="inline-flex items-center gap-4 sm:gap-6 animate-marquee group-hover:[animation-play-state:paused] group-active:[animation-play-state:paused] text-xs font-semibold">
          {/* Double loop of items for continuous, seamless infinite wrap */}
          {[...tickerItems, ...tickerItems].map((item, idx) => {
            const isUp = item.trend === "UP";
            const isDown = item.trend === "DOWN";

            return (
              <span key={idx} className="inline-flex items-center gap-1 sm:gap-1.5 shrink-0">
                {/* Hub Tag */}
                <span className="px-1 sm:px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[9px] sm:text-[10px] tracking-wide uppercase border border-slate-200/60 dark:border-slate-700/60">
                  {item.hub}
                </span>

                {/* Product Name */}
                <span className="font-extrabold text-slate-900 dark:text-white text-[11px] sm:text-xs">
                  {item.product}:
                </span>

                {/* Price & Unit */}
                <span suppressHydrationWarning className="font-mono font-black text-[11px] sm:text-xs text-[#1d4ed8] dark:text-sky-300">
                  {item.price}/{item.unit}
                </span>

                {/* Clean Financial Trend Pill */}
                <span
                  suppressHydrationWarning
                  className={`px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black inline-flex items-center gap-0.5 ${
                    isUp
                      ? "bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60"
                      : isDown
                      ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {isUp && <TrendingUp className="h-2.5 w-2.5 stroke-[2.5]" />}
                  {isDown && <TrendingDown className="h-2.5 w-2.5 stroke-[2.5]" />}
                  {!isUp && !isDown && <Minus className="h-2.5 w-2.5 stroke-[2.5]" />}
                  <span suppressHydrationWarning>{item.change}</span>
                </span>

                {/* Separator Bullet */}
                <span className="text-slate-300 dark:text-slate-700 select-none">•</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* ── FIXED RIGHT CALLOUT LINK (RESPONSIVE LABEL) ── */}
      <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-black text-blue-700 dark:text-sky-400 shrink-0 z-10 pl-1.5 sm:pr-0.5 sm:pl-2 border-l border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 group-hover:translate-x-0.5 transition-transform">
        <span className="hidden min-[420px]:inline">Depot Updates</span>
        <span className="min-[420px]:hidden">Updates</span>
        <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </div>
    </div>
  );
}
