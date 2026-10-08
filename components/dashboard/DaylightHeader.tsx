"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  WifiOff,
  MapPin,
  BrainCircuit,
  Store,
  LogOut,
  QrCode,
  Smartphone,
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
  onOpenReceiveMoney?: () => void;
  activePeriod: "today" | "this_week" | "this_month";
  onChangePeriod: (p: "today" | "this_week" | "this_month") => void;
}

export function DaylightHeader({
  business,
  isOnline,
  isSyncing,
  onManualSync,
  onOpenTracker,
  onOpenReceiveMoney,
  activePeriod,
  onChangePeriod,
}: DaylightHeaderProps) {
  const { user, logout } = useAuth();
  const { isGracePeriodActive, graceDaysLeft, isExpired, openUpgradeModal } = useSubscription();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isRatingStandOpen, setIsRatingStandOpen] = useState(false);

  const displayName = user?.name || "Mama Chidi";
  const shopName = user?.businessName || business.name;
  const location = user?.marketLocation || business.market_location || "Shop 14, Balogun Market, Lagos";
  const profilePhoto = user?.avatarUrl || "/images/traders/mama_chidi.jpg";

  return (
    <>
      <header className="relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] dark:from-[#0b1739] dark:via-[#0f2359] dark:to-[#173887] backdrop-blur-2xl pt-3.5 pb-8 px-3.5 sm:px-6 md:px-8 text-white shadow-[0_12px_36px_rgba(29,78,216,0.3)] dark:shadow-2xl border-b border-white/20 dark:border-white/10 transition-colors">
        {/* Decorative background light orbs */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-sky-300/25 dark:bg-blue-400/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-8 -bottom-8 h-40 w-40 rounded-full bg-blue-300/20 dark:bg-sky-400/10 blur-xl" />

        <div className="relative mx-auto w-full max-w-4xl space-y-3">
          {/* ── ROW 1: TOP MAIN NAV BAR (Shop Identity on Left • Action Hub on Right) ── */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Merchant Profile & Identity */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <InfoTooltip content="Your shop profile & lock shop">
                <button
                  type="button"
                  onClick={() => setIsLogoutOpen(true)}
                  aria-label="Account profile & Lock Shop"
                  className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-2xl overflow-hidden border-2 border-sky-300/80 dark:border-sky-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.3)] shrink-0 cursor-pointer active:scale-95 transition-all bg-blue-950"
                >
                  <img
                    src={profilePhoto}
                    alt={displayName}
                    className="h-full w-full object-cover object-center"
                    onError={(e) => {
                      e.currentTarget.src = "/images/traders/mama_chidi.jpg";
                    }}
                  />
                  <span className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full bg-emerald-400 border-2 border-blue-950 shadow-xs" />
                </button>
              </InfoTooltip>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs xs:text-sm sm:text-base font-black text-white truncate tracking-tight leading-tight">
                    {shopName}
                  </h1>
                </div>

                <div className="flex items-center gap-1.5 xs:gap-2 text-[10.5px] sm:text-[11px] text-sky-100/90 mt-0.5">
                  {/* Sync status button */}
                  <button
                    type="button"
                    onClick={onManualSync}
                    className="inline-flex items-center gap-1 text-[10px] xs:text-[10.5px] font-bold text-sky-200 hover:text-white cursor-pointer transition-colors"
                  >
                    {isOnline ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Online</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3 text-amber-300" />
                        <span className="text-amber-200">Offline</span>
                      </>
                    )}
                  </button>

                  <span className="text-sky-300/40 hidden xs:inline">•</span>

                  {/* Location snippet */}
                  <div className="hidden xs:flex items-center gap-1 text-sky-200/90 truncate">
                    <MapPin className="h-3 w-3 text-sky-300 shrink-0" />
                    <span className="truncate max-w-[120px] sm:max-w-[190px]">{location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Rearranged Fintech Action Icons */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* 0. Dedicated Receive Money (QR & Dedicated Bank Transfer) */}
              {onOpenReceiveMoney && (
                <InfoTooltip content="Show customer QR & shop account to receive money">
                  <button
                    type="button"
                    onClick={onOpenReceiveMoney}
                    aria-label="Receive Money with QR & Account"
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-slate-950 font-black text-[11px] sm:text-xs shadow-md shadow-cyan-950/30 active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    <QrCode className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[2.5]" />
                    <span className="hidden xs:inline">Receive Moni</span>
                    <span className="xs:hidden">Receive</span>
                  </button>
                </InfoTooltip>
              )}

              {/* 1. MoniePay Plus / Free Trial Status Pill */}
              <SubscriptionStatusPill />

              {/* 2. Theme Toggle (Sun ☀️ / Moon 🌙) */}
              <InfoTooltip content="Switch Daylight or Night Market Mode">
                <ThemeToggle size="sm" />
              </InfoTooltip>

              {/* 3. Push Notification Bell & Drawer */}
              <NotificationBellDrawer />

              {/* 4. Customer Rating QR & Reviews Portal */}
              <InfoTooltip content="Shop Counter QR & Customer Reviews">
                <Link
                  href="/reviews"
                  aria-label="Shop QR & Customer Reviews"
                  className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-2xl bg-white/15 dark:bg-white/10 text-white backdrop-blur-md border border-white/20 dark:border-white/10 hover:bg-white/25 active:scale-95 transition-all cursor-pointer shadow-xs group"
                >
                  <QrCode className="h-4 w-4 text-amber-300 group-hover:scale-110 transition-transform" />
                </Link>
              </InfoTooltip>

              {/* 5. Vendor Market Map */}
              <InfoTooltip content="Find nearby market shops on map">
                <Link
                  href="/map"
                  aria-label="Market Map"
                  className="hidden xs:flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-2xl bg-white/15 dark:bg-white/10 text-white backdrop-blur-md border border-white/20 dark:border-white/10 hover:bg-white/25 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  <MapPin className="h-4 w-4 text-sky-200" />
                </Link>
              </InfoTooltip>

              {/* 6. Install App Trigger (Mobile & Desktop) */}
              <InfoTooltip content="Save MoniePay to your phone home screen">
                <button
                  type="button"
                  onClick={triggerInstallPrompt}
                  aria-label="Install App"
                  className="hidden sm:flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-2xl bg-white/15 dark:bg-white/10 text-white backdrop-blur-md border border-white/20 dark:border-white/10 hover:bg-white/25 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  <Smartphone className="h-4 w-4 text-sky-200" />
                </button>
              </InfoTooltip>

              {/* 7. Decision Memory Button */}
              <InfoTooltip content="Past shop decision memory">
                <button
                  type="button"
                  onClick={onOpenTracker}
                  aria-label="Decision Memory"
                  className="hidden md:flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-2xl bg-white/15 dark:bg-white/10 text-white backdrop-blur-md border border-white/20 dark:border-white/10 hover:bg-white/25 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  <BrainCircuit className="h-4 w-4 text-sky-200" />
                </button>
              </InfoTooltip>

              {/* 8. Sign Out / Lock Shop */}
              <InfoTooltip content="Lock shop make nobody touch am">
                <button
                  type="button"
                  onClick={() => setIsLogoutOpen(true)}
                  aria-label="Sign Out"
                  className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-2xl bg-white/10 dark:bg-white/5 hover:bg-white/20 text-white active:scale-95 transition-all cursor-pointer backdrop-blur-md border border-white/15"
                >
                  <LogOut className="h-4 w-4 text-sky-100" />
                </button>
              </InfoTooltip>
            </div>
          </div>

          {/* ── ROW 2: INFORMAL GREETING & STATUS ── */}
          <div className="pt-0.5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-xs sm:text-[13px] font-extrabold text-sky-200 tracking-tight">
                How far, {displayName.split(" ")[0]} 👋
              </span>
              <p className="text-[10.5px] sm:text-xs text-sky-100/90 font-medium truncate">
                Your market sales & shop records dey set sharp-sharp.
              </p>
            </div>

            <span className="hidden xs:inline-flex items-center gap-1 text-[10.5px] sm:text-[11px] font-bold text-sky-200/90 shrink-0 bg-white/10 dark:bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
              100% Offline • No Wahala ⚡
            </span>
          </div>

          {/* ── GRACE PERIOD / EXPIRY NOTIFICATION STRIP ── */}
          {isGracePeriodActive ? (
            <div
              onClick={() => openUpgradeModal("Grace period dey active. Renew your shop pass make your records dey intact.")}
              className="p-2.5 rounded-2xl bg-amber-400/20 hover:bg-amber-400/25 border border-amber-300/40 text-amber-100 text-xs flex items-center justify-between gap-2 cursor-pointer transition-all backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-300 shrink-0 animate-pulse" />
                <span className="font-bold">
                  Grace Period: {graceDaysLeft} {graceDaysLeft === 1 ? "day" : "days"} remain to renew your shop pass.
                </span>
              </div>
              <span className="underline font-black text-[11px] shrink-0 text-white">Renew ₦1,500 &rarr;</span>
            </div>
          ) : isExpired ? (
            <div
              onClick={() => openUpgradeModal("Your MoniePay Plus don expire. Renew sharp-sharp for ₦1,500/month to continue recording.")}
              className="p-2.5 rounded-2xl bg-rose-500/25 hover:bg-rose-500/30 border border-rose-400/50 text-rose-100 text-xs flex items-center justify-between gap-2 cursor-pointer transition-all backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-300 shrink-0 animate-bounce" />
                <span className="font-bold">
                  Shop pass don expire o. Renew sharp-sharp make you continue.
                </span>
              </div>
              <span className="underline font-black text-[11px] shrink-0 text-white">Renew Sharp-sharp &rarr;</span>
            </div>
          ) : null}

          {/* ── ROW 3: MARKET TIMELINE SWITCHER STRIP ── */}
          <div className="pt-0.5 flex items-center justify-between overflow-x-auto no-scrollbar">
            <div className="flex rounded-2xl bg-black/25 dark:bg-black/40 p-0.5 border border-white/15 backdrop-blur-md">
              {(["today", "this_week", "this_month"] as const).map((p) => {
                const isActive = activePeriod === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onChangePeriod(p)}
                    className={`relative px-2.5 xs:px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-extrabold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
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
          </div>
        </div>
      </header>

      {/* Daylight Logout Safety Modal */}
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={logout}
        userName={displayName}
        businessName={shopName}
        avatarUrl={profilePhoto}
      />

      {/* Countertop Merchant Rating Stand (QR & Barcode Modal) */}
      <MerchantRatingStand
        isOpen={isRatingStandOpen}
        onClose={() => setIsRatingStandOpen(false)}
        shopName={shopName}
        traderName={displayName}
        marketLocation={location}
        shopId={user?.id || "mama_chidi"}
        avatarUrl={profilePhoto}
      />
    </>
  );
}

export default DaylightHeader;
