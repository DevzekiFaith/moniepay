"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Public Business Profile & Verified Reviews Page
// Mobile-First • Rating Breakdown • Verified Customer Reviews • Directions
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  MapPin,
  Phone,
  MessageCircle,
  Share2,
  Copy,
  Check,
  Store,
  Clock,
  ThumbsUp,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  QrCode,
} from "lucide-react";
import { motion } from "framer-motion";
import { MoniePayMark } from "@/components/ui/MoniePayLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  getVendor,
  getVendorReviews,
  calculateVendorStats,
  getVendorShareLinks,
  CustomerReview,
} from "@/lib/reviews/vendorStore";

export default function PublicVendorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = (params?.id as string) || "mama_chidi";
  const vendor = getVendor(vendorId);

  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [stats, setStats] = useState(calculateVendorStats(vendorId));
  const [copied, setCopied] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    if (vendorId) {
      setReviews(getVendorReviews(vendorId));
      setStats(calculateVendorStats(vendorId));
    }
  }, [vendorId]);

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#edf3fb] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Store className="h-12 w-12 text-slate-400 mb-2" />
        <h1 className="text-lg font-black">Shop Not Found</h1>
        <p className="text-xs text-slate-500 mb-4">This vendor profile does not exist or has moved.</p>
        <Link
          href="/map"
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
        >
          Explore Market Map
        </Link>
      </div>
    );
  }

  const shareLinks = getVendorShareLinks(vendorId);

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(shareLinks.profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredReviews = filterRating
    ? reviews.filter((r) => Math.round(r.rating) === filterRating)
    : reviews;

  return (
    <div className="min-h-screen bg-[#edf3fb] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors">
      {/* ── TOP NAVIGATION BAR ── */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link
            href="/map"
            className="flex items-center gap-1.5 text-xs font-black text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Market Map</span>
          </Link>

          <Link href="/" className="flex items-center gap-1.5">
            <MoniePayMark size={28} />
            <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white">
              MoniePay
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer active:scale-95 transition-all"
              title="Copy Profile Link"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* ── 1. VENDOR HERO CARD ── */}
        <div className="clay-card p-5 space-y-4 bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-white/10 shadow-xl rounded-[28px] relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            {/* Avatar & Verified Badge */}
            <div className="relative h-20 w-20 sm:h-22 sm:w-22 rounded-3xl overflow-hidden bg-slate-200 border-2 border-white dark:border-slate-800 shrink-0 shadow-md">
              <img
                src={vendor.image}
                alt={vendor.shopName}
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </div>

            {/* Shop Details */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-0.5">
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-black uppercase tracking-wide">
                  {vendor.category}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Trader
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {vendor.shopName}
              </h1>

              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Managed by <strong>{vendor.name}</strong> • Code: {vendor.code}
              </p>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center justify-center sm:justify-start gap-1 pt-0.5">
                <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
                <span>{vendor.market}</span>
              </p>
            </div>
          </div>

          {/* Quick Contact & Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
            <Link
              href={`/rate?shop=${vendor.id}`}
              className="py-2.5 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-center"
            >
              <Star className="h-3.5 w-3.5 fill-white text-white" />
              <span>Leave Review</span>
            </Link>

            <Link
              href={`/map?vendor=${vendor.id}`}
              className="py-2.5 px-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all text-center"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Map & Directions</span>
            </Link>

            <a
              href={`https://wa.me/${vendor.whatsapp}?text=Hello%20${encodeURIComponent(vendor.name)}!%20I%20found%20your%20shop%20on%20MoniePay.`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all text-center"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            <a
              href={`tel:${vendor.phone.replace(/\s+/g, "")}`}
              className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all text-center"
            >
              <Phone className="h-3.5 w-3.5 text-blue-600" />
              <span>Call Shop</span>
            </a>
          </div>
        </div>

        {/* ── 2. RATING SUMMARY & SCORE BREAKDOWN ── */}
        <div className="clay-card p-5 space-y-4 bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-white/10 shadow-lg rounded-[28px]">
          <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
            {/* Big Score Box */}
            <div className="text-center sm:text-left flex items-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-white flex flex-col items-center justify-center shadow-md">
                <span className="text-2xl font-black leading-none">{stats.average}</span>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-2.5 w-2.5 fill-white text-white" />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  Verified Trader Score
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Based on <strong>{stats.total} verified</strong> customer reviews
                </p>
              </div>
            </div>

            {/* Star Distribution Bars */}
            <div className="w-full sm:w-48 space-y-1 text-xs">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.breakdown[star] || 0;
                const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                const isSelected = filterRating === star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFilterRating(isSelected ? null : star)}
                    className={`w-full flex items-center gap-2 py-0.5 px-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                      isSelected ? "ring-1 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/40" : ""
                    }`}
                  >
                    <span className="w-3 text-right font-bold text-slate-600 dark:text-slate-400 text-[11px]">
                      {star}
                    </span>
                    <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400 shrink-0" />
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-4 text-right text-[10.5px] text-slate-400">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Top Praise Tags */}
          {stats.topTags.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-1.5">
              <p className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                What Customers Love Most:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {stats.topTags.map(({ tag, count }) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-bold"
                  >
                    ⭐ {tag} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── 3. LOCATION & DIRECTIONS CARD ── */}
        <div className="clay-card p-4 space-y-2.5 bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-white/10 shadow-sm rounded-[24px]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-sky-400" />
              Confirmed Stall Address
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              {vendor.openingHours}
            </span>
          </div>

          <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
            {vendor.fullAddress}
          </p>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 text-[11px] text-slate-600 dark:text-slate-300">
            <strong>Landmark:</strong> {vendor.landmark}
          </div>

          <div className="flex gap-2 pt-1">
            <Link
              href={`/map?vendor=${vendor.id}`}
              className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span>View On MoniePay Map</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${vendor.coordinates.lat},${vendor.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
            >
              <span>Google Maps</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* ── 4. CUSTOMER REVIEWS LIST ── */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              Customer Reviews ({filteredReviews.length})
            </h2>

            {filterRating && (
              <button
                type="button"
                onClick={() => setFilterRating(null)}
                className="text-[11px] font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                Clear Filter ({filterRating} ★)
              </button>
            )}
          </div>

          {filteredReviews.length === 0 ? (
            <div className="clay-card p-6 text-center space-y-2 bg-white/80 dark:bg-slate-900/80 rounded-[24px]">
              <p className="text-xs text-slate-500 dark:text-slate-400">No reviews found for this rating filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="clay-card p-4 space-y-2.5 bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-white/10 shadow-xs rounded-[24px]"
                >
                  {/* Review Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-xs">
                        {rev.customerName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {rev.customerName}
                          </span>
                          {rev.isVerifiedCustomer && (
                            <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-black inline-flex items-center gap-0.5">
                              <ShieldCheck className="h-2.5 w-2.5" />
                              Verified Customer
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {new Date(rev.createdAt).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-black text-xs border border-amber-200/80 dark:border-amber-800">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{rev.rating}.0</span>
                    </div>
                  </div>

                  {/* Praise Tags */}
                  {rev.tags && rev.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rev.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9.5px] font-semibold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Comment */}
                  {rev.comment && (
                    <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed pt-0.5">
                      "{rev.comment}"
                    </p>
                  )}

                  {/* Merchant Official Reply */}
                  {rev.reply && (
                    <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/50 border border-blue-200/70 dark:border-blue-800 space-y-1 mt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-black text-blue-900 dark:text-blue-200 flex items-center gap-1">
                          <Store className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          <span>{rev.reply.authorName}</span>
                        </span>
                        <span className="text-[9px] text-blue-600 dark:text-blue-400 font-medium">
                          {new Date(rev.reply.createdAt).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-blue-950 dark:text-blue-100 font-medium leading-relaxed">
                        {rev.reply.text}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
