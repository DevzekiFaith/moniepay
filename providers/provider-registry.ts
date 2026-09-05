// ─────────────────────────────────────────────
// Financial Provider Registry
// Resolves the configured Open Banking provider
// ─────────────────────────────────────────────

import type { FinancialProvider } from "./base/financial-provider.interface";
import { MonoFinancialProvider } from "./mono/mono-provider";

let activeProvider: FinancialProvider | null = null;

export function getFinancialProvider(): FinancialProvider {
  if (!activeProvider) {
    activeProvider = new MonoFinancialProvider();
  }
  return activeProvider;
}
