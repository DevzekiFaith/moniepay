"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Modern Responsive Navigation Architecture
// Frosted 3D Glassmorphism • Light & Dark Mode • Mobile Island Dock
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoniePayLogo, MoniePayMark } from "@/components/ui/MoniePayLogo";
import { useAuth } from "@/context/AuthContext";
import { LogoutModal } from "@/components/ui/LogoutModal";
import { SubscriptionStatusPill } from "@/components/subscription/SubscriptionStatusPill";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
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
  Sparkles,
  Zap,
} from "lucide-react";

export const NAV_SECTIONS = [
  {
    title: "Shop Operations",
    items: [
      {
        label: "Today's Pulse",
        href: "/",
        icon: Home,
        description: "Operating Dashboard & Next Actions",
      },
      {
        label: "Activity & Records",
        href: "/activity",
        icon: ArrowLeftRight,
        description: "Live Transactions & Receipts",
      },
      {
        label: "Cash & Accounts",
        href: "/accounts",
        icon: Building2,
        description: "Drawer Cash, Bank & POS",
      },
    ],
  },
  {
    title: "Intelligence Deck",
    items: [
      {
        label: "Market Intelligence",
        href: "/insights",
        icon: BrainCircuit,
        description: "Business Health, Leakages & Pricing",
      },
    ],
  },
  {
    title: "Shop Management",
    items: [
      {
        label: "Shop Profile",
        href: "/profile",
        icon: SlidersHorizontal,
        description: "Shop Details, Staff & Settings",
      },
      {
        label: "MoniePay Plus",
        href: "/upgrade",
        icon: ShieldCheck,
        description: "Shop Intelligence Plan",
        badge: "PRO",
      },
    ],
  },
];

// Flat list for mobile navigation
export const MOBILE_NAV_ITEMS = [
  { label: "Today", href: "/", icon: Home },
  { label: "Activity", href: "/activity", icon: ArrowLeftRight },
  { label: "Accounts", href: "/accounts", icon: Building2 },
  { label: "Insights", href: "/insights", icon: BrainCircuit },
  { label: "Profile", href: "/profile", icon: User },
];

// ── Mobile Header ─────────────────────────────────────────────────
export function AppMobileHeader() {
  const { user } = useAuth();

  return (
    <header className="md:hidden sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 px-3.5 sm:px-4 backdrop-blur-xl transition-colors">
      <Link href="/" className="flex items-center gap-2">
        <MoniePayMark size={28} />
        <div className="flex flex-col">
          <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-none">
            MoniePay
          </span>
          <span className="text-[9.5px] font-bold text-blue-600 dark:text-blue-400">
            Trader OS
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Real-Time Subscription Status Pill */}
        <SubscriptionStatusPill />

        {/* Light / Dark Mode Toggle */}
        <ThemeToggle size="sm" />

        {user ? (
          <Link
            href="/profile"
            className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-blue-950 dark:text-blue-100 text-xs font-bold"
          >
            <div className="h-5 w-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px] font-black">
              {(user.name?.[0] || "M").toUpperCase()}
            </div>
            <span className="max-w-[70px] truncate hidden sm:inline">
              {user.name?.split(" ")[0]}
            </span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-xl bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}

// ── Desktop Sidebar ───────────────────────────────────────────────
export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <>
      <aside className="hidden md:flex flex-col justify-between w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl min-h-screen p-4 sticky top-0 transition-colors z-30">
        <div className="space-y-6">
          {/* Logo & Tagline */}
          <div className="px-2 py-2">
            <MoniePayLogo size={34} showTagline={true} />
          </div>

          {/* Navigation Items */}
          <nav className="space-y-5">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1">
                <span className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {section.title}
                </span>
                <div className="space-y-1 mt-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-blue-700 text-white shadow-md shadow-blue-700/20"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-950 dark:hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              isActive
                                ? "text-white"
                                : "text-blue-600 dark:text-blue-400"
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {item.badge && (
                            <span
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          {isActive && (
                            <ChevronRight className="h-3.5 w-3.5 text-blue-200" />
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer / Theme Toggle, Subscription & Account */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
          {/* Theme Switcher Segmented Control */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Theme:
            </span>
            <ThemeToggle variant="segmented" />
          </div>

          {/* Subscription Status Pill */}
          <div className="px-1 flex justify-start">
            <SubscriptionStatusPill />
          </div>

          {user && (
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-[10.5px] font-medium text-blue-700 dark:text-blue-400 truncate">
                  {user.businessName || "Shop Owner"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLogoutOpen(true)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
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
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 backdrop-blur-2xl transition-colors pb-[env(safe-area-inset-bottom,4px)]">
      <div className="flex items-center justify-around">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10.5px] font-bold transition-all ${
                isActive
                  ? "text-blue-700 dark:text-blue-400 font-black"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default AppSidebar;
