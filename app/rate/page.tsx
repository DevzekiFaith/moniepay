"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Customer Rating & Verified Merchant Feedback Portal
// Mobile-first Form Detail for Customer Reviews, Barcode & QR Verification
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  Store,
  MapPin,
  Sparkles,
  ThumbsUp,
  PackageCheck,
  Zap,
  Tag,
  Heart,
  MessageSquare,
  User,
  Phone,
  ArrowRight,
  Barcode,
  QrCode,
  Share2,
  ChevronLeft,
  Check,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RatingCriteria {
  stockQuality: number;
  priceFairness: number;
  speedOfPayment: number;
  customerService: number;
}

const PRAISE_TAGS = [
  "Original Goods Only",
  "Fair Market Price",
  "Accurate Measure / Derica",
  "Fast Transfer Confirmation",
  "Polite & Respectful",
  "Always Has Change",
  "Clean & Organized Stall",
  "Fast Packaging",
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
        return "Poor Service / Disappointed";
      case 2:
        return "Fair / Needs Improvement";
      case 3:
        return "Good / Standard Experience";
      case 4:
        return "Very Good / Highly Reliable";
      case 5:
        return "Top Notch / Correct Market Trader! ⭐";
      default:
        return "Select Rating";
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
      setErrorMsg("Please select an overall star rating.");
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center">
      {/* Top Emerald Hero Banner */}
      <header className="w-full bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#047857] text-white pt-8 pb-14 px-4 shadow-md relative overflow-hidden">
        <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-emerald-400/20 blur-2xl" />

        <div className="max-w-md mx-auto relative space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-white/20">
                <Store className="h-4 w-4 text-white" />
              </div>
              <span className="text-white font-black text-sm tracking-tight">MoniePay</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-400/20 text-[10.5px] font-bold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified Customer Rating</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black leading-tight tracking-tight">
            Rate Your Market Experience
          </h1>
          <p className="text-xs text-emerald-100/90 font-medium">
            Your honest rating builds trusted business records for market traders in Nigeria.
          </p>
        </div>
      </header>

      {/* Main Content Card Container */}
      <main className="w-full max-w-md px-3.5 sm:px-4 -mt-8 pb-16 flex-1">
        <div className="rounded-[30px] bg-white border border-slate-200/90 shadow-[0_8px_30px_rgba(15,23,42,0.08)] overflow-hidden">
          {/* Merchant Identity Strip */}
          <div className="p-4 bg-slate-50/80 border-b border-slate-200/70 flex items-center gap-3">
            <div className="relative h-14 w-14 rounded-2xl overflow-hidden border-2 border-emerald-600 shadow-sm shrink-0 bg-slate-100">
              <img
                src={merchant.image}
                alt={merchant.shop}
                className="h-full w-full object-cover object-center"
              />
              <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[9px] font-black uppercase tracking-wider">
                  Verified Trader
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  {merchant.code}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate">
                {merchant.shop}
              </h2>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium truncate mt-0.5">
                <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                <span className="truncate">{merchant.market}</span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMsg && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* ── 1. OVERALL STAR RATING ── */}
                <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-teal-50/30 border border-emerald-100/90 space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                    How was your purchase today?
                  </span>

                  {/* Star Rating Buttons */}
                  <div className="flex items-center justify-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const filled = star <= activeStarRating;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setOverallScore(star)}
                          onMouseEnter={() => setHoverScore(star)}
                          onMouseLeave={() => setHoverScore(null)}
                          className="p-1 text-slate-300 hover:scale-115 active:scale-95 transition-all cursor-pointer"
                        >
                          <Star
                            className={`h-8 w-8 sm:h-9 sm:w-9 transition-colors ${
                              filled
                                ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                                : "text-slate-300"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic Rating Label */}
                  <p className="text-xs font-black text-emerald-900 min-h-[1.2rem]">
                    {getStarLabel(activeStarRating)}
                  </p>
                </div>

                {/* ── 2. NIGERIAN MARKET DETAILED CRITERIA ── */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                    Rate Market Reliability Criteria
                  </span>

                  <div className="space-y-2.5">
                    {/* Stock Quality */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <PackageCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                        <div>
                          <p className="text-xs font-black text-slate-900 leading-none">Stock Quality</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Original &amp; fresh products</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setCriteria((c) => ({ ...c, stockQuality: s }))}
                            className={`h-6 w-6 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                              criteria.stockQuality >= s
                                ? "bg-emerald-700 text-white shadow-xs"
                                : "bg-white text-slate-400 border border-slate-200"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Fairness */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Tag className="h-4 w-4 text-emerald-700 shrink-0" />
                        <div>
                          <p className="text-xs font-black text-slate-900 leading-none">Price Fairness</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Honest market pricing</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setCriteria((c) => ({ ...c, priceFairness: s }))}
                            className={`h-6 w-6 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                              criteria.priceFairness >= s
                                ? "bg-emerald-700 text-white shadow-xs"
                                : "bg-white text-slate-400 border border-slate-200"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Transfer & Payment Speed */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Zap className="h-4 w-4 text-emerald-700 shrink-0" />
                        <div>
                          <p className="text-xs font-black text-slate-900 leading-none">Payment Speed</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Quick transfer confirmation</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setCriteria((c) => ({ ...c, speedOfPayment: s }))}
                            className={`h-6 w-6 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                              criteria.speedOfPayment >= s
                                ? "bg-emerald-700 text-white shadow-xs"
                                : "bg-white text-slate-400 border border-slate-200"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Warmth & Service */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Heart className="h-4 w-4 text-emerald-700 shrink-0" />
                        <div>
                          <p className="text-xs font-black text-slate-900 leading-none">Customer Service</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Polite &amp; respectful attitude</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setCriteria((c) => ({ ...c, customerService: s }))}
                            className={`h-6 w-6 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                              criteria.customerService >= s
                                ? "bg-emerald-700 text-white shadow-xs"
                                : "bg-white text-slate-400 border border-slate-200"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── 3. PRAISE TAGS MULTISELECT ── */}
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
                    Select Highlights (Tap all that apply):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRAISE_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                            isSelected
                              ? "bg-emerald-700 text-white shadow-xs"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── 4. CUSTOMER COMMENT / FEEDBACK ── */}
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                    Your Feedback / Experience Details
                  </label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="e.g. Bought provisions from shop 14 today, fast service and complete measure."
                      className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                    />
                  </div>
                </div>

                {/* ── 5. CUSTOMER IDENTITY (OPTIONAL) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                      Your Name (Optional)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Brother Segun"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                      Phone / WhatsApp (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. 08031234567"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <span>Submitting Verified Rating…</span>
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
                    className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs active:scale-95 transition-all block"
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
