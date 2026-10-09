"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Smart Voice & Auto-Stock Directory Ledger Table
// Official MoniePay Branded Directory • Real-time Stock Reconciliation
// Hands-Off Entry Auditing • Date Filtering • Nigerian Market Vernacular & Audio
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Keyboard,
  Package,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Search,
  Calendar,
  Volume2,
  Share2,
  Download,
  Plus,
  X,
  Vibrate,
  Sparkles,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { MoniePayMark } from "@/components/ui/MoniePayLogo";
import {
  InventoryItem,
  VoiceTypedEntry,
  getInventoryItems,
  getVoiceTypedEntries,
  recordVoiceOrTypedStockEntry,
  saveInventoryItems,
} from "@/lib/inventory/inventoryStore";
import {
  playCashChime,
  triggerCashHapticVibration,
  requestHandsOffAlertPermissions,
} from "@/lib/alerts/hapticSoundService";
import {
  playFemaleTraderVoice,
  generateMarketVernacularVoiceResponse,
} from "@/lib/voice/spokenParser";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/NotificationContext";

export function StockDirectoryTable() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [entries, setEntries] = useState<VoiceTypedEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"ENTRIES" | "INVENTORY">("ENTRIES");

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<"ALL" | "VOICE" | "TYPED">("ALL");
  const [movementFilter, setMovementFilter] = useState<"ALL" | "SALES" | "RESTOCK">("ALL");
  const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "YESTERDAY" | "THIS_WEEK" | "THIS_MONTH" | "CUSTOM">("ALL");
  const [customDate, setCustomDate] = useState("");

  // New Stock Modal State
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Provisions & FMCG");
  const [newItemUnit, setNewItemUnit] = useState("Bags");
  const [newItemStock, setNewItemStock] = useState("20");
  const [newItemCost, setNewItemCost] = useState("50000");
  const [newItemSell, setNewItemSell] = useState("58000");
  const [newItemThreshold, setNewItemThreshold] = useState("5");

  // Hydrate from Storage
  const loadData = () => {
    setInventory(getInventoryItems());
    setEntries(getVoiceTypedEntries());
  };

  useEffect(() => {
    loadData();

    const handleStockUpdate = () => loadData();
    const handleVoiceLogged = () => loadData();

    window.addEventListener("moniepay:stock-updated", handleStockUpdate);
    window.addEventListener("moniepay:voice-entry-logged", handleVoiceLogged);

    return () => {
      window.removeEventListener("moniepay:stock-updated", handleStockUpdate);
      window.removeEventListener("moniepay:voice-entry-logged", handleVoiceLogged);
    };
  }, []);

  // ── FILTERED ENTRIES ──
  const filteredEntries = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 86400000;
    const yesterdayStart = todayStart - 86400000;
    const weekStart = todayStart - 7 * 86400000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return entries.filter((entry) => {
      const q = searchTerm.toLowerCase().trim();
      const entryTime = new Date(entry.timestamp).getTime();
      const dateStr = entry.timestamp || "";
      const formattedDate = new Date(dateStr).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).toLowerCase();

      // 1. Search Query
      const matchesSearch =
        !q ||
        entry.raw_transcript.toLowerCase().includes(q) ||
        entry.detected_item.toLowerCase().includes(q) ||
        (entry.counterparty?.toLowerCase() || "").includes(q) ||
        entry.amount.toString().includes(q) ||
        dateStr.toLowerCase().includes(q) ||
        formattedDate.includes(q);

      // 2. Method Filter
      const matchesMethod =
        methodFilter === "ALL" || entry.method === methodFilter;

      // 3. Movement Filter
      const matchesMovement =
        movementFilter === "ALL" ||
        (movementFilter === "SALES" && entry.stock_delta < 0) ||
        (movementFilter === "RESTOCK" && entry.stock_delta > 0);

      // 4. Date Filter
      let matchesDate = true;
      if (dateFilter === "TODAY") {
        matchesDate = entryTime >= todayStart && entryTime < todayEnd;
      } else if (dateFilter === "YESTERDAY") {
        matchesDate = entryTime >= yesterdayStart && entryTime < todayStart;
      } else if (dateFilter === "THIS_WEEK") {
        matchesDate = entryTime >= weekStart;
      } else if (dateFilter === "THIS_MONTH") {
        matchesDate = entryTime >= monthStart;
      } else if (dateFilter === "CUSTOM" && customDate) {
        const parts = customDate.split("-");
        if (parts.length === 3) {
          const cStart = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getTime();
          matchesDate = entryTime >= cStart && entryTime < cStart + 86400000;
        }
      }

      return matchesSearch && matchesMethod && matchesMovement && matchesDate;
    });
  }, [entries, searchTerm, methodFilter, movementFilter, dateFilter, customDate]);

  // ── FILTERED INVENTORY ──
  const filteredInventory = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return inventory.filter((item) => {
      return (
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.unit.toLowerCase().includes(q)
      );
    });
  }, [inventory, searchTerm]);

  // ── EXECUTIVE STATS ──
  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const voiceCount = entries.filter((e) => e.method === "VOICE").length;
    const totalValuation = inventory.reduce((sum, item) => sum + item.current_stock * item.selling_price, 0);
    const lowStockItems = inventory.filter((item) => item.current_stock <= item.reorder_threshold);

    return {
      totalEntries,
      voiceCount,
      totalValuation,
      lowStockCount: lowStockItems.length,
    };
  }, [entries, inventory]);

  // Quick Voice Simulation / Live Beep Test
  const handleTestVoiceEntry = (spokenText: string) => {
    try {
      const result = recordVoiceOrTypedStockEntry({
        method: "VOICE",
        rawTranscript: spokenText,
      });

      playCashChime();
      triggerCashHapticVibration("cash");

      const pidginFeedback = generateMarketVernacularVoiceResponse({
        item: result.entry.detected_item,
        qty: result.entry.quantity,
        unit: result.entry.unit,
        amount: result.entry.amount,
        type: result.entry.type,
        stockBalanceAfter: result.entry.stock_balance_after,
      });

      playFemaleTraderVoice(pidginFeedback);

      toast("Market Entry Don Enter! 🎙️", `I don record am sharp-sharp: ${spokenText}`, { type: "success" });
      loadData();
    } catch (err) {
      console.debug("Voice simulation notice:", err);
    }
  };

  // Add New Stock Item
  const handleCreateStockItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    const newItem: InventoryItem = {
      id: `inv_${Date.now()}`,
      name: newItemName,
      category: newItemCategory,
      unit: newItemUnit,
      current_stock: parseInt(newItemStock, 10) || 0,
      reorder_threshold: parseInt(newItemThreshold, 10) || 3,
      cost_price: parseInt(newItemCost, 10) || 0,
      selling_price: parseInt(newItemSell, 10) || 0,
      last_restocked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newItem, ...inventory];
    saveInventoryItems(updated);
    setInventory(updated);
    setIsAddStockOpen(false);
    setNewItemName("");

    playCashChime();
    triggerCashHapticVibration("restock");

    playFemaleTraderVoice(`New market commodity ${newItem.name} don save inside shop directory ledger.`);

    toast("Fresh Goods Registered 📦", `${newItem.name} don save inside shop catalog!`, { type: "success" });
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Entry ID", "Method", "Wetin Person Talk (Transcript)", "Commodity Item", "How Many (Qty)", "Unit", "Total Amount (NGN)", "Stock Delta", "Stock Balance Left", "Date & Time"];
    const rows = filteredEntries.map((e) => [
      e.id,
      e.method === "VOICE" ? "Talk Am (Voice)" : "Type Am (Keyboard)",
      `"${e.raw_transcript.replace(/"/g, '""')}"`,
      `"${e.detected_item}"`,
      e.quantity,
      e.unit,
      e.amount,
      e.stock_delta,
      e.stock_balance_after,
      e.timestamp,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `moniepay_market_stock_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* ── 1. OFFICIAL MONIEPAY BRANDED DIRECTORY HEADER (MARKET VERNACULAR) ── */}
      <section className="relative overflow-hidden rounded-[28px] bg-slate-900 text-white p-5 sm:p-6 shadow-xl border border-slate-800">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-blue-500/15 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <MoniePayMark size={32} />
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black tracking-tight text-white">
                  MoniePay Auto-Stock Directory Ledger
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400/30 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sharp-Sharp Balancer
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-medium max-w-xl leading-relaxed">
              Every market sale wey you <strong className="text-emerald-400">“Talk Am 🎙️”</strong> or type dey auto-record with date & amount, and update your shop goods automatically with live phone vibration & female voice alert.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={requestHandsOffAlertPermissions}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Test Hardware Vibration & Live Beep Alert"
            >
              <Vibrate className="h-3.5 w-3.5 text-emerald-400" />
              <span>Enable Hands-Off Alerts (Phone Go Vibrate)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddStockOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Put New Goods / Add Stock 📦</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. EXECUTIVE KPI CARDS (MARKET VERNACULAR & STATS) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Entries */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Market Records Logged
            </span>
            <div className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <Mic className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalEntries}
          </p>
          <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold block">
            {stats.voiceCount} entered via Talk Am 🎙️
          </span>
        </div>

        {/* Tracked Stock Items */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Goods Wey Dey Shop
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Package className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {inventory.length} <span className="text-xs font-bold text-slate-500">Commodities</span>
          </p>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
            Auto-deduct on every sale sharp-sharp
          </span>
        </div>

        {/* Live Inventory Valuation */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Stock Worth
            </span>
            <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            ₦{stats.totalValuation.toLocaleString()}
          </p>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block">
            Warehouse goods value in cash
          </span>
        </div>

        {/* Low Stock Depletion Alert */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Low Stock Warning
            </span>
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${
              stats.lowStockCount > 0 ? "bg-rose-100 dark:bg-rose-950 text-rose-600 animate-pulse" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}>
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className={`text-xl sm:text-2xl font-black ${stats.lowStockCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
            {stats.lowStockCount} <span className="text-xs font-bold text-slate-500">Items</span>
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">
            {stats.lowStockCount > 0 ? "E don remain small! Reorder sharp-sharp" : "All goods dey healthy for shop"}
          </span>
        </div>
      </div>

      {/* ── 3. VOICE ENTRY SIMULATOR / LIVE MARKET DIALECT BAR ── */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-900/40 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Test Talk Am Live (Female Voice Alert & Vibration Go Fire)
          </span>
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
            Unanimous Female Nigerian Trader Voice 🔊
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            "I sell 3 bags of Mama Gold Rice for ₦234,000 via transfer",
            "We buy 8 cartons Indomie for ₦68,000 cash for warehouse",
            "Customer take 4 fast chargers on credit (gbese) ₦14,000",
            "I fill 2 cooking gas cylinders for ₦30,000 cash",
          ].map((sample, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleTestVoiceEntry(sample)}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:border-emerald-500 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:scale-102 active:scale-98"
            >
              <Mic className="h-3 w-3 text-emerald-600" />
              <span>“{sample.split("for")[0]}...”</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. VIEW SELECTOR & FILTER TOOLBAR ── */}
      <div className="space-y-3">
        {/* Main Tab Toggle */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("ENTRIES")}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "ENTRIES"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              <Mic className="h-3.5 w-3.5" />
              <span>Voice & Typed Log (Wetin Happen) ({filteredEntries.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("INVENTORY")}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "INVENTORY"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              <span>Shop Goods Catalog (Stock Level) ({filteredInventory.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Download Market Ledger (CSV)</span>
          </button>
        </div>

        {/* Search & Date Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search goods, wetin person talk, customer name, date, or amount..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative flex items-center">
              <Calendar className="absolute left-2.5 h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 pointer-events-none" />
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  if (e.target.value) setDateFilter("CUSTOM");
                  else setDateFilter("ALL");
                }}
                className="pl-8 pr-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-600 shadow-2xs cursor-pointer"
                title="Filter by specific date"
              />
            </div>

            {customDate && (
              <button
                type="button"
                onClick={() => {
                  setCustomDate("");
                  setDateFilter("ALL");
                }}
                className="px-2 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
              >
                Clear Date
              </button>
            )}
          </div>
        </div>

        {/* Date & Method Filter Chips */}
        {activeTab === "ENTRIES" && (
          <div className="space-y-2">
            {/* Date Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-emerald-600" /> When e happen:
              </span>
              {[
                { id: "ALL", label: "All Time" },
                { id: "TODAY", label: "Today Market" },
                { id: "YESTERDAY", label: "Yesterday" },
                { id: "THIS_WEEK", label: "This Week" },
                { id: "THIS_MONTH", label: "This Month" },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setDateFilter(d.id as any);
                    if (d.id !== "CUSTOM") setCustomDate("");
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                    dateFilter === d.id && !customDate
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Entry Method & Movement */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                How E Enter:
              </span>
              {[
                { id: "ALL", label: "All Methods" },
                { id: "VOICE", label: "Talk Am (Voice) 🎙️" },
                { id: "TYPED", label: "Type Am (Keyboard) ⌨️" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethodFilter(m.id as any)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                    methodFilter === m.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {m.label}
                </button>
              ))}

              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 mx-1">
                Stock Move:
              </span>
              {[
                { id: "ALL", label: "All Movements" },
                { id: "SALES", label: "Market Sales (Minus Stock ➖)" },
                { id: "RESTOCK", label: "Restock Supply (Plus Stock ➕)" },
              ].map((mov) => (
                <button
                  key={mov.id}
                  type="button"
                  onClick={() => setMovementFilter(mov.id as any)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                    movementFilter === mov.id
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {mov.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 5. LIVE ENTRIES SECTION (Mobile Cards + Desktop Table) ── */}
      {activeTab === "ENTRIES" ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
          {filteredEntries.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-sm font-black text-slate-800 dark:text-slate-200">
                No entry match wetin you dey find for this date.
              </p>
              <p className="text-xs text-slate-500">
                Talk am with voice or type new sale (e.g. "I sell 3 bags of rice ₦90k") to see auto-reconcile sharp-sharp!
              </p>
            </div>
          ) : (
            <>
              {/* ── MOBILE CARD FEED (Visible on Phones < 640px) ── */}
              <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEntries.map((entry) => {
                  const isSale = entry.stock_delta < 0;
                  const isRestock = entry.stock_delta > 0;

                  return (
                    <div key={entry.id} className="p-3.5 space-y-2.5">
                      {/* Row 1: Method + Date + Audio Replay */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black ${
                            entry.method === "VOICE"
                              ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}>
                            {entry.method === "VOICE" ? <Mic className="h-3 w-3" /> : <Keyboard className="h-3 w-3" />}
                            <span>{entry.method === "VOICE" ? "Talk Am" : "Typed"}</span>
                          </span>

                          <span className="text-[10.5px] text-slate-500 font-semibold">
                            {new Date(entry.timestamp).toLocaleDateString("en-NG", { month: "short", day: "numeric" })} • {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const pidginFeedback = generateMarketVernacularVoiceResponse({
                              item: entry.detected_item,
                              qty: entry.quantity,
                              unit: entry.unit,
                              amount: entry.amount,
                              type: entry.type,
                              stockBalanceAfter: entry.stock_balance_after,
                            });
                            playFemaleTraderVoice(pidginFeedback);
                          }}
                          className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center cursor-pointer hover:bg-emerald-100 hover:text-emerald-700 active:scale-90 transition-all"
                          title="Listen To Female Voice Audio"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Row 2: Spoken Transcript */}
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        "{entry.raw_transcript}"
                      </p>

                      {/* Row 3: Detected Item + Stock Delta + Amount */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-white block">
                            {entry.detected_item}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            Qty: {entry.quantity} {entry.unit}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className={`text-xs font-black block ${
                            isSale ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                          }`}>
                            ₦{entry.amount.toLocaleString()}
                          </span>
                          {isSale && (
                            <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 block">
                              {entry.stock_delta} {entry.unit} (E remain {entry.stock_balance_after})
                            </span>
                          )}
                          {isRestock && (
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 block">
                              +{entry.stock_delta} {entry.unit} (Total: {entry.stock_balance_after})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Row 4: Action button */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-black uppercase text-slate-500">
                          {entry.payment_method}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const text = `MoniePay Receipt Slip:%0AItem: ${entry.detected_item} (${entry.quantity} ${entry.unit})%0AAmount: ₦${entry.amount.toLocaleString()}%0AStock Left: ${entry.stock_balance_after} ${entry.unit}%0ADate: ${new Date(entry.timestamp).toLocaleString()}`;
                            window.open(`https://wa.me/?text=${text}`, "_blank");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                        >
                          <Share2 className="h-3 w-3" />
                          <span>WhatsApp Slip</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── DESKTOP & TABLET TABLE VIEW (Visible >= 640px) ── */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-3 px-3.5">Method</th>
                      <th className="py-3 px-3.5">Wetin Person Talk (Voice / Text)</th>
                      <th className="py-3 px-3.5">Commodity Item & Qty</th>
                      <th className="py-3 px-3.5">Date & Time</th>
                      <th className="py-3 px-3.5">Total Amount</th>
                      <th className="py-3 px-3.5">Stock Movement</th>
                      <th className="py-3 px-3.5 text-right">Receipt Slip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredEntries.map((entry) => {
                      const isSale = entry.stock_delta < 0;
                      const isRestock = entry.stock_delta > 0;

                      return (
                        <tr key={entry.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black ${
                              entry.method === "VOICE"
                                ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}>
                              {entry.method === "VOICE" ? <Mic className="h-3 w-3" /> : <Keyboard className="h-3 w-3" />}
                              <span>{entry.method === "VOICE" ? "Talk Am" : "Typed"}</span>
                            </span>
                          </td>

                          <td className="py-3 px-3.5 max-w-xs font-semibold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const pidginFeedback = generateMarketVernacularVoiceResponse({
                                    item: entry.detected_item,
                                    qty: entry.quantity,
                                    unit: entry.unit,
                                    amount: entry.amount,
                                    type: entry.type,
                                    stockBalanceAfter: entry.stock_balance_after,
                                  });
                                  playFemaleTraderVoice(pidginFeedback);
                                }}
                                className="h-6 w-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 cursor-pointer transition-colors active:scale-90"
                                title="Listen To Female Voice Audio"
                              >
                                <Volume2 className="h-3 w-3" />
                              </button>
                              <span className="line-clamp-2">"{entry.raw_transcript}"</span>
                            </div>
                          </td>

                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className="font-extrabold text-slate-900 dark:text-white block">
                              {entry.detected_item}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                              Qty: {entry.quantity} {entry.unit}
                            </span>
                          </td>

                          <td className="py-3 px-3.5 whitespace-nowrap text-slate-600 dark:text-slate-400">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {new Date(entry.timestamp).toLocaleDateString("en-NG", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span className="text-[10px]">
                              {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </td>

                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className={`font-black block ${
                              entry.type === "SALE" || entry.type === "DEBT_COLLECTION"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-900 dark:text-white"
                            }`}>
                              ₦{entry.amount.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                              {entry.payment_method}
                            </span>
                          </td>

                          <td className="py-3 px-3.5 whitespace-nowrap">
                            {isSale && (
                              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-black">
                                <TrendingDown className="h-3 w-3" />
                                <span>{entry.stock_delta} {entry.unit}</span>
                              </span>
                            )}
                            {isRestock && (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black">
                                <TrendingUp className="h-3 w-3" />
                                <span>+{entry.stock_delta} {entry.unit}</span>
                              </span>
                            )}
                            {!isSale && !isRestock && (
                              <span className="text-slate-400 font-bold">0 Delta</span>
                            )}
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              E remain: {entry.stock_balance_after} {entry.unit}
                            </span>
                          </td>

                          <td className="py-3 px-3.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                const text = `MoniePay Receipt Slip:%0AItem: ${entry.detected_item} (${entry.quantity} ${entry.unit})%0AAmount: ₦${entry.amount.toLocaleString()}%0AStock Left: ${entry.stock_balance_after} ${entry.unit}%0ADate: ${new Date(entry.timestamp).toLocaleString()}`;
                                window.open(`https://wa.me/?text=${text}`, "_blank");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100 text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                            >
                              <Share2 className="h-3 w-3" />
                              <span>Slip</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      ) : (
        /* ── INVENTORY CATALOG VIEW (Mobile Cards + Desktop Table) ── */
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
          {/* Mobile Inventory Cards (Visible < 640px) */}
          <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filteredInventory.map((item) => {
              const isLow = item.current_stock <= item.reorder_threshold;
              const itemValue = item.current_stock * item.selling_price;

              return (
                <div key={item.id} className="p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">
                        {item.name}
                      </h4>
                      <span className="text-[10.5px] text-slate-500 font-semibold">
                        {item.category}
                      </span>
                    </div>

                    {isLow ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-black text-[10px] shrink-0">
                        ⚠️ E don finish ({item.current_stock} left)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-[10px] shrink-0">
                        ✅ {item.current_stock} {item.unit} dey shop
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center text-[11px]">
                    <div>
                      <span className="text-[9.5px] text-slate-400 font-bold block">Cost Price</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">₦{item.cost_price.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 font-bold block">Selling Price</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">₦{item.selling_price.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 font-bold block">Total Worth</span>
                      <span className="font-black text-slate-900 dark:text-white">₦{itemValue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop & Tablet Table (Visible >= 640px) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-3.5">Commodity Name</th>
                  <th className="py-3 px-3.5">Market Category</th>
                  <th className="py-3 px-3.5">Stock Left For Shop</th>
                  <th className="py-3 px-3.5">Cost Price</th>
                  <th className="py-3 px-3.5">Selling Price</th>
                  <th className="py-3 px-3.5">Total Value</th>
                  <th className="py-3 px-3.5 text-right">Stock Level Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInventory.map((item) => {
                  const isLow = item.current_stock <= item.reorder_threshold;
                  const itemValue = item.current_stock * item.selling_price;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3.5 font-black text-slate-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400 font-semibold">
                        {item.category}
                      </td>
                      <td className="py-3 px-3.5 font-black">
                        <span className={`text-sm ${isLow ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
                          {item.current_stock}
                        </span>{" "}
                        <span className="text-[10px] text-slate-500 font-bold">{item.unit}</span>
                      </td>
                      <td className="py-3 px-3.5 font-bold text-slate-600 dark:text-slate-400">
                        ₦{item.cost_price.toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 font-black text-emerald-600 dark:text-emerald-400">
                        ₦{item.selling_price.toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 font-black text-slate-900 dark:text-white">
                        ₦{itemValue.toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        {isLow ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-black text-[10px]">
                            ⚠️ Low Stock ({item.current_stock} left)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-[10px]">
                            ✅ Healthy Level
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 6. ADD STOCK ITEM MODAL (MARKET VERNACULAR & SMOOTH VALIDATION) ── */}
      <AnimatePresence>
        {isAddStockOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-5 sm:p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">Register New Commodity / Market Goods</h3>
                    <p className="text-[11px] text-slate-500">Auto-tracked on every voice sale sharp-sharp</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddStockOpen(false)}
                  className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <form onSubmit={handleCreateStockItem} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Commodity / Item Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. 50kg Mama Gold Rice, Indomie Hungryman, Type-C Cable"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Market Category
                    </label>
                    <select
                      value={newItemCategory}
                      onChange={(e) => setNewItemCategory(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                    >
                      <option>Provisions & FMCG</option>
                      <option>Provisions & Grains</option>
                      <option>Phones & Gadgets</option>
                      <option>Food & Canteen</option>
                      <option>Energy & Kitchen</option>
                      <option>Fabrics & Fashion</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Measurement Unit
                    </label>
                    <select
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                    >
                      <option>Bags</option>
                      <option>Cartons</option>
                      <option>Pcs</option>
                      <option>Jerrycans</option>
                      <option>Cylinders</option>
                      <option>Crates</option>
                      <option>Rubbers</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Current Stock For Shop
                    </label>
                    <input
                      type="number"
                      required
                      value={newItemStock}
                      onChange={(e) => setNewItemStock(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Reorder Alert Level
                    </label>
                    <input
                      type="number"
                      required
                      value={newItemThreshold}
                      onChange={(e) => setNewItemThreshold(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Cost Price (₦)
                    </label>
                    <input
                      type="number"
                      required
                      value={newItemCost}
                      onChange={(e) => setNewItemCost(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Selling Price (₦)
                    </label>
                    <input
                      type="number"
                      required
                      value={newItemSell}
                      onChange={(e) => setNewItemSell(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer shadow-sm active:scale-98 transition-all mt-2"
                >
                  Save Commodity to Shop Directory
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
