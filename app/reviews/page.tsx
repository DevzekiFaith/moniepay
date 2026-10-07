"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Vendor Review Management Portal (Business Dashboard)
// Vendor Reply Flow • Report & Admin Moderation Queue • 1-Tap Share Bar
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  MessageCircle,
  Share2,
  Copy,
  Check,
  Store,
  Printer,
  QrCode,
  Reply,
  Flag,
  AlertTriangle,
  EyeOff,
  Eye,
  CheckCircle2,
  Send,
  X,
  ChevronLeft,
  Search,
  Filter,
  ExternalLink,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MoniePayMark } from "@/components/ui/MoniePayLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MerchantRatingStand } from "@/components/rating/MerchantRatingStand";
import { useAuth } from "@/context/AuthContext";
import {
  getVendor,
  getVendorReviews,
  calculateVendorStats,
  addVendorReply,
  reportReview,
  moderateReviewAction,
  getVendorShareLinks,
  CustomerReview,
} from "@/lib/reviews/vendorStore";

export default function VendorReviewsManagementPage() {
  const { user } = useAuth();
  // Map current authenticated trader or default to mama_chidi
  const shopKey = "mama_chidi";
  const vendor = getVendor(shopKey);

  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [stats, setStats] = useState(calculateVendorStats(shopKey));
  const [copied, setCopied] = useState(false);
  const [showQrStandModal, setShowQrStandModal] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // Reply Modal State
  const [replyingReview, setReplyingReview] = useState<CustomerReview | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // Report Modal State
  const [reportingReview, setReportingReview] = useState<CustomerReview | null>(null);
  const [reportReason, setReportReason] = useState("Spam / Bot Review");
  const [reportNote, setReportNote] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  // Admin Moderation View Toggle (Simulation for platform managers)
  const [adminMode, setAdminMode] = useState(false);

  const refreshData = () => {
    setReviews(getVendorReviews(shopKey, adminMode));
    setStats(calculateVendorStats(shopKey));
  };

  useEffect(() => {
    refreshData();
  }, [shopKey, adminMode]);

  const shareLinks = getVendorShareLinks(shopKey);

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(shareLinks.reviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview || !replyText.trim()) return;

    setIsReplying(true);
    addVendorReply(
      replyingReview.id,
      replyText.trim(),
      `${vendor?.name || "Mama Chidi"} (Shop Owner)`
    );
    setIsReplying(false);
    setReplyingReview(null);
    setReplyText("");
    refreshData();
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingReview) return;

    setIsReporting(true);
    reportReview(reportingReview.id, reportReason, reportNote);
    setIsReporting(false);
    setReportingReview(null);
    setReportNote("");
    refreshData();
  };

  const handleAdminAction = (reviewId: string, action: "approve" | "hide" | "dismiss_report") => {
    moderateReviewAction(reviewId, action);
    refreshData();
  };

  const filteredReviews = filterRating
    ? reviews.filter((r) => Math.round(r.rating) === filterRating)
    : reviews;

  return (
    <div className="min-h-screen bg-[#edf3fb] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors">
      {/* ── TOP HEADER BAR ── */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-black text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <MoniePayMark size={30} />
            <h1 className="text-sm font-black text-slate-900 dark:text-white">
              Customer Reviews &amp; Feedback
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── MAIN CONTAINER ── */}
      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* ── 1. VENDOR SCORE OVERVIEW & EASY SHARE BAR ── */}
        <div className="clay-card p-5 space-y-4 bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-white/10 shadow-xl rounded-[28px]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Score & Profile Summary */}
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-white flex flex-col items-center justify-center shadow-md shrink-0">
                <span className="text-2xl font-black leading-none">{stats.average}</span>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-2.5 w-2.5 fill-white text-white" />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    {vendor?.shopName}
                  </h2>
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9.5px] font-bold inline-flex items-center gap-0.5">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <strong>{stats.total} total reviews</strong> • 100% Verified customer feedback
                </p>
              </div>
            </div>

            {/* Rating Breakdown Bars */}
            <div className="w-full sm:w-56 space-y-1 text-xs">
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

          {/* ── EASY SHARING BAR FOR CUSTOMERS ── */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-2">
            <p className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Share With Customers to Get More Reviews:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <a
                href={shareLinks.whatsappReviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Send WhatsApp Review Link</span>
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="py-3 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Review Link Copied!" : "Copy Review Link"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQrStandModal(true)}
                className="py-3 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer"
              >
                <QrCode className="h-4 w-4" />
                <span>Print Countertop QR Stand</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 2. ADMIN MODERATION BAR (Demo Switch) ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-800 dark:text-slate-100">
                Customer Reviews ({filteredReviews.length})
              </span>
              {filterRating && (
                <button
                  type="button"
                  onClick={() => setFilterRating(null)}
                  className="text-[11px] font-extrabold text-blue-600 dark:text-sky-300 hover:underline cursor-pointer"
                >
                  Clear Filter ({filterRating} ★)
                </button>
              )}
            </div>

            <label className={`flex items-center gap-2 px-2.5 py-1 rounded-xl transition-all cursor-pointer text-[11px] font-bold ${
              adminMode
                ? "bg-amber-400/20 dark:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-400/50 shadow-xs"
                : "text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
            }`}>
              <input
                type="checkbox"
                checked={adminMode}
                onChange={(e) => setAdminMode(e.target.checked)}
                className="h-3.5 w-3.5 rounded text-amber-500 focus:ring-0 accent-amber-500 cursor-pointer"
              />
              <span className="font-bold">Admin Moderation Mode</span>
            </label>
          </div>

          {/* Bright Admin Mode Info Banner */}
          {adminMode && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-400/40 text-slate-900 dark:text-amber-100 text-xs flex items-center justify-between gap-2 shadow-xs backdrop-blur-md">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-300 shrink-0" />
                <div>
                  <span className="font-black text-slate-900 dark:text-white">Admin Queue Active: </span>
                  <span className="text-slate-700 dark:text-amber-200/90 font-medium">
                    Showing all customer submissions and reported reviews with Approve/Hide controls.
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-amber-400 dark:bg-amber-300 text-blue-950 font-black text-[10px] shrink-0 uppercase tracking-wider">
                Admin
              </span>
            </div>
          )}
        </div>

        {/* ── 3. REVIEWS LIST WITH REPLY & REPORT ACTIONS ── */}
        <div className="space-y-3">
          {filteredReviews.length === 0 ? (
            <div className="clay-card p-8 text-center space-y-2 bg-white/80 dark:bg-slate-900/80 rounded-[28px]">
              <Store className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                No reviews found for this filter.
              </p>
            </div>
          ) : (
            filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className={`clay-card p-4 sm:p-5 space-y-3 bg-white/95 dark:bg-slate-900/95 border shadow-xs rounded-[24px] ${
                  rev.isReported
                    ? "border-amber-400/80 bg-amber-50/40 dark:bg-amber-950/30"
                    : rev.moderationStatus === "hidden"
                    ? "border-rose-400/80 bg-rose-50/40 dark:bg-rose-950/30"
                    : "border-white/80 dark:border-white/10"
                }`}
              >
                {/* Review Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-sky-200 flex items-center justify-center font-black text-xs border border-blue-200 dark:border-blue-700">
                      {rev.customerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {rev.customerName}
                        </span>
                        {rev.isVerifiedCustomer && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9.5px] font-bold inline-flex items-center gap-0.5 border border-emerald-300 dark:border-emerald-700">
                            <ShieldCheck className="h-2.5 w-2.5" />
                            Verified Customer
                          </span>
                        )}
                        {rev.isReported && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 text-[10px] font-black inline-flex items-center gap-1 border border-amber-300 dark:border-amber-500 shadow-xs">
                            <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-300" />
                            Under Admin Moderation ({rev.reportReason})
                          </span>
                        )}
                        {rev.moderationStatus === "hidden" && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/80 text-rose-900 dark:text-rose-100 text-[10px] font-black inline-flex items-center gap-1 border border-rose-300 dark:border-rose-500 shadow-xs">
                            <EyeOff className="h-3 w-3 text-rose-600 dark:text-rose-300" />
                            Hidden by Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-300 font-medium">
                        {new Date(rev.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Star Rating Badge */}
                  <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 font-black text-xs border border-amber-200/80 dark:border-amber-700">
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
                        className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-[9.5px] font-bold border border-slate-200/60 dark:border-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Review Body */}
                {rev.comment && (
                  <p className="text-xs text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
                    "{rev.comment}"
                  </p>
                )}

                {/* Existing Official Merchant Reply */}
                {rev.reply && (
                  <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-700/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-black text-blue-950 dark:text-sky-200 flex items-center gap-1">
                        <Store className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        <span>{rev.reply.authorName}</span>
                      </span>
                      <span className="text-[9.5px] text-blue-700 dark:text-sky-300 font-medium">
                        {new Date(rev.reply.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-blue-950 dark:text-slate-100 font-medium leading-relaxed">
                      {rev.reply.text}
                    </p>
                  </div>
                )}

                {/* Vendor Action Buttons: Reply + Report */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingReview(rev);
                        setReplyText(rev.reply?.text || "");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 text-blue-700 dark:text-sky-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all border border-blue-200 dark:border-blue-800"
                    >
                      <Reply className="h-3 w-3" />
                      <span>{rev.reply ? "Edit Reply" : "Reply As Shop Owner"}</span>
                    </button>

                    {!rev.isReported && (
                      <button
                        type="button"
                        onClick={() => setReportingReview(rev)}
                        className="px-2.5 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/80 text-slate-500 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Report inappropriate / spam review"
                      >
                        <Flag className="h-3 w-3" />
                        <span>Report</span>
                      </button>
                    )}
                  </div>

                  {/* Admin Moderation Controls (When Admin Mode is on) */}
                  {adminMode && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAdminAction(rev.id, "approve")}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10.5px] font-black cursor-pointer shadow-xs active:scale-95 transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdminAction(rev.id, "hide")}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10.5px] font-black cursor-pointer shadow-xs active:scale-95 transition-all flex items-center gap-1"
                      >
                        <EyeOff className="h-3 w-3" />
                        <span>Hide</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* ── VENDOR REPLY MODAL ── */}
      <AnimatePresence>
        {replyingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[28px] p-5 text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-white/10 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Reply className="h-4 w-4 text-blue-600" />
                  <h3 className="font-black text-sm">
                    Reply to {replyingReview.customerName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-xs space-y-1">
                <span className="font-bold text-slate-500">Customer said:</span>
                <p className="font-medium text-slate-700 dark:text-slate-200 italic">
                  "{replyingReview.comment || "Left a star rating"}"
                </p>
              </div>

              <form onSubmit={handleSendReply} className="space-y-3">
                <label className="text-xs font-bold block">
                  Your Public Shop Owner Response:
                </label>
                <textarea
                  rows={3}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="E.g. Thank you for your market patronage! We look forward to seeing you again. 🙏"
                  className="w-full p-3 rounded-2xl clay-input text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none resize-none"
                />

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setReplyingReview(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isReplying || !replyText.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Publish Reply</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── REPORT REVIEW MODAL ── */}
      <AnimatePresence>
        {reportingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[28px] p-5 text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-white/10 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2 text-rose-600">
                  <Flag className="h-4 w-4" />
                  <h3 className="font-black text-sm">Report Review to Moderation</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setReportingReview(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 text-amber-900 dark:text-amber-200 text-xs">
                Vendors cannot delete customer reviews directly. Reported reviews enter the <strong>MoniePay Admin Queue</strong> for investigation.
              </div>

              <form onSubmit={handleSendReport} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold">Reason for Report:</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl clay-input text-xs font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Spam / Bot Review">Spam / Bot Review</option>
                    <option value="Competitor Abuse / False Info">Competitor Abuse / False Info</option>
                    <option value="Inappropriate Language">Inappropriate Language</option>
                    <option value="Harassment">Harassment</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold">Additional details for Admin:</label>
                  <textarea
                    rows={2}
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                    placeholder="Provide context on why this review violates platform rules..."
                    className="w-full p-2.5 rounded-xl clay-input text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setReportingReview(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isReporting}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 cursor-pointer"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Submit Report</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PRINTABLE COUNTERTOP QR STAND MODAL ── */}
      <MerchantRatingStand
        isOpen={showQrStandModal}
        onClose={() => setShowQrStandModal(false)}
        shopName={vendor?.shopName}
        traderName={vendor?.name}
        marketLocation={vendor?.market}
        shopId={shopKey}
        avatarUrl={vendor?.image}
      />
    </div>
  );
}
