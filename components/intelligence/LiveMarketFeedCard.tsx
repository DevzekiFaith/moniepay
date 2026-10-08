"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Live Market Intelligence & Wholesaler Price Pulse
// Real-time market reading tailored to trader's specific goods & services
// Authentic Nigerian Informal Market Lingo • Zero Gradients • Solid Colors
// ─────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Store,
  MapPin,
  RefreshCw,
  Search,
  ArrowRight,
  Info,
  SlidersHorizontal,
  CheckCircle2,
} from "lucide-react";
import {
  LIVE_MARKET_FEED,
  MarketCommodityItem,
  getMarketReadingsForTrade,
} from "@/lib/intelligence/marketIntelligence";
import { TradeType } from "@/types/moniepay.types";

interface LiveMarketFeedCardProps {
  tradeType?: TradeType;
  marketLocation?: string;
  onSelectCommodityForDecision?: (item: MarketCommodityItem) => void;
}

export function LiveMarketFeedCard({
  tradeType = "retail_provisions",
  marketLocation = "Balogun / Mile 12 Market, Lagos",
  onSelectCommodityForDecision,
}: LiveMarketFeedCardProps) {
  const [selectedTrade, setSelectedTrade] = useState<TradeType>(tradeType);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MarketCommodityItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const marketItems = getMarketReadingsForTrade(selectedTrade, searchQuery);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 700);
  };

  const tradeCategories: { id: TradeType; label: string }[] = [
    { id: "retail_provisions", label: "Provisions & FMCG" },
    { id: "food_canteen", label: "Food & Canteen" },
    { id: "electronics_phone", label: "Phones & Gadgets" },
    { id: "boutique_fashion", label: "Fabrics & Fashion" },
    { id: "general_merchant", label: "All Market Goods" },
  ];

  return (
    <div className="rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 space-y-4">
      {/* Card Header with Live Market Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Live Market Price Reading • Depot Updates
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Wetin Dey Happen for Market Today?
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Real wholesale prices & depot movements to guide your daily shop decisions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
          <span>Refresh Prices</span>
        </button>
      </div>

      {/* Trade Type Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {tradeCategories.map((cat) => {
          const isActive = selectedTrade === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedTrade(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isActive
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Quick Search Field */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search goods (e.g. Rice, Indomie, Charger, Oil, Cement)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Live Market Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {marketItems.map((item) => {
          const isUp = item.trend === "UP";
          const isDown = item.trend === "DOWN";
          const isSelected = selectedItem?.id === item.id;

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedItem(item)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                isSelected
                  ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-500"
                  : "bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <div className="space-y-1">
                {/* Header: Item Name + Trend Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                      <span className="truncate">{item.hub}</span>
                    </div>
                  </div>

                  {/* Trend Indicator Badge */}
                  <div
                    className={`px-2 py-0.5 rounded-lg text-[10.5px] font-black flex items-center gap-1 shrink-0 ${
                      isUp
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        : isDown
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {isUp && <TrendingUp className="h-3 w-3 stroke-[2.5]" />}
                    {isDown && <TrendingDown className="h-3 w-3 stroke-[2.5]" />}
                    {!isUp && !isDown && <Minus className="h-3 w-3 stroke-[2.5]" />}
                    <span>
                      {isUp ? `+${item.changePercent}%` : isDown ? `${item.changePercent}%` : "Stable"}
                    </span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                    ₦{item.currentPrice.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    / {item.unit}
                  </span>
                  {item.previousPrice !== item.currentPrice && (
                    <span className="text-[10px] line-through text-slate-400 ml-auto font-mono">
                      was ₦{item.previousPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Vivid Pidgin Market Intel Box */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                <p className="font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                  {item.informalHeadline}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {item.informalAdvice}
                </p>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400">
                  Updated {item.updatedAt}
                </span>
                <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:underline">
                  <span>Use in Decision</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {marketItems.length === 0 && (
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center space-y-1 text-slate-500 text-xs">
          <p className="font-bold">No market items found for "{searchQuery}".</p>
          <p className="text-[11px]">Try searching for Rice, Oil, Indomie, Charger, or select "All Market Goods".</p>
        </div>
      )}
    </div>
  );
}
