"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  X,
  BrainCircuit,
  CheckCircle2,
  TrendingUp,
  Clock,
  BadgeCheck,
  Award,
  Users,
  Calendar,
} from "lucide-react";

interface DecisionTrackerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
}

export function DecisionTrackerSheet({
  isOpen,
  onClose,
  businessName,
}: DecisionTrackerSheetProps) {
  if (!isOpen) return null;

  const pastDecisions = [
    {
      id: "dec_1",
      date: "Yesterday",
      title: "Send WhatsApp debt reminder give Bro Segun",
      impact: "Recovered ₦35,000 cash for restock",
      status: "COMPLETED",
    },
    {
      id: "dec_2",
      date: "3 days ago",
      title: "Reduce Indomie carton order by 40%",
      impact: "Saved ₦48,000 from dead stock tie-down",
      status: "COMPLETED",
    },
    {
      id: "dec_3",
      date: "Last week",
      title: "Maintain safe weekly chop money of ₦30,000",
      impact: "Protected shop working capital; runway intact",
      status: "COMPLETED",
    },
  ];

  const learnedPatterns = [
    {
      title: "Sweet Market Days",
      value: "Friday & Saturday",
      explanation: "Brings 48% of weekly revenue. Restock heavily before Friday morning market rush.",
      icon: Calendar,
    },
    {
      title: "Customer Gbese Speed",
      value: "7.2 Days Average",
      explanation: "Customers who owe less than ₦25,000 pay 3x faster than heavy bulk debtors.",
      icon: Users,
    },
    {
      title: "Gen Fuel & Shop Bills",
      value: "₦8,500 / 3 Days",
      explanation: "Generator running costs dey steady at 7% of total revenue.",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-md">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-slate-100 max-h-[90vh] flex flex-col transition-colors"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Shop Memory &amp; Learnings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Wetin MoniePay don learn about your shop rhythm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 overflow-y-auto space-y-5 flex-1 pr-1">
          {/* Learned Business Insights */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-2.5 flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Wetin MoniePay Don Learn About Your Shop</span>
            </h4>
            <div className="space-y-2.5">
              {learnedPatterns.map((pat, idx) => {
                const Icon = pat.icon;
                return (
                  <div
                    key={idx}
                    className="rounded-[20px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 p-3.5 flex items-start gap-3"
                  >
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm border border-slate-100 dark:border-white/10 shrink-0 mt-0.5">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{pat.title}:</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{pat.value}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {pat.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Past Decisions & Outcomes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Actions We Done Track &amp; Verified Results</span>
            </h4>
            <div className="space-y-2.5">
              {pastDecisions.map((dec) => (
                <div
                  key={dec.id}
                  className="rounded-[20px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 p-3.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mb-1">
                    <span>{dec.date}</span>
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> Done &amp; Recorded
                    </span>
                  </div>
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white">{dec.title}</h5>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 text-xs font-bold border border-emerald-200/60 dark:border-emerald-800">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>Result: {dec.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
