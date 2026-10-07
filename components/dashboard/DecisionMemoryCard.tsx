"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  CheckCircle2,
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

  const latestItem = memoryList[0];

  return (
    <section className="rounded-[26px] bg-white border border-emerald-900/10 p-4 sm:p-5 shadow-[0_4px_16px_rgba(5,150,105,0.04)] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 font-bold">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Shop Decision Memory
            </h2>
            <span className="text-[10px] font-bold text-emerald-700">Wetin MoniePay don learn for your shop</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
        >
          <span>{isExpanded ? "Close" : "Past Learnings"}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Latest Verified Learning Card */}
      <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Wetin You Do (Action Taken)
            </span>
            <p className="text-xs sm:text-[13px] font-black text-slate-900 leading-snug mt-0.5 break-words">
              {latestItem.recommendationTitle}
            </p>
          </div>
          <span
            className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${
              latestItem.status.includes("LEARN")
                ? "bg-amber-100 text-amber-900 border border-amber-300/60"
                : "bg-emerald-100 text-emerald-800 border border-emerald-300/60"
            }`}
          >
            {latestItem.status.includes("LEARN")
              ? "Dey Track Result ⏳"
              : latestItem.status.includes("PROVE")
              ? "Don Prove ✓"
              : latestItem.status}
          </span>
        </div>

        <div className="pt-2 border-t border-slate-200/60 text-xs flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
          <p className="text-slate-700 font-medium leading-snug break-words">
            <span className="font-bold text-slate-900">Market Result: </span>
            {latestItem.actualOutcome || latestItem.expectedOutcome}
          </p>
        </div>

        <p className="text-[11px] font-bold text-emerald-900 bg-emerald-50/80 p-2 rounded-xl leading-relaxed">
          💡 {latestItem.learningLesson}
        </p>
      </div>

      {/* Expanded History */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2.5 pt-1"
          >
            {memoryList.slice(1).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 break-words flex-1">
                    {item.recommendationTitle}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                      item.status.includes("LEARN")
                        ? "bg-amber-100 text-amber-900"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {item.status.includes("LEARN")
                      ? "Dey Track ⏳"
                      : item.status.includes("PROVE")
                      ? "Don Prove ✓"
                      : item.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  <span className="font-bold text-slate-800">Result: </span>
                  {item.actualOutcome || item.expectedOutcome}
                </p>
                <p className="text-[10.5px] font-bold text-emerald-900 bg-emerald-50/60 p-2 rounded-xl leading-relaxed">
                  💡 {item.learningLesson}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
