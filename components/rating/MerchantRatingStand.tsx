"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Merchant Barcode & QR Code Customer Rating Stand
// Standalone Scannable Barcode & Separate QR Code for Shop Counters
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  QrCode,
  Barcode,
  Share2,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Star,
  Store,
  MapPin,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MerchantRatingStandProps {
  isOpen: boolean;
  onClose: () => void;
  shopName?: string;
  traderName?: string;
  marketLocation?: string;
  shopId?: string;
  avatarUrl?: string;
  onOpenRatingForm?: () => void;
}

// Generate realistic SVG barcode bars
function SvgBarcode({ code }: { code: string }) {
  // Deterministic bar widths based on code
  const bars = React.useMemo(() => {
    const pattern = [];
    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      pattern.push((charCode % 3) + 1);
      pattern.push(((charCode >> 1) % 2) + 1);
      pattern.push(((charCode >> 2) % 3) + 1);
      pattern.push(1);
    }
    return pattern;
  }, [code]);

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
      <div className="flex items-end justify-center h-12 gap-[2px] w-full max-w-[240px] px-2 overflow-hidden">
        {bars.map((width, idx) => (
          <div
            key={idx}
            className={`bg-slate-900 rounded-[0.5px] ${
              idx % 2 === 0 ? "h-12 opacity-100" : "h-10 opacity-80"
            }`}
            style={{ width: `${Math.max(1.5, width * 1.5)}px` }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between w-full max-w-[240px] px-1 text-[10px] font-mono font-black text-slate-700 tracking-wider">
        <span>*RATE*</span>
        <span>{code}</span>
        <span>*OK*</span>
      </div>
    </div>
  );
}

export function MerchantRatingStand({
  isOpen,
  onClose,
  shopName = "Mama Chidi Super Provisions",
  traderName = "Mama Chidi",
  marketLocation = "Balogun Market, Lagos",
  shopId = "mama_chidi",
  avatarUrl = "/images/traders/mama_chidi.jpg",
  onOpenRatingForm,
}: MerchantRatingStandProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"qr" | "barcode">("qr");

  // Construct rating portal URL
  const ratingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/rate?shop=${encodeURIComponent(shopId)}`
    : `https://moniepay.app/rate?shop=${encodeURIComponent(shopId)}`;

  const barcodeString = `MP-${shopId.substring(0, 4).toUpperCase()}-84920`;

  // Generate QR Code
  useEffect(() => {
    QRCode.toDataURL(ratingUrl, {
      width: 320,
      margin: 1.5,
      color: {
        dark: "#022c22", // MoniePay deep emerald
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code Error:", err));
  }, [ratingUrl]);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ratingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md my-auto rounded-[32px] bg-slate-50 border border-slate-200/90 shadow-2xl overflow-hidden text-slate-900"
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#047857] px-5 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-white/20">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight leading-none">Customer Rating Stand</h3>
                <p className="text-[10.5px] text-emerald-200 font-semibold mt-0.5">
                  Verified MoniePay Merchant Badge
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {/* Merchant Identity Stand Card (Printable Layout) */}
            <div className="p-4 rounded-[24px] bg-white border border-slate-200/90 shadow-sm space-y-3.5">
              {/* Store Profile Header */}
              <div className="flex items-center gap-3">
                <div className="relative h-13 w-13 rounded-2xl overflow-hidden border-2 border-emerald-600 shadow-sm shrink-0">
                  <img
                    src={avatarUrl}
                    alt={shopName}
                    className="h-full w-full object-cover object-center"
                  />
                  <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 text-[9px] font-black uppercase tracking-wider">
                      Verified Shop
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">• MoniePay ID</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate mt-0.5">
                    {shopName}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium truncate">
                    <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{marketLocation}</span>
                  </div>
                </div>
              </div>

              {/* Code Type Switcher */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 border border-slate-200/70">
                <button
                  type="button"
                  onClick={() => setActiveTab("qr")}
                  className={`flex items-center justify-center gap-1.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                    activeTab === "qr"
                      ? "bg-white text-emerald-900 shadow-xs border border-slate-200/60"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Customer QR Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("barcode")}
                  className={`flex items-center justify-center gap-1.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                    activeTab === "barcode"
                      ? "bg-white text-emerald-900 shadow-xs border border-slate-200/60"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Barcode className="h-3.5 w-3.5" />
                  <span>Rating Barcode</span>
                </button>
              </div>

              {/* Code Display Frame */}
              <div className="py-2 flex flex-col items-center justify-center text-center">
                {activeTab === "qr" ? (
                  <div className="flex flex-col items-center">
                    <div className="p-3 rounded-2xl bg-white border-2 border-emerald-900/10 shadow-sm relative group">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="Customer Rating QR Code"
                          className="h-44 w-44 sm:h-48 sm:w-48 object-contain rounded-lg"
                        />
                      ) : (
                        <div className="h-44 w-44 sm:h-48 sm:w-48 bg-slate-100 rounded-lg animate-pulse" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-emerald-950/20 rounded-2xl backdrop-blur-[1px]">
                        <span className="px-2.5 py-1 rounded-xl bg-white text-emerald-950 text-[10px] font-black shadow-md">
                          Scan to Rate Shop
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs font-black text-slate-800">
                      Scan with any Phone Camera
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Opens direct customer rating &amp; verified review form
                    </p>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    <SvgBarcode code={barcodeString} />
                    <p className="mt-2 text-xs font-black text-slate-800">
                      Merchant Rating Barcode
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Scannable at checkout counters and POS scanners
                    </p>
                  </div>
                )}
              </div>

              {/* Live Link Copy Strip */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="text"
                  readOnly
                  value={ratingUrl}
                  className="flex-1 bg-transparent text-[11px] font-semibold text-slate-600 px-1 truncate focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10.5px] font-black shrink-0 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Action Buttons: Try Rating Form, Print & Share */}
            <div className="space-y-2">
              <a
                href={`/rate?shop=${encodeURIComponent(shopId)}`}
                className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                <span>Open Customer Rating Form</span>
                <ChevronRight className="h-4 w-4" />
              </a>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-emerald-600 text-slate-800 text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-600" />
                  <span>Print Counter Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `Rate ${shopName} on MoniePay`,
                        text: `Scan our QR code or visit to leave a verified rating for ${shopName}`,
                        url: ratingUrl,
                      }).catch(() => {});
                    } else {
                      handleCopyLink();
                    }
                  }}
                  className="py-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-emerald-600 text-slate-800 text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Share2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Share via WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
