"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Logout Transition Screen
// Unified Brand Blue/Purple Aesthetics — Clean Session Termination
// ─────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MoniePayLogo } from "@/components/ui/MoniePayLogo";
import { Loader2 } from "lucide-react";
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
      {/* Ambient background glow — Unified brand blue/purple */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "30%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79, 70, 229, 0.22) 0%, rgba(79, 70, 229, 0) 70%)",
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
          borderRadius: "24px",
          padding: "2.5rem 2rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.25rem",
        }}
      >
        <MoniePayLogo size={42} variant="icon" />

        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Signing Out of MoniePay…
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Securing Open Banking vaults &amp; closing active session.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "0.5rem" }}>
          <Loader2 size={18} className="animate-spin" color="var(--accent)" />
          <span style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 500 }}>
            Redirecting to security vault…
          </span>
        </div>
      </motion.div>
    </div>
  );
}
