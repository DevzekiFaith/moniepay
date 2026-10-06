"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Shop Login & Trader Identity Portal
// Deep Emerald Theme • Authentic Local Trader Headshots • 1-Tap Demo
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
  TrendingUp,
  Zap,
  BarChart3,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Floating stat card ───────────────────────────────────────────
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
      className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-white/60"
    >
      <span className={`h-2 w-2 rounded-full ${color} shrink-0`} />
      <div>
        <p className="text-[10px] font-semibold text-slate-500 leading-none mb-0.5">{label}</p>
        <p className="text-xs font-black text-slate-900 leading-none">{value}</p>
      </div>
    </motion.div>
  );
}

// Authentic Nigerian Market Stall Presets
const MARKET_STALL_PRESETS = [
  {
    id: "provisions",
    label: "Provisions & FMCG",
    market: "Balogun Market",
    image: "/images/traders/mama_chidi.jpg",
  },
  {
    id: "grains",
    label: "Grain Wholesale",
    market: "Mile 12 Market",
    image: "/images/traders/alhaji_garba.jpg",
  },
  {
    id: "gadgets",
    label: "Electronics & Phones",
    market: "Alaba Int'l",
    image: "/images/traders/emeka_electronics.jpg",
  },
  {
    id: "textiles",
    label: "Fabrics & Lace",
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
  const handleQuickDemo = async () => {
    setErrorMessage(null);
    setIsDemoLoading(true);
    const res = await loginDemo("mama_chidi");
    if (res.success) {
      setSuccessMessage("Opening Mama Chidi's shop workspace…");
      setTimeout(() => {
        window.location.href = "/";
      }, 300);
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
        setTimeout(() => {
          window.location.href = "/";
        }, 300);
      } else {
        setErrorMessage(res.error || "Incorrect credentials. Try the demo shop below.");
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
        avatarUrl: avatarUrl || "/images/traders/mama_chidi.jpg",
      });
      if (res.success) {
        setSuccessMessage("Shop registered! Setting up your workspace…");
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
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
          HERO SECTION — Deep Emerald Gradient
      ═══════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#047857] flex-shrink-0 text-white">
        {/* Ambient light orbs */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-16 h-56 w-56 rounded-full bg-teal-300/15 blur-3xl" />

        <div className="relative px-4 sm:px-6 pt-10 pb-16 max-w-lg mx-auto">
          {/* Brand mark */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between gap-2.5 mb-5"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-inner">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-white font-black text-base tracking-tight leading-none block">MoniePay</span>
                <span className="text-emerald-200 text-[11px] font-semibold tracking-wide">Business OS</span>
              </div>
            </div>

            {/* Offline-ready indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-400/20 text-[10px] font-bold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Offline-Ready</span>
            </div>
          </motion.div>

          {/* Hero headline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55 }}
          >
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              Your shop.<br />
              <span className="text-emerald-300">Your money.</span><br />
              In your hands.
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xs font-medium">
              Built for Nigeria's market traders. Know what happened in your shop today.
            </p>
          </motion.div>

          {/* Real Market Trader Social Proof Stack */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55 }}
            className="mt-4 flex items-center gap-3 p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 max-w-sm"
          >
            <div className="flex -space-x-2 shrink-0">
              <img
                src="/images/traders/mama_chidi.jpg"
                alt="Mama Chidi"
                className="h-8 w-8 rounded-full object-cover border-2 border-emerald-800 shadow-xs"
              />
              <img
                src="/images/traders/alhaji_garba.jpg"
                alt="Alhaji Garba"
                className="h-8 w-8 rounded-full object-cover border-2 border-emerald-800 shadow-xs"
              />
              <img
                src="/images/traders/emeka_electronics.jpg"
                alt="Emeka Alaba"
                className="h-8 w-8 rounded-full object-cover border-2 border-emerald-800 shadow-xs"
              />
              <img
                src="/images/traders/blessing_fabrics.jpg"
                alt="Blessing Tejuosho"
                className="h-8 w-8 rounded-full object-cover border-2 border-emerald-800 shadow-xs"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-[10px] text-amber-300 font-black">
                <span>★★★★★</span>
                <span className="text-white">4.9/5</span>
              </div>
              <p className="text-[11px] font-bold text-emerald-100 truncate">
                14,000+ traders across Nigerian markets
              </p>
            </div>
          </motion.div>

          {/* Floating stat bubbles */}
          <div className="mt-4 flex flex-wrap gap-2">
            <StatBubble label="Today's Sales" value="₦340,500" color="bg-emerald-400" delay={0.25} />
            <StatBubble label="Customers Owe" value="₦85,000" color="bg-amber-400" delay={0.35} />
            <StatBubble label="Position" value="95 • Thriving" color="bg-teal-300" delay={0.45} />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          AUTH CARD — LOGIN / SIGNUP PORTAL
      ═══════════════════════════════════════════ */}
      <div className="relative -mt-6 flex-1 rounded-t-[32px] bg-slate-50 px-3.5 sm:px-5 pb-12">
        <div className="mx-auto max-w-md pt-5 space-y-4">
          {/* Pill drag handle */}
          <div className="flex justify-center">
            <div className="h-1 w-12 rounded-full bg-slate-300/80" />
          </div>

          {/* ── AUTH CARD ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="rounded-[28px] bg-white border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] overflow-hidden"
          >
            {/* Tab switcher */}
            <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-100">
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className={`py-3.5 text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
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
                className={`py-3.5 text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-white text-emerald-800 border-b-2 border-emerald-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Register Shop
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Status alerts */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold"
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
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ═════════════════════════════════════════════════════════
                    SIGNUP MODE: STRATEGIC STORE & PROFILE IMAGE UPLOAD
                ══════════════════════════════════════════════════════════ */}
                {mode === "register" && (
                  <div className="space-y-4">
                    {/* Strategically Positioned Store / Merchant Photo Card */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-50/30 border border-emerald-200/80">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <Store className="h-4 w-4 text-emerald-700" />
                          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950">
                            Your Market Store Photo
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-300">
                          {isCustomPhoto ? "Custom Photo Loaded" : "Live Store Preview"}
                        </span>
                      </div>

                      {/* Main Interactive Avatar Frame */}
                      <div className="flex items-center gap-3.5">
                        <div className="relative group shrink-0">
                          <div className="relative h-18 w-18 sm:h-20 sm:w-20 rounded-2xl overflow-hidden border-2 border-emerald-600 shadow-md bg-slate-100">
                            <img
                              src={avatarUrl}
                              alt="Your Market Store"
                              className="h-full w-full object-cover object-center transition-all group-hover:scale-105"
                            />
                            <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                          </div>

                          {/* Quick Camera Trigger */}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            title="Take or upload shop photo"
                            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-md border-2 border-white cursor-pointer active:scale-95 transition-all"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Upload Controls & Description */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div>
                            <p className="text-xs font-black text-slate-900 leading-tight">
                              Show yourself in your market stall
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">
                              This authenticates your shop for supplier credit and customer receipts.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Hidden file input supporting camera capture on mobile */}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              capture="user"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[10.5px] font-black shadow-xs active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <span>Take / Upload Photo</span>
                            </button>

                            {isCustomPhoto && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAvatarUrl("/images/traders/mama_chidi.jpg");
                                  setIsCustomPhoto(false);
                                }}
                                className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Nigerian Market Store Presets */}
                      <div className="mt-3 pt-2.5 border-t border-emerald-200/60">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block mb-1.5">
                          Or choose your market trade type:
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {MARKET_STALL_PRESETS.map((preset) => {
                            const isActive = avatarUrl === preset.image && !isCustomPhoto;
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => {
                                  setAvatarUrl(preset.image);
                                  setIsCustomPhoto(false);
                                }}
                                className={`p-1.5 rounded-xl flex items-center gap-2 text-left transition-all cursor-pointer ${
                                  isActive
                                    ? "bg-emerald-700 text-white shadow-xs font-bold ring-1 ring-emerald-500"
                                    : "bg-white/80 hover:bg-white text-slate-700 border border-emerald-200/60 text-[10.5px]"
                                }`}
                              >
                                <img
                                  src={preset.image}
                                  alt={preset.label}
                                  className="h-6 w-6 rounded-lg object-cover shrink-0"
                                />
                                <div className="min-w-0 truncate">
                                  <p className="text-[10px] font-black truncate leading-none">{preset.label}</p>
                                  <p className={`text-[8.5px] truncate mt-0.5 leading-none ${isActive ? "text-emerald-200" : "text-slate-400"}`}>
                                    {preset.market}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                        Your Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Chinedu Eze"
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                        />
                      </div>
                    </div>

                    {/* Shop Name */}
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                        Shop Name
                      </label>
                      <div className="relative">
                        <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. Eze Super Provisions"
                          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                        />
                      </div>
                    </div>

                    {/* Market Location */}
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                        Market Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={marketLocation}
                          onChange={(e) => setMarketLocation(e.target.value)}
                          placeholder="e.g. Shop 24, Balogun Market, Lagos"
                          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Email / Phone */}
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Email Address / Phone Number
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. mama@shop.ng or 08012345678"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isDemoLoading}
                  className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 mt-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  ) : (
                    <>
                      <span>{mode === "signin" ? "Open My Shop" : "Register Shop & Activate OS"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Tap Quick Demo for Testing */}
              {mode === "signin" && (
                <div className="pt-3 border-t border-slate-100 text-center">
                  <p className="text-[11px] text-slate-400 font-medium mb-2">Want to explore first without password?</p>
                  <button
                    type="button"
                    onClick={handleQuickDemo}
                    disabled={isDemoLoading || isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isDemoLoading ? (
                      <Loader2 className="h-3.5 w-3.5 text-slate-600 animate-spin" />
                    ) : (
                      <>
                        <img
                          src="/images/traders/mama_chidi.jpg"
                          alt="Mama Chidi"
                          className="h-4 w-4 rounded-full object-cover"
                        />
                        <span>Explore Mama Chidi's Demo Shop</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Privacy & offline security note */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-semibold text-center">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Encrypted • Operates seamlessly offline in busy markets</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
          <Loader2 className="h-6 w-6 text-emerald-700 animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  );
}

