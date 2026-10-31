// ─────────────────────────────────────────────────────────────────
// MoniePay — Owner Security PIN & Bank Access Key Service
// Protects sensitive shop records, turnover reports & bank exports
// Nigerian SME Anti-Theft & Confidentiality Engine
// ─────────────────────────────────────────────────────────────────

const DEFAULT_PIN_STORAGE_KEY = "moniepay_owner_security_pin";
const AUTO_LOCK_STORAGE_KEY = "moniepay_auto_lock_timer_mins";
const SHOP_LOCKED_STORAGE_KEY = "moniepay_shop_is_locked";

export const AUTO_LOCK_OPTIONS = [
  { label: "1 min idle", value: 1 },
  { label: "2 mins (Default)", value: 2 },
  { label: "5 mins idle", value: 5 },
  { label: "Never (Manual lock only)", value: 0 },
];

export function getOwnerPin(userId?: string): string | null {
  if (typeof window === "undefined") return null;
  const key = userId ? `${DEFAULT_PIN_STORAGE_KEY}_${userId}` : DEFAULT_PIN_STORAGE_KEY;
  return localStorage.getItem(key) || localStorage.getItem(DEFAULT_PIN_STORAGE_KEY);
}

export function hasOwnerPin(userId?: string): boolean {
  return Boolean(getOwnerPin(userId));
}

export function setOwnerPin(pin: string, userId?: string): void {
  if (typeof window === "undefined") return;
  const cleanPin = pin.trim().slice(0, 4);
  if (cleanPin.length !== 4) return;
  const key = userId ? `${DEFAULT_PIN_STORAGE_KEY}_${userId}` : DEFAULT_PIN_STORAGE_KEY;
  localStorage.setItem(key, cleanPin);
  localStorage.setItem(DEFAULT_PIN_STORAGE_KEY, cleanPin);
}

export function verifyOwnerPin(inputPin: string, userId?: string): boolean {
  const stored = getOwnerPin(userId);
  if (!stored) {
    // If no PIN has been set yet, default fallback is "1234"
    return inputPin === "1234";
  }
  return stored === inputPin.trim();
}

export function resetOwnerPin(userId?: string): void {
  if (typeof window === "undefined") return;
  const key = userId ? `${DEFAULT_PIN_STORAGE_KEY}_${userId}` : DEFAULT_PIN_STORAGE_KEY;
  localStorage.removeItem(key);
  localStorage.removeItem(DEFAULT_PIN_STORAGE_KEY);
}

/**
 * Returns auto-lock timer in minutes (default 2 mins, 0 means disabled)
 */
export function getAutoLockMinutes(userId?: string): number {
  if (typeof window === "undefined") return 2;
  const key = userId ? `${AUTO_LOCK_STORAGE_KEY}_${userId}` : AUTO_LOCK_STORAGE_KEY;
  const val = localStorage.getItem(key);
  if (val === null) return 2; // Default to 2 minutes
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? 2 : parsed;
}

export function setAutoLockMinutes(mins: number, userId?: string): void {
  if (typeof window === "undefined") return;
  const key = userId ? `${AUTO_LOCK_STORAGE_KEY}_${userId}` : AUTO_LOCK_STORAGE_KEY;
  localStorage.setItem(key, String(mins));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("moniepay:autolock-setting-changed", { detail: { minutes: mins } }));
  }
}

export function isShopLocked(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SHOP_LOCKED_STORAGE_KEY) === "true";
}

export function lockShop(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SHOP_LOCKED_STORAGE_KEY, "true");
  window.dispatchEvent(new CustomEvent("moniepay:lock-shop"));
}

export function unlockShop(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SHOP_LOCKED_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("moniepay:unlock-shop"));
}

/**
 * Generates an immutable, authentic Bank Verification Access Key
 * e.g., "KEY-849201"
 */
export function generateBankAccessKey(): string {
  const randDigits = Math.floor(100000 + Math.random() * 900000);
  return `KEY-${randDigits}`;
}
