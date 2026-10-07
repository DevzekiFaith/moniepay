"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — PWA Install App Prompt & Banner
// Enables 1-tap installation on Android/Chrome & step-by-step guide for iOS
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { Download, Smartphone, X, CheckCircle2, Share, PlusSquare, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (already installed)
    const isInStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

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
      if (isIosDevice) {
        setShowIosGuide(true);
      } else if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
          if (choiceResult.outcome === "accepted") {
            setDeferredPrompt(null);
            setIsStandalone(true);
          }
        });
      } else {
        // Fallback for browsers that don't support beforeinstallprompt
        setShowIosGuide(true);
      }
    };

    window.addEventListener("moniepay:trigger-install", handleTriggerInstall);

    window.addEventListener("appinstalled", () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("moniepay:trigger-install", handleTriggerInstall);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setDeferredPrompt(null);
        setIsStandalone(true);
      }
    } else {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("moniepay_install_dismissed", "true");
  };

  // If already installed or dismissed, do not show bottom banner (header button will still work)
  if (isStandalone || isDismissed) {
    return (
      <>
        {/* iOS Instruction Modal */}
        <AnimatePresence>
          {showIosGuide && (
            <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-[#edf3fb] rounded-3xl p-5 sm:p-6 text-slate-800 shadow-2xl border border-white/80 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-11 w-11 rounded-2xl overflow-hidden shadow-sm border border-white shrink-0 bg-blue-950">
                      <img
                        src="/moniepay-logo-square.png"
                        alt="MoniePay"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base leading-tight">
                        Install MoniePay App
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Add to phone home screen</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowIosGuide(false)}
                    className="h-8 w-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700 bg-white/70 p-4 rounded-2xl border border-white">
                  <div className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-800 font-black flex items-center justify-center shrink-0">
                      1
                    </span>
                    <p className="font-medium">
                      Tap the <strong>Share</strong> icon (
                      <Share className="inline h-3.5 w-3.5 text-blue-600" />) at the bottom or top of your browser.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-800 font-black flex items-center justify-center shrink-0">
                      2
                    </span>
                    <p className="font-medium">
                      Scroll down and tap <strong>Add to Home Screen</strong> (
                      <PlusSquare className="inline h-3.5 w-3.5 text-blue-600" />).
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-800 font-black flex items-center justify-center shrink-0">
                      3
                    </span>
                    <p className="font-medium">
                      Tap <strong>Add</strong> in the top-right corner to install!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowIosGuide(false)}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-black text-xs cursor-pointer active:scale-98 shadow-md"
                >
                  Got It, Done!
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      {/* ── BOTTOM FLOATING PWA INSTALL BANNER ── */}
      <AnimatePresence>
        {!isDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-20 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:right-6 sm:max-w-md z-40"
          >
            <div className="clay-card p-3.5 sm:p-4 bg-[#edf3fb]/95 backdrop-blur-xl border border-white/90 shadow-[0_16px_36px_rgba(154,180,214,0.45)] rounded-3xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-11 w-11 rounded-2xl overflow-hidden shadow-sm border border-white shrink-0 bg-blue-950">
                  <img
                    src="/moniepay-logo-square.png"
                    alt="MoniePay"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 leading-tight truncate">
                    Install MoniePay App
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium truncate">
                    Fast offline ledger on your phone
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Install</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="h-7 w-7 rounded-xl hover:bg-slate-200/70 text-slate-500 flex items-center justify-center cursor-pointer"
                  aria-label="Dismiss banner"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Instruction Modal */}
      <AnimatePresence>
        {showIosGuide && (
          <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#edf3fb] rounded-3xl p-5 sm:p-6 text-slate-800 shadow-2xl border border-white/80 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base leading-tight">
                      Install MoniePay App
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Add to phone home screen</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIosGuide(false)}
                  className="h-8 w-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 bg-white/70 p-4 rounded-2xl border border-white">
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-800 font-black flex items-center justify-center shrink-0">
                    1
                  </span>
                  <p className="font-medium">
                    Tap the <strong>Share</strong> button (
                    <Share className="inline h-3.5 w-3.5 text-blue-600" />) at the bottom or top of your browser.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-800 font-black flex items-center justify-center shrink-0">
                    2
                  </span>
                  <p className="font-medium">
                    Scroll down and tap <strong>Add to Home Screen</strong> (
                    <PlusSquare className="inline h-3.5 w-3.5 text-blue-600" />).
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-800 font-black flex items-center justify-center shrink-0">
                    3
                  </span>
                  <p className="font-medium">
                    Tap <strong>Add</strong> in the top-right corner to install!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-black text-xs cursor-pointer active:scale-98 shadow-md"
              >
                Got It, Done!
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
