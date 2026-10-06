"use client";

import React, { useState } from "react";
import {
  WifiOff,
  MapPin,
  BrainCircuit,
  Store,
  LogOut,
  QrCode,
} from "lucide-react";
import type { Business } from "@/types/moniepay.types";
import { useAuth } from "@/context/AuthContext";
import { LogoutModal } from "@/components/ui/LogoutModal";
import { MerchantRatingStand } from "@/components/rating/MerchantRatingStand";
import { NotificationBellDrawer } from "@/components/notifications/NotificationBellDrawer";
import { InfoTooltip } from "@/components/ui/tooltip";

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
  const profilePhoto = user?.avatarUrl || "/images/traders/mama_chidi.jpg";

  return (
    <>
      <header className="relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] backdrop-blur-2xl pt-4 pb-9 px-3.5 sm:px-6 md:px-8 text-white shadow-[0_12px_36px_rgba(29,78,216,0.3)] border-b border-white/20">
        {/* Decorative background light orb */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-sky-300/25 blur-2xl" />
        <div className="pointer-events-none absolute -left-8 -bottom-8 h-40 w-40 rounded-full bg-blue-300/20 blur-xl" />

        <div className="relative mx-auto w-full max-w-4xl">
          {/* Top Bar with Avatar, Greeting & Actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Profile Image Avatar Button with Tooltip */}
              <InfoTooltip content="View shop profile, details & sign out">
                <button
                  type="button"
                  onClick={() => setIsLogoutOpen(true)}
                  aria-label="Account profile & Sign Out"
                  className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-2xl overflow-hidden border-2 border-sky-300/80 shadow-[0_4px_16px_rgba(0,0,0,0.3)] shrink-0 cursor-pointer active:scale-95 transition-all bg-blue-950"
                >
                  <img
                    src={profilePhoto}
                    alt={displayName}
                    className="h-full w-full object-cover object-center"
                    onError={(e) => {
                      e.currentTarget.src = "/images/traders/mama_chidi.jpg";
                    }}
                  />
                  <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-sky-400 border-2 border-blue-950 shadow-xs" />
                </button>
              </InfoTooltip>

              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-sky-200 block truncate">
                  Good day, {displayName.split(" ")[0]} 👋
                </span>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white leading-tight truncate">
                  {user?.businessName || business.name}
                </h1>
                <div className="flex items-center gap-1 text-[10.5px] text-sky-100/90 mt-0.5 truncate">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{user?.marketLocation || business.market_location || "Balogun Market"}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Push Notification Bell & Drawer */}
              <NotificationBellDrawer />

              {/* Rating Barcode & QR Stand Button with Tooltip */}
              <InfoTooltip content="Show customer QR & Barcode stand for your shop counter">
                <button
                  type="button"
                  onClick={() => setIsRatingStandOpen(true)}
                  aria-label="Customer Rating QR & Barcode Stand"
                  className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-auto sm:gap-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/15 text-white backdrop-blur-md border border-white/20 hover:bg-white/25 active:scale-95 transition-all text-xs font-bold cursor-pointer shadow-xs"
                >
                  <QrCode className="h-3.5 w-3.5 text-sky-200" />
                  <span className="hidden sm:inline">Rating Stand</span>
                </button>
              </InfoTooltip>

              {/* Decision Memory Button with Tooltip */}
              <InfoTooltip content="Check memory of past decisions and actions wey you don record">
                <button
                  type="button"
                  onClick={onOpenTracker}
                  aria-label="Decision Memory & Outcomes"
                  className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-auto sm:gap-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/15 text-white backdrop-blur-md border border-white/20 hover:bg-white/25 active:scale-95 transition-all text-xs font-bold cursor-pointer shadow-xs"
                >
                  <BrainCircuit className="h-3.5 w-3.5 text-sky-200" />
                  <span className="hidden sm:inline">Memory</span>
                </button>
              </InfoTooltip>

              {/* Network Sync Status with Tooltip */}
              <InfoTooltip content={isOnline ? "Online: Transactions dey sync live to cloud" : "Offline: Everything saved safe on your phone memory"}>
                <button
                  type="button"
                  onClick={onManualSync}
                  aria-label={isOnline ? "Online • Instant Sync" : "Offline • Saved on device"}
                  className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-auto sm:gap-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/15 text-white text-xs font-bold backdrop-blur-md border border-white/20 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  {isOnline ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-sky-300 animate-pulse" />
                      <span className="text-[11px] hidden sm:inline">{isSyncing ? "..." : "Online"}</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3.5 w-3.5 text-amber-300" />
                      <span className="text-[11px] text-amber-200 hidden sm:inline">Offline</span>
                    </>
                  )}
                </button>
              </InfoTooltip>

              {/* Logout Button with Tooltip */}
              <InfoTooltip content="Lock shop & Sign Out">
                <button
                  type="button"
                  onClick={() => setIsLogoutOpen(true)}
                  aria-label="Sign Out"
                  className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all cursor-pointer backdrop-blur-md border border-white/10"
                >
                  <LogOut className="h-3.5 w-3.5 text-sky-100" />
                </button>
              </InfoTooltip>
            </div>
          </div>

          {/* Compact Period Switcher Strip */}
          <div className="mt-3.5 flex items-center justify-between">
            <div className="flex rounded-xl bg-black/25 p-0.5 border border-white/15 backdrop-blur-md">
              {(["today", "this_week", "this_month"] as const).map((p) => {
                const isActive = activePeriod === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onChangePeriod(p)}
                    className={`relative px-3 sm:px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? "bg-white text-blue-950 shadow-sm"
                        : "text-sky-100 hover:text-white"
                    }`}
                  >
                    {p === "today" && "Today Market"}
                    {p === "this_week" && "This Week"}
                    {p === "this_month" && "This Month"}
                  </button>
                );
              })}
            </div>

            <span className="hidden sm:inline text-[11px] font-bold text-sky-200/90">
              Live Market Ledger • 100% Offline Ready
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
        avatarUrl={profilePhoto}
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
