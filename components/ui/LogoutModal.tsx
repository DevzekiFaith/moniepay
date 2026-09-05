"use client";

// ─────────────────────────────────────────────────────────────────
// AjoPay — Luxury Glassmorphic Logout Confirmation Modal
// ─────────────────────────────────────────────────────────────────

import React from "react";
import { LogOut, X, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AjoPayEmblem } from "./AjoPayLogo";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
}

export function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  userName = "Alex Chen",
}: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(3, 7, 18, 0.78)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          padding: "1rem",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{
            width: "100%",
            maxWidth: "400px",
            background: "rgba(13, 21, 38, 0.88)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "20px",
            padding: "1.75rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={15} />
          </button>

          {/* Header with AjoPay Emblem & Logout Glyph */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1.25rem" }}>
            <div style={{ position: "relative" }}>
              <AjoPayEmblem size={44} />
              <div
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "-2px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "var(--bg-surface)",
                  border: "1px solid rgba(244, 63, 94, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.5)",
                }}
              >
                <LogOut size={10} color="var(--negative)" />
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                Log out of AjoPay?
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Active session for <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{userName}</span>
              </p>
            </div>
          </div>

          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: "1.5rem" }}>
            Your Open Banking credentials remain securely encrypted. You will need to sign in again to access real-time financial intelligence.
          </p>

          {/* Action Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                height: "42px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "var(--text-primary)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              style={{
                height: "42px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
