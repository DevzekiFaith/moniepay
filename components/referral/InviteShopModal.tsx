"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Invite Shop Neighbor & 7-Day Trader Reward Modal
// Modern Daylight & Night Market Theme • Sleek Typography • WhatsApp 1-Tap
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Store,
  Gift,
  X,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import {
  ReferredTrader,
  ReferralStats,
} from "@/types/referral.types";
import {
  getReferredTraders,
  getReferralStats,
  claimReferralReward,
  generateWhatsAppInviteMessage,
} from "@/lib/referral/referralStore";
import { playCashChime, triggerCashHapticVibration } from "@/lib/alerts/hapticSoundService";
import { useToast } from "@/context/NotificationContext";

interface InviteShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName?: string;
  ownerName?: string;
  userPhone?: string;
}

export function InviteShopModal({
  isOpen,
  onClose,
  businessName = "My Shop",
  ownerName = "Shop Owner",
  userPhone = "",
}: InviteShopModalProps) {
  const { toast } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED" | "RULES">("ACTIVE");
  const [stats, setStats] = useState<ReferralStats>(() => getReferralStats(businessName, userPhone));
  const [traders, setTraders] = useState<ReferredTrader[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const loadData = () => {
    setStats(getReferralStats(businessName, userPhone));
    setTraders(getReferredTraders());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, businessName, userPhone]);

  useEffect(() => {
    const handleUpdate = () => loadData();
    window.addEventListener("moniepay:referral-updated", handleUpdate);
    return () => {
      window.removeEventListener("moniepay:referral-updated", handleUpdate);
    };
  }, []);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(stats.referral_link);
    }
    setCopiedLink(true);
    triggerCashHapticVibration("cash");
    playCashChime();
    toast("Link Copied! 📋", "Share with fellow shop owners on WhatsApp or SMS.", { type: "success" });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(stats.referral_code);
    }
    setCopiedCode(true);
    triggerCashHapticVibration("cash");
    toast("Code Copied!", `Your referral code ${stats.referral_code} is ready.`, { type: "success" });
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = generateWhatsAppInviteMessage(stats.referral_code, ownerName);
    const whatsappUrl = `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, "_blank");
    triggerCashHapticVibration("cash");
  };

  const handleClaim = (trader: ReferredTrader) => {
    setClaimingId(trader.id);
    const res = claimReferralReward(trader.id);
    if (res.success) {
      playCashChime();
      triggerCashHapticVibration("cash");
      toast("Reward Unlocked! 🎉", res.message, { type: "success" });
      loadData();
    } else {
      toast("Notice", res.message, { type: "error" });
    }
    setClaimingId(null);
  };

  const activeTraders = traders.filter((t) => t.status === "ACTIVE_RECORDING" || t.status === "PENDING_ONBOARDING");
  const completedTraders = traders.filter((t) => t.status === "QUALIFIED_COMPLETED" || t.status === "REWARD_CLAIMED");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="w-full max-w-lg rounded-[24px] sm:rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_25px_65px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] text-slate-900 dark:text-slate-100 transition-colors"
      >
        {/* ── HEADER ── */}
        <div className="relative p-3.5 sm:p-5 bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] dark:from-[#0b1739] dark:via-[#0f2359] dark:to-[#173887] text-white shrink-0 overflow-hidden">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sky-300/20 blur-2xl" />

          <div className="flex items-start sm:items-center justify-between gap-2.5 sm:gap-3 relative z-10">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Users className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-xs sm:text-base font-black tracking-tight text-white leading-tight">
                    Call Your Shop Neighbor 🤝
                  </h2>
                  <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[9px] sm:text-[10px] font-black uppercase whitespace-nowrap">
                    +25 Free Credits
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-sky-100/90 font-medium mt-0.5 line-clamp-1 sm:line-clamp-none">
                  Una two go enjoy +25 Free Insight Credits to diagnose your shop and collect gbese!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-3 pt-2.5 sm:pt-3 border-t border-white/15 text-center">
            <div className="bg-black/15 dark:bg-black/30 rounded-xl p-1.5 sm:p-2 border border-white/10 backdrop-blur-xs">
              <span className="text-[8px] sm:text-[9.5px] text-sky-200 font-bold block uppercase tracking-wide truncate">People You Call</span>
              <span className="text-xs sm:text-base font-black text-white">{stats.total_invited}</span>
            </div>
            <div className="bg-black/15 dark:bg-black/30 rounded-xl p-1.5 sm:p-2 border border-white/10 backdrop-blur-xs">
              <span className="text-[8px] sm:text-[9.5px] text-sky-200 font-bold block uppercase tracking-wide truncate">Dey Test-Run</span>
              <span className="text-xs sm:text-base font-black text-emerald-300">{stats.active_in_progress}</span>
            </div>
            <div className="bg-black/15 dark:bg-black/30 rounded-xl p-1.5 sm:p-2 border border-white/10 backdrop-blur-xs">
              <span className="text-[8px] sm:text-[9.5px] text-sky-200 font-bold block uppercase tracking-wide truncate">Free Days Won</span>
              <span className="text-xs sm:text-base font-black text-white">+{stats.bonus_days_earned}d</span>
            </div>
          </div>
        </div>

        {/* ── CONTENT BODY ── */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3.5 sm:space-y-4 text-xs">
          {/* Share Action Box */}
          <div className="rounded-2xl bg-[#f8fafc] dark:bg-slate-800/70 p-3 sm:p-4 border border-slate-200/90 dark:border-slate-700/70 space-y-2.5 sm:space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="min-w-0">
                <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Your Shop Code (Give Neighbor)
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm sm:text-lg font-mono font-black text-[#1d4ed8] dark:text-sky-400 tracking-wider">
                    {stats.referral_code}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1 sm:p-1.5 rounded-lg hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 active:scale-90 transition-all cursor-pointer"
                    title="Copy Code"
                  >
                    {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* WhatsApp 1-Tap Share Button */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full sm:w-auto px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] sm:text-xs flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm shadow-emerald-700/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>Send Give Neighbor on WhatsApp 📲</span>
              </button>
            </div>

            {/* Share Link Input */}
            <div className="flex items-center gap-1.5 sm:gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
              <input
                type="text"
                readOnly
                value={stats.referral_link}
                className="flex-1 min-w-0 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[10px] sm:text-[11px] truncate focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[11px] sm:text-xs flex items-center gap-1.5 shrink-0 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedLink ? "Don Copy! ✓" : "Copy Link"}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tab Switcher */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 gap-0.5 sm:gap-1">
            {[
              {
                id: "ACTIVE",
                shortLabel: `Active (${activeTraders.length})`,
                fullLabel: `Dey Record Now (${activeTraders.length})`,
              },
              {
                id: "COMPLETED",
                shortLabel: `Claim (${completedTraders.length})`,
                fullLabel: `Collect Free Days (${completedTraders.length})`,
              },
              {
                id: "RULES",
                shortLabel: "Rules",
                fullLabel: "How E Dey Work",
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-1.5 px-1 sm:px-2 rounded-lg font-black text-[10.5px] sm:text-xs transition-all cursor-pointer text-center truncate ${
                    isActive
                      ? "bg-white dark:bg-slate-900 text-[#1d4ed8] dark:text-sky-300 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className="hidden sm:inline">{tab.fullLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === "ACTIVE" && (
            <div className="space-y-2.5">
              {activeTraders.length === 0 ? (
                <div className="text-center py-6 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                  <Users className="h-7 w-7 mx-auto text-slate-400" />
                  <p className="font-black text-slate-800 dark:text-slate-200 text-xs">You never invite any market neighbor yet o!</p>
                  <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-[11px]">
                    Share your code give fellow shop owners around you. Once dem begin record their daily market, their 7-day journey go show here sharp-sharp.
                  </p>
                </div>
              ) : (
                activeTraders.map((trader) => (
                  <div
                    key={trader.id}
                    className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 space-y-2 shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Store className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <h4 className="font-black text-slate-900 dark:text-white text-xs truncate">
                            {trader.business_name}
                          </h4>
                        </div>
                        <span className="text-[10px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
                          {trader.owner_name} • {trader.market_location || "Market Trader"}
                        </span>
                      </div>

                      <span className="self-start sm:self-auto px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300 font-black text-[9.5px] sm:text-[10px] shrink-0 border border-blue-200 dark:border-blue-900 whitespace-nowrap">
                        Day {trader.active_days_count} of {trader.required_days} don enter
                      </span>
                    </div>

                    {/* 7-Segmented Day Progress Dots */}
                    <div className="space-y-1">
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 7 }).map((_, i) => {
                          const isDone = i < trader.active_days_count;
                          const isCurrent = i === trader.active_days_count;
                          return (
                            <div
                              key={i}
                              className={`h-2 rounded-full transition-all ${
                                isDone
                                  ? "bg-emerald-500"
                                  : isCurrent
                                  ? "bg-amber-400 animate-pulse"
                                  : "bg-slate-200 dark:bg-slate-700"
                              }`}
                              title={`Day ${i + 1}`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] sm:text-[10.5px] pt-1 text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60">
                      <span className="flex items-center gap-1 truncate mr-2">
                        <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">E remain {7 - trader.active_days_count} days to unlock +14d free</span>
                      </span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-black shrink-0 whitespace-nowrap">+14d Reward</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "COMPLETED" && (
            <div className="space-y-2.5">
              {completedTraders.length === 0 ? (
                <div className="text-center py-6 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                  <Gift className="h-7 w-7 mx-auto text-slate-400" />
                  <p className="font-black text-slate-800 dark:text-slate-200 text-xs">No free days to claim yet</p>
                  <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-[11px]">
                    Once your neighbor record market reach 7 days on MoniePay, come press button here make your +14 free days enter your shop account sharp-sharp!
                  </p>
                </div>
              ) : (
                completedTraders.map((trader) => (
                  <div
                    key={trader.id}
                    className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 space-y-2 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <h4 className="font-black text-slate-900 dark:text-white text-xs truncate">
                          {trader.business_name}
                        </h4>
                      </div>
                      <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {trader.owner_name} don record reach 7 days! Una reward don ready.
                      </p>
                    </div>

                    <div className="shrink-0 w-full sm:w-auto">
                      {trader.status === "QUALIFIED_COMPLETED" ? (
                        <button
                          type="button"
                          disabled={claimingId === trader.id}
                          onClick={() => handleClaim(trader)}
                          className="w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                        >
                          <Gift className="h-3.5 w-3.5" />
                          <span>Collect +14 Days Free 🎁</span>
                        </button>
                      ) : (
                        <span className="w-full sm:w-auto justify-center px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-black text-[10px] sm:text-[10.5px] border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          <span>You Don Collect Am ✓</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "RULES" && (
            <div className="space-y-3 text-slate-600 dark:text-slate-300 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/60 space-y-2.5">
                <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="h-4 w-4 text-[#1d4ed8] dark:text-sky-400" />
                  How This Neighbor Reward Dey Work (Step-by-Step No Wahala)
                </h4>
                <ul className="space-y-2 text-[11px] list-none leading-relaxed text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="h-4 w-4 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-sky-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span><strong>Give Neighbor Your Code:</strong> Send your special code or WhatsApp link give any fellow shop owner or market neighbor.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-4 w-4 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-sky-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span><strong>Make Dem Record Market for 7 Days:</strong> When dem use MoniePay record their daily market sales & expenses for 7 different days...</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-4 w-4 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span><strong>Una Two Go Win +14 Days Free!:</strong> Both you and that your neighbor go get +14 Days free MoniePay Plus access without paying single kobo!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-4 w-4 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <span><strong>You Fit Win reach 140 Days Every Month:</strong> You fit invite reach 10 shop owners every month, wey mean say you fit enjoy full free access round the year!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-4 w-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">5</span>
                    <span><strong>Original Market Records Only:</strong> Genuine daily shop recording na him dey count. Fake or duplicate accounts no dey qualify.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200/80 dark:border-slate-800 text-center text-[11px] text-slate-500 font-medium shrink-0 flex items-center justify-center gap-1.5">
          <Store className="h-3.5 w-3.5 text-[#1d4ed8] dark:text-sky-400" />
          <span>MoniePay • Understand your money, no be just to record am</span>
        </div>
      </motion.div>
    </div>
  );
}
