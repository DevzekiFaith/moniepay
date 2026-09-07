"use client";

// ─────────────────────────────────────────────────────────────────
// AJO — Logout Transition Screen
// Clean Session Termination
// ─────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AjoLogo } from "@/components/ui/AjoLogo";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      logout();
    }, 800);
    return () => clearTimeout(timer);
  }, [logout]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050505",
        padding: "1.5rem",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          width: "100%",
          maxWidth: "360px",
          background: "#0D0D0D",
          border: "1px solid #1F1F1F",
          borderRadius: "16px",
          padding: "2.5rem 2rem",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.7)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.25rem",
        }}
      >
        <AjoLogo size={36} variant="icon" theme="dark" />

        <div>
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
            Signing Out of AJO…
          </h2>
          <p style={{ fontSize: "12.5px", color: "#71717A", marginTop: "4px" }}>
            Securing your session.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "0.25rem" }}>
          <Loader2 size={16} className="animate-spin" color="#A1A1AA" />
          <span style={{ fontSize: "12px", color: "#52525B" }}>
            Redirecting to sign in…
          </span>
        </div>
      </motion.div>
    </div>
  );
}
