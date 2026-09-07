"use client";

// ─────────────────────────────────────────────────────────────────
// AJO — Personal Money Intelligence
// Minimalist, premium sign-in & onboarding portal.
// Instant local verification with zero hanging.
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import { AjoLogo } from "@/components/ui/AjoLogo";
import { Lock, Mail, User, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Direct fast sign in
  const performLogin = async (loginEmail: string, loginPass: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim().toLowerCase(), password: loginPass }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.user) {
        setErrorMsg(data.error || "Invalid email or password. Please verify your credentials.");
        return false;
      }

      // Persist session to local storage and cookies
      localStorage.setItem("ajo_session", JSON.stringify(data.user));
      document.cookie = `ajo_session=${encodeURIComponent(data.user.id)}; path=/; max-age=2592000; SameSite=Lax`;

      // Full window navigation to refresh Next.js router cache cleanly
      window.location.href = "/";
      return true;
    } catch (err: any) {
      if (err.name === "AbortError") {
        setErrorMsg("Request timed out. Please check your connection and try again.");
      } else {
        setErrorMsg("Authentication error. Please try again.");
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg("Please provide both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "register") {
        if (!name.trim()) {
          setErrorMsg("Please enter your name.");
          setIsSubmitting(false);
          return;
        }

        if (password.length < 8) {
          setErrorMsg("Password must be at least 8 characters long.");
          setIsSubmitting(false);
          return;
        }

        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), email: cleanEmail, password }),
        });

        const regData = await regRes.json().catch(() => ({}));
        if (!regRes.ok) {
          setErrorMsg(regData.error || "Failed to create account.");
          setIsSubmitting(false);
          return;
        }
      }

      const success = await performLogin(cleanEmail, password);
      if (!success) {
        setIsSubmitting(false);
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };


  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050505",
        padding: "1.5rem 1rem",
        color: "#EDEDED",
        fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#0A0A0A",
          border: "1px solid #1A1A1A",
          borderRadius: "16px",
          padding: "clamp(1.5rem, 4vw, 2.25rem) clamp(1rem, 4vw, 2rem)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)",
        }}
      >
        {/* Brand Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.75rem", textAlign: "center" }}>
          <AjoLogo variant="stacked" size={40} showTagline={true} theme="dark" />
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            background: "#111111",
            padding: "3px",
            borderRadius: "8px",
            border: "1px solid #1C1C1C",
            marginBottom: "1.25rem",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMsg(null);
            }}
            style={{
              padding: "8px 0",
              fontSize: "12.5px",
              fontWeight: mode === "signin" ? 600 : 500,
              color: mode === "signin" ? "#FFFFFF" : "#71717A",
              background: mode === "signin" ? "#1F1F1F" : "transparent",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg(null);
            }}
            style={{
              padding: "8px 0",
              fontSize: "12.5px",
              fontWeight: mode === "register" ? 600 : 500,
              color: mode === "register" ? "#FFFFFF" : "#71717A",
              background: mode === "register" ? "#1F1F1F" : "transparent",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              borderRadius: "8px",
              marginBottom: "1.25rem",
              fontSize: "12.5px",
              color: "#FCA5A5",
              lineHeight: 1.4,
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {mode === "register" && (
            <div>
              <label style={{ display: "block", fontSize: "11.5px", fontWeight: 500, color: "#A1A1AA", marginBottom: "5px" }}>
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={14}
                  color="#52525B"
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="text"
                  placeholder="e.g. Adewale Adeleke"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "9px 12px 9px 36px",
                    background: "#121212",
                    border: "1px solid #242424",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    outline: "none",
                    transition: "border-color 0.15s ease",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#52525B")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#242424")}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: 500, color: "#A1A1AA", marginBottom: "5px" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={14}
                color="#52525B"
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 36px",
                  background: "#121212",
                  border: "1px solid #242424",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  outline: "none",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#52525B")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#242424")}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: 500, color: "#A1A1AA", marginBottom: "5px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={14}
                color="#52525B"
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 36px",
                  background: "#121212",
                  border: "1px solid #242424",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  outline: "none",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#52525B")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#242424")}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: "0.5rem",
              padding: "10px 16px",
              background: "#FFFFFF",
              color: "#050505",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "opacity 0.15s ease",
              opacity: isSubmitting ? 0.75 : 1,
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <span>{mode === "signin" ? "Sign In to AJO" : "Create AJO Account"}</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </form>

        {/* Security Footnote */}
        <div style={{ marginTop: "1.5rem", borderTop: "1px solid #171717", paddingTop: "1rem", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#52525B", fontSize: "11px" }}>
            <ShieldCheck size={12} color="#71717A" />
            <span>Read-only Open Banking intelligence. No card entry required.</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
