"use client";

// ─────────────────────────────────────────────────────────────────
// MONIEPAY — Daylight Safe Sign-Out Confirmation Modal
// Ensures market traders know their recorded offline sales are safe.
// ─────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LogOut, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onLockShop?: () => void;
  userName?: string;
  businessName?: string;
  avatarUrl?: string;
}

export function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  onLockShop,
  userName = "Shop Owner",
  businessName = "My Business Store",
  avatarUrl,
}: LogoutModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 14 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-sm max-h-[92vh] overflow-y-auto rounded-[24px] sm:rounded-[32px] clay-card p-5 sm:p-7 text-slate-800 dark:text-slate-100 border border-white/80 dark:border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-2xl clay-card-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Profile Image & Status Badge */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative h-14 w-14 rounded-2xl overflow-hidden clay-icon-box shrink-0 p-0.5">
              <img
                src={avatarUrl}
                alt={userName}
                className="h-full w-full object-cover rounded-[14px]"
                onError={(e) => {
                  e.currentTarget.src = "/images/traders/mama_chidi.jpg";
                }}
              />
              <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800 shadow-sm" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800 inline-block mb-0.5 shadow-sm">
                Active Shop
              </span>
              <p className="text-base font-black text-slate-900 dark:text-white truncate tracking-tight">{userName}</p>
            </div>
          </div>

          {/* Heading */}
          <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
            Sign Out of {businessName}?
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Are you sure you want to sign out, <span className="font-bold text-slate-800 dark:text-slate-100">{userName}</span>?
          </p>

          {/* Reassurance Banner for Traders */}
          <div className="mt-4 p-3.5 rounded-2xl clay-card-sm flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Your recorded transactions on this phone will stay saved offline and sync when you sign back in.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 space-y-2">
            {onLockShop && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLockShop();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🔒 Lock Shop Screen (Quick PIN)</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl clay-btn-secondary text-slate-700 dark:text-slate-200 font-bold text-xs active:scale-95 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Full Sign Out</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
