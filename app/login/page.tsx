"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Shop Login & Trader Identity Portal
// Soft 3D Glassmorphism & Neumorphism Design System
// ─────────────────────────────────────────────────────────────────

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
  Camera,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Authentic Nigerian Market Stall Presets
const MARKET_STALL_PRESETS: Array<{
  id: "mama_chidi" | "alhaji_garba" | "emeka" | "blessing";
  label: string;
  trade: string;
  market: string;
  image: string;
}> = [
  {
    id: "mama_chidi",
    label: "Mama Chidi",
    trade: "Provisions & FMCG",
    market: "Balogun Market",
    image: "/images/traders/mama_chidi.jpg",
  },
  {
    id: "alhaji_garba",
    label: "Alhaji Garba",
    trade: "Grain Wholesale",
    market: "Mile 12 Market",
    image: "/images/traders/alhaji_garba.jpg",
  },
  {
    id: "emeka",
    label: "Emeka Alaba",
    trade: "Electronics & Phones",
    market: "Alaba Int'l",
    image: "/images/traders/emeka_electronics.jpg",
  },
  {
    id: "blessing",
    label: "Blessing",
    trade: "Fabrics & Lace",
    market: "Tejuosho Yaba",
    image: "/images/traders/blessing_fabrics.jpg",
  },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginDemo, registerShop, isAuthenticated, isLoading: authLoading } = useAuth();

  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register fields
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [marketLocation, setMarketLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("/images/traders/mama_chidi.jpg");
  const [isCustomPhoto, setIsCustomPhoto] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle live file/camera upload for store & headshot
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Photo size should be under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
          setIsCustomPhoto(true);
          setErrorMessage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // One-tap demo
  const handleQuickDemo = async (presetId: "mama_chidi" | "alhaji_garba" | "emeka" | "blessing" = "mama_chidi") => {
    setErrorMessage(null);
    setIsDemoLoading(true);
    const res = await loginDemo(presetId);
    if (!res.success) {
      setErrorMessage("Could not sign in with demo account.");
      setIsDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    if (mode === "signin") {
      if (!identifier || !password) {
        setErrorMessage("Please enter your email/phone and password.");
        setIsSubmitting(false);
        return;
      }

      const res = await login(identifier, password);
      if (!res.success) {
        setErrorMessage(res.error || "Incorrect credentials. Please try again.");
        setIsSubmitting(false);
      } else {
        setSuccessMessage("Signed in! Loading your shop…");
        setTimeout(() => router.replace("/"), 400);
      }
    } else {
      // REGISTER
      if (!fullName.trim()) {
        setErrorMessage("Please enter your name.");
        setIsSubmitting(false);
        return;
      }
      if (!identifier.trim()) {
        setErrorMessage("Please enter your email or phone number.");
        setIsSubmitting(false);
        return;
      }
      if (!password || password.length < 4) {
        setErrorMessage("Password must be at least 4 characters.");
        setIsSubmitting(false);
        return;
      }

      const res = await registerShop({
        name: fullName.trim(),
        email: identifier.trim(),
        pass: password,
        businessName: businessName.trim() || `${fullName.trim()}'s Shop`,
        marketLocation: marketLocation.trim() || "Balogun Market, Lagos",
        avatarUrl,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Registration failed. Please try another email/phone.");
        setIsSubmitting(false);
      } else {
        setSuccessMessage("Shop registered! Activating your decision intelligence…");
        setTimeout(() => router.replace("/"), 600);
      }
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#edf3fb] selection:bg-blue-500/20">
      {/* ── AMBIENT 3D FROSTED GLASS BACKGROUND ELEMENTS ── */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-300/30 to-indigo-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-tl from-blue-400/25 to-sky-200/20 blur-3xl" />
      
      {/* Top Floating 3D Soft Orb */}
      <div className="pointer-events-none absolute top-12 left-1/4 h-32 w-32 rounded-full bg-white/40 shadow-[10px_10px_30px_rgba(160,185,218,0.4)] backdrop-blur-xl border border-white/80 float-3d" />
      <div className="pointer-events-none absolute bottom-16 right-1/4 h-24 w-24 rounded-full bg-white/30 shadow-[8px_8px_24px_rgba(160,185,218,0.35)] backdrop-blur-lg border border-white/70 float-3d" style={{ animationDelay: "-3s" }} />

      {/* ── MAIN 3D SOFT GLASS AUTH CONTAINER ── */}
      <div className="relative w-full max-w-sm sm:max-w-md my-6 z-10 space-y-5">
        {/* 3D Emblems & Brand Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center space-y-3"
        >
          {/* 3D Soft App Icon Container */}
          <div className="relative flex h-20 w-20 sm:h-22 sm:w-22 items-center justify-center rounded-[28px] clay-icon-box">
            {/* 3D Gradient Ribbon Emblem */}
            <div className="relative flex items-center justify-center">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-tr from-[#1d4ed8] via-[#2563eb] to-[#60a5fa] shadow-[0_8px_20px_rgba(37,99,235,0.45)] flex items-center justify-center transform rotate-6">
                <Store className="h-5 w-5 sm:h-6 sm:w-6 text-white -rotate-6" />
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-sky-300/90 border border-white shadow-xs" />
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {mode === "signin" ? "Welcome Back" : "Register Your Shop"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {mode === "signin"
                ? "Sign in to manage your shop & track your money"
                : "Open your digital record book in 30 seconds"}
            </p>
          </div>
        </motion.div>

        {/* ── 3D SOFT GLASS CARD ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="clay-card p-5 sm:p-7 space-y-4"
        >
          {/* Mode Switcher Pill */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-200/50 border border-white/60 shadow-inner text-xs font-black">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === "signin"
                  ? "clay-btn-secondary text-blue-700 font-black"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === "register"
                  ? "clay-btn-secondary text-blue-700 font-black"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Register Shop
            </button>
          </div>

          {/* Alert messages */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-700 text-xs font-semibold"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs font-semibold"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* REGISTER EXTRA FIELDS */}
            {mode === "register" && (
              <div className="space-y-3 pt-1">
                {/* Store Photo Upload Frame */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 border border-white/90 shadow-sm">
                  <div className="relative h-14 w-14 rounded-2xl overflow-hidden border border-blue-200 shrink-0 bg-slate-100">
                    <img
                      src={avatarUrl}
                      alt="Shop Avatar"
                      className="h-full w-full object-cover object-center"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/30 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Shop Photo / Logo</p>
                    <p className="text-[10px] text-slate-500 font-medium">Upload stall picture or preset</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-xl text-[10.5px] font-bold clay-btn-secondary cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                {/* Full Name */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Full Name (e.g. Mama Chidi)"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-2xl clay-input text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
                  />
                </div>

                {/* Shop Name */}
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Shop Name (e.g. Mama Chidi Provisions)"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl clay-input text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
                  />
                </div>

                {/* Market Location */}
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={marketLocation}
                    onChange={(e) => setMarketLocation(e.target.value)}
                    placeholder="Market Location (e.g. Balogun Market)"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl clay-input text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email or Username input */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Username or Email / Phone"
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl clay-input text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
              />
            </div>

            {/* Password input */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full pl-11 pr-11 py-3.5 rounded-2xl clay-input text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Remember Me & Forgot Password row */}
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <label className="flex items-center gap-2 text-slate-600 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                />
                <span>Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() => handleQuickDemo("mama_chidi")}
                className="text-blue-600 hover:text-blue-800 font-bold transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Primary Action Button (Electric Blue Pill) */}
            <button
              type="submit"
              disabled={isSubmitting || isDemoLoading}
              className="w-full py-4 rounded-2xl clay-btn-primary font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75 mt-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              ) : (
                <>
                  <span>{mode === "signin" ? "Login" : "Register Shop"}</span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <ArrowRight className="h-3.5 w-3.5 text-white" />
                  </div>
                </>
              )}
            </button>
          </form>

          {/* ── OR CONTINUE WITH MARKET TRADER DEMO PRESETS ── */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Or Continue With
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* 4 Soft 3D Frosted Preset Tiles */}
            <div className="grid grid-cols-4 gap-2.5">
              {MARKET_STALL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleQuickDemo(preset.id)}
                  disabled={isDemoLoading}
                  className="clay-card-sm p-2 flex flex-col items-center justify-center gap-1 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                  title={`Sign in as ${preset.label}`}
                >
                  <img
                    src={preset.image}
                    alt={preset.label}
                    className="h-8 w-8 rounded-full object-cover border border-white shadow-xs group-hover:ring-2 group-hover:ring-blue-500 transition-all"
                  />
                  <span className="text-[9px] font-black text-slate-700 truncate w-full text-center">
                    {preset.label.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Privacy & Trust Badge */}
        <p className="text-[11px] text-slate-400 font-semibold text-center tracking-wide">
          MONIEPAY • OPERATES OFFLINE &amp; LIVE IN MARKETS
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#edf3fb] text-slate-900">
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  );
}
