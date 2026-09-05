"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Luxury Glassmorphic Sign In Portal
// Unified Brand Blue/Purple Aesthetics — No discordant color variants
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MoniePayLogo } from "@/components/ui/MoniePayLogo";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Fingerprint,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin, isLoading } = useAuth();

  const [email, setEmail] = useState("alex.chen@moniepay.app");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setErrorMsg("Invalid credentials. Please check your details.");
      setIsSubmitting(false);
    }
  };

  const handleDemoAccess = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    await demoLogin();
  };

  const handleBiometricAuth = async () => {
    setBiometricSuccess(true);
    setTimeout(async () => {
      await demoLogin();
    }, 800);
  };

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
        padding: "1.5rem 1rem",
      }}
    >
      {/* Ambient Unified Blue & Purple Glow Orbs */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "20%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, rgba(79, 70, 229, 0) 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "20%",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, rgba(37, 99, 235, 0) 70%)",
          filter: "blur(65px)",
          pointerEvents: "none",
        }}
      />

      {/* Luxury Glassmorphic Card */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "rgba(13, 21, 38, 0.78)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "24px",
          padding: "2.25rem 2rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Header Branding with Original Signature Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.75rem", textAlign: "center" }}>
          <MoniePayLogo variant="stacked" size={42} showTagline={true} taglineText="Money Intelligence" />
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginTop: "0.85rem",
              lineHeight: 1.45,
            }}
          >
            Access your personal money intelligence ledger &amp; Open Banking vault.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              background: "rgba(244, 63, 94, 0.12)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              color: "var(--negative)",
              fontSize: "12.5px",
              fontWeight: 600,
              marginBottom: "1.25rem",
              textAlign: "center",
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          {/* Email Input */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "6px",
              }}
            >
              Account Email
            </label>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-tertiary)",
                  display: "flex",
                }}
              >
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                style={{
                  width: "100%",
                  height: "44px",
                  paddingLeft: "38px",
                  paddingRight: "14px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  color: "var(--text-primary)",
                  fontSize: "13.5px",
                  outline: "none",
                  transition: "all 0.15s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--accent)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(79, 156, 249, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Security PIN / Password
              </label>
              <button
                type="button"
                onClick={() => alert("Demo Mode: Click 'Instant Demo Sign In' below to access instantly.")}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "11px",
                  color: "var(--accent)",
                  cursor: "pointer",
                  fontWeight: 600,
                  padding: 0,
                }}
              >
                Forgot PIN?
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-tertiary)",
                  display: "flex",
                }}
              >
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  width: "100%",
                  height: "44px",
                  paddingLeft: "38px",
                  paddingRight: "38px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  color: "var(--text-primary)",
                  fontSize: "13.5px",
                  outline: "none",
                  transition: "all 0.15s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--accent)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(79, 156, 249, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-tertiary)",
                  cursor: "pointer",
                  display: "flex",
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Session Checkbox */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "2px 0" }}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                accentColor: "var(--accent)",
                width: "15px",
                height: "15px",
                cursor: "pointer",
              }}
            />
            <label htmlFor="remember" style={{ fontSize: "12px", color: "var(--text-secondary)", cursor: "pointer" }}>
              Remember session on this trusted device
            </label>
          </div>

          {/* Submit Button — Unified Brand Purple/Blue */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              height: "46px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 700,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              marginTop: "4px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)";
            }}
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span>Sign In to MoniePay</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            margin: "1.25rem 0",
            color: "var(--text-tertiary)",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.08)" }} />
          <span>or frictionless entry</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.08)" }} />
        </div>

        {/* Instant Demo Access Button — Unified Brand Blue */}
        <button
          type="button"
          onClick={handleDemoAccess}
          disabled={isSubmitting}
          style={{
            width: "100%",
            height: "44px",
            borderRadius: "12px",
            background: "rgba(79, 156, 249, 0.12)",
            border: "1px solid rgba(79, 156, 249, 0.35)",
            color: "#4F9CF9",
            fontSize: "13px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer",
            transition: "all 0.15s ease",
            marginBottom: "0.75rem",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(79, 156, 249, 0.22)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(79, 156, 249, 0.12)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <Sparkles size={15} color="#4F9CF9" />
          <span>Instant Demo Sign In (1-Click)</span>
        </button>

        {/* Biometric Touch ID Button — Unified Brand Blue Tint */}
        <button
          type="button"
          onClick={handleBiometricAuth}
          style={{
            width: "100%",
            height: "40px",
            borderRadius: "12px",
            background: "rgba(79, 156, 249, 0.06)",
            border: "1px solid rgba(79, 156, 249, 0.2)",
            color: "#93C5FD",
            fontSize: "12.5px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(79, 156, 249, 0.14)";
            e.currentTarget.style.borderColor = "rgba(79, 156, 249, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(79, 156, 249, 0.06)";
            e.currentTarget.style.borderColor = "rgba(79, 156, 249, 0.2)";
          }}
        >
          {biometricSuccess ? (
            <>
              <CheckCircle2 size={16} color="var(--positive)" />
              <span>Biometric Verified</span>
            </>
          ) : (
            <>
              <Fingerprint size={16} color="#93C5FD" />
              <span>Sign In with Face ID / Fingerprint</span>
            </>
          )}
        </button>

        {/* Bottom Trust Badge */}
        <div
          style={{
            marginTop: "1.5rem",
            paddingTop: "1rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            color: "var(--text-tertiary)",
            fontSize: "11px",
          }}
        >
          <ShieldCheck size={13} color="var(--accent)" />
          <span>256-bit TLS Bank-Grade Encryption</span>
        </div>
      </motion.div>
    </div>
  );
}
