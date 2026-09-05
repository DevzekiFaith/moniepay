"use client";

// ─────────────────────────────────────────────────────────────────
// AjoPay — Luxury Glassmorphic Sign In Portal
// "Save Small, Grow Big" — Dark Neo-Tactile Glass Aesthetics
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AjoPayLogo } from "@/components/ui/AjoPayLogo";
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

  const [email, setEmail] = useState("alex.chen@ajopay.app");
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
      {/* Ambient Glassmorphic Mesh Glow Orbs */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "15%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.28) 0%, rgba(124, 58, 237, 0) 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          animation: "floatSlow 8s ease-in-out infinite alternate",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "15%",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0) 70%)",
          filter: "blur(65px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          right: "-5%",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.16) 0%, rgba(56, 189, 248, 0) 70%)",
          filter: "blur(55px)",
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
          background: "rgba(13, 21, 38, 0.76)",
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
        {/* Header Branding */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.75rem", textAlign: "center" }}>
          <AjoPayLogo variant="stacked" size={46} useImage={true} showTagline={true} />
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
                onClick={() => alert("Demo Mode: Click 'Instant Demo Sign In' below to access without password.")}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              height: "46px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 50%, #2563EB 100%)",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 700,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              boxShadow: "0 4px 20px rgba(124, 58, 237, 0.4)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              marginTop: "4px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(124, 58, 237, 0.55)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(124, 58, 237, 0.4)";
            }}
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span>Sign In to AjoPay</span>
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

        {/* Instant Demo Access Button */}
        <button
          type="button"
          onClick={handleDemoAccess}
          disabled={isSubmitting}
          style={{
            width: "100%",
            height: "44px",
            borderRadius: "12px",
            background: "rgba(52, 211, 153, 0.12)",
            border: "1px solid rgba(52, 211, 153, 0.3)",
            color: "var(--positive)",
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
            e.currentTarget.style.background = "rgba(52, 211, 153, 0.2)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(52, 211, 153, 0.12)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <Sparkles size={15} color="var(--positive)" />
          <span>Instant Demo Sign In (1-Click)</span>
        </button>

        {/* Biometric Touch ID Button */}
        <button
          type="button"
          onClick={handleBiometricAuth}
          style={{
            width: "100%",
            height: "40px",
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "var(--text-secondary)",
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
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          {biometricSuccess ? (
            <>
              <CheckCircle2 size={16} color="var(--positive)" />
              <span style={{ color: "var(--positive)" }}>Biometric Verified!</span>
            </>
          ) : (
            <>
              <Fingerprint size={16} color="#A855F7" />
              <span>Sign in with Biometrics / Face ID</span>
            </>
          )}
        </button>

        {/* Trust Badges Footer */}
        <div
          style={{
            marginTop: "1.75rem",
            paddingTop: "1rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            fontSize: "10.5px",
            color: "var(--text-tertiary)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <ShieldCheck size={13} color="var(--positive)" />
            <span>CBN Open Banking</span>
          </div>
          <span>•</span>
          <span>256-Bit SSL Encrypted</span>
          <span>•</span>
          <span>NDPR Certified</span>
        </div>
      </motion.div>
    </div>
  );
}
