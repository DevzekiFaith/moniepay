// ─────────────────────────────────────────────────────────────────
// MoniePay — Owner Security PIN & Bank Access Key Service
// Protects sensitive shop records, turnover reports & bank exports
// Nigerian SME Anti-Theft & Confidentiality Engine
// ─────────────────────────────────────────────────────────────────

const DEFAULT_PIN_STORAGE_KEY = "moniepay_owner_security_pin";

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
 * Generates an immutable, authentic Bank Verification Access Key
 * e.g., "KEY-849201"
 */
export function generateBankAccessKey(): string {
  const randDigits = Math.floor(100000 + Math.random() * 900000);
  return `KEY-${randDigits}`;
}
