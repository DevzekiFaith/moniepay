"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — 4-Digit Owner PIN Quick Unlock & Security Modal
// Instant (<1s) unlock, anti-theft screen lock for shop owners
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Unlock,
  X,
  Delete,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import {
  verifyOwnerPin,
  setOwnerPin,
  hasOwnerPin,
  getOwnerPin,
} from "@/lib/security/ownerPinService";

interface OwnerPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId?: string;
  userName?: string;
  businessName?: string;
  avatarUrl?: string;
  mode?: "UNLOCK" | "SET_NEW_PIN";
}

export function OwnerPinModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
  userName = "Shop Owner",
  businessName = "My Business Store",
  avatarUrl = "/images/traders/mama_chidi.jpg",
  mode: initialMode = "UNLOCK",
}: OwnerPinModalProps) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"UNLOCK" | "SET_NEW_PIN">(initialMode);
  const [pin, setPin] = useState<string>("");
  const [confirmPin, setConfirmPin] = useState<string>("");
  const [isSettingConfirm, setIsSettingConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isConfigured = hasOwnerPin(userId);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setConfirmPin("");
      setIsSettingConfirm(false);
      setErrorMsg(null);
      setSuccessMsg(null);
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  const handleKeyPress = (num: number) => {
    setErrorMsg(null);
    if (mode === "UNLOCK") {
      if (pin.length < 4) {
        const nextPin = pin + num;
        setPin(nextPin);
        if (nextPin.length === 4) {
          // Verify PIN immediately
          setTimeout(() => {
            const isValid = verifyOwnerPin(nextPin, userId);
            if (isValid) {
              setSuccessMsg("PIN Verified! Unlocking shop…");
              setTimeout(() => {
                onSuccess();
              }, 400);
            } else {
              setErrorMsg("Incorrect PIN. Please try again (default PIN: 1234).");
              setPin("");
            }
          }, 150);
        }
      }
    } else {
      // SET NEW PIN
      if (!isSettingConfirm) {
        if (pin.length < 4) {
          const next = pin + num;
          setPin(next);
          if (next.length === 4) {
            setTimeout(() => {
              setIsSettingConfirm(true);
            }, 200);
          }
        }
      } else {
        if (confirmPin.length < 4) {
          const nextConfirm = confirmPin + num;
          setConfirmPin(nextConfirm);
          if (nextConfirm.length === 4) {
            setTimeout(() => {
              if (nextConfirm === pin) {
                setOwnerPin(pin, userId);
                setSuccessMsg("New 4-digit PIN saved safely! ✓");
                setTimeout(() => {
                  onSuccess();
                }, 600);
              } else {
                setErrorMsg("PINs do not match. Please enter again.");
                setConfirmPin("");
                setIsSettingConfirm(false);
                setPin("");
              }
            }, 200);
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    setErrorMsg(null);
    if (mode === "UNLOCK") {
      setPin((prev) => prev.slice(0, -1));
    } else {
      if (isSettingConfirm) {
        if (confirmPin.length > 0) {
          setConfirmPin((prev) => prev.slice(0, -1));
        } else {
          setIsSettingConfirm(false);
        }
      } else {
        setPin((prev) => prev.slice(0, -1));
      }
    }
  };

  if (!isOpen || !mounted) return null;

  const currentDisplayPin = mode === "SET_NEW_PIN" && isSettingConfirm ? confirmPin : pin;

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
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-sm rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-2xl p-5 sm:p-7 text-slate-800 dark:text-slate-100 select-none overflow-hidden"
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

          {/* Header & Avatar */}
          <div className="flex flex-col items-center text-center space-y-2 pt-1">
            <div className="relative h-16 w-16 rounded-2xl overflow-hidden border-2 border-blue-500/80 shadow-md">
              <img
                src={avatarUrl}
                alt={userName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/traders/mama_chidi.jpg";
                }}
              />
              <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </div>

            <div>
              <p className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                {mode === "UNLOCK" ? "Shop Locked" : "Owner Security PIN"}
              </p>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {businessName}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {mode === "UNLOCK"
                  ? "Enter your 4-digit PIN to open your shop ledger"
                  : isSettingConfirm
                  ? "Re-enter the 4-digit PIN to confirm"
                  : "Choose a new 4-digit PIN for quick 1s unlock"}
              </p>
            </div>
          </div>

          {/* 4 PIN Dots */}
          <div className="flex items-center justify-center gap-3 my-5">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = idx < currentDisplayPin.length;
              return (
                <motion.div
                  key={idx}
                  animate={{
                    scale: isFilled ? 1.15 : 1,
                    backgroundColor: isFilled ? "#2563eb" : "transparent",
                  }}
                  className={`h-4 w-4 rounded-full border-2 transition-colors ${
                    isFilled
                      ? "border-blue-600 bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                      : "border-slate-300 dark:border-slate-600"
                  }`}
                />
              );
            })}
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[11px] font-bold text-center mb-3 border border-rose-200 dark:border-rose-800"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold text-center mb-3 border border-emerald-200 dark:border-emerald-800"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Numeric Keypad Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-[260px] mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="h-12 sm:h-13 rounded-2xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950 text-slate-800 hover:text-blue-700 dark:text-slate-100 dark:hover:text-blue-300 text-lg font-black transition-all active:scale-95 cursor-pointer border border-slate-200/60 dark:border-white/5 flex items-center justify-center shadow-2xs"
              >
                {num}
              </button>
            ))}

            {/* Bottom row: Mode Toggle or Key, 0, Backspace */}
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setPin("");
                setConfirmPin("");
                setIsSettingConfirm(false);
                setMode(mode === "UNLOCK" ? "SET_NEW_PIN" : "UNLOCK");
              }}
              className="h-12 sm:h-13 rounded-2xl text-[10px] font-black text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300 transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95"
              title={mode === "UNLOCK" ? "Set custom PIN" : "Back to unlock"}
            >
              <KeyRound className="h-4 w-4" />
              <span>{mode === "UNLOCK" ? "Change PIN" : "Cancel"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleKeyPress(0)}
              className="h-12 sm:h-13 rounded-2xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950 text-slate-800 hover:text-blue-700 dark:text-slate-100 dark:hover:text-blue-300 text-lg font-black transition-all active:scale-95 cursor-pointer border border-slate-200/60 dark:border-white/5 flex items-center justify-center shadow-2xs"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 sm:h-13 rounded-2xl bg-slate-100/70 hover:bg-rose-50 dark:bg-slate-800/70 dark:hover:bg-rose-950 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 transition-all active:scale-95 flex items-center justify-center cursor-pointer border border-slate-200/60 dark:border-white/5"
              title="Delete"
            >
              <Delete className="h-5 w-5" />
            </button>
          </div>

          {/* Footer Helper Note */}
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-medium mt-4">
            {mode === "UNLOCK"
              ? "Default PIN is 1234. You can change it anytime with 'Change PIN'."
              : "Keep this PIN secret. It locks your shop records from prying eyes."}
          </p>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

