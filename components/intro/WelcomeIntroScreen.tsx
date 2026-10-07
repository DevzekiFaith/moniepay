"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Welcome Introduction Animation Screen
// Built with full-blown Framer Motion animations & 3D Daylight Glass aesthetics
// Nigerian Market & Trader friendly onboarding experience
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  Store,
  Zap,
  Mic,
  MessageSquare,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Wallet,
  Coins,
  Receipt,
  Clock,
  Volume2,
} from "lucide-react";

interface WelcomeIntroScreenProps {
  onComplete: () => void;
  onSkip?: () => void;
}

interface SlideData {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  highlight: string;
  description: string;
  icon: React.ReactNode;
  themeColor: string;
  gradient: string;
  visualElement: React.ReactNode;
}

export function WelcomeIntroScreen({ onComplete, onSkip }: WelcomeIntroScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  const slides: SlideData[] = [
    {
      id: "welcome",
      badge: "Welcome to MoniePay 🇳🇬",
      badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
      title: "Your Sharp-Sharp",
      highlight: "Shop Intelligence Partner",
      description:
        "Understand your money, no be just to record am. Track your true daily profit, protect drawer cash, and run your shop with confidence.",
      icon: <Store className="h-7 w-7 text-blue-600" />,
      themeColor: "#1d4ed8",
      gradient: "from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb]",
      visualElement: (
        <div className="relative w-full h-48 sm:h-56 flex items-center justify-center">
          {/* Pulsing Concentric Ripple Rings */}
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.1, 0.35] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute h-44 w-44 sm:h-52 sm:w-52 rounded-full border-2 border-blue-400/40 bg-blue-100/20"
          />
          <motion.div
            animate={{ scale: [1, 1.45, 1], opacity: [0.25, 0.05, 0.25] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="absolute h-56 w-56 sm:h-64 sm:w-64 rounded-full border border-sky-400/30"
          />

          {/* Central 3D Storefront Card */}
          <motion.div
            initial={{ scale: 0.8, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative z-10 p-5 rounded-[28px] bg-white/90 backdrop-blur-xl border border-white shadow-[0_16px_40px_rgba(29,78,216,0.18)] flex flex-col items-center text-center space-y-2"
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] text-white flex items-center justify-center shadow-md">
              <Store className="h-8 w-8 text-sky-200" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">MoniePay Trader OS</p>
              <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 justify-center">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                100% Offline Ready
              </p>
            </div>
          </motion.div>

          {/* Floating Pill Left: Daily Profit */}
          <motion.div
            animate={{ y: [-4, 6, -4], rotate: [-2, 2, -2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-2 sm:left-2 top-4 z-20 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-200 shadow-md flex items-center gap-1.5"
          >
            <div className="h-6 w-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase">Today Profit</p>
              <p className="text-xs font-black text-emerald-700">+₦35,400</p>
            </div>
          </motion.div>

          {/* Floating Pill Right: 7-Day Free Trial */}
          <motion.div
            animate={{ y: [6, -5, 6], rotate: [2, -2, 2] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -right-2 sm:right-2 bottom-4 z-20 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-blue-200 shadow-md flex items-center gap-1.5"
          >
            <div className="h-6 w-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase">Free Test-Run</p>
              <p className="text-xs font-black text-blue-800">7 Days Free</p>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      id: "recording",
      badge: "Fast Record • 2 Seconds 🎙️",
      badgeColor: "bg-amber-50 text-amber-900 border-amber-200",
      title: "Talk Am or Type Am",
      highlight: "Sharp-Sharp Recording",
      description:
        "No stopping your market flow. Press mic or type fast: 'Sold 3 bags of rice for ₦90k' — MoniePay updates your cash drawer instantly.",
      icon: <Zap className="h-7 w-7 text-amber-600" />,
      themeColor: "#d97706",
      gradient: "from-amber-700 via-amber-600 to-yellow-500",
      visualElement: (
        <div className="relative w-full h-48 sm:h-56 flex items-center justify-center">
          {/* Animated Audio Frequency Waves */}
          <div className="absolute inset-x-8 top-6 flex items-center justify-center gap-1.5 z-0 opacity-60">
            {[16, 28, 44, 24, 52, 36, 60, 40, 20, 48, 30, 18].map((height, i) => (
              <motion.div
                key={i}
                animate={{
                  height: [height * 0.4, height * 1.1, height * 0.4],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.08,
                  ease: "easeInOut",
                }}
                className="w-1.5 rounded-full bg-gradient-to-t from-amber-500 to-blue-500"
                style={{ height }}
              />
            ))}
          </div>

          {/* Central Voice & Ledger Card */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative z-10 w-64 p-4 rounded-3xl bg-white/95 backdrop-blur-xl border border-white shadow-[0_16px_40px_rgba(217,119,6,0.18)] space-y-3"
          >
            {/* Sim Voice Input Bar */}
            <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-amber-50/90 border border-amber-200/80">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-8 w-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0"
              >
                <Mic className="h-4 w-4" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-amber-950 truncate">
                  "I sell 2 carton Indomie ₦18,000"
                </p>
                <p className="text-[9px] font-semibold text-amber-700">Voice understood ⚡</p>
              </div>
            </div>

            {/* Instant Receipt Generated Tag */}
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[10.5px] font-black text-slate-800">Recorded as Sale</span>
              </div>
              <span className="text-[11px] font-black text-emerald-700">+₦18,000</span>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      id: "gbese",
      badge: "Zero Wahala Recovery 💬",
      badgeColor: "bg-emerald-50 text-emerald-900 border-emerald-200",
      title: "Collect Your Money",
      highlight: "Without Fight or Quarrel",
      description:
        "Customer dey owe you? Send polite 1-tap WhatsApp payment reminders with receipt details. Recover cash directly into your shop account.",
      icon: <MessageSquare className="h-7 w-7 text-emerald-600" />,
      themeColor: "#059669",
      gradient: "from-emerald-800 via-emerald-600 to-teal-500",
      visualElement: (
        <div className="relative w-full h-48 sm:h-56 flex items-center justify-center">
          {/* Simulated WhatsApp Chat Bubble */}
          <motion.div
            initial={{ scale: 0.85, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
            className="relative z-10 w-72 p-3.5 rounded-3xl bg-white/95 backdrop-blur-xl border border-white shadow-[0_16px_40px_rgba(5,150,105,0.18)] space-y-2.5"
          >
            {/* WhatsApp Header Mock */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-[10px]">
                  WA
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-900">Alhaji Garba</p>
                  <p className="text-[9px] font-bold text-emerald-600">Owing ₦25,000 (3 days)</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black">
                Gbese Sheet
              </span>
            </div>

            {/* Simulated Message Bubble */}
            <div className="p-2.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 text-[10.5px] leading-relaxed font-medium">
              "Good day Alhaji! Friendly reminder on your balance of <strong>₦25,000</strong> for the goods. Thank you for your patronage! 🙏"
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3 text-emerald-600" />
                1-Tap WhatsApp Ping
              </span>
              <span className="text-[10.5px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-lg">
                Sent 🚀
              </span>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      id: "pulse",
      badge: "Real Shop Intelligence 📈",
      badgeColor: "bg-indigo-50 text-indigo-900 border-indigo-200",
      title: "Know Wetin to Do Next",
      highlight: "Daily Pulse & Decisions",
      description:
        "Know your safe personal chop money withdrawal, real net profit, and wholesale stock price alerts so you never lose market capital.",
      icon: <TrendingUp className="h-7 w-7 text-indigo-600" />,
      themeColor: "#4338ca",
      gradient: "from-indigo-800 via-indigo-600 to-sky-500",
      visualElement: (
        <div className="relative w-full h-48 sm:h-56 flex items-center justify-center">
          {/* Central 3-Step Decision Cards */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative z-10 w-72 p-4 rounded-3xl bg-white/95 backdrop-blur-xl border border-white shadow-[0_16px_40px_rgba(67,56,202,0.18)] space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">Today's Safe Chop Money</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                Safe to take
              </span>
            </div>

            <div className="flex items-baseline justify-between p-2.5 rounded-2xl bg-indigo-50/80 border border-indigo-100">
              <div>
                <p className="text-xl font-black text-indigo-950">₦15,000</p>
                <p className="text-[9.5px] font-semibold text-indigo-700">Capital stays 100% protected</p>
              </div>
              <Wallet className="h-6 w-6 text-indigo-600" />
            </div>

            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-[10.5px] font-semibold text-slate-700">
              <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>Restock Sugar: Price drops by ₦1,200 tomorrow!</span>
            </div>
          </motion.div>
        </div>
      ),
    },
  ];

  const current = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden bg-[#edf3fb] selection:bg-blue-500/20 text-slate-900">
      {/* ── AMBIENT 3D BACKGROUND GLOWS ── */}
      <div className="pointer-events-none absolute -top-28 -left-28 h-96 w-96 rounded-full bg-gradient-to-br from-blue-300/30 to-indigo-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-gradient-to-tl from-blue-400/25 to-sky-200/20 blur-3xl" />
      <div className="pointer-events-none absolute top-12 left-1/4 h-32 w-32 rounded-full bg-white/40 shadow-[10px_10px_30px_rgba(160,185,218,0.4)] backdrop-blur-xl border border-white/80 float-3d" />

      {/* ── TOP UTILITY ROW (Logo + Skip Tour Button) ── */}
      <header className="relative w-full max-w-md flex items-center justify-between z-20 pt-2 px-1">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-2xl bg-[#1d4ed8] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-black tracking-tight text-slate-900">MoniePay</span>
            <span className="text-[10px] font-bold text-blue-600 block leading-none">Trader Intro</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onSkip || onComplete}
          className="px-3.5 py-1.5 rounded-xl bg-white/70 hover:bg-white text-slate-600 hover:text-slate-900 text-xs font-black border border-white/80 shadow-2xs backdrop-blur-md active:scale-95 transition-all cursor-pointer"
        >
          Skip Intro &rarr;
        </button>
      </header>

      {/* ── MAIN ANIMATED SLIDE CARD CONTAINER ── */}
      <main className="relative w-full max-w-md my-auto py-4 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 35, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -35, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="clay-card p-5 sm:p-7 space-y-4 text-center relative overflow-hidden"
          >
            {/* Top Micro Tag */}
            <div className="flex justify-center">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border shadow-2xs ${current.badgeColor}`}
              >
                <Store className="h-3.5 w-3.5" />
                <span>{current.badge}</span>
              </span>
            </div>

            {/* Dynamic Visual Element Stage */}
            <div className="py-1">{current.visualElement}</div>

            {/* Typography Hierarchy */}
            <div className="space-y-1.5 pt-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {current.title}{" "}
                <span className="text-[#1d4ed8] block sm:inline">{current.highlight}</span>
              </h2>

              <p className="text-xs sm:text-[13px] text-slate-600 font-medium leading-relaxed max-w-xs mx-auto">
                {current.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── BOTTOM CONTROLS & NAVIGATION STRIP ── */}
      <footer className="relative w-full max-w-md z-20 pb-4 space-y-4">
        {/* Progress Dot Capsules */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((s, idx) => {
            const isActive = currentSlide === idx;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "w-8 bg-[#1d4ed8] shadow-[0_0_10px_rgba(29,78,216,0.5)]"
                    : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            );
          })}
        </div>

        {/* Primary Next / Get Started Action Button */}
        <div className="flex items-center gap-2.5">
          {currentSlide > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-black shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              Back
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-4 px-6 rounded-2xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-sm font-black tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-[0_6px_20px_rgba(29,78,216,0.35)] active:scale-98 transition-all"
          >
            <span>
              {currentSlide === slides.length - 1 ? "Open Shop / Sign In" : "Continue"}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Footer Security Note */}
        <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest">
          MoniePay • 100% Offline Capable • Built for Nigerian Traders
        </p>
      </footer>
    </div>
  );
}
