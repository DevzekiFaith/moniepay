"use client";

// ─────────────────────────────────────────────────────────────────
// Monie AI — Conversational Money Intelligence Chat Interface
// Powered by MonieAiLogo & Enhanced Framer Motion Spring Dynamics
// Strictly adheres to MoniePay's electric blue/indigo color system
// ─────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { MonieAiEmblem } from "@/components/ui/MonieAiLogo";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const INITIAL_SUGGESTIONS = [
  "How much did I spend on food this week?",
  "Where is most of my money going?",
  "What was my biggest expense this month?",
  "What recurring bills do I have coming up?",
  "Am I spending faster than I'm earning?",
];

export function MonieAiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi Alex! I'm **Monie AI**, your personal money intelligence copilot. Ask me anything about your verified spending, balances, or recurring bills.",
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to receive response from Monie AI");
      }

      const data = await res.json();
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content:
          data.reply ||
          "I analyzed your active ledger, but couldn't produce an answer right now. Please try asking again in a moment.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Monie AI error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content:
            "⚠️ Unable to connect to your live ledger intelligence right now. Please check your network connection and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: "assistant",
        content:
          "Conversation cleared. How can I help you understand your money today?",
        timestamp: new Date(),
      },
    ]);
  };

  const renderFormattedContent = (text: string) => {
    const lines = text.split("\n");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} style={{ height: "0.25rem" }} />;

          if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
            const clean = line.trim().replace(/^[•\-]\s*/, "");
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  paddingLeft: "0.25rem",
                }}
              >
                <span
                  style={{
                    color: "var(--accent)",
                    fontWeight: 700,
                    lineHeight: 1.4,
                  }}
                >
                  •
                </span>
                <span
                  style={{ flex: 1 }}
                  dangerouslySetInnerHTML={{
                    __html: formatBold(clean),
                  }}
                />
              </div>
            );
          }

          return (
            <p
              key={idx}
              style={{ margin: 0, lineHeight: 1.55 }}
              dangerouslySetInnerHTML={{
                __html: formatBold(line),
              }}
            />
          );
        })}
      </div>
    );
  };

  const formatBold = (str: string) => {
    return str.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #F8FAFC; font-weight: 600;">$1</strong>');
  };

  return (
    <>
      {/* ── Tactile Floating Launcher Button ── */}
      <div
        style={{
          position: "fixed",
          bottom: "5rem",
          right: "1.5rem",
          zIndex: 900,
        }}
      >
        <motion.button
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          onClick={() => setIsOpen((prev) => !prev)}
          style={{
            position: "relative",
            width: "52px",
            height: "52px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #131D31 0%, #0D1526 100%)",
            border: "1px solid rgba(79, 156, 249, 0.35)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            cursor: "pointer",
            padding: 0,
          }}
          aria-label="Open Monie AI Assistant"
          title="Talk to Monie AI"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <MonieAiEmblem size={34} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── Glassmorphic Conversational Modal / Drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.93 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            style={{
              position: "fixed",
              bottom: "8.75rem",
              right: "1.5rem",
              width: "min(420px, calc(100vw - 2rem))",
              height: "min(590px, calc(100dvh - 11rem))",
              background: "rgba(10, 16, 30, 0.96)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: "1px solid rgba(79, 156, 249, 0.22)",
              borderRadius: "22px",
              boxShadow:
                "0 24px 70px rgba(0, 0, 0, 0.8), 0 0 20px rgba(37, 99, 235, 0.25)",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "1rem 1.25rem",
                background:
                  "linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(79, 156, 249, 0.12) 100%)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <MonieAiEmblem size={32} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        letterSpacing: "-0.01em",
                        margin: 0,
                      }}
                    >
                      Monie AI
                    </h3>
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: "4px",
                        background: "rgba(79, 156, 249, 0.15)",
                        color: "var(--accent)",
                        border: "1px solid rgba(79, 156, 249, 0.3)",
                      }}
                    >
                      LIVE COPILOT
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--text-tertiary)",
                      margin: "2px 0 0 0",
                    }}
                  >
                    Natural Money Intelligence
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={clearChat}
                  title="Clear conversation"
                  className="neo-tactile-btn"
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  <RefreshCw size={13} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  title="Minimize"
                  className="neo-tactile-btn"
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  <X size={15} />
                </motion.button>
              </div>
            </div>

            {/* Message Thread */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.875rem",
              }}
            >
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 350, damping: 24 }}
                    style={{
                      display: "flex",
                      justifyContent: isUser ? "flex-end" : "flex-start",
                      gap: "8px",
                    }}
                  >
                    {!isUser && (
                      <div style={{ flexShrink: 0, marginTop: "2px" }}>
                        <MonieAiEmblem size={24} />
                      </div>
                    )}

                    <div
                      style={{
                        maxWidth: "85%",
                        padding: "0.75rem 0.95rem",
                        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        background: isUser
                          ? "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)"
                          : "rgba(255, 255, 255, 0.05)",
                        border: isUser
                          ? "1px solid rgba(255, 255, 255, 0.2)"
                          : "1px solid rgba(255, 255, 255, 0.08)",
                        color: isUser ? "#FFFFFF" : "var(--text-secondary)",
                        fontSize: "13px",
                        boxShadow: isUser
                          ? "0 4px 16px rgba(37, 99, 235, 0.3)"
                          : "0 2px 8px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      {renderFormattedContent(msg.content)}
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div style={{ flexShrink: 0 }}>
                    <MonieAiEmblem size={24} />
                  </div>
                  <div
                    style={{
                      padding: "0.5rem 0.85rem",
                      borderRadius: "14px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      fontSize: "12px",
                      color: "var(--text-tertiary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Loader2 size={12} className="animate-spin" color="var(--accent)" />
                    <span>Analyzing live ledger</span>
                    <span className="animate-pulse">…</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            {messages.length <= 3 && (
              <div
                style={{
                  padding: "0 0.875rem 0.625rem",
                  display: "flex",
                  gap: "6px",
                  overflowX: "auto",
                  scrollbarWidth: "none",
                }}
              >
                {INITIAL_SUGGESTIONS.map((sug, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSend(sug)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: 500,
                      color: "var(--accent)",
                      background: "rgba(79, 156, 249, 0.08)",
                      border: "1px solid rgba(79, 156, 249, 0.2)",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      transition: "border-color 0.15s ease",
                      flexShrink: 0,
                    }}
                  >
                    {sug}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div
              style={{
                padding: "0.75rem 1rem 1rem",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                background: "rgba(10, 16, 30, 0.8)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about spending, food, bills…"
                disabled={isLoading}
                style={{
                  flex: 1,
                  height: "38px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  padding: "0 12px",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />

              <motion.button
                whileHover={input.trim() && !isLoading ? { scale: 1.08 } : {}}
                whileTap={input.trim() && !isLoading ? { scale: 0.92 } : {}}
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="neo-tactile-btn"
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: input.trim() && !isLoading
                    ? "linear-gradient(135deg, #4F9CF9 0%, #2563EB 100%)"
                    : "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: input.trim() && !isLoading ? "#FFFFFF" : "var(--text-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: input.trim() && !isLoading ? "pointer" : "default",
                  boxShadow: input.trim() && !isLoading
                    ? "0 1px 3px rgba(0, 0, 0, 0.3)"
                    : "none",
                }}
              >
                <Send size={14} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
