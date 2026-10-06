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
        {/* 3D User Profile & Welcoming Hero (Flex Presentation with Bold Text Hierarchy) */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="clay-card p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left relative overflow-hidden"
        >
          {/* Ambient refraction top line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 opacity-90" />

          {/* 3D Profile Avatar */}
          <div className="relative flex h-20 w-20 sm:h-22 sm:w-22 items-center justify-center rounded-[28px] clay-icon-box p-1 shrink-0 shadow-[0_10px_25px_rgba(154,180,214,0.45)] group">
            <div className="relative h-full w-full rounded-[22px] overflow-hidden bg-slate-100 border border-white/80">
              <img
                src={avatarUrl}
                alt="Trader Profile"
                className="h-full w-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.src = "/images/traders/mama_chidi.jpg";
                }}
              />
              {mode === "register" && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Upload profile photo"
                >
                  <Camera className="h-5 w-5" />
                  <span className="text-[9px] font-bold mt-0.5">Change</span>
                </button>
              )}
            </div>

            {/* Active / Verified Online Dot */}
            <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
          </div>

          {/* Text Hierarchy */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Micro Tag / Category */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-[10.5px] font-black tracking-wide uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>Trader Shop Portal</span>
            </div>

            {/* Main Headline - Bold & Prominent */}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {mode === "signin" ? "Welcome Back O!" : "Open Your Shop Sharp-Sharp"}
            </h1>

            {/* Descriptive Body - Structured & Legible */}
            <p className="text-xs sm:text-[13px] text-slate-600 font-medium leading-relaxed">
              {mode === "signin"
                ? "Enter your shop make you see how your money dey move today. Check your daily profit, track who dey owe you gbese, and see wetin you suppose do next for market."
                : "Open your digital record book in 30 seconds. Track sales, debts & restock alerts with zero stress."}
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
              Enter Shop
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
              Register New Shop
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
                    <p className="text-[10px] text-slate-500 font-medium">Snap your stall or upload photo</p>
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
                    placeholder="Shop Name (e.g. Mama Chidi Super Store)"
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
                    placeholder="Market Location (e.g. Balogun Market, Lagos)"
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
                placeholder="Your Phone Number or Email"
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
                placeholder="Your Secret Password"
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
                <span>Keep me signed in</span>
              </label>

              <button
                type="button"
                onClick={() => setErrorMessage("Password reset link sent to your registered email/phone.")}
                className="text-blue-600 hover:text-blue-800 font-bold transition-colors cursor-pointer"
              >
                Forget Password?
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
                  <span>{mode === "signin" ? "Enter Shop Now" : "Open Shop Now"}</span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <ArrowRight className="h-3.5 w-3.5 text-white" />
                  </div>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* MoniePay Trader Motto / Value Proposition Card (Organized 3-Step Process) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="clay-card p-4 sm:p-5 space-y-3.5 relative overflow-hidden"
        >
          {/* Header & Explanation */}
          <div className="text-center space-y-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-[10px] font-black tracking-widest uppercase">
              How MoniePay Dey Help You
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-snug">
              Understand your money well-well.
            </h3>
            <p className="text-xs font-black text-blue-700">
              No be just to write am down for book.
            </p>
            <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed max-w-xs mx-auto pt-0.5">
              Record wetin enter and wetin comot — MoniePay go explain wetin the money mean for your daily profit.
            </p>
          </div>

          {/* 3-Step Process Cards */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1 items-stretch">
            {/* Step 1 */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/60 border border-white/80 shadow-2xs text-center flex flex-col items-center justify-center">
              <span className="text-[9px] font-black text-blue-600 bg-blue-100/70 px-1.5 py-0.5 rounded-md uppercase tracking-wider mb-1">
                Step 1
              </span>
              <p className="text-[11px] sm:text-xs font-black text-slate-900 leading-tight">
                Record am
              </p>
              <p className="text-[9.5px] text-slate-500 font-semibold leading-tight mt-0.5">
                Sales &amp; Gbese
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/60 border border-white/80 shadow-2xs text-center flex flex-col items-center justify-center">
              <span className="text-[9px] font-black text-indigo-600 bg-indigo-100/70 px-1.5 py-0.5 rounded-md uppercase tracking-wider mb-1">
                Step 2
              </span>
              <p className="text-[11px] sm:text-xs font-black text-slate-900 leading-tight">
                Understand am
              </p>
              <p className="text-[9.5px] text-slate-500 font-semibold leading-tight mt-0.5">
                See Position
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/80 border border-blue-300/70 shadow-xs text-center flex flex-col items-center justify-center ring-1 ring-blue-400/30">
              <span className="text-[9px] font-black text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-md uppercase tracking-wider mb-1">
                Step 3
              </span>
              <p className="text-[11px] sm:text-xs font-black text-blue-900 leading-tight">
                Decide sharp-sharp
              </p>
              <p className="text-[9.5px] text-blue-600 font-bold leading-tight mt-0.5">
                Protect Profit
              </p>
            </div>
          </div>

          {/* Bottom Motto */}
          <div className="pt-2 border-t border-slate-200/60 text-center">
            <p className="text-[10px] sm:text-[10.5px] text-slate-500 font-bold tracking-wider uppercase">
              Your money <span className="text-blue-500 font-black">•</span> Your picture <span className="text-blue-500 font-black">•</span> Your decisions
            </p>
          </div>
        </motion.div>
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
