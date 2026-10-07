"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Responsive Navigation Architecture
// Unified Single Emerald Theme • Fully Responsive
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AjoLogo } from "@/components/ui/AjoLogo";
import { useAuth } from "@/context/AuthContext";
import { LogoutModal } from "@/components/ui/LogoutModal";
import { SubscriptionStatusPill } from "@/components/subscription/SubscriptionStatusPill";
import {
  Home,
  ArrowLeftRight,
  BrainCircuit,
  Building2,
  SlidersHorizontal,
  LogOut,
  User,
  ShieldCheck,
  ChevronRight,
  Store,
} from "lucide-react";

export const NAV_SECTIONS = [
  {
    title: "Operating Layer",
    items: [
      { label: "Decisions", href: "/", icon: Home, description: "Operating Dashboard & Next Actions" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "Activity", href: "/activity", icon: ArrowLeftRight, description: "Live Business Activity" },
      { label: "Diagnostics", href: "/insights", icon: BrainCircuit, description: "Business Health & Leaks" },
      { label: "Cash & Accounts", href: "/accounts", icon: Building2, description: "Cash Drawer & Bank Accounts" },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Shop Profile", href: "/profile", icon: SlidersHorizontal, description: "Shop Info & Target" },
    ],
  },
];

// Flat list for mobile navigation
export const MOBILE_NAV_ITEMS = [
  { label: "Decisions", href: "/", icon: Home },
  { label: "Activity", href: "/activity", icon: ArrowLeftRight },
  { label: "Diagnostics", href: "/insights", icon: BrainCircuit },
  { label: "Accounts", href: "/accounts", icon: Building2 },
  { label: "Profile", href: "/profile", icon: User },
];

// ── Mobile Header ─────────────────────────────────────────────────
export function AppMobileHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-emerald-900/10 bg-white/95 px-3.5 sm:px-4 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <AjoLogo size={26} showTagline={false} />
        </Link>

        <div className="flex items-center gap-2">
          {/* Real-Time Subscription & Trial Days Pill */}
          <SubscriptionStatusPill />

          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-950 text-xs font-bold"
            >
              <div className="h-5 w-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-black">
                {(user.name?.[0] || "M").toUpperCase()}
              </div>
              <span className="max-w-[80px] truncate hidden sm:inline">{user.name?.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>
    </>
  );
}

// ── Desktop Sidebar ───────────────────────────────────────────────
export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <>
      <aside className="hidden md:flex flex-col justify-between w-64 border-r border-emerald-900/10 bg-white min-h-screen p-4 sticky top-0">
        <div className="space-y-6">
          {/* Logo */}
          <div className="px-2 py-2 flex items-center justify-between">
            <AjoLogo size={32} showTagline={true} />
          </div>

          {/* Navigation Items */}
          <nav className="space-y-5">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1">
                <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {section.title}
                </span>
                <div className="space-y-0.5 mt-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                          isActive
                            ? "bg-emerald-700 text-white shadow-sm"
                            : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-950"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-emerald-800"}`} />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <ChevronRight className="h-3.5 w-3.5 text-emerald-200" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer / Account & Subscription Status */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          {/* Subscription Status Pill */}
          <div className="px-1 flex justify-start">
            <SubscriptionStatusPill />
          </div>

          {user && (
            <div className="flex items-center justify-between p-2 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
                <p className="text-[10.5px] font-medium text-emerald-800 truncate">{user.businessName || "Shop Owner"}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsLogoutOpen(true)}
                className="p-1.5 rounded-xl hover:bg-emerald-100 text-slate-500 hover:text-slate-900 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        userName={user?.name || "Trader"}
        businessName={user?.businessName || "Shop"}
        onConfirm={async () => {
          setIsLogoutOpen(false);
          await logout();
        }}
      />
    </>
  );
}

// ── Mobile Bottom Navigation Bar ──────────────────────────────────
export function AppBottomBar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 border-t border-emerald-900/10 px-2 py-1.5 backdrop-blur-md">
      <div className="flex items-center justify-around">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10.5px] font-bold transition-all ${
                isActive ? "text-emerald-700 font-black" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${isActive ? "text-emerald-700" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
