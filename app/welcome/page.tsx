"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Welcome / Onboarding Landing Page
// Daylight Fluid Architecture • Single Green Market Theme
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Store,
  Wallet,
  Users,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { AjoLogo } from "@/components/ui/AjoLogo";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500/20 selection:text-blue-950 dark:selection:text-white flex flex-col justify-between overflow-x-hidden transition-colors">
      {/* Top Navbar */}
      <header className="w-full border-b border-emerald-900/10 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <AjoLogo size={32} showTagline={false} />
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm cursor-pointer active:scale-95 transition-all shadow-xs"
          >
            Open Shop
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16 text-center space-y-6">
        {/* Market Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-black">
          <Store className="h-3.5 w-3.5 text-emerald-700" />
          <span>Informal Business Operating Layer</span>
        </div>

        {/* Big Headline */}
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
          You run your shop. <br />
          <span className="text-emerald-700">MoniePay does the thinking.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
          Tell MoniePay what happened in plain words. Get instant answers on safe chop money, restocking funds, customer debt collection, and profit margins.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-lg shadow-emerald-900/20"
          >
            <span>Start Using MoniePay</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 3 Core Value Props Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-8 text-left">
          <div className="rounded-[22px] bg-white border border-emerald-900/10 p-4 sm:p-5 shadow-xs space-y-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Tell MoniePay</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Type or speak “Sold 45k” or “Bought stock 20k”. No bookkeeping software to learn.
            </p>
          </div>

          <div className="rounded-[22px] bg-white border border-emerald-900/10 p-4 sm:p-5 shadow-xs space-y-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Your Next Move</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Get the single highest-leverage decision every day so you never run out of restock capital.
            </p>
          </div>

          <div className="rounded-[22px] bg-white border border-emerald-900/10 p-4 sm:p-5 shadow-xs space-y-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Gbese Book</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              1-tap WhatsApp reminders for customers who owe you money before your weekend stock buy.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 py-6 px-4 text-center text-xs text-slate-400 font-medium">
        MoniePay • Built for Nigeria's Informal Economy
      </footer>
    </div>
  );
}
