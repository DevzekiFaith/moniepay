// ─────────────────────────────────────────────────────────────────
// MoniePay — Pluggable Payment Provider Interface Architecture
// Enables seamless Flutterwave integration today, with plug-and-play
// support for Paystack, Squad, Moniepoint, or others in the future.
// ─────────────────────────────────────────────────────────────────

export interface CreateVirtualAccountParams {
  userId: string;
  email: string;
  businessName: string;
  bvn?: string;
  phone?: string;
  isPermanent?: boolean;
}

export interface VirtualAccountResult {
  success: boolean;
  accountNumber: string;
  bankName: string;
  accountName: string;
  flwRef?: string;
  orderRef?: string;
  expiryDate?: string;
  rawResponse?: any;
  error?: string;
}

export interface TransactionVerificationResult {
  success: boolean;
  status: "successful" | "failed" | "pending";
  txRef: string;
  flwRef?: string;
  amount: number;
  currency: string;
  paymentType: string;
  customer: {
    email?: string;
    name?: string;
    phone?: string;
  };
  meta: Record<string, any>;
  rawPayload: any;
  error?: string;
}

export interface WebhookPaymentEvent {
  event: "charge.completed" | "transfer.completed" | "virtual_account.credited";
  txRef: string;
  flwRef?: string;
  amount: number;
  currency: string;
  status: "successful" | "failed" | "pending";
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  accountNumber?: string;
  bankName?: string;
  settledAmount?: number;
  raw: any;
}

export interface PaymentProvider {
  readonly name: string;
  createVirtualAccount(params: CreateVirtualAccountParams): Promise<VirtualAccountResult>;
  verifyTransaction(transactionId: string | number): Promise<TransactionVerificationResult>;
  verifyWebhookSignature(signatureHeader: string | null): boolean;
  parseWebhookPayload(body: any): WebhookPaymentEvent | null;
}
