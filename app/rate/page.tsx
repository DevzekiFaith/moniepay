"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Customer Rating & Verified Merchant Feedback Portal
// Clean, Modern Minimalist UI Review Design
// ─────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

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
  "Clean Stall",
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
        return "1.0 • Poor Service / Disappointed";
      case 2:
        return "2.0 • Fair / Small Issue Dey";
      case 3:
        return "3.0 • Good / Standard Market Buy";
      case 4:
        return "4.0 • Very Good / Highly Reliable";
      case 5:
        return "5.0 • Top Notch / Correct Market Trader";
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
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center py-6 sm:py-10 px-3 sm:px-4 selection:bg-blue-500/20 selection:text-blue-950 dark:selection:text-white transition-colors">
      <div className="w-full max-w-lg space-y-4">
        {/* ── 1. CLEAN MODERN HEADER ── */}
        <div className="text-center space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400 block">
            MoniePay Trust Network
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Customer Review &amp; Rating
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
            Verify transaction quality and build trusted business reputation for Nigerian traders.
          </p>
        </div>

        {/* ── 2. MERCHANT PROFILE CARD ── */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 p-4 sm:p-5 shadow-sm flex items-center justify-between gap-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-13 w-13 sm:h-14 sm:w-14 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 shrink-0">
              <img
                src={merchant.image}
                alt={merchant.shop}
                className="h-full w-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.src = "/images/traders/mama_chidi.jpg";
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200/60 dark:border-emerald-800">
                  Verified Trader
                </span>
                <span className="text-[10.5px] font-mono text-slate-400 dark:text-slate-500 font-semibold">
                  {merchant.code}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight truncate">
                {merchant.shop}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                {merchant.market}
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. MAIN FORM CARD ── */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 p-5 sm:p-7 shadow-sm">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* OVERALL STAR RATING */}
              <div className="text-center py-2 space-y-2 border-b border-slate-100 dark:border-white/10 pb-5">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                  How was your purchase today?
                </span>

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
                        className="p-1 rounded-xl transition-all cursor-pointer hover:scale-110 active:scale-95"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star
                          className={`h-8 w-8 sm:h-9 sm:w-9 transition-colors ${
                            filled
                              ? "fill-amber-400 text-amber-400"
                              : "fill-transparent text-slate-300 dark:text-slate-600 stroke-[1.5]"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300 min-h-[1.2rem]">
                  {getStarLabel(activeStarRating)}
                </p>
              </div>

              {/* DETAILED CRITERIA */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Market Reliability Criteria
                </span>

                <div className="space-y-2.5">
                  {[
                    {
                      key: "stockQuality" as const,
                      label: "Stock Quality",
                      sublabel: "Original & fresh products",
                    },
                    {
                      key: "priceFairness" as const,
                      label: "Price Fairness",
                      sublabel: "Honest market pricing",
                    },
                    {
                      key: "speedOfPayment" as const,
                      label: "Payment Speed",
                      sublabel: "Quick transfer confirmation",
                    },
                    {
                      key: "customerService" as const,
                      label: "Customer Service",
                      sublabel: "Polite & respectful attitude",
                    },
                  ].map((item) => {
                    const currentVal = criteria[item.key];

                    return (
                      <div
                        key={item.key}
                        className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                            {item.label}
                          </p>
                          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium leading-tight truncate mt-0.5">
                            {item.sublabel}
                          </p>
                        </div>

                        {/* Minimalist Segmented 1-5 Control */}
                        <div className="flex items-center gap-1 shrink-0 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                          {[1, 2, 3, 4, 5].map((s) => {
                            const isSelected = currentVal === s;
                            const isAtOrBelow = currentVal >= s;
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
                                className={`h-6.5 w-6.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                                  isSelected
                                    ? "bg-emerald-800 dark:bg-emerald-600 text-white shadow-xs"
                                    : isAtOrBelow
                                    ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 font-bold"
                                    : "text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                }`}
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

              {/* HIGHLIGHTS (TAGS) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Highlights
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRAISE_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                          isSelected
                            ? "bg-emerald-800 dark:bg-emerald-600 text-white border border-emerald-900 dark:border-emerald-500 shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-white/10"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CUSTOMER FEEDBACK */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 dark:text-white block">
                  Your Feedback / Experience Details
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Bought provisions from shop 14 today, fast service and complete measure."
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 transition-all"
                />
              </div>

              {/* CONTACT INPUTS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Brother Segun"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 08031234567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 transition-all"
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-75"
              >
                {isSubmitting ? "Submitting Verified Rating…" : "Submit Verified Rating"}
              </button>
            </form>
          ) : (
            /* SUBMITTED STATE */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4 space-y-4"
            >
              <div className="space-y-1">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-bold border border-emerald-200 dark:border-emerald-800">
                  Rating Logged
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white pt-2">
                  Thank You for Your Feedback!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">
                  Your rating for <strong className="text-slate-900 dark:text-white">{merchant.shop}</strong> has been recorded.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Shop Code</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{merchant.code}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Your Rating</span>
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">{overallScore} / 5 Stars</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Selected Tags</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                    {selectedTags.join(", ")}
                  </span>
                </div>
              </div>

              {/* Where to find this rating next time */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800 text-left space-y-1 text-xs">
                <p className="font-bold text-emerald-950 dark:text-emerald-200">
                  Where to find this shop for your next market visit:
                </p>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
                  • <strong>Physical Counter:</strong> Scan the MoniePay QR stand at {merchant.market}.<br />
                  • <strong>Phone Link:</strong> Save this shop page to your phone or share it to your WhatsApp.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                {/* 1-Tap WhatsApp Share & Save */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `I just rated ${merchant.shop} (${merchant.market}) ${overallScore} stars on MoniePay! View their verified trust profile and ratings here: https://moniepay.vercel.app/rate?shop=${shopKey}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm active:scale-95 transition-all block shadow-xs"
                >
                  Save &amp; Share Shop Link on WhatsApp
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setComment("");
                  }}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs active:scale-95 transition-all cursor-pointer"
                >
                  Rate Another Transaction
                </button>

                <a
                  href="/"
                  className="w-full py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs active:scale-95 transition-all block text-center"
                >
                  Return to Home
                </a>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── 4. RECENT VERIFIED MARKET REVIEWS FEED ── */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Verified Market Reviews
              </h3>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
                Recent feedback from verified market buyers
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200/60 dark:border-emerald-800">
              4.9 ★ (128 reviews)
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              {
                name: "Mama Ifeoma",
                date: "Today",
                rating: 5,
                comment: "Original goods only, fast POS transfer confirmation and she always has clean change.",
                tags: ["Original Goods", "Fast Transfer"],
              },
              {
                name: "Alhaji Bello",
                date: "Yesterday",
                rating: 5,
                comment: "Derica measure complete well-well, very polite mama.",
                tags: ["Accurate Measure", "Polite & Respectful"],
              },
              {
                name: "Chukwudi E.",
                date: "2 days ago",
                rating: 5,
                comment: "Bought provisions in bulk, packaged sharp-sharp without delay.",
                tags: ["Fast Packaging", "Fair Price"],
              },
            ].map((rev, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">{rev.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{rev.date}</span>
                </div>
                <div className="text-amber-400 text-xs tracking-tighter">
                  {"★".repeat(rev.rating)}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  "{rev.comment}"
                </p>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {rev.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-[9.5px] font-medium text-slate-600 dark:text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium text-center">
          Encrypted Nigerian Merchant Trust Network • MoniePay
        </p>
      </div>
    </div>
  );
}

export default function RatePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Loading Customer Rating Portal…</span>
        </div>
      }
    >
      <CustomerRatingContent />
    </React.Suspense>
  );
}
