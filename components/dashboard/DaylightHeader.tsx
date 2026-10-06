"use client";

import React from "react";
import {
  Wifi,
  WifiOff,
  Bell,
  MapPin,
  Sparkles,
  BrainCircuit,
  Store,
} from "lucide-react";
import type { Business } from "@/types/moniepay.types";

interface DaylightHeaderProps {
  business: Business;
  isOnline: boolean;
  isSyncing: boolean;
  onManualSync: () => void;
  onOpenTracker: () => void;
  activePeriod: "today" | "this_week" | "this_month";
  onChangePeriod: (p: "today" | "this_week" | "this_month") => void;
}

export function DaylightHeader({
  business,
  isOnline,
  isSyncing,
  onManualSync,
  onOpenTracker,
  activePeriod,
  onChangePeriod,
}: DaylightHeaderProps) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-800 pt-5 pb-12 px-4 sm:px-8 text-white shadow-lg">
      {/* Decorative background light orbs */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 bottom-0 h-48 w-48 rounded-full bg-teal-400/20 blur-2xl" />

      {/* Spacious, unconstrained container */}
      <div className="relative mx-auto w-full max-w-5xl lg:max-w-6xl">
        {/* Top Bar with Avatar, Greeting & Frosted Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Avatar Pill */}
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white font-black text-xl shadow-inner backdrop-blur-md border border-white/30 shrink-0">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-emerald-100">
                  Good morning!
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white leading-tight">
                {business.name}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-emerald-100/90 mt-0.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>{business.market_location || "Balogun Market, Lagos"}</span>
              </div>
            </div>
          </div>

          {/* Frosted Action Pills (Inspired by Image 1) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenTracker}
              title="Decision Learning Engine"
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/15 text-white backdrop-blur-md border border-white/20 hover:bg-white/25 active:scale-95 transition-all shadow-sm"
            >
              <BrainCircuit className="h-4 w-4 text-emerald-200" />
              <span className="hidden sm:inline text-xs font-bold">Track & Learn</span>
            </button>

            <button
              onClick={onManualSync}
              title={isOnline ? "Online • Instant Sync" : "Offline • Saved on device"}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/15 text-white text-xs font-bold backdrop-blur-md border border-white/20 active:scale-95 transition-all shadow-sm"
            >
              {isOnline ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                  <span className="text-xs">{isSyncing ? "Syncing..." : "Online"}</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-amber-300" />
                  <span className="text-xs text-amber-200">Offline</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Period Selector Strip (Tabs with Organic Indicator like Image 1) */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex rounded-2xl bg-black/15 p-1 border border-white/15 backdrop-blur-md">
            {(["today", "this_week", "this_month"] as const).map((p) => {
              const isActive = activePeriod === p;
              return (
                <button
                  key={p}
                  onClick={() => onChangePeriod(p)}
                  className={`relative px-4 sm:px-6 py-2 text-xs sm:text-sm font-extrabold rounded-xl transition-all ${
                    isActive
                      ? "bg-white text-emerald-900 shadow-md"
                      : "text-emerald-100 hover:text-white"
                  }`}
                >
                  {p === "today" && "Today"}
                  {p === "this_week" && "This Week"}
                  {p === "this_month" && "This Month"}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-100/90">
            <Store className="h-4 w-4" />
            <span>Informal Business Operating Layer</span>
          </div>
        </div>
      </div>
    </header>
  );
}
