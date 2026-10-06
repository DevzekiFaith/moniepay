"use client";

import React, { useState } from "react";
import {
  WifiOff,
  MapPin,
  BrainCircuit,
  Store,
  LogOut,
  Sparkles,
  QrCode,
} from "lucide-react";
import type { Business } from "@/types/moniepay.types";
import { useAuth } from "@/context/AuthContext";
import { LogoutModal } from "@/components/ui/LogoutModal";
import { MerchantRatingStand } from "@/components/rating/MerchantRatingStand";

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
  const { user, logout } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isRatingStandOpen, setIsRatingStandOpen] = useState(false);

  const displayName = user?.name || "Mama Chidi";
  const avatarLetter = (displayName[0] || "M").toUpperCase();

  return (
    <>
      <header className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 pt-4 pb-9 px-3.5 sm:px-6 md:px-8 text-white shadow-md">
        {/* Decorative background light orb */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-emerald-400/15 blur-2xl" />

        <div className="relative mx-auto w-full max-w-4xl">
          {/* Top Bar with Avatar, Greeting & Actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Avatar Pill */}
              <button
                type="button"
                onClick={() => setIsLogoutOpen(true)}
                title="Account details & Sign Out"
                className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-2xl overflow-hidden bg-white/20 hover:bg-white/30 text-white font-black text-lg shadow-inner backdrop-blur-md border border-white/30 shrink-0 cursor-pointer active:scale-95 transition-all"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span>{avatarLetter}</span>
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-emerald-900" />
              </button>

              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-emerald-200 block truncate">
                  Good day, {displayName.split(" ")[0]}
                </span>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white leading-tight truncate">
                  {user?.businessName || business.name}
                </h1>
                <div className="flex items-center gap-1 text-[10.5px] text-emerald-100/80 mt-0.5 truncate">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{user?.marketLocation || business.market_location || "Balogun Market"}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Rating Barcode & QR Stand Button */}
              <button
                type="button"
                onClick={() => setIsRatingStandOpen(true)}
                title="Customer Rating QR & Barcode Stand"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/15 text-white backdrop-blur-md border border-white/20 hover:bg-white/25 active:scale-95 transition-all text-xs font-bold cursor-pointer"
              >
                <QrCode className="h-3.5 w-3.5 text-emerald-200" />
                <span className="hidden sm:inline">Rating Stand</span>
              </button>

              <button
                type="button"
                onClick={onOpenTracker}
                title="Decision Memory & Outcomes"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/15 text-white backdrop-blur-md border border-white/20 hover:bg-white/25 active:scale-95 transition-all text-xs font-bold cursor-pointer"
              >
                <BrainCircuit className="h-3.5 w-3.5 text-emerald-200" />
                <span className="hidden sm:inline">Memory</span>
              </button>

              <button
                type="button"
                onClick={onManualSync}
                title={isOnline ? "Online • Instant Sync" : "Offline • Saved on device"}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/15 text-white text-xs font-bold backdrop-blur-md border border-white/20 active:scale-95 transition-all cursor-pointer"
              >
                {isOnline ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                    <span className="text-[11px]">{isSyncing ? "..." : "Online"}</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-amber-300" />
                    <span className="text-[11px] text-amber-200">Offline</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsLogoutOpen(true)}
                title="Sign Out"
                className="flex items-center justify-center h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 text-emerald-100" />
              </button>
            </div>
          </div>

          {/* Compact Period Switcher Strip */}
          <div className="mt-3.5 flex items-center justify-between">
            <div className="flex rounded-xl bg-black/20 p-0.5 border border-white/15 backdrop-blur-md">
              {(["today", "this_week", "this_month"] as const).map((p) => {
                const isActive = activePeriod === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onChangePeriod(p)}
                    className={`relative px-3 sm:px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? "bg-white text-emerald-950 shadow-sm"
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

            <span className="hidden sm:inline text-[11px] font-bold text-emerald-200/90">
              Informal Business OS
            </span>
          </div>
        </div>
      </header>

      {/* Daylight Logout Safety Modal */}
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        userName={displayName}
        businessName={user?.businessName || business.name}
        onConfirm={async () => {
          setIsLogoutOpen(false);
          await logout();
        }}
      />

      {/* Customer Rating Barcode & QR Code Counter Stand */}
      <MerchantRatingStand
        isOpen={isRatingStandOpen}
        onClose={() => setIsRatingStandOpen(false)}
        shopName={user?.businessName || business.name}
        traderName={displayName}
        marketLocation={user?.marketLocation || business.market_location || "Balogun Market, Lagos"}
        shopId={user?.id || "mama_chidi"}
        avatarUrl={user?.avatarUrl || "/images/traders/mama_chidi.jpg"}
      />
    </>
  );
}
