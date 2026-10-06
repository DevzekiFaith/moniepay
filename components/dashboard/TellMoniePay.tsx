"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Tell MoniePay Component
// Fluid Voice/Text Capture • Spring Transitions • Deep Emerald Feedback
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mic,
  MicOff,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Volume2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TransactionType, PaymentMethod } from "@/types/moniepay.types";
import { recordOptimisticTransaction } from "@/lib/offline/offlineQueue";

// Natural Nigerian Voice Audio Playback for traders
export function speakTraderAudioFeedback(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-NG";
    utterance.rate = 1.02;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(
      (v) =>
        v.lang.includes("en-NG") ||
        v.lang.includes("en-GB") ||
        v.name.toLowerCase().includes("nigeria") ||
        v.name.toLowerCase().includes("english")
    );
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  } catch {}
}

interface TellMoniePayProps {
  onOpenDetailedSheet: (type: TransactionType) => void;
  onActivityRecorded: () => void;
}

interface ValueFeedback {
  amount: number;
  typeLabel: string;
  whatChanged: string;
  whyItMatters: string;
  whatToDoNext: string;
  actionText?: string;
  actionHandler?: () => void;
}

export function TellMoniePay({
  onOpenDetailedSheet,
  onActivityRecorded,
}: TellMoniePayProps) {
  const [inputVal, setInputVal] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<ValueFeedback | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API if supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-NG"; // Nigerian English dialect

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputVal(transcript);
            processTraderInput(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      const samples = [
        "Sold 45k today",
        "Bought materials for 20k",
        "Chidi paid me 15k",
        "I owe supplier 80k",
        "I withdrew 30k",
      ];
      const randomSample = samples[Math.floor(Math.random() * samples.length)];
      setInputVal(randomSample);
      processTraderInput(randomSample);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const processTraderInput = (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    let amount = 0;
    const matchK = text.match(/(\d+(?:\.\d+)?)\s*k\b/i);
    const matchNum = text.match(/(?:₦|ngn)?\s*(\d[\d,]*)/i);

    if (matchK) {
      amount = parseFloat(matchK[1]) * 1000;
    } else if (matchNum) {
      amount = parseFloat(matchNum[1].replace(/,/g, ""));
    }

    if (!amount || amount <= 0) {
      onOpenDetailedSheet("SALE");
      return;
    }

    const lower = text.toLowerCase();
    let type: TransactionType = "SALE";
    let category = "Sales";
    let paymentMethod: PaymentMethod = "CASH";
    let typeLabel = "Sale";
    let whatChanged = `Today's sales increased by ₦${amount.toLocaleString()}.`;
    let whyItMatters = "Fresh cash added to your daily business position.";
    let whatToDoNext = "Set aside restock cash before taking chop money.";

    if (lower.includes("transfer")) paymentMethod = "TRANSFER";
    else if (lower.includes("pos")) paymentMethod = "POS";

    // 1. Customer Credit / Debt
    if (
      lower.includes("owe") ||
      lower.includes("credit") ||
      lower.includes("gbese")
    ) {
      if (lower.includes("supplier") || lower.includes("wholesaler")) {
        type = "SUPPLIER_PAYMENT";
        category = "Supplier Debt";
        typeLabel = "Supplier Debt Logged";
        whatChanged = `₦${amount.toLocaleString()} supplier debt recorded.`;
        whyItMatters = "Clear before wholesale cut-off to protect credit rating.";
        whatToDoNext = "Plan repayment from tomorrow's morning sales.";
      } else {
        type = "SALE";
        paymentMethod = "CREDIT";
        category = "Customer Credit";
        typeLabel = "Customer Credit (Owing)";
        whatChanged = `₦${amount.toLocaleString()} goods given on credit.`;
        whyItMatters = "Money is trapped outside your cash drawer.";
        whatToDoNext = "Send a WhatsApp reminder before Friday restock.";
      }
    }
    // 2. Stock / Material Purchase
    else if (
      lower.includes("bought") ||
      lower.includes("buy") ||
      lower.includes("material") ||
      lower.includes("stock") ||
      lower.includes("goods")
    ) {
      type = "STOCK_PURCHASE";
      category = "Materials & Stock";
      typeLabel = "Stock Purchase";
      whatChanged = `Spent ₦${amount.toLocaleString()} on new business stock.`;
      whyItMatters = "Restock pool converted to physical inventory.";
      whatToDoNext = "Mark up goods with at least 25% margin to protect profit.";
    }
    // 3. Customer Paid
    else if (
      lower.includes("paid me") ||
      lower.includes("chidi paid") ||
      lower.includes("collected") ||
      lower.includes("repaid") ||
      lower.includes("recovered")
    ) {
      type = "DEBT_COLLECTION";
      category = "Customer Debt Recovered";
      typeLabel = "Debt Collected";
      whatChanged = `₦${amount.toLocaleString()} recovered into cash drawer.`;
      whyItMatters = "Locked capital returned to working cash.";
      whatToDoNext = "Safe to allocate toward tomorrow's restock.";
    }
    // 4. Chop Money
    else if (
      lower.includes("withdrew") ||
      lower.includes("withdraw") ||
      lower.includes("chop") ||
      lower.includes("took") ||
      lower.includes("home")
    ) {
      type = "OWNER_WITHDRAWAL";
      category = "Chop Money";
      typeLabel = "Chop Money Taken";
      whatChanged = `₦${amount.toLocaleString()} taken out for personal expenses.`;
      whyItMatters = "Personal money separated from shop business capital.";
      whatToDoNext = "Restock capital remains protected.";
    }
    // 5. Staff payment
    else if (
      lower.includes("staff") ||
      lower.includes("wage") ||
      lower.includes("assistant") ||
      lower.includes("boy") ||
      lower.includes("salary")
    ) {
      type = "STAFF_PAYMENT";
      category = "Staff Wage";
      typeLabel = "Staff Wage";
      whatChanged = `₦${amount.toLocaleString()} paid for shop assistance.`;
      whyItMatters = "Operating expense recorded cleanly.";
      whatToDoNext = "Counted against this week's shop overhead.";
    }
    // 6. Regular Sale
    else {
      type = "SALE";
      category = "General Sales";
      typeLabel = "Sales Recorded";
      whatChanged = `Today's sales up by ₦${amount.toLocaleString()}.`;
      whyItMatters = "Drawer cash healthy; ~24% profit margin.";
      whatToDoNext = "Keep 70% in drawer for restock.";
    }

    recordOptimisticTransaction({
      business_id: "biz_default_01",
      type,
      amount,
      payment_method: paymentMethod,
      category,
      description: text,
      transaction_date: new Date().toISOString(),
    });

    setInputVal("");
    setFeedback({
      amount,
      typeLabel,
      whatChanged,
      whyItMatters,
      whatToDoNext,
    });
    onActivityRecorded();

    // Natural audio voice readout confirming the record
    speakTraderAudioFeedback(`${typeLabel}: ${whatChanged} ${whatToDoNext}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processTraderInput(inputVal);
  };

  const quickExamples = [
    { text: "Sold 45k today", label: "“Sold 45k today”" },
    { text: "Bought stock for 20k", label: "“Buy stock 20k”" },
    { text: "Chidi paid me 15k", label: "“Chidi pay me 15k”" },
    { text: "I owe supplier 80k", label: "“I owe supplier 80k”" },
    { text: "I withdrew 30k chop money", label: "“Take 30k chop moni”" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-[28px] bg-white/80 backdrop-blur-md border border-emerald-950/[0.08] p-4 sm:p-5 shadow-[0_8px_32px_rgba(4,120,87,0.04)] space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <h2 className="text-xs font-black uppercase tracking-wider text-emerald-950">
            Tell MoniePay Wetin Happen For Shop
          </h2>
        </div>
        <span className="text-[11px] font-bold text-emerald-700">
          Instant • Voice &amp; No-Internet
        </span>
      </div>

      {/* Input & Voice Interaction Box */}
      <form onSubmit={handleFormSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Talk or type: e.g. Sold 45k, Chidi pay 15k, Buy stock 20k..."
            className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-50/90 backdrop-blur-xs border border-slate-200/90 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 transition-all"
          />
          {inputVal && (
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center cursor-pointer shadow-sm"
              title="Record to MoniePay"
            >
              <Send className="h-3.5 w-3.5" />
            </motion.button>
          )}
        </div>

        {/* Voice Trigger Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={toggleListening}
              className={`h-11 w-11 rounded-2xl flex items-center justify-center cursor-pointer transition-all shrink-0 ${
                isListening
                  ? "bg-rose-600 text-white animate-pulse shadow-md shadow-rose-500/30"
                  : "bg-emerald-50/90 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 shadow-2xs backdrop-blur-xs"
              }`}
            >
              {isListening ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent>
            {isListening ? "Dey listen... Talk in English or Pidgin now" : "Talk wetin happen with voice (Hands-free)"}
          </TooltipContent>
        </Tooltip>
      </form>

      {/* Quick 1-Tap Example Phrases */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
        {quickExamples.map((item, idx) => (
          <Tooltip key={idx}>
            <TooltipTrigger asChild>
              <motion.button
                type="button"
                whileHover={{ y: -1, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setInputVal(item.text);
                  processTraderInput(item.text);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200/70 text-emerald-950 text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0 backdrop-blur-xs"
              >
                {item.label}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>
              1-Tap record sharp-sharp: {item.text}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Value Feedback Card: What Changed? Why It Matters? What To Do Next? */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="rounded-2xl bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#047857] text-white p-4 space-y-2.5 shadow-lg shadow-emerald-950/20 border border-emerald-600/40 relative overflow-hidden"
          >
            {/* Header: Recorded ✓ */}
            <div className="flex items-center justify-between pb-2 border-b border-emerald-700/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
                <span className="text-xs font-black text-emerald-100 tracking-wide uppercase">
                  Recorded ✓ ₦{feedback.amount.toLocaleString()} ({feedback.typeLabel})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    speakTraderAudioFeedback(
                      `${feedback.typeLabel}: ${feedback.whatChanged} ${feedback.whatToDoNext}`
                    )
                  }
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-200 hover:text-white bg-white/15 hover:bg-white/25 px-2 py-0.5 rounded-md transition-all cursor-pointer backdrop-blur-sm"
                  title="Listen to voice confirmation again"
                >
                  <Volume2 className="h-3 w-3" />
                  <span>Listen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  className="text-[11px] font-bold text-emerald-300 hover:text-white cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>

            {/* 3 Core Value Items */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-start gap-2">
                <span className="font-black text-emerald-300 shrink-0 min-w-[85px]">
                  What changed?
                </span>
                <span className="text-emerald-100 font-medium leading-tight">
                  {feedback.whatChanged}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-black text-emerald-300 shrink-0 min-w-[85px]">
                  Why it matters?
                </span>
                <span className="text-emerald-200 font-medium leading-tight">
                  {feedback.whyItMatters}
                </span>
              </div>

              <div className="flex items-start gap-2 pt-1 border-t border-emerald-700/60">
                <span className="font-black text-white shrink-0 min-w-[85px]">
                  Next move:
                </span>
                <span className="text-white font-black leading-tight">
                  {feedback.whatToDoNext}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
