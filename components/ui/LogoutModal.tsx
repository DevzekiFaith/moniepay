"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Luxury Glassmorphic Logout Confirmation Modal
// Tactile Framer Motion spring physics & unified brand palette (no variant colors)
// ─────────────────────────────────────────────────────────────────

import React from "react";
import { LogOut, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MoniePayEmblem } from "./MoniePayLogo";

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
  userName = "Member",
}: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(3, 7, 18, 0.78)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          padding: "1rem",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 18 }}
          transition={{ type: "spring", damping: 24, stiffness: 320 }}
          style={{
            width: "100%",
            maxWidth: "410px",
            background: "rgba(13, 21, 38, 0.92)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(79, 156, 249, 0.25)",
            borderRadius: "22px",
            padding: "1.85rem",
            boxShadow:
              "0 28px 60px -12px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
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
          </motion.button>

          {/* Header with MoniePay Emblem & Logout Glyph */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1.25rem" }}>
            <div style={{ position: "relative" }}>
              <MoniePayEmblem size={44} />
              <div
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "-2px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "var(--bg-surface)",
                  border: "1px solid rgba(79, 156, 249, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.5)",
                }}
              >
                <LogOut size={10} color="var(--accent)" />
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em", margin: 0 }}>
                Log out of AJO?
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px", margin: 0 }}>
                Active session for <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{userName}</span>
              </p>
            </div>
          </div>

          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: "1.5rem" }}>
            Logging out will safely end your active session on this device.
          </p>

          {/* Action Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
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
              }}
            >
              Cancel
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={onConfirm}
              style={{
                height: "42px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #4F9CF9 0%, #2563EB 100%)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 4px 16px rgba(37, 99, 235, 0.45)",
              }}
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
