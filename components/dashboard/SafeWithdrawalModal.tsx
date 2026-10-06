"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Wallet, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { recordOptimisticTransaction } from "@/lib/offline/offlineQueue";

interface SafeWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  safeAmount: number;
  businessId: string;
  onSuccess?: () => void;
}

export function SafeWithdrawalModal({
  isOpen,
  onClose,
  safeAmount,
  businessId,
  onSuccess,
}: SafeWithdrawalModalProps) {
  const [amount, setAmount] = useState<number>(safeAmount);
  const [purpose, setPurpose] = useState<string>("Household Feeding & Family");
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    recordOptimisticTransaction({
      business_id: businessId,
      type: "OWNER_WITHDRAWAL",
      amount: amount || safeAmount,
      payment_method: "CASH",
      category: "Owner Chop Money",
      description: purpose,
    });

    setIsDone(true);
    setTimeout(() => {
      setIsDone(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md rounded-[32px] bg-white border border-slate-200 p-6 shadow-2xl text-slate-900"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <Wallet className="h-4 w-4" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Safe Chop Money</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 p-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 text-center">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
            Calculated Safe Amount
          </span>
          <div className="text-3xl font-black text-slate-900">
            ₦{Number(amount || safeAmount).toLocaleString()}
          </div>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Taking this amount will not starve your restock capital or breach supplier obligations.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Adjust Amount (₦)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-3 text-xl font-black text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Purpose</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Household feeding"
              className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        <div className="mt-5">
          <button
            onClick={handleConfirm}
            disabled={isDone}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all"
          >
            {isDone ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                <span>Withdrawal Recorded ✓</span>
              </>
            ) : (
              <>
                <span>Confirm & Withdraw ₦{Number(amount || safeAmount).toLocaleString()}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
