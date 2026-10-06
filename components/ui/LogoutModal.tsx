"use client";

// ─────────────────────────────────────────────────────────────────
// MONIEPAY — Daylight Safe Sign-Out Confirmation Modal
// Ensures market traders know their recorded offline sales are safe.
// ─────────────────────────────────────────────────────────────────

import React from "react";
import { LogOut, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
  businessName?: string;
}

export function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  userName = "Shop Owner",
  businessName = "Mama Chidi Super Provisions",
}: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 14 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-sm rounded-[28px] bg-white border border-slate-200/90 p-6 sm:p-7 shadow-[0_20px_60px_rgba(15,23,42,0.22)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon Badge */}
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mb-4 shadow-sm">
            <ShieldAlert className="h-6 w-6 stroke-[2.2]" />
          </div>

          {/* Heading */}
          <h3 className="text-lg font-black text-slate-900 leading-tight">
            Sign Out of {businessName}?
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to sign out, <span className="font-bold text-slate-800">{userName}</span>?
          </p>

          {/* Reassurance Banner for Traders */}
          <div className="mt-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-2 text-xs text-slate-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Your recorded transactions on this phone will stay saved offline and sync when you sign back in.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs active:scale-95 transition-all order-2 sm:order-1"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md shadow-rose-600/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 order-1 sm:order-2 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
