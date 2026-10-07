"use client";

import React, { useState } from "react";
import {
  WifiOff,
  MapPin,
  BrainCircuit,
  Store,
  LogOut,
  QrCode,
  Download,
  AlertTriangle,
  Clock,
} from "lucide-react";
import type { Business } from "@/types/moniepay.types";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { LogoutModal } from "@/components/ui/LogoutModal";
import { MerchantRatingStand } from "@/components/rating/MerchantRatingStand";
import { NotificationBellDrawer } from "@/components/notifications/NotificationBellDrawer";
import { SubscriptionStatusPill } from "@/components/subscription/SubscriptionStatusPill";
import { triggerInstallPrompt } from "@/components/pwa/InstallAppBanner";
import { InfoTooltip } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

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
  const { isGracePeriodActive, graceDaysLeft, isExpired, openUpgradeModal } = useSubscription();
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

        <div className="relative mx-auto w-full max-w-4xl space-y-3 sm:space-y-3.5">
          {/* ── ROW 1: TOP UTILITY BAR (Avatar + Quick Action Controls) ── */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Avatar + Sync Badge */}
            <div className="flex items-center gap-2">
              <InfoTooltip content="View shop profile, details & sign out">
                <button
                  type="button"
                  onClick={() => setIsLogoutOpen(true)}
                  aria-label="Account profile & Sign Out"
                  className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-2xl overflow-hidden border-2 border-sky-300/80 shadow-[0_4px_16px_rgba(0,0,0,0.3)] shrink-0 cursor-pointer active:scale-95 transition-all bg-blue-950"
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

              {/* Online / Offline Status Badge */}
              <InfoTooltip content={isOnline ? "Online: Transactions dey sync live to cloud" : "Offline: Everything saved safe on your phone memory"}>
                <button
                  type="button"
                  onClick={onManualSync}
                  aria-label={isOnline ? "Online • Instant Sync" : "Offline • Saved on device"}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/15 text-white text-[11px] font-bold backdrop-blur-md border border-white/20 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  {isOnline ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-sky-300 animate-pulse" />
                      <span>{isSyncing ? "..." : "Online"}</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3 text-amber-300" />
                      <span className="text-amber-200">Offline</span>
                    </>
                  )}
                </button>
              </InfoTooltip>
            </div>

            {/* Right: Actions Cluster (Subscription Pill, Bell, Install App, Rating QR, Memory, Logout) */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-wrap justify-end">
              {/* MoniePay Plus / Free Trial Status Pill */}
              <SubscriptionStatusPill />

              {/* Theme Toggle (Sun / Moon) */}
              <InfoTooltip content="Switch between Daylight & Night Market Theme">
                <ThemeToggle size="sm" />
              </InfoTooltip>

              {/* Push Notification Bell & Drawer */}
              <NotificationBellDrawer />

              {/* Install App Trigger Button with Tooltip */}
              <InfoTooltip content="Install MoniePay app to your phone home screen for fast offline recording">
                <button
                  type="button"
                  onClick={triggerInstallPrompt}
                  aria-label="Install MoniePay App on phone"
                  className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-auto sm:gap-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/15 text-white backdrop-blur-md border border-white/20 hover:bg-white/25 active:scale-95 transition-all text-xs font-bold cursor-pointer shadow-xs"
                >
                  <Download className="h-3.5 w-3.5 text-sky-200" />
                  <span className="hidden lg:inline">Install App</span>
                </button>
              </InfoTooltip>

              {/* Rating Barcode & QR Stand Button with Tooltip */}
              <InfoTooltip content="Show customer QR & Barcode stand for your shop counter">
                <button
                  type="button"
                  onClick={() => setIsRatingStandOpen(true)}
                  aria-label="Customer Rating QR & Barcode Stand"
                  className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-auto sm:gap-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/15 text-white backdrop-blur-md border border-white/20 hover:bg-white/25 active:scale-95 transition-all text-xs font-bold cursor-pointer shadow-xs"
                >
                  <QrCode className="h-3.5 w-3.5 text-sky-200" />
                  <span className="hidden md:inline">Rating Stand</span>
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
                  <span className="hidden md:inline">Memory</span>
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

          {/* ── ROW 2: SHOP IDENTITY BANNER (Dedicated full-width row under avatar & trial pill) ── */}
          <div className="pt-0.5">
            <span className="text-xs sm:text-[13px] font-bold text-sky-200 flex items-center gap-1">
              Good day, {displayName.split(" ")[0]} 👋
            </span>

            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white leading-tight mt-0.5">
              {user?.businessName || business.name}
            </h1>

            <div className="flex items-center gap-1.5 text-xs text-sky-100/90 mt-1">
              <MapPin className="h-3.5 w-3.5 text-sky-300 shrink-0" />
              <span className="font-medium">
                {user?.marketLocation || business.market_location || "Shop 14, Balogun Market, Lagos"}
              </span>
            </div>
          </div>

          {/* ── GRACE PERIOD / EXPIRY NOTIFICATION STRIP ── */}
          {isGracePeriodActive ? (
            <div
              onClick={() => openUpgradeModal("Grace period active. Renew your MoniePay Plus subscription to keep full access.")}
              className="p-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/25 border border-amber-300/40 text-amber-100 text-xs flex items-center justify-between gap-2 cursor-pointer transition-all backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-300 shrink-0 animate-pulse" />
                <span className="font-bold">
                  Grace Period: {graceDaysLeft} {graceDaysLeft === 1 ? "day" : "days"} left to renew your subscription.
                </span>
              </div>
              <span className="underline font-black text-[11px] shrink-0 text-white">Renew ₦1,500 &rarr;</span>
            </div>
          ) : isExpired ? (
            <div
              onClick={() => openUpgradeModal("Your MoniePay Plus has expired. Renew for ₦1,500/month or ₦15,000/year to continue.")}
              className="p-2.5 rounded-xl bg-rose-500/25 hover:bg-rose-500/30 border border-rose-400/50 text-rose-100 text-xs flex items-center justify-between gap-2 cursor-pointer transition-all backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-300 shrink-0 animate-bounce" />
                <span className="font-bold">
                  Your MoniePay Plus has expired. Renew to continue recording.
                </span>
              </div>
              <span className="underline font-black text-[11px] shrink-0 text-white">Renew Now &rarr;</span>
            </div>
          ) : null}

          {/* ── ROW 3: MARKET TIMELINE SWITCHER STRIP ── */}
          <div className="pt-1 flex items-center justify-between">
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
        onConfirm={logout}
        userName={displayName}
        businessName={user?.businessName || business.name}
        avatarUrl={profilePhoto}
      />

      {/* Countertop Merchant Rating Stand (QR & Barcode Modal) */}
      <MerchantRatingStand
        isOpen={isRatingStandOpen}
        onClose={() => setIsRatingStandOpen(false)}
        shopName={user?.businessName || business.name}
        traderName={displayName}
        marketLocation={user?.marketLocation || business.market_location}
        avatarUrl={profilePhoto}
      />
    </>
  );
}
