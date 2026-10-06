"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  History,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { DecisionMemoryItem } from "@/types/moniepay.types";
import { getDecisionMemory } from "@/lib/intelligence/decisionMemory";

export function DecisionMemoryCard() {
  const [memoryList, setMemoryList] = useState<DecisionMemoryItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setMemoryList(getDecisionMemory());

    const handleUpdate = () => {
      setMemoryList(getDecisionMemory());
    };
    window.addEventListener("moniepay:decision-recorded", handleUpdate);
    return () => window.removeEventListener("moniepay:decision-recorded", handleUpdate);
  }, []);

  if (memoryList.length === 0) return null;

  const provenCount = memoryList.filter((m) => m.status === "PROVEN").length;
  const latestItem = memoryList[0];

  return (
    <div className="rounded-[26px] bg-white border border-slate-200/90 p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-sm">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Decision Memory & Learning
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-[10px] font-black text-emerald-800">
                {provenCount} Proven Outcomes
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
              Tracks actions you took and measures if your profit & cash improved
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>{isExpanded ? "Show Less" : "View History"}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Featured Latest Memory Item */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200/80 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span className="uppercase tracking-wider">Latest Action Verified</span>
            </div>
            <h4 className="text-xs sm:text-[13px] font-black text-slate-900 leading-snug">
              {latestItem.recommendationTitle}
            </h4>
            <p className="text-[11.5px] font-medium text-slate-600 mt-1 leading-relaxed">
              <span className="font-bold text-slate-700">What happened: </span>
              {latestItem.actualOutcome || latestItem.expectedOutcome}
            </p>
          </div>
        </div>

        {/* Lesson Learned Card */}
        <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-start gap-2.5">
          <div className="h-2 w-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
          <p className="text-[11px] font-bold text-indigo-900 leading-snug">
            <span className="text-slate-500 font-semibold">What MoniePay learned: </span>
            {latestItem.learningLesson}
          </p>
        </div>
      </div>

      {/* Expanded History */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3 pt-2 border-t border-slate-100"
          >
            {memoryList.slice(1).map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{item.recommendationTitle}</span>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  {item.actualOutcome || item.expectedOutcome}
                </p>
                <p className="text-[10.5px] font-bold text-indigo-800 bg-indigo-50/60 p-2 rounded-xl">
                  💡 {item.learningLesson}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
