"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Smart Voice & Auto-Stock Directory Ledger Table
// Official MoniePay Branded Directory • Real-time Stock Reconciliation
// Hands-Off Entry Auditing • Date Filtering • Audio Playback
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
  RefreshCw,
  CheckCircle2,
  SlidersHorizontal,
  X,
  Store,
  ArrowRight,
  ShieldCheck,
  Vibrate,
  Bell,
  Sparkles,
} from "lucide-react";
import { MoniePayMark } from "@/components/ui/MoniePayLogo";
import { MonieAiLogo } from "@/components/ui/MonieAiLogo";
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
import { playFemaleTraderVoice } from "@/lib/voice/spokenParser";
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

  // Simulated Voice Test State
  const [testTranscript, setTestTranscript] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

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
    setIsSimulating(true);
    try {
      const result = recordVoiceOrTypedStockEntry({
        method: "VOICE",
        rawTranscript: spokenText,
      });

      playCashChime();
      triggerCashHapticVibration("cash");
      playFemaleTraderVoice(`Recorded ${result.entry.detected_item}. Stock updated.`);

      toast("Voice Entry Recorded 🎙️", `Auto-reconciled: ${spokenText}`, { type: "success" });
      loadData();
    } finally {
      setIsSimulating(false);
      setTestTranscript("");
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
    toast("Stock Item Added 📦", `${newItem.name} registered in directory`, { type: "success" });
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Entry ID", "Method", "Spoken Transcript", "Detected Item", "Quantity", "Unit", "Amount (NGN)", "Stock Delta", "Stock Balance", "Timestamp"];
    const rows = filteredEntries.map((e) => [
      e.id,
      e.method,
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
    link.setAttribute("download", `moniepay_voice_stock_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* ── 1. OFFICIAL MONIEPAY BRANDED DIRECTORY HEADER ── */}
      <section className="relative overflow-hidden rounded-[28px] bg-slate-900 text-white p-5 sm:p-6 shadow-xl border border-slate-800">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-blue-500/15 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <MoniePayMark size={32} />
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black tracking-tight text-white">
                  MoniePay Auto-Stock Directory
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400/30 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Reconciler
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-medium max-w-xl">
              Every voice entry ("Talk Am") and typed sale is automatically parsed, cataloged with date & amount, and reconciles shop stock in real time with hands-off vibration & audio alerts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={requestHandsOffAlertPermissions}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Test Hardware Vibration & Beep"
            >
              <Vibrate className="h-3.5 w-3.5 text-emerald-400" />
              <span>Enable Hands-Off Alerts</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddStockOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Stock Item</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. EXECUTIVE KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Entries */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Logged Entries
            </span>
            <div className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <Mic className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalEntries}
          </p>
          <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold block">
            {stats.voiceCount} captured via Voice 🎙️
          </span>
        </div>

        {/* Tracked Stock Items */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tracked Commodities
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Package className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {inventory.length} <span className="text-xs font-bold text-slate-500">Items</span>
          </p>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
            Auto-deduct on every sale
          </span>
        </div>

        {/* Live Inventory Valuation */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Stock Valuation
            </span>
            <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            ₦{stats.totalValuation.toLocaleString()}
          </p>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block">
            Total warehouse worth
          </span>
        </div>

        {/* Low Stock Depletion Alert */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${
              stats.lowStockCount > 0 ? "bg-rose-100 dark:bg-rose-950 text-rose-600 animate-pulse" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}>
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className={`text-xl sm:text-2xl font-black ${stats.lowStockCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
            {stats.lowStockCount} <span className="text-xs font-bold text-slate-500">Commodities</span>
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">
            {stats.lowStockCount > 0 ? "Reorder before stock finishes" : "All stock levels healthy"}
          </span>
        </div>
      </div>

      {/* ── 3. VOICE ENTRY SIMULATOR / LIVE PREVIEW BAR ── */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-900/40 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Try Live Voice / Spoken Entry (Triggers Hands-Off Beep & Vibration)
          </span>
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
            Natural Pidgin & English
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            "Sold 3 bags of Mama Gold Rice for ₦234,000 via transfer",
            "Bought 8 cartons Indomie for ₦68,000 cash",
            "Customer took 4 fast chargers on credit ₦14,000",
            "Filled 2 cooking gas cylinders for ₦30,000",
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
              <span>Voice & Typed Entry Log ({filteredEntries.length})</span>
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
              <span>Live Stock Catalog ({filteredInventory.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Export CSV</span>
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
              placeholder="Search by spoken words, commodity, customer, or date..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
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
                <Calendar className="h-3 w-3 text-emerald-600" /> Date:
              </span>
              {[
                { id: "ALL", label: "All Time" },
                { id: "TODAY", label: "Today" },
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
                Method:
              </span>
              {[
                { id: "ALL", label: "All Methods" },
                { id: "VOICE", label: "Voice Entries 🎙️" },
                { id: "TYPED", label: "Typed Entries ⌨️" },
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
                Stock:
              </span>
              {[
                { id: "ALL", label: "All Movement" },
                { id: "SALES", label: "Sales Outflow ➖" },
                { id: "RESTOCK", label: "Restock Inflow ➕" },
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

      {/* ── 5. LIVE DATA TABLE SECTION ── */}
      {activeTab === "ENTRIES" ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
          {filteredEntries.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-sm font-black text-slate-800 dark:text-slate-200">
                No entries match your search or date filter.
              </p>
              <p className="text-xs text-slate-500">
                Speak or type a new sale (e.g. "Sold 3 bags of rice for ₦90k") to see auto-reconciliation.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-3.5">Method</th>
                    <th className="py-3 px-3.5">Spoken / Typed Input</th>
                    <th className="py-3 px-3.5">Detected Item & Qty</th>
                    <th className="py-3 px-3.5">Date & Time</th>
                    <th className="py-3 px-3.5">Amount</th>
                    <th className="py-3 px-3.5">Stock Movement</th>
                    <th className="py-3 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredEntries.map((entry) => {
                    const isSale = entry.stock_delta < 0;
                    const isRestock = entry.stock_delta > 0;

                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Method Badge */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black ${
                            entry.method === "VOICE"
                              ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}>
                            {entry.method === "VOICE" ? <Mic className="h-3 w-3" /> : <Keyboard className="h-3 w-3" />}
                            <span>{entry.method}</span>
                          </span>
                        </td>

                        {/* Raw Transcript with Audio Playback */}
                        <td className="py-3 px-3.5 max-w-xs font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => playFemaleTraderVoice(entry.raw_transcript)}
                              className="h-6 w-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                              title="Replay Spoken Audio"
                            >
                              <Volume2 className="h-3 w-3" />
                            </button>
                            <span className="line-clamp-2">"{entry.raw_transcript}"</span>
                          </div>
                        </td>

                        {/* Detected Item & Qty */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className="font-extrabold text-slate-900 dark:text-white block">
                            {entry.detected_item}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            Qty: {entry.quantity} {entry.unit}
                          </span>
                        </td>

                        {/* Date & Time */}
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

                        {/* Amount & Payment Channel */}
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

                        {/* Stock Movement & Balance */}
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
                            Balance: {entry.stock_balance_after} {entry.unit}
                          </span>
                        </td>

                        {/* Action Slip */}
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              const text = `MoniePay Receipt Slip:%0AItem: ${entry.detected_item} (${entry.quantity} ${entry.unit})%0AAmount: ₦${entry.amount.toLocaleString()}%0ADate: ${new Date(entry.timestamp).toLocaleString()}`;
                              window.open(`https://wa.me/?text=${text}`, "_blank");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100 text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
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
          )}
        </div>
      ) : (
        /* ── INVENTORY CATALOG VIEW ── */
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-3.5">Commodity Name</th>
                  <th className="py-3 px-3.5">Category</th>
                  <th className="py-3 px-3.5">Current Stock</th>
                  <th className="py-3 px-3.5">Cost Price</th>
                  <th className="py-3 px-3.5">Selling Price</th>
                  <th className="py-3 px-3.5">Total Value</th>
                  <th className="py-3 px-3.5 text-right">Stock Health</th>
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

      {/* ── 6. ADD STOCK ITEM MODAL ── */}
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
                    <h3 className="text-sm font-black">Register New Stock Item</h3>
                    <p className="text-[11px] text-slate-500">Auto-tracked on every voice sale</p>
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
                    placeholder="e.g. Indomie Hungryman, 50kg Sugar, Type-C Cable"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Category
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
                      Current Stock Qty
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
                  Save Commodity to Directory
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
