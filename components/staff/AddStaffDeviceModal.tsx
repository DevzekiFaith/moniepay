"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Add Staff Device (QR Code & 6-Digit Shop Code Modal)
// Pair apprentices & sales boys without sharing master password or PIN
// 100% Mobile Responsive • Nigerian Market Anti-Theft Protection
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  QrCode,
  Copy,
  Check,
  Share2,
  ShieldCheck,
  Smartphone,
  Users,
  RefreshCw,
  Trash2,
  Lock,
  Store,
  AlertCircle,
} from "lucide-react";
import {
  getShopStaffConfig,
  generateStaffQrDataUrl,
  regenerateShopPairingCode,
  formatWhatsAppStaffInvite,
  revokeStaffDevice,
  PairedStaffDevice,
  ShopStaffConfig,
} from "@/lib/staff/staffDeviceService";

interface AddStaffDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerId?: string;
  businessName?: string;
  traderName?: string;
}

export function AddStaffDeviceModal({
  isOpen,
  onClose,
  ownerId,
  businessName = "My Business Store",
  traderName = "Shop Owner",
}: AddStaffDeviceModalProps) {
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<ShopStaffConfig | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "devices">("code");
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const refreshConfig = () => {
    const current = getShopStaffConfig(ownerId, businessName);
    setConfig(current);
    generateStaffQrDataUrl(current.shopCode, businessName).then(setQrDataUrl);
  };

  useEffect(() => {
    if (isOpen) {
      refreshConfig();
    }
  }, [isOpen, ownerId, businessName]);

  if (!isOpen || !mounted) return null;

  const shopCode = config?.shopCode || "SHOP-8492";
  const devices = config?.devices || [];

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(shopCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  const handleShareWhatsApp = () => {
    const text = formatWhatsAppStaffInvite(shopCode, businessName);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleRegenerateCode = () => {
    if (!window.confirm("Do you want to generate a new Shop Code? Staff who haven't paired yet will need the new code.")) {
      return;
    }
    setIsRegenerating(true);
    const newCode = regenerateShopPairingCode(ownerId, businessName);
    refreshConfig();
    setTimeout(() => setIsRegenerating(false), 400);
  };

  const handleRevoke = (deviceId: string, staffName: string) => {
    if (!window.confirm(`Disconnect ${staffName}'s phone from your shop? They will no longer be able to record sales.`)) {
      return;
    }
    revokeStaffDevice(deviceId, ownerId);
    refreshConfig();
  };

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-md rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-2xl p-5 sm:p-6 text-slate-800 dark:text-slate-100 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-11 w-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                Multi-Device Staff Protection
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Add Staff / Cashier Phone
              </h2>
            </div>
          </div>

          {/* Anti-Theft Trust Notice Banner */}
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-start gap-2 mb-4">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-extrabold text-emerald-900 dark:text-emerald-200">Anti-Theft Active: </strong>
              Staff can record sales and send receipts from their phone, but will <span className="font-bold underline">never</span> see your profit, bank balances, or owner PIN.
            </div>
          </div>

          {/* Navigation Tabs (Pair Code vs Connected Staff) */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 mb-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("code")}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                activeTab === "code"
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              1. QR &amp; Pairing Code
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("devices")}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === "devices"
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>2. Connected Staff</span>
              {devices.length > 0 && (
                <span className="h-4 w-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                  {devices.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === "code" ? (
            <div className="space-y-4">
              {/* 6-Digit Code Hero Card */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 text-center space-y-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  6-Digit Shop Code for Staff Phones:
                </span>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border-2 border-blue-600 shadow-sm">
                  <span className="font-mono text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-400 tracking-wider">
                    {shopCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100 transition-all cursor-pointer"
                    title="Copy Shop Code"
                  >
                    {copiedCode ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Staff opens MoniePay → taps <strong>&ldquo;Join as Staff&rdquo;</strong> → enters this code.
                </p>
              </div>

              {/* Scannable QR Code */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <QrCode className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Or Scan with Staff Phone Camera:</span>
                </span>

                {qrDataUrl ? (
                  <div className="p-2.5 rounded-2xl bg-white shadow-md border border-slate-200">
                    <img
                      src={qrDataUrl}
                      alt={`Staff Pairing QR for ${shopCode}`}
                      className="h-44 w-44 sm:h-48 sm:w-48 object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-44 w-44 bg-slate-200 rounded-2xl flex items-center justify-center text-xs text-slate-400">
                    Loading QR…
                  </div>
                )}
                <span className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-2">
                  Staff points phone camera here to pair instantly in 1 second.
                </span>
              </div>

              {/* Action Buttons: WhatsApp Share & Regenerate Code */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex-1 py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Send via WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleRegenerateCode}
                  disabled={isRegenerating}
                  className="py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0"
                  title="Generate a brand new 6-digit code"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
                  <span className="hidden xs:inline">New Code</span>
                </button>
              </div>
            </div>
          ) : (
            /* Connected Devices Tab */
            <div className="space-y-3">
              {devices.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
                  <Smartphone className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No Staff Devices Paired Yet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Share your Shop Code (<strong>{shopCode}</strong>) with your apprentice to connect their phone.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {devices.map((dev) => (
                    <div
                      key={dev.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 font-black text-xs">
                          {dev.name[0]?.toUpperCase() || "S"}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {dev.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                            {dev.role} • {dev.deviceModel || "Mobile Phone"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRevoke(dev.id, dev.name)}
                        className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all cursor-pointer shrink-0"
                        title="Disconnect this staff device"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[10.5px] text-slate-400 dark:text-slate-500 text-center pt-2">
                You can disconnect any apprentice&apos;s phone at any time with 1 tap.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

