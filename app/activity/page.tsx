"use client";

// ─────────────────────────────────────────────────────────────────
// AJO — Activity Timeline
// Automated financial activity timeline observed from connected accounts.
// Chronological grouping (Today, Yesterday, This Week, Earlier),
// category corrections for self-learning, and zero manual transaction creation.
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo } from "react";
import { AppSidebar, AppBottomBar, AppMobileHeader } from "@/components/layout/AppNavigation";
import { formatNaira, formatTransactionDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { useRealtimeTransactions, dispatchRealtimeUpdate } from "@/hooks/useRealtimeTransactions";
import {
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Loader2,
  X,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { RecordActivityModal } from "@/components/modals/RecordActivityModal";

export interface TransactionItem {
  id: string;
  amount: number;
  currency: string;
  transactionDate: string | Date;
  description: string;
  merchantName?: string | null;
  normalizedMerchantName?: string | null;
  transactionType: "INCOME" | "EXPENSE" | "TRANSFER" | "REFUND" | string;
  status: string;
  isTransfer: boolean;
  category?: {
    id: string;
    name: string;
    slug?: string;
    icon?: string | null;
    color?: string | null;
  } | null;
  account?: {
    id: string;
    name: string;
  } | null;
  source?: string;
}

type FilterType = "ALL" | "EXPENSE" | "INCOME" | "TRANSFER";

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All Activity", value: "ALL" },
  { label: "Expenses",     value: "EXPENSE" },
  { label: "Income",       value: "INCOME" },
  { label: "Transfers",    value: "TRANSFER" },
];

function getDateGroupLabel(dateStr: string | Date): string {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const itemDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (itemDate.getTime() === today.getTime()) return "Today";
  if (itemDate.getTime() === yesterday.getTime()) return "Yesterday";

  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  if (itemDate >= oneWeekAgo) return "This Week";

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (itemDate.getFullYear() === now.getFullYear() && itemDate.getMonth() === now.getMonth()) {
    return "Earlier This Month";
  }

  return `${monthNames[itemDate.getMonth()]} ${itemDate.getFullYear()}`;
}

export default function ActivityPage() {
  const { user } = useAuth();
  const { notify, error } = useNotification();

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeDetailTx, setActiveDetailTx] = useState<TransactionItem | null>(null);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Pagination state (8 items per page for clean, manageable height)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedCategory, searchQuery]);

  // Load Transactions
  const loadTransactions = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions?pageSize=100");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error("Failed to load activity:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Realtime updates subscription
  useRealtimeTransactions({
    userId: user?.id,
    onTransactionChange: () => loadTransactions(),
  });

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Filter by type
      if (activeTab !== "ALL") {
        if (activeTab === "TRANSFER" && !tx.isTransfer && tx.transactionType !== "TRANSFER") return false;
        if (activeTab === "EXPENSE" && (tx.transactionType !== "EXPENSE" || tx.isTransfer)) return false;
        if (activeTab === "INCOME" && (tx.transactionType !== "INCOME" || tx.isTransfer)) return false;
      }

      // Filter by category
      if (selectedCategory !== "ALL" && tx.category?.name !== selectedCategory) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const desc = (tx.description || "").toLowerCase();
        const merchant = (tx.merchantName || "").toLowerCase();
        const normMerchant = (tx.normalizedMerchantName || "").toLowerCase();
        const cat = (tx.category?.name || "").toLowerCase();
        return desc.includes(q) || merchant.includes(q) || normMerchant.includes(q) || cat.includes(q);
      }

      return true;
    });
  }, [transactions, activeTab, selectedCategory, searchQuery]);

  // Pagination calculations
  const totalItems = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedTransactions = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, safeCurrentPage, pageSize]);

  // Group by Date for the CURRENT PAGE only (keeps page compact)
  const groupedTransactions = useMemo(() => {
    const groups: { label: string; items: TransactionItem[] }[] = [];
    const groupMap = new Map<string, TransactionItem[]>();

    for (const tx of paginatedTransactions) {
      const label = getDateGroupLabel(tx.transactionDate);
      if (!groupMap.has(label)) {
        groupMap.set(label, []);
      }
      groupMap.get(label)!.push(tx);
    }

    groupMap.forEach((items, label) => {
      groups.push({ label, items });
    });

    return groups;
  }, [paginatedTransactions]);

  // Unique Categories for Filter
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      if (t.category?.name) set.add(t.category.name);
    });
    return Array.from(set);
  }, [transactions]);

  // Category Correction Handler (Learns user rule)
  const handleUpdateCategory = async (txId: string, categoryId: string) => {
    setIsUpdatingCategory(true);
    try {
      const res = await fetch(`/api/transactions/${txId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId }),
      });

      if (res.ok) {
        const data = await res.json();
        notify("Category Updated", "AJO will remember this classification for future transactions.", { type: "success" });
        if (activeDetailTx?.id === txId && data.transaction) {
          setActiveDetailTx(data.transaction);
        }
        dispatchRealtimeUpdate("transaction");
        loadTransactions();
      } else {
        error("Update Failed", "Could not update category.");
      }
    } catch {
      error("Error", "Network error occurred.");
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  return (
    <div className="app-shell" style={{ display: "flex", minHeight: "100dvh", background: "#050505", color: "#EDEDED" }}>
      {/* Desktop Sidebar */}
      <div className="desktop-only">
        <AppSidebar />
      </div>

      {/* Main Page Area */}
      <div className="page-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AppMobileHeader />

        <main className="page-body" style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "#71717A", textTransform: "uppercase" }}>
                Financial Timeline
              </span>
              <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.03em", color: "#FFFFFF", marginTop: "4px" }}>
                Activity
              </h1>
              <p style={{ fontSize: "13.5px", color: "#A1A1AA", marginTop: "4px" }}>
                Observed bank feeds and recorded financial activity analyzed by AJO.
              </p>
            </div>

            <button
              onClick={() => setIsRecordModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                background: "#FFFFFF",
                color: "#050505",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "opacity 0.15s ease",
              }}
            >
              <Plus size={15} />
              <span>Record Activity</span>
            </button>
          </div>

          {/* Controls Bar: Search & Filters */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.75rem" }}>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
              {/* Type Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: "2px",
                  background: "#0D0D0D",
                  padding: "3px",
                  borderRadius: "8px",
                  border: "1px solid #1A1A1A",
                }}
              >
                {FILTERS.map((f) => {
                  const isSelected = activeTab === f.value;
                  return (
                    <button
                      key={f.value}
                      onClick={() => setActiveTab(f.value)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? "#050505" : "#71717A",
                        background: isSelected ? "#FFFFFF" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div style={{ position: "relative", minWidth: "240px", flex: "1 1 240px", maxWidth: "340px" }}>
                <Search
                  size={14}
                  color="#71717A"
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="text"
                  placeholder="Search merchant, narration…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 12px 7px 34px",
                    background: "#0D0D0D",
                    border: "1px solid #1A1A1A",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    color: "#FFFFFF",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            {categoriesList.length > 0 && (
              <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
                <button
                  onClick={() => setSelectedCategory("ALL")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11.5px",
                    fontWeight: selectedCategory === "ALL" ? 600 : 400,
                    background: selectedCategory === "ALL" ? "#222222" : "#0D0D0D",
                    border: "1px solid #1A1A1A",
                    color: selectedCategory === "ALL" ? "#FFFFFF" : "#71717A",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  All Categories
                </button>
                {categoriesList.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "11.5px",
                        fontWeight: isSelected ? 600 : 400,
                        background: isSelected ? "#222222" : "#0D0D0D",
                        border: "1px solid #1A1A1A",
                        color: isSelected ? "#FFFFFF" : "#71717A",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Loading */}
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "45vh", gap: "12px", color: "#71717A" }}>
              <Loader2 size={24} className="animate-spin" />
              <p style={{ fontSize: "13.5px" }}>Loading transaction activity…</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            /* ── EMPTY STATE ── */
            <div
              style={{
                background: "#0A0A0A",
                border: "1px dashed #222222",
                borderRadius: "16px",
                padding: "3.5rem 2rem",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                maxWidth: "500px",
                margin: "2rem auto",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "#141414",
                  border: "1px solid #222222",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                  color: "#FFFFFF",
                }}
              >
                <Layers size={20} />
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#FFFFFF", marginBottom: "6px" }}>
                No Transactions Recorded Yet
              </h3>
              <p style={{ fontSize: "13px", color: "#A1A1AA", lineHeight: 1.5, maxWidth: "380px", marginBottom: "1.5rem" }}>
                Once your connected financial accounts ingest new activity, transactions will automatically appear here.
              </p>
              <Link
                href="/accounts"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 16px",
                  background: "#FFFFFF",
                  color: "#050505",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <Plus size={14} />
                <span>Manage Accounts</span>
              </Link>
            </div>
          ) : (
            /* ── TIMELINE FEED ── */
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {groupedTransactions.map((group) => (
                <div key={group.label}>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      color: "#71717A",
                      textTransform: "uppercase",
                      marginBottom: "0.75rem",
                      paddingLeft: "4px",
                    }}
                  >
                    {group.label}
                  </div>

                  <div
                    style={{
                      background: "#0D0D0D",
                      border: "1px solid #1A1A1A",
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}
                  >
                    {group.items.map((tx, idx) => {
                      const isExpense = tx.transactionType === "EXPENSE" && !tx.isTransfer;
                      const isIncome = tx.transactionType === "INCOME" && !tx.isTransfer;
                      const isTransfer = tx.isTransfer || tx.transactionType === "TRANSFER";
                      const merchantTitle = tx.normalizedMerchantName || tx.merchantName || tx.description;

                      return (
                        <div
                          key={tx.id}
                          onClick={() => setActiveDetailTx(tx)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "1rem 1.25rem",
                            borderBottom: idx === group.items.length - 1 ? "none" : "1px solid #141414",
                            cursor: "pointer",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#121212")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          {/* Left: Direction Icon & Details */}
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                                background: "#171717",
                                border: "1px solid #222222",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                color: isIncome ? "#10B981" : isTransfer ? "#3B82F6" : "#A1A1AA",
                              }}
                            >
                              {isIncome ? (
                                <ArrowDownLeft size={16} />
                              ) : isTransfer ? (
                                <ArrowLeftRight size={15} />
                              ) : (
                                <ArrowUpRight size={16} />
                              )}
                            </div>

                            <div style={{ minWidth: 0 }}>
                              <p
                                style={{
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: "#FFFFFF",
                                  lineHeight: 1.3,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  maxWidth: "100%",
                                }}
                              >
                                {merchantTitle}
                              </p>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                                <span style={{ fontSize: "11.5px", color: "#71717A" }}>
                                  {tx.category?.name || "Uncategorized"}
                                </span>
                                {tx.account?.name && (
                                  <>
                                    <span style={{ fontSize: "10px", color: "#3F3F46" }}>•</span>
                                    <span style={{ fontSize: "11px", color: "#52525B" }}>{tx.account.name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Amount & Date */}
                          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "1rem" }}>
                            <span
                              style={{
                                fontSize: "14.5px",
                                fontWeight: 700,
                                color: isIncome ? "#10B981" : isTransfer ? "#93C5FD" : "#FFFFFF",
                                display: "block",
                              }}
                            >
                              {isIncome ? `+${formatNaira(tx.amount)}` : isTransfer ? formatNaira(tx.amount) : `-${formatNaira(tx.amount)}`}
                            </span>
                            <span style={{ fontSize: "11px", color: "#52525B", marginTop: "2px", display: "block" }}>
                              {new Date(tx.transactionDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1rem",
                    padding: "1rem 0.25rem",
                    borderTop: "1px solid #1A1A1A",
                    marginTop: "0.5rem",
                  }}
                >
                  <span style={{ fontSize: "12.5px", color: "#71717A" }}>
                    Showing{" "}
                    <strong style={{ color: "#EDEDED" }}>
                      {(safeCurrentPage - 1) * pageSize + 1}–{Math.min(safeCurrentPage * pageSize, totalItems)}
                    </strong>{" "}
                    of <strong style={{ color: "#EDEDED" }}>{totalItems}</strong> transactions
                  </span>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={safeCurrentPage <= 1}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "6px 10px",
                        background: "#0D0D0D",
                        border: "1px solid #222222",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: safeCurrentPage <= 1 ? "#3F3F46" : "#EDEDED",
                        cursor: safeCurrentPage <= 1 ? "not-allowed" : "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <ChevronLeft size={14} />
                      <span className="desktop-inline">Previous</span>
                    </button>

                    {/* Mobile Page Readout */}
                    <span className="mobile-only" style={{ fontSize: "11.5px", color: "#A1A1AA", padding: "0 4px" }}>
                      {safeCurrentPage} / {totalPages}
                    </span>

                    {/* Desktop Page Pills (Windowed around active page) */}
                    <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
                        .map((p, idx, arr) => {
                          const isCurrent = p === safeCurrentPage;
                          const prev = arr[idx - 1];
                          const showEllipsis = prev && p - prev > 1;

                          return (
                            <div key={p} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              {showEllipsis && <span style={{ color: "#52525B", fontSize: "11px", padding: "0 2px" }}>…</span>}
                              <button
                                type="button"
                                onClick={() => {
                                  setCurrentPage(p);
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  fontWeight: isCurrent ? 700 : 500,
                                  background: isCurrent ? "#FFFFFF" : "#0D0D0D",
                                  color: isCurrent ? "#050505" : "#71717A",
                                  border: isCurrent ? "none" : "1px solid #222222",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                {p}
                              </button>
                            </div>
                          );
                        })}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={safeCurrentPage >= totalPages}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "6px 10px",
                        background: "#0D0D0D",
                        border: "1px solid #222222",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: safeCurrentPage >= totalPages ? "#3F3F46" : "#EDEDED",
                        cursor: safeCurrentPage >= totalPages ? "not-allowed" : "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span className="desktop-inline">Next</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="mobile-only">
        <AppBottomBar />
      </div>

      {/* ── RECORD LIVE ACTIVITY MODAL ── */}
      <RecordActivityModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={() => loadTransactions()}
      />

      {/* ── TRANSACTION DETAIL DRAWER (Section 24 of Specification) ── */}
      <AnimatePresence>
        {activeDetailTx && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: "1rem",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              style={{
                width: "100%",
                maxWidth: "460px",
                background: "#0D0D0D",
                border: "1px solid #222222",
                borderRadius: "16px",
                padding: "2rem",
                position: "relative",
              }}
            >
              <button
                onClick={() => setActiveDetailTx(null)}
                style={{
                  position: "absolute",
                  top: "1.25rem",
                  right: "1.25rem",
                  background: "transparent",
                  border: "none",
                  color: "#71717A",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>

              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "#71717A", textTransform: "uppercase" }}>
                Transaction Detail
              </span>

              <h2 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.03em", color: "#FFFFFF", marginTop: "4px" }}>
                {activeDetailTx.transactionType === "INCOME" ? `+${formatNaira(activeDetailTx.amount)}` : `-${formatNaira(activeDetailTx.amount)}`}
              </h2>

              <p style={{ fontSize: "14px", color: "#E4E4E7", marginTop: "4px", fontWeight: 600 }}>
                {activeDetailTx.normalizedMerchantName || activeDetailTx.merchantName || activeDetailTx.description}
              </p>

              {/* Data Table */}
              <div style={{ marginTop: "1.5rem", borderTop: "1px solid #1A1A1A", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#71717A" }}>Date &amp; Time</span>
                  <span style={{ color: "#FFFFFF", fontWeight: 500 }}>
                    {formatTransactionDate(activeDetailTx.transactionDate)}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#71717A" }}>Account</span>
                  <span style={{ color: "#FFFFFF", fontWeight: 500 }}>{activeDetailTx.account?.name || "Connected Bank"}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#71717A" }}>Type</span>
                  <span style={{ color: "#FFFFFF", fontWeight: 500 }}>{activeDetailTx.transactionType}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#71717A" }}>Status</span>
                  <span style={{ color: "#10B981", fontWeight: 600 }}>{activeDetailTx.status}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#71717A" }}>Category</span>
                  <span style={{ color: "#FFFFFF", fontWeight: 600 }}>{activeDetailTx.category?.name || "Uncategorized"}</span>
                </div>

                {activeDetailTx.description !== activeDetailTx.merchantName && (
                  <div style={{ borderTop: "1px solid #171717", paddingTop: "8px", marginTop: "4px" }}>
                    <span style={{ fontSize: "11px", color: "#52525B", display: "block" }}>Original Provider Description</span>
                    <p style={{ fontSize: "12px", color: "#71717A", marginTop: "2px", fontFamily: "monospace" }}>
                      {activeDetailTx.description}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ marginTop: "2rem", borderTop: "1px solid #1A1A1A", paddingTop: "1.25rem" }}>
                <button
                  type="button"
                  onClick={() => setActiveDetailTx(null)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#171717",
                    border: "1px solid #262626",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
