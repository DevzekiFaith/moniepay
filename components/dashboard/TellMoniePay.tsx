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
    let typeLabel = "Market Sales";
    let whatChanged = `Today sales don jump up with ₦${amount.toLocaleString()} clean cash.`;
    let whyItMatters = "Drawer cash dey solid; fresh profit enter your daily position.";
    let whatToDoNext = "Keep at least 70% inside drawer make you take restock market.";

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
        typeLabel = "Supplier Gbese (You Owe)";
        whatChanged = `You collect ₦${amount.toLocaleString()} market on credit from supplier.`;
        whyItMatters = "Clear am on time make wholesaler keep good price for your shop.";
        whatToDoNext = "Plan make you pay am from tomorrow morning market sales.";
      } else {
        type = "SALE";
        paymentMethod = "CREDIT";
        category = "Customer Credit";
        typeLabel = "Customer Gbese (Credit)";
        whatChanged = `You give customer ₦${amount.toLocaleString()} market goods on credit.`;
        whyItMatters = "Your money still dey trap for outside, drawer never balance.";
        whatToDoNext = "Send am WhatsApp reminder sharp-sharp before weekend restock.";
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
      typeLabel = "Restock / Market Goods";
      whatChanged = `You spend ₦${amount.toLocaleString()} buy fresh market stock.`;
      whyItMatters = "Cash don turn to heavy goods wey go bring correct profit.";
      whatToDoNext = "Put better market margin (at least 25%) make you gain well.";
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
      typeLabel = "Gbese Recovered (Customer Pay)";
      whatChanged = `₦${amount.toLocaleString()} don return enter your cash drawer sharp-sharp.`;
      whyItMatters = "Money wey trap outside don enter back as working capital.";
      whatToDoNext = "E safe well-well to put am for tomorrow restock.";
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
      typeLabel = "Chop Money (Personal Cash)";
      whatChanged = `You commot ₦${amount.toLocaleString()} for house & personal upkeep.`;
      whyItMatters = "Personal chop money separated clean from shop business capital.";
      whatToDoNext = "Restock capital still dey safe 100%, no shaking.";
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
      typeLabel = "Shop Boy / Staff Wage";
      whatChanged = `You settle shop helper ₦${amount.toLocaleString()}.`;
      whyItMatters = "Shop running cost record clean, no hidden shortage.";
      whatToDoNext = "Don calculate inside this week shop overhead.";
    }
    // 6. Regular Sale
    else {
      type = "SALE";
      category = "General Sales";
      typeLabel = "Sales Don Enter";
      whatChanged = `Today sales don jump up with ₦${amount.toLocaleString()} clean cash.`;
      whyItMatters = "Drawer cash dey solid; fresh profit enter your daily position.";
      whatToDoNext = "Keep at least 70% inside drawer make you take restock market.";
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
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processTraderInput(inputVal);
  };

  const quickExamples = [
    { text: "Sold 45k today", label: "“Sell 45k today”" },
    { text: "Bought stock for 20k", label: "“Buy market 20k”" },
    { text: "Chidi paid me 15k", label: "“Chidi pay me 15k”" },
    { text: "I owe supplier 80k", label: "“I owe supplier 80k”" },
    { text: "I withdrew 30k chop money", label: "“Take 30k chop moni”" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="clay-card p-3.5 sm:p-5 space-y-3 sm:space-y-3.5 relative overflow-hidden"
    >
      {/* Decorative ambient glass light */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-400/15 blur-2xl" />
      <div className="pointer-events-none absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-sky-300/15 blur-2xl" />

      {/* Header: Fluid Mobile Wrap */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse shadow-xs shadow-blue-500/50 shrink-0" />
          <h2 className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-slate-800 leading-tight">
            Tell MoniePay Wetin Happen For Shop
          </h2>
        </div>
        <span className="self-start sm:self-auto text-[9.5px] sm:text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50/90 text-blue-700 border border-blue-200/60 shadow-xs">
          Sharp-Sharp • Talk am or Type am
        </span>
      </div>

      {/* Input & Voice Interaction Box */}
      <form onSubmit={handleFormSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Talk or type: e.g. Sell 45k, Chidi pay 15k, Buy market 20k..."
            className="clay-input w-full pl-3.5 sm:pl-4 pr-10 sm:pr-11 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {inputVal && (
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 h-7.5 w-7.5 sm:h-8 sm:w-8 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white flex items-center justify-center cursor-pointer shadow-md shadow-blue-600/30 border-t border-white/30"
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
              className={`h-10 w-10 sm:h-11 sm:w-11 rounded-2xl flex items-center justify-center cursor-pointer transition-all shrink-0 ${
                isListening
                  ? "bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-500/40"
                  : "clay-card-sm text-blue-700 hover:text-blue-900"
              }`}
            >
              {isListening ? (
                <MicOff className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              ) : (
                <Mic className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent>
            {isListening ? "Dey listen... Talk in English or Pidgin now" : "Talk wetin happen with voice (Hands-free)"}
          </TooltipContent>
        </Tooltip>
      </form>

      {/* Quick 1-Tap Example Phrases with Horizontal Scroll */}
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
                className="px-2.5 sm:px-3 py-1.5 rounded-xl clay-card-sm text-slate-700 hover:text-blue-700 text-[11px] sm:text-xs font-bold whitespace-nowrap cursor-pointer transition-all shrink-0"
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

      {/* Value Feedback Card: Mobile-Responsive Frosted Glassmorphic Change Card */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="rounded-[24px] backdrop-blur-2xl bg-gradient-to-br from-white/95 via-blue-50/70 to-white/90 border border-white/90 shadow-[0_12px_36px_rgba(37,99,235,0.12),-6px_-6px_20px_rgba(255,255,255,0.95)] p-3.5 sm:p-5 space-y-3 relative overflow-hidden"
          >
            {/* Ambient glass flare effect */}
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/15 blur-xl" />
            <div className="pointer-events-none absolute -left-6 -bottom-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl" />

            {/* Header: Recorded Status & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-blue-100/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-7 w-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight block truncate">
                    Don Record Sharp-Sharp ✓ <span className="text-blue-700">₦{feedback.amount.toLocaleString()}</span>
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50/90 px-2 py-0.5 rounded-full border border-blue-200/60 inline-block mt-0.5">
                    {feedback.typeLabel}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Listen & Dismiss */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-1 sm:pt-0">
                <button
                  type="button"
                  onClick={() =>
                    speakTraderAudioFeedback(
                      `${feedback.typeLabel}: ${feedback.whatChanged} ${feedback.whatToDoNext}`
                    )
                  }
                  className="flex items-center gap-1.5 text-[11px] font-black text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Listen to voice confirmation"
                >
                  <Volume2 className="h-3.5 w-3.5 text-blue-600" />
                  <span>Hear am</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-700 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Comot am
                </button>
              </div>
            </div>

            {/* 3 Core Value Items (Mobile-Fluid Stack) */}
            <div className="space-y-2 text-xs">
              {/* 1. Wetin change? */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 p-2.5 rounded-2xl bg-white/60 border border-white/90 shadow-2xs">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-blue-800 bg-blue-50/90 px-2 py-0.5 rounded-lg border border-blue-200/60 self-start sm:shrink-0 sm:min-w-[95px] text-center">
                  Wetin change?
                </span>
                <span className="text-slate-800 font-bold leading-relaxed text-xs sm:text-[13px] pt-0.5">
                  {feedback.whatChanged}
                </span>
              </div>

              {/* 2. Why e matter? */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 p-2.5 rounded-2xl bg-white/60 border border-white/90 shadow-2xs">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-indigo-800 bg-indigo-50/90 px-2 py-0.5 rounded-lg border border-indigo-200/60 self-start sm:shrink-0 sm:min-w-[95px] text-center">
                  Why e matter?
                </span>
                <span className="text-slate-700 font-semibold leading-relaxed text-xs sm:text-[13px] pt-0.5">
                  {feedback.whyItMatters}
                </span>
              </div>

              {/* 3. Wetin you go do now: */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-3 p-3 rounded-2xl bg-gradient-to-r from-blue-600/15 via-sky-500/10 to-transparent border-l-4 border-blue-600 shadow-xs">
                <span className="text-[10.5px] sm:text-[11px] font-black uppercase tracking-wider text-blue-900 bg-blue-100/90 px-2.5 py-0.5 rounded-lg border border-blue-300/70 self-start sm:shrink-0 sm:min-w-[95px] text-center">
                  Wetin you go do:
                </span>
                <span className="text-blue-950 font-black leading-relaxed text-xs sm:text-[13px] pt-0.5">
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
