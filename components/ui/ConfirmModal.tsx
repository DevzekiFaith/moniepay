"use client";

// ─────────────────────────────────────────────────────────────────
// Monie Lite — Neo-tactile Confirmation Dialog
// Replaces crude browser confirm() with luxury fintech modal
// ─────────────────────────────────────────────────────────────────

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Loader2, ShieldAlert } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  targetName?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  targetName,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDanger = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="card"
          style={{
            width: "100%",
            maxWidth: "460px",
            background: "#0D1526",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "20px",
            padding: "1.75rem",
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(244, 63, 94, 0.15)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: isDanger ? "rgba(244, 63, 94, 0.15)" : "rgba(79, 156, 249, 0.15)",
                  color: isDanger ? "var(--negative)" : "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {isDanger ? <ShieldAlert size={22} /> : <AlertTriangle size={22} />}
              </div>
              <div>
                <h3 style={{ fontSize: "16.5px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                  {title}
                </h3>
                <span className="pill pill-negative" style={{ fontSize: "9.5px", marginTop: "2px" }}>
                  Action Required
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onCancel}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-base)",
                color: "var(--text-secondary)",
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Target Highlight Box */}
          {targetName && (
            <div
              style={{
                padding: "0.875rem 1rem",
                borderRadius: "12px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-base)",
                marginBottom: "1rem",
              }}
            >
              <p style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 600 }}>
                Target Account
              </p>
              <p style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                {targetName}
              </p>
            </div>
          )}

          {/* Message / Description */}
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: "1.5rem" }}>
            {message || "Are you sure you want to proceed? This will immediately disconnect the active connection."}
          </p>

          {/* Action Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              style={{
                height: "42px",
                borderRadius: "10px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-base)",
                color: "var(--text-secondary)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                height: "42px",
                borderRadius: "10px",
                background: isDanger ? "var(--negative)" : "var(--accent)",
                border: "none",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 700,
                cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: isDanger
                  ? "0 4px 18px rgba(244, 63, 94, 0.35)"
                  : "0 4px 18px rgba(79, 156, 249, 0.35)",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Processing…</span>
                </>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
