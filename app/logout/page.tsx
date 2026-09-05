"use client";

// ─────────────────────────────────────────────────────────────────
// AjoPay — Logout Transition Screen
// ─────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AjoPayLogo } from "@/components/ui/AjoPayLogo";
import { Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      logout();
    }, 900);
    return () => clearTimeout(timer);
  }, [logout]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#080D1A",
        position: "relative",
        overflow: "hidden",
        padding: "1.5rem",
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "30%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.22) 0%, rgba(124, 58, 237, 0) 70%)",
          filter: "blur(60px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          width: "100%",
          maxWidth: "380px",
          background: "rgba(13, 21, 38, 0.8)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "20px",
          padding: "2.25rem 2rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.25rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        <AjoPayLogo variant="stacked" size={44} useImage={true} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
            <Loader2 size={16} className="animate-spin" color="var(--accent)" />
            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              Signing out securely…
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
            Clearing active session keys and closing encrypted tunnel.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
