// ─────────────────────────────────────────────
// Shared Utilities
// ─────────────────────────────────────────────

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Nigerian Naira
 */
export function formatNaira(amount: number, compact = false): string {
  const abs = Math.abs(amount);
  if (compact && abs >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (compact && abs >= 1_000) {
    return `₦${(amount / 1_000).toFixed(0)}K`;
  }
  return `₦${Math.round(abs).toLocaleString("en-US")}`;
}

/**
 * Format a relative date string (e.g., "Today · 8:42 AM")
 */
export function formatTransactionDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const txDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const time = d.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit", hour12: true });

  if (txDay.getTime() === today.getTime()) return `Today · ${time}`;
  if (txDay.getTime() === yesterday.getTime()) return `Yesterday · ${time}`;

  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: txDay.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  }) + ` · ${time}`;
}

/**
 * Calculate percentage change between two values.
 */
export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Truncate text to a given length.
 */
export function truncate(text: string, max = 30): string {
  if (text.length <= max) return text;
  return text.substring(0, max - 1) + "…";
}

/**
 * Get initials from a name (e.g., "John Doe" → "JD")
 */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Sleep utility for mock delays.
 */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
