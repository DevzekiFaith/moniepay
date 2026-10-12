"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Live Nigeria Market Price Reading & Depot Updates
// "Wetin Dey Happen for Market Today?"
// Real-time wholesale radar across Mile 12, Daleko, Alaba, Balogun,
// Kano Dawanau, Onitsha Relief Market, Apapa Terminals & Ibese Depot
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
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
  Volume2,
  VolumeX,
  Truck,
  Ship,
  CheckCircle2,
  AlertTriangle,
  X,
  Lightbulb,
  Layers,
  Info,
} from "lucide-react";
import {
  MarketCommodityItem,
  MarketRegion,
  getMarketReadingsForTrade,
  refreshMarketFeedPrices,
  getAudioMarketBriefingScript,
  BASE_MARKET_FEED,
  getStoredMarketFeed,
} from "@/lib/intelligence/marketIntelligence";
import { TradeType } from "@/types/moniepay.types";
import { playCashChime, triggerCashHapticVibration } from "@/lib/alerts/hapticSoundService";
import { useToast } from "@/context/NotificationContext";

interface LiveMarketFeedCardProps {
  tradeType?: TradeType;
  marketLocation?: string;
  onSelectCommodityForDecision?: (item: MarketCommodityItem) => void;
  onOpenRestockRecord?: () => void;
}

export function LiveMarketFeedCard({
  tradeType = "retail_provisions",
  marketLocation = "National Depots & Wholesale Hubs, Nigeria",
  onSelectCommodityForDecision,
  onOpenRestockRecord,
}: LiveMarketFeedCardProps) {
  const { toast } = useToast();
  const [selectedTrade, setSelectedTrade] = useState<TradeType>(tradeType);
  const [selectedRegion, setSelectedRegion] = useState<MarketRegion>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MarketCommodityItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [marketItems, setMarketItems] = useState<MarketCommodityItem[]>(() =>
    BASE_MARKET_FEED.filter(
      (item) =>
        tradeType === "general_merchant" ||
        item.tradeTypes.includes(tradeType) ||
        item.tradeTypes.includes("general_merchant")
    )
  );

  const loadItems = () => {
    setMarketItems(getMarketReadingsForTrade(selectedTrade, searchQuery, selectedRegion));
  };

  useEffect(() => {
    loadItems();
  }, [selectedTrade, searchQuery, selectedRegion]);

  useEffect(() => {
    const handleUpdate = () => loadItems();
    window.addEventListener("moniepay:market-feed-updated", handleUpdate);
    return () => {
      window.removeEventListener("moniepay:market-feed-updated", handleUpdate);
    };
  }, [selectedTrade, searchQuery, selectedRegion]);

  // Handle manual live refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    triggerCashHapticVibration("restock");
    playCashChime();

    const updated = refreshMarketFeedPrices();
    setMarketItems(getMarketReadingsForTrade(selectedTrade, searchQuery, selectedRegion));

    toast(
      "Depot Radar Refreshed! ⚡",
      "Live wholesale price readings and truck arrivals updated from Mile 12, Daleko, Alaba, Kano & Apapa.",
      { type: "success" }
    );

    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Audio Speech Synthesis for Nigerian Market Pidgin Briefing
  const handleToggleAudioBriefing = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast("Audio Notice", "Speech synthesis not supported on this browser.", { type: "info" });
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const script = getAudioMarketBriefingScript();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick English (Nigeria) or UK voice if available
    const voices = window.speechSynthesis.getVoices();
    const nigerianOrGbVoice = voices.find(
      (v) => v.lang.includes("en-NG") || v.lang.includes("en-GB") || v.name.includes("Nigerian")
    );
    if (nigerianOrGbVoice) utterance.voice = nigerianOrGbVoice;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
    triggerCashHapticVibration("restock");
  };

  const tradeCategories: { id: TradeType; label: string }[] = [
    { id: "retail_provisions", label: "Provisions & FMCG" },
    { id: "food_canteen", label: "Foodstuff & Grains" },
    { id: "electronics_phone", label: "Phones & Gadgets" },
    { id: "boutique_fashion", label: "Fabrics & Fashion" },
    { id: "general_merchant", label: "All Market Goods" },
  ];

  const regionTabs: { id: MarketRegion; label: string }[] = [
    { id: "ALL", label: "All Nigeria Hubs" },
    { id: "LAGOS", label: "Lagos Depots (Mile 12, Daleko, Alaba)" },
    { id: "NORTH", label: "Kano & North (Dawanau, Singer)" },
    { id: "EAST", label: "East (Onitsha, Aba Ariaria)" },
    { id: "DEPOTS", label: "Depots & Terminals (Apapa, Ibese)" },
  ];

  return (
    <div className="rounded-2xl sm:rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 text-slate-900 dark:text-slate-100 transition-colors overflow-hidden">
      {/* ── CARD HEADER WITH LIVE DEPOT STATUS & ACTIONS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          {/* Live pulsing badge */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-[10.5px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              Live Market Price Reading • Depot Updates
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Wetin Dey Happen for Market Today?
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Real wholesale prices, trailer arrivals &amp; depot movements across Nigerian markets to guide your daily shop decisions.
          </p>
        </div>

        {/* Action Buttons: Audio Briefing & Refresh (Side by side on mobile) */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={handleToggleAudioBriefing}
            className={`w-full sm:w-auto justify-center px-2.5 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              isPlayingAudio
                ? "bg-amber-500 text-white animate-pulse"
                : "bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
            }`}
            title="Listen to daily market audio briefing in Pidgin"
          >
            {isPlayingAudio ? <VolumeX className="h-3.5 w-3.5 shrink-0" /> : <Volume2 className="h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-400" />}
            <span className="truncate">{isPlayingAudio ? "Stop Audio" : "Play Brief 🔊"}</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full sm:w-auto justify-center px-2.5 sm:px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] sm:text-xs font-black flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-2xs disabled:opacity-75"
          >
            <RefreshCw className={`h-3.5 w-3.5 shrink-0 ${isRefreshing ? "animate-spin text-blue-400" : ""}`} />
            <span className="truncate">{isRefreshing ? "Updating…" : "Refresh 🔄"}</span>
          </button>
        </div>
      </div>

      {/* ── REGIONAL HUB FILTER TABS (Edge-to-Edge Mobile Scrolling) ── */}
      <div className="-mx-3.5 px-3.5 sm:mx-0 sm:px-0 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {regionTabs.map((r) => {
          const isActive = selectedRegion === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRegion(r.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isActive
                  ? "bg-[#1d4ed8] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {/* ── TRADE CATEGORY FILTER TABS (Edge-to-Edge Mobile Scrolling) ── */}
      <div className="-mx-3.5 px-3.5 sm:mx-0 sm:px-0 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {tradeCategories.map((cat) => {
          const isActive = selectedTrade === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedTrade(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isActive
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  : "bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200/80 dark:border-slate-800"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── SEARCH INPUT ── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search wholesale goods, depots, or markets (e.g. Rice, Indomie, Gas, Oil, Cement)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ── COMMODITIES & DEPOT UPDATES GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {marketItems.map((item) => {
          const isUp = item.trend === "UP";
          const isDown = item.trend === "DOWN";
          const isSelected = selectedItem?.id === item.id;

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedItem(item)}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? "bg-blue-50/90 dark:bg-blue-950/50 border-blue-500 shadow-sm"
                  : "bg-slate-50/80 dark:bg-slate-800/60 border-slate-200/90 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs"
              }`}
            >
              <div className="space-y-2">
                {/* Hub Location & Depot Supply Status Chips */}
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate max-w-[210px]">
                    <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                    <span>{item.hub}</span>
                  </span>

                  {/* Supply Status Pill */}
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider shrink-0 ${
                      item.supplyStatus === "SCARCE"
                        ? "bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                        : item.supplyStatus === "SURPLUS"
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                        : "bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {item.supplyStatusPidgin}
                  </span>
                </div>

                {/* Commodity Title & Price Tag */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-[13px] font-black text-slate-900 dark:text-white leading-tight">
                      {item.name}
                    </h3>
                    {item.depotArrivals && (
                      <p className="text-[10px] font-bold text-blue-700 dark:text-sky-300 flex items-center gap-1 mt-0.5">
                        <Truck className="h-3 w-3 shrink-0 text-blue-600 dark:text-sky-400" />
                        <span className="truncate">{item.depotArrivals}</span>
                      </p>
                    )}
                  </div>

                  {/* Trend Badge */}
                  <div
                    className={`px-2 py-0.5 rounded-lg text-[10.5px] font-black flex items-center gap-1 shrink-0 ${
                      isUp
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                        : isDown
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {isUp && <TrendingUp className="h-3 w-3 stroke-[2.5]" />}
                    {isDown && <TrendingDown className="h-3 w-3 stroke-[2.5]" />}
                    {!isUp && !isDown && <Minus className="h-3 w-3 stroke-[2.5]" />}
                    <span>{isUp ? `+${item.changePercent}%` : isDown ? `${item.changePercent}%` : "Steady"}</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-2 pt-0.5">
                  <span className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white">
                    ₦{item.currentPrice.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">/ {item.unit}</span>
                  {item.previousPrice !== item.currentPrice && (
                    <span className="text-[10px] line-through text-slate-400 dark:text-slate-500 ml-auto font-mono">
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
                <p className="text-[10.5px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {item.informalAdvice}
                </p>
              </div>

              {/* Bottom Row: Timestamp & Interactive Callout */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[10.5px]">
                <span className="font-bold text-slate-400 dark:text-slate-500">Updated {item.updatedAt}</span>
                <span className="font-black text-blue-700 dark:text-sky-300 flex items-center gap-1 group-hover:underline">
                  <span>See Advice &amp; Decision</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {marketItems.length === 0 && (
        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center space-y-2 text-slate-500 text-xs">
          <p className="font-black text-slate-800 dark:text-slate-200">No market items found for "{searchQuery}".</p>
          <p className="text-[11px]">
            Try searching for Rice, Oil, Indomie, Gas, or change your selected region filter.
          </p>
        </div>
      )}

      {/* ── SELECTED COMMODITY MODAL (DEPOT SLIP & TRADER ADVICE) ── */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/65 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-[22px] sm:rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-4 sm:p-5 space-y-3.5 sm:space-y-4 text-slate-900 dark:text-slate-100"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2.5 sm:gap-3 border-b border-slate-100 dark:border-slate-800 pb-2.5 sm:pb-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-sky-300 block">
                    Depot Intelligence Slip
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight mt-0.5 truncate">
                    {selectedItem.name}
                  </h3>
                  <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    {selectedItem.hub}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                  aria-label="Close depot slip"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>

              {/* Price Movement Highlight Card */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-500 uppercase">Current Depot Price</span>
                    <p className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white truncate">
                      ₦{selectedItem.currentPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-500 uppercase">Movement</span>
                    <p
                      className={`text-xs sm:text-sm font-black ${
                        selectedItem.trend === "UP"
                          ? "text-rose-600"
                          : selectedItem.trend === "DOWN"
                          ? "text-emerald-600"
                          : "text-slate-600"
                      }`}
                    >
                      {selectedItem.trend === "UP" ? `+${selectedItem.changePercent}%` : `${selectedItem.changePercent}%`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10.5px] sm:text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex-wrap gap-1">
                  <span className="text-slate-500 font-medium truncate">Unit: {selectedItem.unit}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Previous: ₦{selectedItem.previousPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Depot Status Tag */}
              {selectedItem.depotArrivals && (
                <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900 text-xs flex items-center gap-2 text-blue-950 dark:text-blue-100">
                  <Truck className="h-4 w-4 text-blue-600 dark:text-sky-400 shrink-0" />
                  <span className="font-bold text-[11px] sm:text-xs leading-snug">{selectedItem.depotArrivals}</span>
                </div>
              )}

              {/* Informal Advice in Plain Nigerian Market Vernacular */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>Wetin You Suppose Do for Your Shop:</span>
                </h4>
                <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs space-y-1">
                  <p className="font-black text-amber-950 dark:text-amber-100 text-[11.5px] sm:text-xs">{selectedItem.informalHeadline}</p>
                  <p className="text-[10.5px] sm:text-[11px] text-amber-900/90 dark:text-amber-200 leading-relaxed font-medium">
                    {selectedItem.informalAdvice}
                  </p>
                </div>
              </div>

              {/* Profit & Capital Impact */}
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10.5px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-snug">
                <strong>Profit Impact:</strong> {selectedItem.decisionImpact}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectCommodityForDecision) onSelectCommodityForDecision(selectedItem);
                    if (onOpenRestockRecord) onOpenRestockRecord();
                    setSelectedItem(null);
                  }}
                  className="w-full sm:flex-1 py-2.5 sm:py-3 px-3 rounded-xl sm:rounded-2xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-98"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Record Restock at This Price</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="w-full sm:w-auto py-2 sm:py-2.5 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-98 text-center"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
