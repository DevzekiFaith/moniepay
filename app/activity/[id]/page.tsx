"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Dynamic Transaction Receipt & Detail View (/activity/[id])
// Full Digital Slip • One-Tap WhatsApp Receipt • Downloadable Slip
// Authentic Nigerian Market & Trader Vernacular
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Share2,
  Download,
  CheckCircle2,
  Clock,
  Trash2,
  Store,
  Calendar,
  CreditCard,
  Tag,
  FileText,
  AlertTriangle,
  Copy,
  Check,
  Building2,
  User,
  Phone,
  Receipt,
  Wallet,
  Coins,
} from "lucide-react";
import { AppSidebar, AppBottomBar, AppMobileHeader } from "@/components/layout/AppNavigation";
import { formatNaira, formatTransactionDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import type { BusinessTransaction } from "@/types/moniepay.types";
import {
  getCachedTransactions,
  setCachedTransactions,
} from "@/lib/offline/offlineQueue";
import { DEFAULT_TRANSACTIONS } from "@/lib/data/initialBusinessData";

// Helper to format full human readable date
function formatFullDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-NG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

// Convert amount to Naira words (for formal receipts)
function numberToNairaWords(num: number): string {
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (num === 0) return "Zero Naira Only";

  function convertBelowThousand(n: number): string {
    let str = "";
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
      if (n > 0) str += "and ";
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      str += units[n] + " ";
    }
    return str.trim();
  }

  let words = "";
  const millions = Math.floor(num / 1_000_000);
  const thousands = Math.floor((num % 1_000_000) / 1_000);
  const remainder = Math.floor(num % 1_000);

  if (millions > 0) {
    words += convertBelowThousand(millions) + " Million ";
  }
  if (thousands > 0) {
    words += convertBelowThousand(thousands) + " Thousand ";
  }
  if (remainder > 0) {
    words += convertBelowThousand(remainder) + " ";
  }

  return (words.trim() + " Naira Only").replace(/\s+/g, " ");
}

// Market informal terminology mapping
function getMarketTypeTitle(type: string, method?: string): string {
  if (type === "SALE" && method === "CREDIT") return "Customer Gbese (Goods Given on Credit)";
  if (type === "SALE") return "Market Sale (Money In)";
  if (type === "DEBT_COLLECTION") return "Gbese Recovered (Customer Settled Debt)";
  if (type === "STOCK_PURCHASE") return "Market Restock (Bought Goods to Resell)";
  if (type === "EXPENSE") return "Shop Expense & Gen Fuel";
  if (type === "STAFF_PAYMENT") return "Shop Boy / Apprentice Wages";
  if (type === "OWNER_WITHDRAWAL") return "Chop Money (House & Family Feeding)";
  if (type === "SUPPLIER_PAYMENT") return "Supplier Payment (Paid Wholesaler)";
  return type.replace(/_/g, " ");
}

function getMarketPaymentMethod(method: string): string {
  if (method === "CASH") return "Cash Drawer (Hand-to-Hand)";
  if (method === "TRANSFER") return "Bank Transfer (Alert Confirmed)";
  if (method === "POS") return "POS Machine";
  if (method === "CREDIT") return "Gbese / Book Credit";
  return method;
}

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { notify } = useNotification();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [transaction, setTransaction] = useState<BusinessTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Search cached transactions
    const cached = getCachedTransactions();
    const all = cached.length > 0 ? cached : DEFAULT_TRANSACTIONS;
    const found = all.find((tx) => tx.id === id || tx.client_tx_id === id);

    if (found) {
      setTransaction(found);
    } else {
      // Fallback search default transactions
      const defaultFound = DEFAULT_TRANSACTIONS.find((tx) => tx.id === id || tx.client_tx_id === id);
      setTransaction(defaultFound || null);
    }
    setLoading(false);
  }, [id]);

  const isPositive = transaction?.type === "SALE" || transaction?.type === "DEBT_COLLECTION";

  const shopName = user?.businessName || "Mama Chidi Super Provisions";
  const shopLocation = user?.marketLocation || "Shop 14, Balogun Market, Lagos";

  const handleCopyReference = () => {
    if (!transaction) return;
    const ref = (transaction.client_tx_id || transaction.id).slice(0, 8).toUpperCase();
    navigator.clipboard?.writeText(ref);
    setCopied(true);
    notify(
      "Slip Ref Copied!",
      `Slip Reference #${ref} copied to clipboard.`,
      "success"
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!transaction) return;
    const ref = (transaction.client_tx_id || transaction.id).slice(0, 8).toUpperCase();
    const dateFormatted = formatTransactionDate(transaction.transaction_date);
    const amountStr = `₦${Number(transaction.amount).toLocaleString()}`;
    const nairaWords = numberToNairaWords(Number(transaction.amount));
    const marketType = getMarketTypeTitle(transaction.type, transaction.payment_method);
    const paymentMethodStr = getMarketPaymentMethod(transaction.payment_method);

    const receiptText = `*MONIEPAY SHOP PAYMENT SLIP*
━━━━━━━━━━━━━━━━━━━━━
*${shopName}*
${shopLocation}

*${amountStr}*
_${nairaWords}_

• *Market Activity:* ${marketType}
• *Goods / Particulars:* ${transaction.description || transaction.category}
• *Payment Way:* ${paymentMethodStr}
• *Market Time & Date:* ${dateFormatted}
• *Slip Ref:* #${ref}
━━━━━━━━━━━━━━━━━━━━━
*Status: Record Don Save Safe & Reconciled ✓*
_Thank you for your business & God bless your hustle!_
_Powered by MoniePay_`;

    const url = `https://wa.me/?text=${encodeURIComponent(receiptText)}`;
    window.open(url, "_blank");
  };

  // High-Resolution Crisp Canvas Slip Generator (Market Language)
  const handleDownloadReceipt = () => {
    if (!transaction) return;

    try {
      const ref = (transaction.client_tx_id || transaction.id).slice(0, 8).toUpperCase();
      const canvas = document.createElement("canvas");
      const scale = 2; // 2x Retina resolution
      const width = 600;
      const height = 800;
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.scale(scale, scale);

      // 1. Background
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(0, 0, width, height, 28);
      } else {
        ctx.rect(0, 0, width, height);
      }
      ctx.fill();

      // Outer border
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 2. Header Gradient Strip
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "#047857");
      gradient.addColorStop(0.5, "#0d9488");
      gradient.addColorStop(1, "#059669");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, 14);

      // 3. Shop Info Header
      ctx.textAlign = "center";
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
      ctx.fillText(shopName, width / 2, 70);

      ctx.fillStyle = "#64748b";
      ctx.font = "500 14px system-ui, -apple-system, sans-serif";
      ctx.fillText(shopLocation, width / 2, 98);

      // Receipt Tag Pill
      ctx.fillStyle = "#ecfdf5";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(width / 2 - 120, 118, 240, 28, 14);
      } else {
        ctx.rect(width / 2 - 120, 118, 240, 28);
      }
      ctx.fill();
      ctx.strokeStyle = "#a7f3d0";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#065f46";
      ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
      ctx.fillText("SHOP PAYMENT SLIP", width / 2, 136);

      // Divider Dashed Line
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.moveTo(40, 170);
      ctx.lineTo(width - 40, 170);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // 4. Amount Hero
      ctx.fillStyle = isPositive ? "#065f46" : "#0f172a";
      ctx.font = "900 42px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        `${isPositive ? "+" : "-"}₦${Number(transaction.amount).toLocaleString()}`,
        width / 2,
        230
      );

      ctx.fillStyle = "#64748b";
      ctx.font = "italic 500 13px system-ui, -apple-system, sans-serif";
      const words = numberToNairaWords(Number(transaction.amount));
      ctx.fillText(`"${words}"`, width / 2, 260);

      // 5. Details Table Box
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(40, 290, width - 80, 330, 18);
      } else {
        ctx.rect(40, 290, width - 80, 330);
      }
      ctx.fill();
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Row Drawer Helper
      const rows = [
        { label: "Market Activity", value: getMarketTypeTitle(transaction.type, transaction.payment_method) },
        { label: "Goods / Particulars", value: transaction.description || transaction.category },
        { label: "Payment Way", value: getMarketPaymentMethod(transaction.payment_method) },
        { label: "Market Time & Date", value: formatFullDate(transaction.transaction_date) },
        { label: "Slip Ref Number", value: `#${ref}` },
      ];

      let rowY = 335;
      rows.forEach((r, idx) => {
        // Label (left aligned)
        ctx.textAlign = "left";
        ctx.fillStyle = "#64748b";
        ctx.font = "600 13px system-ui, -apple-system, sans-serif";
        ctx.fillText(r.label, 65, rowY);

        // Value (right aligned)
        ctx.textAlign = "right";
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
        ctx.fillText(r.value, width - 65, rowY);

        if (idx < rows.length - 1) {
          ctx.strokeStyle = "#f1f5f9";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(65, rowY + 18);
          ctx.lineTo(width - 65, rowY + 18);
          ctx.stroke();
        }

        rowY += 56;
      });

      // 6. Status & Footer
      ctx.textAlign = "center";
      ctx.fillStyle = "#059669";
      ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
      ctx.fillText("✓ Record Don Save Safe & Reconciled", width / 2, 665);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "500 11px system-ui, -apple-system, sans-serif";
      ctx.fillText("MoniePay • Nigeria's Market OS • God bless your hustle!", width / 2, 745);

      // Trigger Instant Image Download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `MoniePay_Slip_${ref}.png`;
      link.href = dataUrl;
      link.click();

      notify(
        "Receipt Downloaded",
        `Receipt image #MoniePay_Slip_${ref}.png saved to your device.`,
        "success"
      );
    } catch (err) {
      notify("Download Error", "Could not export receipt image.", "error");
    }
  };

  const handleDeleteTransaction = () => {
    if (!transaction) return;
    setIsDeleting(true);

    try {
      const cached = getCachedTransactions();
      const txId = transaction.id || transaction.client_tx_id;
      const updated = cached.filter((tx) => tx.id !== txId && tx.client_tx_id !== txId);
      setCachedTransactions(updated);

      notify(
        "Record Deleted",
        "Transaction was removed from your market ledger.",
        "success"
      );

      router.push("/activity");
    } catch (err) {
      notify(
        "Error",
        "Could not delete this transaction.",
        "error"
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500/20 overflow-x-hidden">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-10">
        <AppMobileHeader />

        <main className="w-full max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
          {/* Top Back Navigation Bar */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Activity Log</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Download Slip</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share Slip</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center rounded-[32px] bg-white border border-slate-200">
              <Clock className="h-8 w-8 text-slate-300 mx-auto animate-spin mb-3" />
              <p className="text-xs font-bold text-slate-500">Checking record for shop memory...</p>
            </div>
          ) : !transaction ? (
            <div className="p-10 text-center rounded-[32px] bg-white border border-slate-200 space-y-3">
              <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
              <h3 className="text-base font-black text-slate-900">Record Not Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                This market record could not be found or may have been cleared from device memory.
              </p>
              <Link
                href="/activity"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
              >
                Return to Activity Log
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* ── DIGITAL SLIP CARD (Market Paper Slip Aesthetic) ── */}
              <div className="relative rounded-[32px] bg-white border border-emerald-950/10 shadow-[0_12px_32px_rgba(0,0,0,0.06)] overflow-hidden">
                {/* Top Colored Branding Strip */}
                <div
                  className={`h-3.5 w-full ${
                    isPositive
                      ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500"
                      : "bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900"
                  }`}
                />

                <div className="p-5 sm:p-7 space-y-6">
                  {/* Shop Branding Header */}
                  <div className="text-center pb-5 border-b border-dashed border-slate-200">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 mb-2 shadow-xs">
                      <Store className="h-6 w-6" />
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      {shopName}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {shopLocation}
                    </p>
                    <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-black border border-emerald-200/80">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      <span>Record Don Save Safe ✓</span>
                    </div>
                  </div>

                  {/* Main Amount Callout */}
                  <div className="text-center py-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                      {getMarketTypeTitle(transaction.type, transaction.payment_method)}
                    </span>
                    <div
                      className={`text-3xl sm:text-4xl font-black tracking-tight mt-1 ${
                        isPositive ? "text-emerald-800" : "text-slate-900"
                      }`}
                    >
                      {isPositive ? "+" : "-"}₦{Number(transaction.amount).toLocaleString()}
                    </div>
                    <p className="text-xs font-bold text-slate-500 mt-1 italic max-w-md mx-auto">
                      "{numberToNairaWords(Number(transaction.amount))}"
                    </p>
                  </div>

                  {/* Transaction Details Grid */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 sm:p-5 space-y-3.5">
                    {/* Item Description */}
                    <div className="flex items-start justify-between gap-3 text-xs sm:text-sm">
                      <span className="text-slate-500 font-semibold flex items-center gap-1.5 shrink-0">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span>Goods / Particulars</span>
                      </span>
                      <span className="font-black text-slate-900 text-right">
                        {transaction.description || transaction.category}
                      </span>
                    </div>

                    {/* Category */}
                    <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                      <span className="text-slate-500 font-semibold flex items-center gap-1.5 shrink-0">
                        <Tag className="h-4 w-4 text-slate-400" />
                        <span>Market Category</span>
                      </span>
                      <span className="font-bold text-slate-800 text-right">
                        {transaction.category}
                      </span>
                    </div>

                    {/* Payment Method */}
                    <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                      <span className="text-slate-500 font-semibold flex items-center gap-1.5 shrink-0">
                        <CreditCard className="h-4 w-4 text-slate-400" />
                        <span>Payment Way</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 font-black text-slate-900 text-xs shadow-2xs">
                        {getMarketPaymentMethod(transaction.payment_method)}
                      </span>
                    </div>

                    {/* Exact Timestamp */}
                    <div className="flex items-start justify-between gap-3 text-xs sm:text-sm">
                      <span className="text-slate-500 font-semibold flex items-center gap-1.5 shrink-0">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>Market Time & Date</span>
                      </span>
                      <span className="font-bold text-slate-900 text-right">
                        {formatFullDate(transaction.transaction_date)}
                      </span>
                    </div>

                    {/* Transaction Reference ID */}
                    <div className="flex items-center justify-between gap-3 text-xs sm:text-sm pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 font-semibold flex items-center gap-1.5 shrink-0">
                        <span>Slip Ref Number</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyReference}
                        className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-800 hover:text-emerald-900 hover:underline cursor-pointer"
                      >
                        <span>
                          #{(transaction.client_tx_id || transaction.id).slice(0, 8).toUpperCase()}
                        </span>
                        {copied ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* WhatsApp Direct Share Button */}
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Send Slip to Customer on WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Delete / Void Action Bar */}
              <div className="pt-2 text-center">
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Cancel or Delete this Market Record</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left space-y-2">
                    <p className="text-xs font-bold text-rose-900">
                      You sure say you wan remove this transaction record from your shop ledger?
                    </p>
                    <p className="text-[11px] text-rose-700">
                      If you delete am, MoniePay go remove am from today sales/expenses and recalculate your drawer money.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={handleDeleteTransaction}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isDeleting ? "Deleting..." : "Yes, Delete Record"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        <AppBottomBar />
      </div>
    </div>
  );
}
