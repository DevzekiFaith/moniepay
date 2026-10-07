"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Public Customer Rating & Verified QR Feedback Portal
// Clean, Fast, Mobile-First UI • Anti-Spam • Instant WhatsApp Sharing
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  ShieldCheck,
  Store,
  MapPin,
  ArrowRight,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Clock,
  Sparkles,
  AlertCircle,
  ThumbsUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MoniePayMark } from "@/components/ui/MoniePayLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  getVendor,
  submitReview,
  checkReviewCooldown,
  getVendorShareLinks,
} from "@/lib/reviews/vendorStore";

const PRAISE_TAGS = [
  "Original Goods Only",
  "Fair Market Price",
  "Accurate Measure / Derica",
  "Fast Transfer Confirmation",
  "Polite & Respectful",
  "Always Has Change",
  "Clean Stall",
  "Fast Packaging",
  "Quality Aso-Ebi",
  "100% Genuine Tech",
];

function CustomerRatingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const shopKey = searchParams?.get("shop") || "mama_chidi";
  const vendor = getVendor(shopKey);

  // Rating Form State
  const [overallScore, setOverallScore] = useState<number>(5);
  const [hoverScore, setHoverScore] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Original Goods Only",
    "Fast Transfer Confirmation",
  ]);
  const [comment, setComment] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedReviewId, setSubmittedReviewId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeStarRating = hoverScore !== null ? hoverScore : overallScore;

  // Check cooldown on load
  const [cooldownStatus, setCooldownStatus] = useState<{ canSubmit: boolean; message?: string }>({
    canSubmit: true,
  });

  useEffect(() => {
    const status = checkReviewCooldown(shopKey);
    setCooldownStatus(status);
  }, [shopKey]);

  const getStarLabel = (stars: number) => {
    switch (stars) {
      case 1:
        return "1.0 • Poor Service / Issue Dey";
      case 2:
        return "2.0 • Fair / Small Wahala";
      case 3:
        return "3.0 • Good / Standard Market Buy";
      case 4:
        return "4.0 • Very Good / Reliable Trader";
      case 5:
        return "5.0 • Top Notch / 100% Correct!";
      default:
        return "Tap star to rate";
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
      setErrorMsg("Please choose a star rating.");
      return;
    }

    setIsSubmitting(true);

    const result = submitReview({
      shopKey,
      rating: overallScore,
      comment: comment.trim(),
      tags: selectedTags,
      customerName: customerName.trim() || "Market Customer",
      customerPhone: customerPhone.trim(),
      isVerifiedCustomer: true, // QR interaction verified
    });

    if (result.success && result.review) {
      setSubmittedReviewId(result.review.id);
      setIsSubmitted(true);
    } else {
      setErrorMsg(result.error || "Failed to submit review. Please try again.");
    }
    setIsSubmitting(false);
  };

  const shareLinks = getVendorShareLinks(shopKey);

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(shareLinks.reviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf3fb] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between py-4 sm:py-8 px-3 sm:px-6 transition-colors">
      {/* ── HEADER ── */}
      <header className="w-full max-w-lg mx-auto flex items-center justify-between pb-4 px-1">
        <Link href={`/vendors/${shopKey}`} className="flex items-center gap-2 group cursor-pointer">
          <MoniePayMark size={36} />
          <div>
            <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              MoniePay
            </span>
            <span className="text-[10px] font-bold text-blue-600 dark:text-sky-400 block leading-none">
              Verified Trader Review
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href={`/vendors/${shopKey}`}
            className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-white/10 shadow-2xs active:scale-95 transition-all"
          >
            View Shop Profile
          </Link>
        </div>
      </header>

      {/* ── MAIN CARD CONTAINER ── */}
      <main className="w-full max-w-lg mx-auto my-auto py-2">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="rating-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              className="clay-card p-5 sm:p-7 space-y-5 bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-white/10 shadow-2xl rounded-[32px]"
            >
              {/* Vendor Profile Header Banner */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800">
                <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-slate-200 border border-white/80 dark:border-white/20 shrink-0 shadow-xs">
                  <img
                    src={vendor?.image || "/images/traders/mama_chidi.jpg"}
                    alt={vendor?.shopName || "Vendor"}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {vendor?.category || "Trader"}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-0.5">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </span>
                  </div>
                  <h1 className="text-base font-black text-slate-900 dark:text-white truncate">
                    {vendor?.shopName}
                  </h1>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                    <span>{vendor?.market}</span>
                  </p>
                </div>
              </div>

              {/* Notice Banner */}
              <div className="p-3 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 text-xs flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="font-medium text-[11.5px] leading-snug">
                  <strong>Verified QR Scan:</strong> Your review will appear publicly with a <strong>Verified Customer</strong> badge. Your phone number is kept 100% private.
                </p>
              </div>

              {/* Cooldown Warning if recently submitted */}
              {!cooldownStatus.canSubmit && (
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="font-medium text-[11.5px] leading-relaxed">
                    {cooldownStatus.message}
                  </p>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ── 1. STAR RATING SELECTOR ── */}
                <div className="text-center space-y-2 pt-1 pb-2">
                  <p className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    How was your market experience?
                  </p>

                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= activeStarRating;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setOverallScore(star)}
                          onMouseEnter={() => setHoverScore(star)}
                          onMouseLeave={() => setHoverScore(null)}
                          className="p-1 cursor-pointer active:scale-90 transition-transform focus:outline-none"
                          aria-label={`Rate ${star} star`}
                        >
                          <Star
                            className={`h-9 w-9 sm:h-10 sm:w-10 transition-colors ${
                              isFilled
                                ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                                : "text-slate-300 dark:text-slate-700"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="inline-block px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-black">
                    {getStarLabel(activeStarRating)}
                  </div>
                </div>

                {/* ── 2. PRAISE TAGS PILLS ── */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                    Wetin you like about this trader? (Tap tags)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRAISE_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? "bg-blue-600 dark:bg-blue-600 text-white border-blue-600 shadow-xs scale-100"
                              : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:border-blue-400"
                          }`}
                        >
                          {isSelected && "✓ "}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── 3. WRITTEN REVIEW / COMMENT ── */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                    Write small review (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="E.g. She give me correct derica measure, rice clean well well..."
                    className="w-full p-3 rounded-2xl clay-input text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none transition-all resize-none"
                  />
                </div>

                {/* ── 4. CUSTOMER NAME & PHONE ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="E.g. Chidinma Okafor"
                      className="w-full px-3 py-2.5 rounded-xl clay-input text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Phone Number</span>
                      <span className="text-[9.5px] text-slate-400 font-normal">Never shared publicly</span>
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="0803 123 4567"
                      className="w-full px-3 py-2.5 rounded-xl clay-input text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting || !cooldownStatus.canSubmit}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-black text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30 active:scale-98 transition-all disabled:opacity-60 mt-3"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Submit Verified Review</span>
                </button>
              </form>
            </motion.div>
          ) : (
            /* ── SUCCESS VIEW AFTER SUBMIT ── */
            <motion.div
              key="success-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="clay-card p-6 sm:p-8 text-center space-y-5 bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-white/10 shadow-2xl rounded-[32px]"
            >
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                  Review Published Live 🎉
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white pt-1">
                  Thank You for Supporting {vendor?.shopName}!
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium max-w-sm mx-auto leading-relaxed">
                  Your verified review helps fellow market shoppers discover honest traders and builds market trust.
                </p>
              </div>

              {/* Action Buttons: WhatsApp Share + View Profile + Map */}
              <div className="space-y-2.5 pt-2">
                <a
                  href={shareLinks.whatsappReviewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Share Review Link with Friends on WhatsApp</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="py-3 px-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Link Copied!" : "Copy Link"}</span>
                  </button>

                  <Link
                    href={`/vendors/${shopKey}`}
                    className="py-3 px-3 rounded-2xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-black flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                  >
                    <Store className="h-3.5 w-3.5" />
                    <span>View Shop</span>
                  </Link>
                </div>

                <Link
                  href={`/map?vendor=${shopKey}`}
                  className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-sky-400" />
                  <span>See {vendor?.shopName} on Market Map</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── FOOTER ── */}
      <footer className="w-full max-w-lg mx-auto text-center pt-4 pb-2 text-[10.5px] text-slate-400 dark:text-slate-500 font-medium">
        MoniePay Verified Review Network • Built for Nigerian Traders
      </footer>
    </div>
  );
}

export default function CustomerRatingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#edf3fb] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      }
    >
      <CustomerRatingContent />
    </React.Suspense>
  );
}
