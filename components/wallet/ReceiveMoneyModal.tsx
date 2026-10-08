"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Receive Money & Shop Payment QR Modal
// Flutterwave-Powered Virtual Account & Instant Auto-Recording
// Dedicated for Nigerian Market Traders • No Gradients • No Stars
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  QrCode,
  Copy,
  Check,
  Building2,
  Share2,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/NotificationContext";

interface ReceiveMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateIncomingTransfer?: (amount: number, senderName: string) => void;
}

export function ReceiveMoneyModal({
  isOpen,
  onClose,
  onSimulateIncomingTransfer,
}: ReceiveMoneyModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [directPayUrl, setDirectPayUrl] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const businessName = user?.businessName || (user?.name ? `${user.name} Provisions` : "Mama Chidi Provisions");
  const bankName = "Providus Bank";
  // Deterministic or user-assigned dedicated payment account
  const accountNumber = user?.id ? `99${user.id.replace(/\D/g, "").slice(-8).padStart(8, "20192381")}` : "9920192381";
  const accountName = `MoniePay / ${businessName}`;

  // Generate QR Code data URL (encodes valid public payment URL)
  useEffect(() => {
    if (!isOpen) return;

    let origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://moniepay.app";
    // If running in local dev on localhost, use the machine's LAN IP so phone cameras on the Wi-Fi open it seamlessly
    if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
      origin = `http://192.168.149.225:${window.location.port || "3001"}`;
    }

    const paymentUrl = `${origin}/pay?account=${encodeURIComponent(accountNumber)}&bank=${encodeURIComponent(bankName)}&name=${encodeURIComponent(businessName)}`;
    setDirectPayUrl(paymentUrl);

    QRCode.toDataURL(paymentUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code generate error:", err));
  }, [isOpen, accountNumber, bankName, businessName]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedField(label);
      toast("Copied to Clipboard!", `${label} copied. You can paste to customer.`, { type: "success" });
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      toast("Copied", text, { type: "info" });
    }
  };

  const handleShareWhatsApp = () => {
    const message = `Hello! You can make payment for your purchase to our shop account:\n\n🏦 *Bank:* ${bankName}\n🔢 *Account Number:* ${accountNumber}\n👤 *Account Name:* ${accountName}\n\n_Payment is automatically confirmed and receipt issued immediately._ Thank you! 🙏`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleSimulatePayment = (amount = 20000) => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      if (onSimulateIncomingTransfer) {
        onSimulateIncomingTransfer(amount, "Chidinma O.");
      }
      toast(
        "Transfer Received & Auto-Recorded!",
        `+₦${amount.toLocaleString()} from Chidinma O. (Providus Bank) has been added to your sales ledger automatically.`,
        { type: "success" }
      );
      onClose();
    }, 1000);
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 text-slate-900 dark:text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  Receive Moni (QR & Transfer)
                </h2>
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Auto-Records Every Payment
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Dedicated Virtual Bank Card (Solid Slate-900 / Single Colour) */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-blue-400">
                <Building2 className="h-4 w-4" />
                {bankName}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black">
                Dedicated Account
              </span>
            </div>

            {/* Account Number in High-Contrast Digits */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Account Number</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-white">
                  {accountNumber}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(accountNumber, "Account Number")}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  {copiedField === "Account Number" ? (
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

            {/* Account Name */}
            <div className="pt-2 border-t border-slate-800 text-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Beneficiary Name</p>
                <p className="font-bold text-white truncate max-w-[240px]">{accountName}</p>
              </div>
            </div>
          </div>

          {/* QR Code Counter Display Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center space-y-2.5">
            <p className="text-xs font-black text-slate-800 dark:text-slate-100">
              Customer QR Code to Scan
            </p>

            <div className="p-2.5 bg-white rounded-2xl border-2 border-slate-300 shadow-md">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="MoniePay Shop Payment QR Code" className="h-44 w-44 object-contain" />
              ) : (
                <div className="h-44 w-44 flex items-center justify-center text-xs text-slate-400">
                  Loading QR Code...
                </div>
              )}
            </div>

            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 max-w-xs">
              Customer can scan with phone camera or banking app to pay.
            </p>

            {/* Direct 1-Tap Browser Test Link */}
            {directPayUrl && (
              <a
                href={directPayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Live Payment Page in Browser</span>
              </a>
            )}
          </div>

          {/* Instant Auto-Record Guarantee Tag */}
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5">
            <div className="h-6 w-6 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <div className="text-xs">
              <p className="font-black text-emerald-950 dark:text-emerald-100">
                Automatic Recording • Zero Manual Typing
              </p>
              <p className="text-emerald-800 dark:text-emerald-300 text-[11px] font-medium mt-0.5 leading-relaxed">
                When a customer makes a transfer to this account, MoniePay instantly records the sale in your ledger.
              </p>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" />
              Send on WhatsApp
            </button>

            <button
              type="button"
              onClick={() =>
                copyToClipboard(
                  `Bank: ${bankName}\nAccount Number: ${accountNumber}\nAccount Name: ${accountName}`,
                  "All Bank Details"
                )
              }
              className="py-3 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              <Copy className="h-4 w-4" />
              Copy Details
            </button>
          </div>

          {/* Test Simulation Trigger */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400">
              Want to test auto-record?
            </span>
            <button
              type="button"
              disabled={isSimulating}
              onClick={() => handleSimulatePayment(20000)}
              className="px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-950 hover:bg-blue-200 text-blue-800 dark:text-blue-300 font-black text-[11px] flex items-center gap-1.5 border border-blue-300 dark:border-blue-800 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isSimulating ? "animate-spin" : ""}`} />
              {isSimulating ? "Receiving..." : "Simulate ₦20,000 Payment"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
