"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, BarChart3, Lock, Globe, ChevronDown } from "lucide-react";

function FeaturePill({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 14px",
        borderRadius: "999px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        fontSize: "12px",
        color: "#A1A1AA",
        letterSpacing: "0.01em",
        backdropFilter: "blur(6px)",
      }}
    >
      <Icon size={12} color="#71717A" />
      {text}
    </div>
  );
}

function FloatingCard({
  delay,
  x,
  y,
  rotate,
  children,
}: {
  delay: number;
  x: string;
  y: string;
  rotate: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, rotate: rotate - 4 }}
      animate={{ opacity: 1, scale: 1, rotate }}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: "200px",
        background: "rgba(13,13,13,0.9)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "16px",
        backdropFilter: "blur(20px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {children}
    </motion.div>
  );
}

export default function WelcomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#050505",
        color: "#FFFFFF",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Ambient gradients */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "900px", height: "600px", background: "radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(120,100,255,0.04) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", top: "40%", left: "-5%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(0,200,150,0.03) 0%, transparent 60%)" }} />
      </div>

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          background: "rgba(5,5,5,0.85)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "28px", height: "28px", background: "#FFFFFF", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 900, color: "#050505", letterSpacing: "-0.04em" }}>A</span>
          </div>
          <span style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.03em" }}>AJO</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link href="/login" style={{ fontSize: "13px", color: "#A1A1AA", textDecoration: "none", padding: "8px 16px", borderRadius: "8px" }}>Sign In</Link>
          <Link href="/login?register=1" style={{ fontSize: "13px", fontWeight: 600, color: "#050505", background: "#FFFFFF", textDecoration: "none", padding: "8px 16px", borderRadius: "8px" }}>Get Started</Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section style={{ position: "relative", zIndex: 1, minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 24px 80px", textAlign: "center", overflow: "hidden" }}>
        
        {/* Floating cards - desktop only */}
        {mounted && (
          <div className="welcome-cards" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <FloatingCard delay={0.6} x="5%" y="20%" rotate={-4}>
              <div style={{ fontSize: "10px", color: "#52525B", marginBottom: "6px" }}>Total Balance</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.04em" }}>₦2,450,000</div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "6px", fontSize: "11px", color: "#22C55E" }}>
                <span>↑ +12.4%</span><span style={{ color: "#3F3F46" }}>this month</span>
              </div>
            </FloatingCard>

            <FloatingCard delay={0.8} x="72%" y="15%" rotate={3}>
              <div style={{ fontSize: "10px", color: "#52525B", marginBottom: "8px" }}>Recent Activity</div>
              {[
                { name: "OPay Transfer", amount: "-₦15,000", color: "#EF4444" },
                { name: "Salary Credit", amount: "+₦350,000", color: "#22C55E" },
                { name: "Data Purchase", amount: "-₦3,000", color: "#EF4444" },
              ].map((tx) => (
                <div key={tx.name} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "6px" }}>
                  <span style={{ color: "#A1A1AA" }}>{tx.name}</span>
                  <span style={{ color: tx.color, fontWeight: 600 }}>{tx.amount}</span>
                </div>
              ))}
            </FloatingCard>

            <FloatingCard delay={1.0} x="68%" y="60%" rotate={-2}>
              <div style={{ fontSize: "10px", color: "#52525B", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>💡 Money Story</div>
              <p style={{ fontSize: "11px", color: "#A1A1AA", lineHeight: 1.5 }}>
                You've saved <span style={{ color: "#FFFFFF", fontWeight: 600 }}>₦42,000</span> more than last month!
              </p>
            </FloatingCard>

            <FloatingCard delay={1.2} x="3%" y="62%" rotate={2}>
              <div style={{ fontSize: "10px", color: "#52525B", marginBottom: "8px" }}>By Category</div>
              {[{ label: "Food", pct: 38 }, { label: "Transport", pct: 22 }, { label: "Bills", pct: 40 }].map((c) => (
                <div key={c.label} style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#71717A", marginBottom: "3px" }}>
                    <span>{c.label}</span><span>{c.pct}%</span>
                  </div>
                  <div style={{ height: "3px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${c.pct}%`, background: "rgba(255,255,255,0.3)", borderRadius: "2px" }} />
                  </div>
                </div>
              ))}
            </FloatingCard>
          </div>
        )}

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", fontSize: "11.5px", color: "#A1A1AA", marginBottom: "24px", backdropFilter: "blur(8px)" }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
          Now live with Mono Connect
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: "clamp(40px, 8vw, 80px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, color: "#FFFFFF", maxWidth: "800px", margin: "0 auto 20px" }}
        >
          Your money.<br />
          <span style={{ background: "linear-gradient(135deg, #FFFFFF 30%, rgba(255,255,255,0.4) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Understood.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
          style={{ fontSize: "clamp(15px, 2.5vw, 18px)", color: "#71717A", maxWidth: "520px", lineHeight: 1.7, margin: "0 auto 36px" }}
        >
          AJO connects to your bank via Mono, automatically tracks every naira, and tells you exactly what&apos;s happening with your money — in plain language.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
          style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", marginBottom: "40px" }}
        >
          <Link
            href="/login?register=1"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 28px", borderRadius: "12px", background: "#FFFFFF", color: "#050505", fontSize: "14px", fontWeight: 700, textDecoration: "none", letterSpacing: "-0.01em", boxShadow: "0 8px 32px rgba(255,255,255,0.08)" }}
          >
            Create Free Account <ArrowRight size={15} />
          </Link>
          <Link
            href="/login"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 28px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#A1A1AA", fontSize: "14px", fontWeight: 600, textDecoration: "none", backdropFilter: "blur(8px)" }}
          >
            Sign In
          </Link>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}
        >
          <FeaturePill icon={ShieldCheck} text="Bank-grade security" />
          <FeaturePill icon={Zap} text="Instant sync via Mono" />
          <FeaturePill icon={BarChart3} text="AI money insights" />
          <FeaturePill icon={Lock} text="End-to-end encrypted" />
          <FeaturePill icon={Globe} text="All Nigerian banks" />
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: "#3F3F46", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          <span>Scroll</span>
          <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
            <ChevronDown size={14} />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <motion.section
        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7 }}
        style={{ position: "relative", zIndex: 1, padding: "80px 24px", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.01)" }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "40px", textAlign: "center" }}>
          {[
            { value: "50+", label: "Banks supported" },
            { value: "10k+", label: "Transactions synced daily" },
            { value: "3×", label: "Security audits passed" },
            { value: "2 min", label: "Avg. setup time" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: "26px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.04em" }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "#52525B", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Features grid */}
      <section style={{ position: "relative", zIndex: 1, padding: "100px 24px", maxWidth: "1000px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "60px" }}
        >
          <h2 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#FFFFFF", marginBottom: "12px" }}>
            Everything your money needs
          </h2>
          <p style={{ fontSize: "15px", color: "#52525B", maxWidth: "480px", margin: "0 auto" }}>
            One place to see, understand, and act on your complete financial picture.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {[
            { icon: "⚡", title: "Real-time Sync", desc: "Connect OPay, GTBank, Access Bank or any Nigerian bank. Transactions appear instantly via Mono." },
            { icon: "💡", title: "Money Stories", desc: "Plain-English summaries of your spending. No charts to decode — just clear, human language." },
            { icon: "📊", title: "Spending Intelligence", desc: "Automatic categorisation of every transaction. See exactly where your money goes." },
            { icon: "🔒", title: "Read-Only Access", desc: "AJO only reads your transactions. It cannot move money. Your credentials never leave Mono." },
            { icon: "📈", title: "Trend Analysis", desc: "Daily, weekly, and monthly trends so you know if you're on track or overspending." },
            { icon: "🎯", title: "Activity Tracking", desc: "Log and categorise your own financial activities to build a complete money picture." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: i * 0.07 }}
              style={{ padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", cursor: "default" }}
            >
              <div style={{ fontSize: "24px", marginBottom: "12px" }}>{f.icon}</div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em", marginBottom: "8px" }}>{f.title}</h3>
              <p style={{ fontSize: "13px", color: "#52525B", lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <motion.section
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }}
        style={{ position: "relative", zIndex: 1, padding: "80px 24px", background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#FFFFFF", marginBottom: "48px" }}>
            Up and running in minutes
          </h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { step: "01", title: "Create your account", desc: "Sign up with your email. No credit card, no KYC forms." },
              { step: "02", title: "Connect your bank via Mono", desc: "Securely link your OPay or bank account. Takes 30 seconds." },
              { step: "03", title: "Watch your money story unfold", desc: "AJO syncs transactions and gives you instant intelligence." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                style={{ display: "flex", gap: "24px", textAlign: "left", padding: "24px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#3F3F46", letterSpacing: "0.06em", minWidth: "24px", paddingTop: "2px" }}>{item.step}</div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em", marginBottom: "4px" }}>{item.title}</div>
                  <div style={{ fontSize: "13px", color: "#52525B" }}>{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }}
        style={{ position: "relative", zIndex: 1, padding: "120px 24px", textAlign: "center" }}
      >
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#FFFFFF", marginBottom: "16px", lineHeight: 1.08 }}>
            Start understanding your money today.
          </h2>
          <p style={{ fontSize: "15px", color: "#52525B", marginBottom: "36px", lineHeight: 1.6 }}>Free forever. No subscriptions, no hidden fees.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
            <Link href="/login?register=1" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "16px 32px", borderRadius: "12px", background: "#FFFFFF", color: "#050505", fontSize: "15px", fontWeight: 700, textDecoration: "none", letterSpacing: "-0.02em", boxShadow: "0 8px 32px rgba(255,255,255,0.08)" }}>
              Create Free Account <ArrowRight size={16} />
            </Link>
            <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "16px 32px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#71717A", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}>
              Sign In
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, padding: "32px 24px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "20px", height: "20px", background: "#FFFFFF", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "10px", fontWeight: 900, color: "#050505" }}>A</span>
          </div>
          <span style={{ fontSize: "12px", color: "#3F3F46" }}>AJO — Personal Money Intelligence</span>
        </div>
        <span style={{ fontSize: "11px", color: "#27272A" }}>Powered by Mono Connect · © {new Date().getFullYear()}</span>
      </footer>

      <style jsx global>{`
        @media (max-width: 768px) { .welcome-cards { display: none !important; } }
      `}</style>
    </div>
  );
}

