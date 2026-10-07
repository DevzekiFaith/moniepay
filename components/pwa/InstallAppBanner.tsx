"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — PWA Install App Prompt & Interactive Modal
// Enables 1-tap installation on Android/Chrome & step-by-step guide for iOS
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import {
  Smartphone,
  X,
  CheckCircle2,
  Share,
  PlusSquare,
  Zap,
  BellRing,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MoniePayMark } from "@/components/ui/MoniePayLogo";

export function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (already installed)
    const isInStandaloneMode =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true);

    if (isInStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // Check if user is on iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Check if previously dismissed in this session
    const dismissed = sessionStorage.getItem("moniepay_install_dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }

    // Listen for beforeinstallprompt (Android / Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for custom trigger event from anywhere in the app (e.g. Header button)
    const handleTriggerInstall = () => {
      setShowModal(true);
    };

    window.addEventListener("moniepay:trigger-install", handleTriggerInstall);

    window.addEventListener("appinstalled", () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      setShowModal(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("moniepay:trigger-install", handleTriggerInstall);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setDeferredPrompt(null);
        setIsStandalone(true);
        setShowModal(false);
      }
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("moniepay_install_dismissed", "true");
  };

  return (
    <>
      {/* ── BOTTOM FLOATING PWA INSTALL BANNER (Only if not installed and not dismissed) ── */}
      <AnimatePresence>
        {!isStandalone && !isDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-20 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:right-6 sm:max-w-md z-40"
          >
            <div className="p-3.5 sm:p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-[0_16px_36px_rgba(15,23,42,0.18)] dark:shadow-2xl rounded-[28px] flex items-center justify-between gap-3 text-slate-900 dark:text-slate-100">
              <div
                className="flex items-center gap-3 min-w-0 cursor-pointer"
                onClick={() => setShowModal(true)}
              >
                <MoniePayMark size={40} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">
                      Install MoniePay Lite
                    </p>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                      Offline OS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                    1-tap home screen access &amp; instant alerts
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm transition-all"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Install</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="h-7 w-7 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── INTERACTIVE INSTALL APP MODAL (Triggered on click) ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-4 max-h-[92vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <MoniePayMark size={44} />
                  <div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider mb-0.5">
                      <Sparkles className="h-2.5 w-2.5" />
                      <span>Official Trader OS</span>
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg leading-tight">
                      Install MoniePay App
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Fast, lightweight app on your home screen
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* 3 Nigerian Trader App Benefits */}
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-950 dark:text-emerald-200">
                      Zero Data Offline Mode
                    </p>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                      Record sales &amp; gbese without active internet or airtime.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/50 border border-blue-200/70 dark:border-blue-800 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                    <BellRing className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-blue-950 dark:text-blue-200">
                      Instant Debt Due Alerts
                    </p>
                    <p className="text-[11px] text-blue-800 dark:text-blue-300 font-medium">
                      Direct phone reminders when customer payment is due.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/50 border border-purple-200/70 dark:border-purple-800 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-purple-950 dark:text-purple-200">
                      Instant 1-Tap Access
                    </p>
                    <p className="text-[11px] text-purple-800 dark:text-purple-300 font-medium">
                      Full-screen standalone view with no browser search bars.
                    </p>
                  </div>
                </div>
              </div>

              {/* Install Flow: Android / 1-Tap vs iOS Instructions */}
              {deferredPrompt ? (
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleNativeInstall}
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98 transition-all cursor-pointer"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Install MoniePay Now (1-Tap)</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="text-[11px] text-center text-slate-400 font-medium">
                    Takes 0 MB extra phone storage • Auto-updates
                  </p>
                </div>
              ) : isIos ? (
                <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
                  <p className="text-[11.5px] font-black text-slate-900 dark:text-white mb-2">
                    How to install on your iPhone / iPad (Safari):
                  </p>
                  <div className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                      1
                    </span>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      Tap the <strong>Share</strong> button (
                      <Share className="inline h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mx-0.5" />) in Safari.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                      2
                    </span>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      Scroll down and tap <strong>Add to Home Screen</strong> (
                      <PlusSquare className="inline h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mx-0.5" />).
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                      3
                    </span>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      Tap <strong>Add</strong> at top right. MoniePay will appear on your home screen!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
                  <p className="text-[11.5px] font-black text-slate-900 dark:text-white mb-1.5">
                    How to add to your phone:
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    Tap your browser menu (<strong>⋮</strong> or <strong>Share</strong>) and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </p>
                </div>
              )}

              {/* Close / Action Button */}
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer active:scale-98 transition-all"
              >
                {deferredPrompt ? "Maybe Later" : "Done / Close"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Global trigger function to open PWA install prompt from any button/widget
 */
export function triggerInstallPrompt() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("moniepay:trigger-install"));
  }
}
