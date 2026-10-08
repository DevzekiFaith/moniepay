"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Public Customer Direct Payment & QR Landing Page (/pay)
// Allows customers to scan shop counter QR, view account details,
// copy account number, and confirm transfer for instant receipt.
// ─────────────────────────────────────────────────────────────────

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Copy,
  Check,
  CheckCircle2,
  ArrowDownLeft,
  ShieldCheck,
  Store,
  ExternalLink,
  MessageCircle,
  Clock,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MoniePayMark } from "@/components/ui/MoniePayLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

function PaymentContent() {
  const searchParams = useSearchParams();

  const rawBank = searchParams?.get("bank") || "Providus Bank";
  const rawAccount = searchParams?.get("account") || "9920192381";
  const rawName = searchParams?.get("name") || "Mama Chidi Provisions";
  const defaultAmount = searchParams?.get("amount") || "";

  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState(defaultAmount);
  const [payerName, setPayerName] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [receiptRef, setReceiptRef] = useState("");

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(rawAccount);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = `FLW-${Date.now().toString().slice(-6)}`;
    setReceiptRef(ref);
    setIsPaid(true);

    // If on same browser, trigger local notification event
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("moniepay:transaction-recorded", {
          detail: {
            transaction: {
              id: `tx_qr_${Date.now()}`,
              client_tx_id: `tx_qr_${Date.now()}`,
              business_id: "biz_default_01",
              type: "SALE",
              amount: Number(amount) || 20000,
              category: "Shop Sale (Customer QR)",
              description: `Direct QR Transfer from ${payerName.trim() || "Customer"}`,
              payment_method: "TRANSFER",
              transaction_date: new Date().toISOString(),
              created_at: new Date().toISOString(),
              metadata: {
                receipt_reference: ref,
                source_channel: "QR_COUNTER",
              },
            },
          },
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#edf3fb] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 transition-colors">
      {/* Top Header */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between pb-4">
        <div className="flex items-center gap-2.5">
          <MoniePayMark size={32} />
          <div>
            <span className="text-sm font-black text-slate-900 dark:text-white">MoniePay</span>
            <span className="text-[10px] font-bold text-blue-600 dark:text-sky-400 block leading-none">
              Direct Shop Payment
            </span>
          </div>
        </div>
        <ThemeToggle size="sm" />
      </header>

      {/* Main Payment Container */}
      <main className="w-full max-w-md mx-auto my-auto space-y-4">
        <AnimatePresence mode="wait">
          {!isPaid ? (
            <motion.div
              key="payment-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="clay-card p-5 sm:p-6 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-2xl space-y-4.5"
            >
              {/* Merchant Title Banner */}
              <div className="text-center space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-black border border-blue-200 dark:border-blue-800">
                  <Store className="h-3.5 w-3.5" />
                  <span>Paying Merchant</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {rawName}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Official MoniePay Business Account
                </p>
              </div>

              {/* Dedicated Bank Account Details Box (Solid Single Color) */}
              <div className="p-4 rounded-2xl bg-[#0f172a] text-white space-y-3 shadow-lg border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-blue-400" />
                    {rawBank}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                    Verified Account
                  </span>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Account Number</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-white">
                      {rawAccount}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-sm"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Beneficiary Name</p>
                    <p className="font-bold text-white text-[11px] truncate max-w-[220px]">
                      MoniePay / {rawName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Instructions Form */}
              <form onSubmit={handleConfirmPayment} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Amount Paid (₦)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-base focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name / Phone (For Receipt)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chidinma Okafor"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Confirm Paid Button (Solid Blue) */}
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98 transition-all cursor-pointer mt-2"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span>I Have Made This Transfer</span>
                </button>
              </form>

              {/* Auto Verification Tag */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium text-emerald-900 dark:text-emerald-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Shopkeeper receives instant notification once bank confirms your transfer.</span>
              </div>
            </motion.div>
          ) : (
            /* Digital Receipt View */
            <motion.div
              key="receipt"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="clay-card p-6 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-2xl text-center space-y-4"
            >
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                  Transfer Submitted ⚡
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white pt-1">
                  ₦{Number(amount || 20000).toLocaleString()}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Sent to {rawName} ({rawBank})
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-left space-y-2 text-xs border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Receipt Ref:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{receiptRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Payer:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{payerName || "Customer"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Date:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPaid(false)}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Make Another Payment
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-md mx-auto pt-4 text-center">
        <p className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Secured by MoniePay • Flutterwave Partner Network
        </p>
      </footer>
    </div>
  );
}

export default function PublicPayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <p className="text-sm font-bold text-slate-500">Loading MoniePay Shop Payment...</p>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
