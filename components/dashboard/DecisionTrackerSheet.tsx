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
      title: "Sent WhatsApp debt reminder to Bro Segun",
      impact: "Recovered ₦35,000 cash for restock",
      status: "COMPLETED",
    },
    {
      id: "dec_2",
      date: "3 days ago",
      title: "Reduced Indomie carton order by 40%",
      impact: "Saved ₦48,000 from dead stock tie-down",
      status: "COMPLETED",
    },
    {
      id: "dec_3",
      date: "Last week",
      title: "Maintained safe weekly chop money of ₦30,000",
      impact: "Prevented capital erosion; shop runway intact",
      status: "COMPLETED",
    },
  ];

  const learnedPatterns = [
    {
      title: "Best Trading Days",
      value: "Friday & Saturday",
      explanation: "Generate 48% of weekly revenue. Restock heavily before Friday morning.",
      icon: Calendar,
    },
    {
      title: "Customer Credit Velocity",
      value: "7.2 Days Average",
      explanation: "Customers who owe less than ₦25,000 pay 3x faster than bulk debtors.",
      icon: Users,
    },
    {
      title: "Fuel & Power Efficiency",
      value: "₦8,500 / 3 Days",
      explanation: "Generator running costs are steady at 7% of total revenue.",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 sm:p-4 backdrop-blur-sm">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] bg-white border border-slate-200 p-5 sm:p-6 shadow-2xl text-slate-900 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Track & Learn</h3>
              <p className="text-xs text-slate-500">Decision outcomes & learned business rhythm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 overflow-y-auto space-y-5 flex-1 pr-1">
          {/* Learned Business Insights */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2.5 flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>What MoniePay Has Learned About Your Business</span>
            </h4>
            <div className="space-y-2.5">
              {learnedPatterns.map((pat, idx) => {
                const Icon = pat.icon;
                return (
                  <div
                    key={idx}
                    className="rounded-[20px] bg-slate-50 border border-slate-200/80 p-3.5 flex items-start gap-3"
                  >
                    <div className="p-2.5 rounded-xl bg-white text-emerald-700 shadow-sm border border-slate-100 shrink-0 mt-0.5">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">{pat.title}:</span>
                        <span className="text-xs font-black text-slate-900">{pat.value}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-blue-600" />
              <span>Decisions Actioned & Measured Results</span>
            </h4>
            <div className="space-y-2.5">
              {pastDecisions.map((dec) => (
                <div
                  key={dec.id}
                  className="rounded-[20px] bg-slate-50 border border-slate-200/80 p-3.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>{dec.date}</span>
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Actioned
                    </span>
                  </div>
                  <h5 className="text-sm font-bold text-slate-900">{dec.title}</h5>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-900 text-xs font-bold">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-700" />
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
