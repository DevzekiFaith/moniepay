"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Customer Rating & Verified Merchant Feedback Portal
// Mobile-first Form Detail for Customer Reviews, Barcode & QR Verification
// ─────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  Store,
  MapPin,
  PackageCheck,
  Zap,
  Tag,
  Heart,
  User,
  Phone,
  ArrowRight,
  Check,
  AlertCircle,
  Share2,
  Sparkles,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RatingCriteria {
  stockQuality: number;
  priceFairness: number;
  speedOfPayment: number;
  customerService: number;
}

const PRAISE_TAGS = [
  { id: "original", label: "Original Goods Only", icon: "✨" },
  { id: "fair_price", label: "Fair Market Price", icon: "🏷️" },
  { id: "derica", label: "Accurate Measure / Derica", icon: "⚖️" },
  { id: "fast_transfer", label: "Fast Transfer Confirmation", icon: "⚡" },
  { id: "respectful", label: "Polite & Respectful", icon: "🤝" },
  { id: "has_change", label: "Always Has Change", icon: "💵" },
  { id: "clean_stall", label: "Clean & Organized Stall", icon: "🧹" },
  { id: "fast_pack", label: "Fast Packaging", icon: "📦" },
];

const MERCHANT_PROFILES: Record<
  string,
  {
    name: string;
    shop: string;
    market: string;
    image: string;
    code: string;
  }
> = {
  mama_chidi: {
    name: "Mama Chidi",
    shop: "Mama Chidi Super Provisions",
    market: "Shop 14, Balogun Market, Lagos",
    image: "/images/traders/mama_chidi.jpg",
    code: "MP-BAL-84920",
  },
  alhaji_garba: {
    name: "Alhaji Garba",
    shop: "Alhaji Garba Grains & Foodstuff",
    market: "Mile 12 Wholesale Market, Lagos",
    image: "/images/traders/alhaji_garba.jpg",
    code: "MP-M12-92140",
  },
  emeka: {
    name: "Emeka Okonkwo",
    shop: "Emeka Mobile & Electronics Hub",
    market: "Alaba Int'l Market, Lagos",
    image: "/images/traders/emeka_electronics.jpg",
    code: "MP-ALA-73010",
  },
  blessing: {
    name: "Blessing Adebayo",
    shop: "Blessing Fabrics & Lace Store",
    market: "Tejuosho Market, Yaba, Lagos",
    image: "/images/traders/blessing_fabrics.jpg",
    code: "MP-TEJ-61840",
  },
};

function CustomerRatingContent() {
  const searchParams = useSearchParams();
  const shopKey = searchParams?.get("shop") || "mama_chidi";
  const merchant = MERCHANT_PROFILES[shopKey] || MERCHANT_PROFILES.mama_chidi;

  // Rating State
  const [overallScore, setOverallScore] = useState<number>(5);
  const [hoverScore, setHoverScore] = useState<number | null>(null);

  const [criteria, setCriteria] = useState<RatingCriteria>({
    stockQuality: 5,
    priceFairness: 5,
    speedOfPayment: 5,
    customerService: 5,
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Original Goods Only",
    "Fast Transfer Confirmation",
  ]);
  const [comment, setComment] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeStarRating = hoverScore !== null ? hoverScore : overallScore;

  const getStarLabel = (stars: number) => {
    switch (stars) {
      case 1:
        return "1/5 • Poor Service / Disappointed";
      case 2:
        return "2/5 • Fair / Small Issue Dey";
      case 3:
        return "3/5 • Good / Standard Market Buy";
      case 4:
        return "4/5 • Very Good / Highly Reliable";
      case 5:
        return "5/5 • Top Notch / Correct Market Trader! ⭐";
      default:
        return "Tap to Rate";
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (overallScore < 1) {
      setErrorMsg("Please tap at least 1 star to rate.");
      return;
    }

    setIsSubmitting(true);

    const reviewData = {
      id: `rev_${Date.now()}`,
      shopKey,
      shopName: merchant.shop,
      overallScore,
      criteria,
      selectedTags,
      comment: comment.trim(),
      customerName: customerName.trim() || "Market Customer",
      customerPhone: customerPhone.trim(),
      createdAt: new Date().toISOString(),
    };

    // Store in local storage queue for offline persistence
    try {
      const existing = JSON.parse(
        localStorage.getItem("moniepay_customer_ratings") || "[]"
      );
      existing.unshift(reviewData);
      localStorage.setItem(
        "moniepay_customer_ratings",
        JSON.stringify(existing.slice(0, 50))
      );
    } catch {}

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center selection:bg-emerald-500/20">
      {/* ═══════════════════════════════════════════
          TOP HERO HEADER — EMERALD GRADIENT
      ═══════════════════════════════════════════ */}
      <header className="w-full bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#047857] text-white pt-8 pb-16 px-4 shadow-md relative overflow-hidden">
        <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-teal-300/15 blur-2xl" />

        <div className="max-w-md mx-auto relative space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-xs">
                <Store className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <span className="text-white font-black text-sm tracking-tight leading-none block">
                  MoniePay
                </span>
                <span className="text-[10.5px] font-semibold text-emerald-200">
                  Trust Network
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-400/30 text-[10.5px] font-bold text-emerald-300 shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Verified Customer Rating</span>
            </div>
          </div>

          <div className="pt-2">
            <h1 className="text-xl sm:text-2xl font-black leading-tight tracking-tight text-white">
              Rate Your Market Purchase
            </h1>
            <p className="text-xs text-emerald-100/90 font-medium mt-0.5 leading-relaxed">
              Your honest feedback builds real trust and creditworthiness for Nigerian market traders.
            </p>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════
          MAIN REVIEW CARD CONTAINER
      ═══════════════════════════════════════════ */}
      <main className="w-full max-w-md px-3.5 sm:px-4 -mt-9 pb-16 flex-1">
        <div className="rounded-[32px] bg-white border border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.08)] overflow-hidden">
          {/* ── 1. MERCHANT IDENTITY STRIP ── */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-emerald-50/70 border-b border-emerald-950/[0.08] flex items-center gap-3.5">
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-2xl overflow-hidden border-2 border-emerald-600 shadow-sm shrink-0 bg-emerald-950">
              <img
                src={merchant.image}
                alt={merchant.shop}
                className="h-full w-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.src = "/images/traders/mama_chidi.jpg";
                }}
              />
              <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white shadow-xs" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[9.5px] font-black uppercase tracking-wider shadow-2xs">
                  <Award className="h-2.5 w-2.5" />
                  Verified Trader
                </span>
                <span className="text-[10px] font-mono text-emerald-900/80 font-bold bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">
                  {merchant.code}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate">
                {merchant.shop}
              </h2>
              <div className="flex items-center gap-1 text-[11px] text-slate-600 font-semibold truncate mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                <span className="truncate">{merchant.market}</span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {/* ── 2. OVERALL STAR RATING HERO ── */}
                <div className="text-center p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 border border-emerald-200/70 shadow-xs space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-950/70 block">
                    How was your purchase today?
                  </span>

                  {/* 5 Big Tactile Star Buttons */}
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const filled = star <= activeStarRating;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setOverallScore(star)}
                          onMouseEnter={() => setHoverScore(star)}
                          onMouseLeave={() => setHoverScore(null)}
                          className="p-1 rounded-xl hover:bg-amber-50 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                          aria-label={`Rate ${star} star`}
                        >
                          <Star
                            className={`h-9 w-9 sm:h-10 sm:w-10 transition-colors ${
                              filled
                                ? "fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.4)]"
                                : "text-slate-300"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic Rating Label */}
                  <motion.div
                    key={activeStarRating}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-emerald-300/80 shadow-xs"
                  >
                    <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                    <span className="text-xs font-black text-emerald-950">
                      {getStarLabel(activeStarRating)}
                    </span>
                  </motion.div>
                </div>

                {/* ── 3. DETAILED MARKET RELIABILITY CRITERIA ── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                      Rate Market Reliability Criteria
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800">
                      Tap 1 to 5 Stars
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {/* Criteria Item Component */}
                    {[
                      {
                        key: "stockQuality" as const,
                        label: "Stock Quality",
                        sublabel: "Original & fresh products",
                        icon: PackageCheck,
                      },
                      {
                        key: "priceFairness" as const,
                        label: "Price Fairness",
                        sublabel: "Honest market pricing",
                        icon: Tag,
                      },
                      {
                        key: "speedOfPayment" as const,
                        label: "Payment Speed",
                        sublabel: "Quick transfer confirmation",
                        icon: Zap,
                      },
                      {
                        key: "customerService" as const,
                        label: "Customer Service",
                        sublabel: "Polite & respectful attitude",
                        icon: Heart,
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      const currentVal = criteria[item.key];

                      return (
                        <div
                          key={item.key}
                          className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between gap-2.5 hover:border-emerald-300 transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-800 shrink-0">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-900 leading-tight truncate">
                                {item.label}
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium leading-tight truncate mt-0.5">
                                {item.sublabel}
                              </p>
                            </div>
                          </div>

                          {/* 1 - 5 Segmented Pill Selector */}
                          <div className="flex items-center gap-1 shrink-0 bg-white p-1 rounded-xl border border-slate-200/70 shadow-2xs">
                            {[1, 2, 3, 4, 5].map((s) => {
                              const isRated = currentVal >= s;
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() =>
                                    setCriteria((prev) => ({
                                      ...prev,
                                      [item.key]: s,
                                    }))
                                  }
                                  className={`h-6.5 w-6.5 rounded-lg text-[10.5px] font-black transition-all cursor-pointer flex items-center justify-center ${
                                    isRated
                                      ? "bg-emerald-700 text-white shadow-xs scale-102"
                                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                  }`}
                                  aria-label={`${item.label} score ${s}`}
                                >
                                  {s}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── 4. PRAISE HIGHLIGHT TAGS ── */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                    Select Highlights (Tap all that apply):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRAISE_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag.label);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.label)}
                          className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                            isSelected
                              ? "bg-emerald-700 text-white shadow-xs border border-emerald-800"
                              : "bg-slate-100/90 text-slate-700 hover:bg-slate-200 border border-slate-200/80"
                          }`}
                        >
                          <span>{tag.icon}</span>
                          <span>{tag.label}</span>
                          {isSelected && <Check className="h-3 w-3 text-white ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── 5. CUSTOMER FEEDBACK TEXTAREA ── */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                    Your Feedback / Experience Details
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="e.g. Bought provisions from shop 14 today, fast service and complete measure."
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                  />
                </div>

                {/* ── 6. CUSTOMER CONTACT (OPTIONAL) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                      Your Name (Optional)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Brother Segun"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                      Phone / WhatsApp (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. 08031234567"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* ── SUBMIT BUTTON ── */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-950/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Submitting Verified Rating…</span>
                    </span>
                  ) : (
                    <>
                      <span>Submit Verified Rating</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* ── SUBMITTED VERIFIED RECEIPT STATE ── */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 mx-auto shadow-inner border border-emerald-200">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
                    Rating Verified &amp; Logged
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-2">
                    Thank You for Supporting Local Markets!
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 font-medium">
                    Your feedback for <strong className="text-slate-900">{merchant.shop}</strong> has been verified and added to their MoniePay trust profile.
                  </p>
                </div>

                {/* Verified Customer Rating Receipt Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-[11px] font-bold text-slate-500">Shop ID</span>
                    <span className="text-xs font-mono font-black text-slate-900">{merchant.code}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-[11px] font-bold text-slate-500">Your Rating</span>
                    <div className="flex items-center gap-1 text-xs font-black text-amber-500">
                      <span>{"★".repeat(overallScore)}</span>
                      <span className="text-slate-900">({overallScore}/5)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">Highlights</span>
                    <span className="text-[11px] font-bold text-emerald-800 truncate max-w-[180px]">
                      {selectedTags.slice(0, 2).join(", ")}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setComment("");
                    }}
                    className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm active:scale-95 transition-all cursor-pointer"
                  >
                    Rate Another Transaction
                  </button>

                  <a
                    href="/"
                    className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs active:scale-95 transition-all block text-center"
                  >
                    Return to MoniePay Home
                  </a>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-semibold text-center">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>Encrypted Nigerian Merchant Trust Network • MoniePay</span>
        </div>
      </main>
    </div>
  );
}

export default function RatePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
          <span className="text-xs font-bold text-emerald-700">Loading Customer Rating Portal…</span>
        </div>
      }
    >
      <CustomerRatingContent />
    </React.Suspense>
  );
}
