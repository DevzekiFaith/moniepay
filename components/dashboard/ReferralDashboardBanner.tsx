"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Referral & 7-Day Trader Activation Dashboard Card
// Clean, Modern, 100% Mobile Responsive • High Engagement
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Share2, ArrowRight, Gift, CheckCircle2, Clock } from "lucide-react";
import { getReferralStats } from "@/lib/referral/referralStore";
import { ReferralStats } from "@/types/referral.types";

interface ReferralDashboardBannerProps {
  onOpenInviteModal: () => void;
  businessName?: string;
  userPhone?: string;
}

export function ReferralDashboardBanner({
  onOpenInviteModal,
  businessName = "My Shop",
  userPhone = "",
}: ReferralDashboardBannerProps) {
  const [stats, setStats] = useState<ReferralStats>(() => getReferralStats(businessName, userPhone));

  const loadStats = () => {
    setStats(getReferralStats(businessName, userPhone));
  };

  useEffect(() => {
    loadStats();
    const handleUpdate = () => loadStats();
    window.addEventListener("moniepay:referral-updated", handleUpdate);
    return () => {
      window.removeEventListener("moniepay:referral-updated", handleUpdate);
    };
  }, [businessName, userPhone]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.008 }}
      whileTap={{ scale: 0.992 }}
      onClick={onOpenInviteModal}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-white/10 p-3 sm:p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="relative z-10 flex items-center justify-between gap-2.5 sm:gap-3">
        {/* Left: Icon & Short Pidgin Copy */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-[#1d4ed8] dark:text-sky-400 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Users className="h-5 w-5 stroke-[2.2]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-[13px] font-black text-slate-900 dark:text-white truncate leading-tight">
                Invite Neighbor • +14d Free 🤝
              </h3>
              {stats.pending_claims_count > 0 && (
                <span className="px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-black text-[9.5px] border border-amber-300 dark:border-amber-800">
                  {stats.pending_claims_count} Ready
                </span>
              )}
            </div>
            <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
              Tell neighbor make una two get +14 days free MoniePay Plus.
            </p>
          </div>
        </div>

        {/* Right: Compact Link Sharing Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenInviteModal();
          }}
          className="px-3 sm:px-3.5 py-2 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 shrink-0 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden min-[360px]:inline">Share Link</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </motion.section>
  );
}
