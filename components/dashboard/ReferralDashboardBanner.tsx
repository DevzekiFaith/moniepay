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
    <section className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-emerald-900/60 p-4 sm:p-5 text-white shadow-lg">
      <div className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-emerald-500/15 blur-2xl" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-start sm:items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-white">
                Invite Shop Neighbor &amp; Earn Free Days 🤝
              </h3>
              {stats.pending_claims_count > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] animate-pulse">
                  {stats.pending_claims_count} Reward Ready!
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-200/90 font-medium leading-relaxed">
              When a shop owner records for 7 active days, you both get +14 Days MoniePay Plus.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:shrink-0">
          <button
            type="button"
            onClick={onOpenInviteModal}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/40 active:scale-95 transition-all cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Invite on WhatsApp</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
