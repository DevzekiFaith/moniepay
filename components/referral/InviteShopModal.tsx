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
  Sparkles,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="w-full max-w-lg rounded-[28px] sm:rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_25px_65px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-slate-100 transition-colors"
      >
        {/* ── HEADER ── */}
        <div className="relative p-4 sm:p-5 bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] dark:from-[#0b1739] dark:via-[#0f2359] dark:to-[#173887] text-white shrink-0 overflow-hidden">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sky-300/20 blur-2xl" />

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                    Invite Shop Neighbor
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase">
                    +14d Free
                  </span>
                </div>
                <p className="text-[11px] text-sky-100/90 font-medium">
                  Una two go get +14 days free MoniePay Plus sharp-sharp!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-white/15 text-center">
            <div className="bg-black/15 dark:bg-black/30 rounded-xl p-2 border border-white/10 backdrop-blur-xs">
              <span className="text-[9.5px] text-sky-200 font-bold block uppercase tracking-wider">Invited</span>
              <span className="text-sm sm:text-base font-black text-white">{stats.total_invited}</span>
            </div>
            <div className="bg-black/15 dark:bg-black/30 rounded-xl p-2 border border-white/10 backdrop-blur-xs">
              <span className="text-[9.5px] text-sky-200 font-bold block uppercase tracking-wider">In 7-Day Trial</span>
              <span className="text-sm sm:text-base font-black text-emerald-300">{stats.active_in_progress}</span>
            </div>
            <div className="bg-black/15 dark:bg-black/30 rounded-xl p-2 border border-white/10 backdrop-blur-xs">
              <span className="text-[9.5px] text-sky-200 font-bold block uppercase tracking-wider">Days Earned</span>
              <span className="text-sm sm:text-base font-black text-white">+{stats.bonus_days_earned}d</span>
            </div>
          </div>
        </div>

        {/* ── CONTENT BODY ── */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Share Action Box */}
          <div className="rounded-2xl bg-[#f8fafc] dark:bg-slate-800/70 p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-700/70 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Your Unique Referral Code
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-base sm:text-lg font-mono font-black text-[#1d4ed8] dark:text-sky-400 tracking-wider">
                    {stats.referral_code}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 active:scale-90 transition-all cursor-pointer"
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
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm shadow-emerald-700/25 active:scale-95 transition-all cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Share on WhatsApp</span>
              </button>
            </div>

            {/* Share Link Input */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
              <input
                type="text"
                readOnly
                value={stats.referral_link}
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[11px] truncate focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs flex items-center gap-1.5 shrink-0 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-2xs"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tab Switcher */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1">
            {(
              [
                { id: "ACTIVE", label: `In Progress (${activeTraders.length})` },
                { id: "COMPLETED", label: `Rewards (${completedTraders.length})` },
                { id: "RULES", label: "How It Works" },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-black text-[11px] sm:text-xs transition-all cursor-pointer text-center truncate ${
                    isActive
                      ? "bg-white dark:bg-slate-900 text-[#1d4ed8] dark:text-sky-300 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
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
                  <p className="font-black text-slate-800 dark:text-slate-200 text-xs">No active invited traders yet</p>
                  <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-[11px]">
                    Share your invite link with shop neighbors. Once they start recording transactions, their 7-day progress appears here.
                  </p>
                </div>
              ) : (
                activeTraders.map((trader) => (
                  <div
                    key={trader.id}
                    className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 space-y-2 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Store className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <h4 className="font-black text-slate-900 dark:text-white text-xs truncate">
                            {trader.business_name}
                          </h4>
                        </div>
                        <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
                          {trader.owner_name} • {trader.market_location || "Market Trader"}
                        </span>
                      </div>

                      <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-sky-300 font-black text-[10px] shrink-0 border border-blue-200 dark:border-blue-900">
                        Day {trader.active_days_count} of {trader.required_days}
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

                    <div className="flex items-center justify-between text-[10.5px] pt-1 text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{7 - trader.active_days_count} more active recording days left</span>
                      </span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-black">+14d Reward</span>
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
                  <p className="font-black text-slate-800 dark:text-slate-200 text-xs">No completed rewards yet</p>
                  <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-[11px]">
                    When your referred traders log 7 active days on MoniePay, you can claim your +14 Days extension here!
                  </p>
                </div>
              ) : (
                completedTraders.map((trader) => (
                  <div
                    key={trader.id}
                    className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 space-y-2 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <h4 className="font-black text-slate-900 dark:text-white text-xs truncate">
                          {trader.business_name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {trader.owner_name} completed 7 active days!
                      </p>
                    </div>

                    <div className="shrink-0">
                      {trader.status === "QUALIFIED_COMPLETED" ? (
                        <button
                          type="button"
                          disabled={claimingId === trader.id}
                          onClick={() => handleClaim(trader)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                        >
                          <Gift className="h-3.5 w-3.5" />
                          <span>Claim +14 Days</span>
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-black text-[10.5px] border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          <span>Claimed ✓</span>
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
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/60 space-y-2">
                <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#1d4ed8] dark:text-sky-400" />
                  How Referral Works
                </h4>
                <ul className="space-y-1.5 text-[11px] list-disc list-inside leading-relaxed text-slate-600 dark:text-slate-300">
                  <li><strong>7 Active Days:</strong> Invited shop owners must record shop sales/expenses on 7 separate days.</li>
                  <li><strong>Win-Win:</strong> When they reach 7 days, you and your neighbor both get +14 Days MoniePay Plus for free.</li>
                  <li><strong>Up to 10 Referrals/Month:</strong> You can earn up to 140 bonus days of MoniePay Plus every single month!</li>
                  <li><strong>Zero Spam:</strong> Genuine shop recordings only. Fake duplicates are disqualified automatically.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200/80 dark:border-slate-800 text-center text-[11px] text-slate-500 font-medium shrink-0 flex items-center justify-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>MoniePay • Understand your money, no be just to record am</span>
        </div>
      </motion.div>
    </div>
  );
}
