"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  WifiOff,
  MapPin,
  Building2,
  BrainCircuit,
  Store,
  LogOut,
  QrCode,
  Smartphone,
  AlertTriangle,
  Clock,
  MoreVertical,
  ThumbsUp,
  ShieldCheck,
  ChevronDown,
  Users,
} from "lucide-react";
import type { Business } from "@/types/moniepay.types";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { LogoutModal } from "@/components/ui/LogoutModal";
import { MerchantRatingStand } from "@/components/rating/MerchantRatingStand";
import { NotificationBellDrawer } from "@/components/notifications/NotificationBellDrawer";
import { SubscriptionStatusPill } from "@/components/subscription/SubscriptionStatusPill";
import { CreditBalancePill } from "@/components/credits/CreditBalancePill";
import { triggerInstallPrompt } from "@/components/pwa/InstallAppBanner";
import { InfoTooltip } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getPendingQueue } from "@/lib/offline/offlineQueue";
import { lockShop, getAutoLockMinutes } from "@/lib/security/ownerPinService";
import { AddStaffDeviceModal } from "@/components/staff/AddStaffDeviceModal";
import { Lock } from "lucide-react";

interface DaylightHeaderProps {
  business: Business;
  isOnline: boolean;
  isSyncing: boolean;
  onManualSync: () => void;
  onOpenTracker: () => void;
  onOpenReceiveMoney?: () => void;
  onOpenInvite?: () => void;
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
  onOpenInvite,
  activePeriod,
  onChangePeriod,
}: DaylightHeaderProps) {
  const { user, logout } = useAuth();
  const { openUpgradeModal } = useSubscription();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isRatingStandOpen, setIsRatingStandOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Live offline pending queue watcher
  React.useEffect(() => {
    const updateQueue = () => {
      try {
        setPendingCount(getPendingQueue().length);
      } catch {}
    };
    updateQueue();
    window.addEventListener("moniepay:transaction-recorded", updateQueue);
    window.addEventListener("moniepay:sync-completed", updateQueue);
    window.addEventListener("online", updateQueue);
    window.addEventListener("offline", updateQueue);
    return () => {
      window.removeEventListener("moniepay:transaction-recorded", updateQueue);
      window.removeEventListener("moniepay:sync-completed", updateQueue);
      window.removeEventListener("online", updateQueue);
      window.removeEventListener("offline", updateQueue);
    };
  }, []);

  const isDemoMamaChidi = !user || user.id === "user_owner_01" || (user.name === "Mama Chidi" && (!user.marketLocation || user.marketLocation.includes("Balogun")));
  const displayName = user?.name || "Shop Owner";
  const shopName = user?.businessName || (isDemoMamaChidi ? business.name : `${displayName}'s Store`);
  // Avoid static location for users: only use location after registration / if explicitly set
  const rawLoc = user?.marketLocation || (business.market_location && !business.market_location.toLowerCase().includes("balogun") ? business.market_location : null);
  const registeredLocation = rawLoc && !rawLoc.toLowerCase().includes("balogun") && rawLoc !== "Commercial Trading Shop, Nigeria" ? rawLoc : null;
  const profilePhoto = user?.avatarUrl || (isDemoMamaChidi ? "/images/traders/mama_chidi.jpg" : undefined);

  return (
    <>
      <header className="relative z-30 bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] dark:from-[#0b1739] dark:via-[#0f2359] dark:to-[#173887] backdrop-blur-2xl pt-3.5 pb-8 px-3.5 sm:px-6 md:px-8 text-white shadow-[0_12px_36px_rgba(29,78,216,0.3)] dark:shadow-2xl border-b border-white/20 dark:border-white/10 transition-colors">
        {/* Decorative background light orbs (contained in dedicated overflow wrapper) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-sky-300/25 dark:bg-blue-400/10 blur-2xl" />
          <div className="absolute -left-8 -bottom-8 h-40 w-40 rounded-full bg-blue-300/20 dark:bg-sky-400/10 blur-xl" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-4xl space-y-3">
          {/* ── ROW 1: TOP MAIN NAV BAR (Shop Identity on Left • Clean Action Hub on Right) ── */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Merchant Profile & Identity (Avatar + Docked Sync Pill, Shop Name & Location) */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {/* Avatar + Docked Sync Status Chip */}
              <div className="flex flex-col items-center shrink-0">
                <InfoTooltip content="Your shop profile & lock shop">
                  <button
                    type="button"
                    onClick={() => setIsLogoutOpen(true)}
                    aria-label="Account profile & Lock Shop"
                    className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-2xl overflow-hidden border-2 border-sky-300/80 dark:border-sky-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.3)] shrink-0 cursor-pointer active:scale-95 transition-all bg-blue-950 flex items-center justify-center"
                  >
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt={displayName}
                        className="h-full w-full object-cover object-center"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="font-black text-white text-base">
                        {(displayName[0] || "T").toUpperCase()}
                      </span>
                    )}
                    <span className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full bg-emerald-400 border-2 border-blue-950 shadow-xs" />
                  </button>
                </InfoTooltip>

                {/* Docked Sync status pill with live offline pending count */}
                <button
                  type="button"
                  onClick={onManualSync}
                  className={`mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] sm:text-[9.5px] font-black cursor-pointer active:scale-95 transition-all shadow-2xs backdrop-blur-md whitespace-nowrap ${
                    isSyncing
                      ? "bg-amber-400/20 text-amber-200 border-amber-300/40"
                      : pendingCount > 0
                      ? isOnline
                        ? "bg-amber-500/25 text-amber-100 border-amber-300/60 hover:bg-amber-500/35"
                        : "bg-rose-500/25 text-rose-100 border-rose-300/60"
                      : isOnline
                      ? "bg-white/15 dark:bg-white/10 text-sky-100 hover:text-white border-white/20 hover:bg-white/25"
                      : "bg-amber-950/40 text-amber-200 border-amber-400/30"
                  }`}
                  title={
                    pendingCount > 0
                      ? `${pendingCount} recorded transactions waiting to sync to cloud. Click to sync now.`
                      : isOnline
                      ? "All records backed up to cloud. Click to force sync."
                      : "Device offline. Records safely stored locally on phone and will sync automatically once network is restored."
                  }
                >
                  {isSyncing ? (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-ping" />
                      <span>Syncing…</span>
                    </>
                  ) : pendingCount > 0 ? (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span>{isOnline ? `${pendingCount} Pending Sync` : `Offline (${pendingCount})`}</span>
                    </>
                  ) : isOnline ? (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>Backed Up ✓</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-2.5 w-2.5 text-amber-300" />
                      <span className="text-amber-200">Offline Safe</span>
                    </>
                  )}
                </button>
              </div>

              {/* Shop Name & Location to the right */}
              <div className="min-w-0 flex-1">
                <h1 className="text-xs xs:text-sm sm:text-base font-black text-white truncate tracking-tight leading-tight">
                  {shopName}
                </h1>

                {registeredLocation ? (
                  <div className="flex items-center gap-1 text-[10.5px] sm:text-[11px] text-sky-200/90 font-medium mt-0.5 truncate">
                    <MapPin className="h-3 w-3 text-sky-300 shrink-0" />
                    <span className="truncate max-w-[140px] sm:max-w-[220px]">{registeredLocation}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10.5px] sm:text-[11px] text-sky-200/90 font-medium mt-0.5 truncate">
                    <Building2 className="h-3 w-3 text-sky-300 shrink-0" />
                    <span className="truncate max-w-[140px] sm:max-w-[220px]">{shopName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Streamlined, Uncrowded Action Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* 1. Notification Bell */}
              <NotificationBellDrawer />

              {/* 2. Theme Toggle */}
              <InfoTooltip content="Switch Daylight or Night Mode">
                <ThemeToggle size="sm" />
              </InfoTooltip>

              {/* 3. Insight Credits Balance Pill */}
              <div className="inline-flex">
                <CreditBalancePill />
              </div>

              {/* 4. Pro Status Pill (Visible on md+ screens) */}
              <div className="hidden md:inline-flex">
                <SubscriptionStatusPill />
              </div>

              {/* 5. 1-Tap Quick Screen Lock (Instant Anti-Theft) */}
              <InfoTooltip content="Lock Shop Screen Now (4-Digit PIN)">
                <button
                  type="button"
                  onClick={() => lockShop()}
                  aria-label="Lock Stall Screen"
                  className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-white/15 dark:bg-white/10 text-white backdrop-blur-md border border-white/20 dark:border-white/10 hover:bg-white/25 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  <Lock className="h-3.5 w-3.5" />
                </button>
              </InfoTooltip>

              {/* 6. More Actions Dropdown (Organizes secondary links cleanly) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  aria-label="More Options"
                  className={`flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-white/15 dark:bg-white/10 text-white backdrop-blur-md border border-white/20 dark:border-white/10 hover:bg-white/25 active:scale-95 transition-all cursor-pointer shadow-xs ${
                    isMoreMenuOpen ? "bg-white/30 text-white" : ""
                  }`}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {/* Dropdown Menu Popup */}
                {isMoreMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsMoreMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-11 z-40 w-56 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-1.5 space-y-1 text-xs text-slate-800 dark:text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
                      <Link
                        href="/reviews"
                        onClick={() => setIsMoreMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-bold transition-colors"
                      >
                        <ThumbsUp className="h-4 w-4 text-amber-500 shrink-0" />
                        <span>Customer Reviews & QR</span>
                      </Link>

                      <Link
                        href="/map"
                        onClick={() => setIsMoreMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-bold transition-colors"
                      >
                        <MapPin className="h-4 w-4 text-sky-500 shrink-0" />
                        <span>Market Vendor Map</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          onOpenTracker();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-bold transition-colors text-left cursor-pointer"
                      >
                        <BrainCircuit className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span>Decision Memory</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          triggerInstallPrompt();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-bold transition-colors text-left cursor-pointer"
                      >
                        <Smartphone className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>Install App on Phone</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          lockShop();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-bold transition-colors text-left cursor-pointer"
                      >
                        <Lock className="h-4 w-4 text-blue-500 shrink-0" />
                        <div>
                          <span>Lock Shop Screen (PIN)</span>
                          <span className="block text-[10px] text-slate-400 font-normal">Auto-locks after 2m idle</span>
                        </div>
                      </button>

                      {!user?.isStaff && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsMoreMenuOpen(false);
                            setIsStaffModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-bold transition-colors text-left cursor-pointer"
                        >
                          <Users className="h-4 w-4 text-indigo-500 shrink-0" />
                          <div>
                            <span>Add Staff Device (QR)</span>
                            <span className="block text-[10px] text-slate-400 font-normal">Pair sales boy / cashier</span>
                          </div>
                        </button>
                      )}

                      {onOpenInvite && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsMoreMenuOpen(false);
                            onOpenInvite();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-black transition-colors text-left cursor-pointer"
                        >
                          <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Invite Neighbor (+14d Free) 🤝</span>
                        </button>
                      )}

                      <Link
                        href="/upgrade"
                        onClick={() => setIsMoreMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-bold transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
                        <span>MoniePay Plus Pass</span>
                      </Link>

                      <div className="pt-1 border-t border-black/10 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMoreMenuOpen(false);
                            setIsLogoutOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 text-rose-500 shrink-0" />
                          <span>Lock Shop / Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── ROW 2: INFORMAL GREETING & STATUS ── */}
          <div className="pt-0.5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-xs sm:text-[13px] font-extrabold text-sky-200 tracking-tight flex items-center gap-1.5">
                <span>How far, {displayName.split(" ")[0]} 👋</span>
                {user?.isStaff && (
                  <span className="bg-amber-400/25 text-amber-100 border border-amber-300/50 text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider">
                    Staff Terminal 🛡️
                  </span>
                )}
              </span>
              <p className="text-[10.5px] sm:text-xs text-sky-100/90 font-medium truncate">
                {user?.isStaff
                  ? `Operating as ${user.staffRole || "Sales Cashier"}. Record sales & customer receipts.`
                  : "Your market sales & shop records dey set sharp-sharp."}
              </p>
            </div>

            <span className="hidden xs:inline-flex items-center gap-1 text-[10.5px] sm:text-[11px] font-bold text-sky-200/90 shrink-0 bg-white/10 dark:bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
              {user?.isStaff ? "Sales & Receipts Mode 🧾" : "100% Offline • No Wahala ⚡"}
            </span>
          </div>


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
        onLockShop={() => {
          setIsLogoutOpen(false);
          lockShop();
        }}
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
        marketLocation={registeredLocation || undefined}
        shopId={user?.id || "mama_chidi"}
        avatarUrl={profilePhoto}
      />

      {/* Multi-Device Staff Pairing QR & 6-Digit Code Modal */}
      <AddStaffDeviceModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        ownerId={user?.id}
        businessName={shopName}
        traderName={displayName}
      />
    </>
  );
}

export default DaylightHeader;
