"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Voice & Auto-Stock Directory Page
// Live Voice/Typed Entry Ingestion • Stock Reconciliation • Alerts
// ─────────────────────────────────────────────────────────────────

import React from "react";
import { AppSidebar, AppBottomBar, AppMobileHeader } from "@/components/layout/AppNavigation";
import { StockDirectoryTable } from "@/components/directory/StockDirectoryTable";

export default function DirectoryPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased">
      {/* ── DESKTOP SIDEBAR ── */}
      <AppSidebar />

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col min-w-0 pb-28 md:pb-12">
        {/* Mobile Header */}
        <AppMobileHeader />

        <div className="max-w-7xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-4">
          <StockDirectoryTable />
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAVIGATION ── */}
      <AppBottomBar />
    </div>
  );
}
