"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Store,
  Lock,
  Mail,
  User,
  MapPin,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  Zap,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Tiny floating stat card ──────────────────────────────────────
function StatBubble({
  label,
  value,
  color,
  delay,
}: {
  label: string;
  value: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/95 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-white/60"
    >
      <span className={`h-2 w-2 rounded-full ${color} shrink-0`} />
      <div>
        <p className="text-[10px] font-semibold text-slate-500 leading-none mb-0.5">{label}</p>
        <p className="text-xs font-black text-slate-900 leading-none">{value}</p>
      </div>
    </motion.div>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginDemo, registerShop, isAuthenticated, isLoading: authLoading } = useAuth();

  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [marketLocation, setMarketLocation] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.replace("/");
    }
  }, [isAuthenticated, authLoading, router]);

  // Handle ?register=1
  useEffect(() => {
    if (searchParams?.get("register") === "1") setMode("register");
  }, [searchParams]);

  // One-tap demo
  const handleQuickDemo = async () => {
    setErrorMessage(null);
    setIsDemoLoading(true);
    const res = await loginDemo();
    if (res.success) {
      setSuccessMessage("Opening Mama Chidi's store…");
      setTimeout(() => { window.location.href = "/"; }, 300);
    } else {
      setErrorMessage("Demo unavailable. Please try again.");
      setIsDemoLoading(false);
    }
  };

  // Main form handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === "signin") {
      if (!identifier.trim() || !password) {
        setErrorMessage("Enter your email and password.");
        return;
      }
      setIsSubmitting(true);
      const res = await login(identifier, password);
      if (res.success) {
        setSuccessMessage("Signed in! Loading your shop…");
        setTimeout(() => { window.location.href = "/"; }, 300);
      } else {
        setErrorMessage(res.error || "Incorrect credentials. Try the demo shop instead.");
        setIsSubmitting(false);
      }
    } else {
      if (!fullName.trim() || !identifier.trim() || !password) {
        setErrorMessage("Please fill in all required fields.");
        return;
      }
      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters.");
        return;
      }
      setIsSubmitting(true);
      const res = await registerShop({
        name: fullName,
        email: identifier,
        pass: password,
        businessName: businessName.trim() || `${fullName}'s Store`,
        marketLocation: marketLocation.trim() || "Balogun Market, Lagos",
      });
      if (res.success) {
        setSuccessMessage("Shop registered! Setting up your workspace…");
        setTimeout(() => { window.location.href = "/"; }, 500);
      } else {
        setErrorMessage(res.error || "Registration failed. Please try again.");
        setIsSubmitting(false);
      }
    }
  };

  const switchMode = (next: "signin" | "register") => {
    setMode(next);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      {/* ═══════════════════════════════════════════
          HERO SECTION — Full-bleed emerald gradient
      ═══════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 flex-shrink-0">
        {/* Orb decorations */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-emerald-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-16 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-emerald-500/15 blur-2xl" />

        <div className="relative px-5 pt-12 pb-24 max-w-lg mx-auto">
          {/* Brand mark */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5 mb-8"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-inner">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-white font-black text-base tracking-tight leading-none block">MoniePay</span>
              <span className="text-emerald-200 text-[11px] font-semibold tracking-wide">Business OS</span>
            </div>
          </motion.div>

          {/* Hero headline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55 }}
          >
            <h1 className="text-[28px] sm:text-3xl font-black text-white leading-tight tracking-tight">
              Your shop.<br />
              <span className="text-emerald-200">Your money.</span><br />
              In your hands.
            </h1>
            <p className="mt-3 text-sm text-emerald-100/85 leading-relaxed max-w-xs">
              Built for Nigeria's market traders. Know what happened in your shop today.
            </p>
          </motion.div>

          {/* Floating stat bubbles */}
          <div className="mt-6 flex flex-wrap gap-2">
            <StatBubble label="Today's Revenue" value="₦340,500" color="bg-emerald-500" delay={0.25} />
            <StatBubble label="Customers Owe" value="₦85,000" color="bg-amber-400" delay={0.35} />
            <StatBubble label="Business Health" value="95 • Thriving" color="bg-blue-500" delay={0.45} />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          AUTH CARD — Slides up over hero
      ═══════════════════════════════════════════ */}
      <div className="relative -mt-10 flex-1 rounded-t-[32px] bg-slate-50 px-4 sm:px-5 pb-12">
        <div className="mx-auto max-w-md pt-6 space-y-5">
          {/* Pill drag handle */}
          <div className="flex justify-center">
            <div className="h-1 w-12 rounded-full bg-slate-300/80" />
          </div>

          {/* ── 1-TAP DEMO SHOP ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={isDemoLoading || isSubmitting}
              className="group w-full relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#047857] p-[1px] shadow-[0_8px_26px_rgba(4,120,87,0.3)] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-80"
            >
              <div className="rounded-[23px] bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#047857] px-4 sm:px-5 py-3.5 sm:py-4 flex items-center gap-3.5">
                {/* Local market headshot avatar */}
                <div className="relative h-13 w-13 rounded-2xl overflow-hidden border-2 border-emerald-400/40 shrink-0 shadow-md">
                  <img
                    src="/images/traders/mama_chidi.jpg"
                    alt="Mama Chidi - Balogun Market Trader"
                    className="h-full w-full object-cover object-center"
                  />
                  <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-emerald-950 animate-pulse" />
                </div>

                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                      Try Demo Shop
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-[9px] font-black text-emerald-200 uppercase tracking-wider border border-emerald-400/30">
                      1-Tap Free
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-black text-white leading-tight truncate">
                    Mama Chidi's Provisions
                  </p>
                  <p className="text-[11px] text-emerald-100/80 font-medium mt-0.5 truncate">
                    Balogun Market, Lagos • No password needed
                  </p>
                </div>

                <div className="shrink-0">
                  {isDemoLoading ? (
                    <Loader2 className="h-5 w-5 text-emerald-200 animate-spin" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 border border-white/25 group-hover:bg-white/25 transition-all">
                      <ArrowRight className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </button>
          </motion.div>

          {/* ── DIVIDER ── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* ── AUTH CARD ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="rounded-[26px] bg-white border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] overflow-hidden"
          >
            {/* Tab switcher */}
            <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-100">
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className={`py-4 text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
                  mode === "signin"
                    ? "bg-white text-emerald-800 border-b-2 border-emerald-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`py-4 text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-white text-emerald-800 border-b-2 border-emerald-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Open My Shop
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {/* Feedback banners */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-800 font-semibold"
                  >
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
                {successMessage && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800 font-semibold"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {mode === "register" && (
                    <motion.div
                      key="register-fields"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3.5"
                    >
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                          Your Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-350" />
                          <input
                            type="text"
                            placeholder="e.g. Adewale Okafor"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-[13px] font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all"
                          />
                        </div>
                      </div>

                      {/* Shop Name */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                          Shop / Store Name
                        </label>
                        <div className="relative">
                          <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-350" />
                          <input
                            type="text"
                            placeholder="e.g. Mama Chidi Provisions"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-[13px] font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all"
                          />
                        </div>
                      </div>

                      {/* Market Location */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                          Market / Location
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-350" />
                          <input
                            type="text"
                            placeholder="e.g. Shop 14, Balogun Market"
                            value={marketLocation}
                            onChange={(e) => setMarketLocation(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-[13px] font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email / Phone */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-350" />
                    <input
                      type="text"
                      placeholder="name@example.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      autoCapitalize="none"
                      autoCorrect="off"
                      inputMode="email"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-[13px] font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                      Password
                    </label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-600 transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-350" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-[13px] font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {mode === "register" && (
                    <p className="text-[11px] text-slate-400 font-medium ml-1">Minimum 6 characters</p>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isDemoLoading}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-extrabold text-sm shadow-[0_4px_16px_rgba(15,23,42,0.18)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{mode === "signin" ? "Signing in…" : "Creating shop…"}</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === "signin" ? "Sign In to My Shop" : "Open My MoniePay Store"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Trust footer */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-400">
                  Bank-grade encryption • Works offline
                </span>
              </div>
            </div>
          </motion.div>

          {/* ── FEATURE PILLS ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="grid grid-cols-3 gap-2.5"
          >
            {[
              { icon: Zap, label: "Instant", desc: "5ms capture" },
              { icon: BarChart3, label: "Decisions", desc: "Daily advice" },
              { icon: TrendingUp, label: "Profit", desc: "Live margin" },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-slate-200/70 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 mb-2">
                  <Icon className="h-4 w-4 text-emerald-700" />
                </div>
                <span className="text-xs font-extrabold text-slate-800">{label}</span>
                <span className="text-[10px] font-medium text-slate-400 mt-0.5">{desc}</span>
              </div>
            ))}
          </motion.div>

          {/* Footer note */}
          <p className="text-center text-[11px] text-slate-400 font-medium pb-2">
            Built for Nigeria&apos;s informal and micro-business economy
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  );
}
