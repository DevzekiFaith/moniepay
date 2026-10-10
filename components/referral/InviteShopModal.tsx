"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Invite Shop Neighbor & 7-Day Trader Reward Modal
// 100% Mobile Responsive • WhatsApp 1-Tap Share • Active Milestone Tracker
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
  Phone,
  Gift,
  AlertCircle,
  X,
  ArrowRight,
  TrendingUp,
  MessageCircle,
} from "lucide-react";
import {
  ReferredTrader,
  ReferralStats,
  ReferralConfig,
} from "@/types/referral.types";
import {
  getReferredTraders,
  getReferralStats,
  claimReferralReward,
  generateWhatsAppInviteMessage,
  DEFAULT_REFERRAL_CONFIG,
} from "@/lib/referral/referralStore";
import { playCashChime, triggerCashHapticVibration } from "@/lib/alerts/hapticSoundService";
import { useNotifications } from "@/context/NotificationContext";

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
  const { toast } = useNotifications();
  const [copied, setCopied] = useState(false);
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
    setCopied(true);
    triggerCashHapticVibration("success");
    playCashChime();
    toast("Referral Link Copied 📋", "Share with fellow shop owners on WhatsApp or SMS.", { type: "success" });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(stats.referral_code);
    }
    setCopied(true);
    triggerCashHapticVibration("success");
    toast("Code Copied!", `Your referral code ${stats.referral_code} is ready.`, { type: "success" });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = generateWhatsAppInviteMessage(stats.referral_code, ownerName);
    const whatsappUrl = `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, "_blank");
    triggerCashHapticVibration("tap");
  };

  const handleClaim = (trader: ReferredTrader) => {
    setClaimingId(trader.id);
    const res = claimReferralReward(trader.id);
    if (res.success) {
      playCashChime();
      triggerCashHapticVibration("sale");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl rounded-[28px] sm:rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white shrink-0 overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-400/20 blur-2xl" />
          
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Invite Shop Neighbor 🤝
                </h2>
                <p className="text-xs text-emerald-200/90 font-medium">
                  Earn +14 Days Free MoniePay Plus for every active trader
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
            <div className="bg-white/5 rounded-xl p-2">
              <span className="text-[10px] text-emerald-200 font-bold block uppercase tracking-wider">Invited</span>
              <span className="text-sm sm:text-base font-black text-white">{stats.total_invited}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2">
              <span className="text-[10px] text-emerald-200 font-bold block uppercase tracking-wider">In 7-Day Trial</span>
              <span className="text-sm sm:text-base font-black text-emerald-300">{stats.active_in_progress}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2">
              <span className="text-[10px] text-emerald-200 font-bold block uppercase tracking-wider">Days Earned</span>
              <span className="text-sm sm:text-base font-black text-white">+{stats.bonus_days_earned}d</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Share Action Box */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Your Unique Referral Code
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-base sm:text-lg font-mono font-black text-slate-900 dark:text-white tracking-wider">
                    {stats.referral_code}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                    title="Copy Code"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* WhatsApp 1-Tap Share Button */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Share on WhatsApp</span>
              </button>
            </div>

            {/* Share Link Input */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
              <input
                type="text"
                readOnly
                value={stats.referral_link}
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[11px] truncate focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs flex items-center gap-1.5 shrink-0 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("ACTIVE")}
              className={`pb-2 px-3 font-black text-xs border-b-2 transition-colors cursor-pointer ${
                activeTab === "ACTIVE"
                  ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Active 7-Day Progress ({activeTraders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("COMPLETED")}
              className={`pb-2 px-3 font-black text-xs border-b-2 transition-colors cursor-pointer ${
                activeTab === "COMPLETED"
                  ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Qualified &amp; Rewards ({completedTraders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("RULES")}
              className={`pb-2 px-3 font-black text-xs border-b-2 transition-colors cursor-pointer ${
                activeTab === "RULES"
                  ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              How It Works
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "ACTIVE" && (
            <div className="space-y-3">
              {activeTraders.length === 0 ? (
                <div className="text-center py-6 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                  <Users className="h-8 w-8 mx-auto text-slate-400" />
                  <p className="font-black text-slate-800 dark:text-slate-200">No active invited traders yet</p>
                  <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-[11px]">
                    Share your referral link with shop neighbors. Once they start recording transactions, their 7-day progress appears here.
                  </p>
                </div>
              ) : (
                activeTraders.map((trader) => {
                  const percent = Math.round((trader.active_days_count / trader.required_days) * 100);
                  return (
                    <div
                      key={trader.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Store className="h-3.5 w-3.5 text-slate-500" />
                            <h4 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                              {trader.business_name}
                            </h4>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {trader.owner_name} • {trader.market_location || "Market Trader"}
                          </span>
                        </div>

                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black text-[10px] shrink-0 border border-blue-200 dark:border-blue-800">
                          Day {trader.active_days_count} of {trader.required_days}
                        </span>
                      </div>

                      {/* 7-Day Visual Progress Dots */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                          <span>Recording Consistency</span>
                          <span>{trader.active_days_count}/{trader.required_days} Days Active</span>
                        </div>
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
                          {7 - trader.active_days_count} more active recording days to unlock +14 Days reward
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "COMPLETED" && (
            <div className="space-y-3">
              {completedTraders.length === 0 ? (
                <div className="text-center py-6 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                  <Gift className="h-8 w-8 mx-auto text-slate-400" />
                  <p className="font-black text-slate-800 dark:text-slate-200">No completed rewards yet</p>
                  <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-[11px]">
                    When your referred traders log 7 active days on MoniePay, you can claim your +14 Days extension here!
                  </p>
                </div>
              ) : (
                completedTraders.map((trader) => (
                  <div
                    key={trader.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <h4 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                          {trader.business_name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {trader.owner_name} completed 7 active days of transaction logging!
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      {trader.status === "QUALIFIED_COMPLETED" ? (
                        <button
                          type="button"
                          disabled={claimingId === trader.id}
                          onClick={() => handleClaim(trader)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
                        >
                          <Gift className="h-3.5 w-3.5" />
                          <span>Claim +14 Days</span>
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-black text-[10.5px] border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          <span>Reward Claimed</span>
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
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Sustainable &amp; Anti-Abuse Rules
                </h4>
                <ul className="space-y-1.5 text-[11px] list-disc list-inside">
                  <li><strong>7-Day Active Habit:</strong> The invited trader must genuinely log sales/expenses on 7 distinct days.</li>
                  <li><strong>Genuine Business Check:</strong> Fake duplicate accounts created on the same phone or browser are automatically disqualified.</li>
                  <li><strong>Sustainable Cap:</strong> Up to 10 verified shop referrals per month (giving up to 140 bonus days of MoniePay Plus).</li>
                  <li><strong>Win-Win:</strong> Your invited trader gets 7 days free onboarding and you get free extension on your plan.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-500 font-medium shrink-0">
          MoniePay helps shop owners understand their money — not just record it.
        </div>
      </motion.div>
    </div>
  );
}
