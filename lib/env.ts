// ─────────────────────────────────────────────
// Environment helpers — provider & runtime config
// ─────────────────────────────────────────────

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function getFinancialProviderType(): "MONO" | "MOCK" {
  const configured = process.env.FINANCIAL_PROVIDER?.toUpperCase();

  if (configured === "MOCK") {
    return isDevelopment() ? "MOCK" : "MONO";
  }

  if (configured === "MONO" || !configured) {
    return "MONO";
  }

  return "MONO";
}

export function isMonoConfigured(): boolean {
  return Boolean(process.env.MONO_SECRET_KEY?.trim());
}

export function isFinancialProviderReady(): boolean {
  const provider = getFinancialProviderType();
  if (provider === "MOCK") return isDevelopment();
  return isMonoConfigured();
}
