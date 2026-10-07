// ─────────────────────────────────────────────────────────────────
// MoniePay — Flutterwave API Service & Signature Verifier
// Server-side Flutterwave Checkout & Transaction Verification
// 7-day Free Trial • ₦1,500/Month or ₦15,000/Year Plans
// ─────────────────────────────────────────────────────────────────

export const FLUTTERWAVE_CONFIG = {
  PUBLIC_KEY:
    process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ||
    process.env.FLUTTERWAVE_PUBLIC_KEY ||
    "",
  SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY || "",
  SECRET_HASH: process.env.FLUTTERWAVE_SECRET_HASH || "moniepay_flw_secure_secret_hash",
  BASE_URL: "https://api.flutterwave.com/v3",
  MONTHLY_AMOUNT: 1500, // ₦1,500 / month
  ANNUAL_AMOUNT: 15000, // ₦15,000 / year (save ₦3,000)
  CURRENCY: "NGN",
  PLAN_NAME_MONTHLY: "MoniePay Plus Monthly",
  PLAN_NAME_ANNUAL: "MoniePay Plus Annual",
};

export interface InitPaymentParams {
  userId: string;
  email: string;
  name: string;
  phone?: string;
  planType?: "monthly" | "annual";
  redirectUrl?: string;
  customTxRef?: string;
}

/**
 * Verifies Flutterwave webhook verif-hash signature
 */
export function verifyFlutterwaveWebhookSignature(signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  return signatureHeader === FLUTTERWAVE_CONFIG.SECRET_HASH;
}

/**
 * Initialize standard hosted Flutterwave Checkout session
 */
export async function initializeFlutterwaveCheckout(params: InitPaymentParams) {
  const { userId, email, name, phone, planType = "monthly", redirectUrl, customTxRef } = params;
  const isAnnual = planType === "annual";
  const amount = isAnnual ? FLUTTERWAVE_CONFIG.ANNUAL_AMOUNT : FLUTTERWAVE_CONFIG.MONTHLY_AMOUNT;
  const durationDays = isAnnual ? 365 : 30;
  const planTitle = isAnnual ? "MoniePay Plus Annual (1 Year)" : "MoniePay Plus Monthly (1 Month)";
  const planDesc = isAnnual ? "12 Months Full Shop Decision Intelligence (₦15,000/yr)" : "1 Month Full Shop Decision Intelligence (₦1,500/mo)";

  const txRef = customTxRef || `mp_${isAnnual ? "ann" : "sub"}_${userId.substring(0, 8)}_${Date.now()}`;

  const payload = {
    tx_ref: txRef,
    amount,
    currency: FLUTTERWAVE_CONFIG.CURRENCY,
    redirect_url: redirectUrl,
    payment_options: "card,banktransfer,ussd,account,qr,credit",
    customer: {
      email: email.trim().toLowerCase(),
      name: name.trim() || "Trader",
      phonenumber: phone || "08000000000",
    },
    customizations: {
      title: planTitle,
      description: planDesc,
      logo: "https://moniepay.app/images/logo.png",
    },
    meta: {
      userId,
      plan: isAnnual ? "MONIEPAY_PLUS_ANNUAL" : "MONIEPAY_PLUS_MONTHLY",
      planType: isAnnual ? "annual" : "monthly",
      duration_days: durationDays,
      appName: "MoniePay",
    },
  };

  try {
    const res = await fetch(`${FLUTTERWAVE_CONFIG.BASE_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FLUTTERWAVE_CONFIG.SECRET_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok && data?.status === "success" && data?.data?.link) {
      return {
        success: true,
        paymentLink: data.data.link as string,
        txRef,
        amount,
        planType: isAnnual ? "annual" : "monthly",
      };
    }

    // If Flutterwave sandbox returns an error or mock mode is active
    console.warn("Flutterwave init returned non-success:", data);
    return {
      success: false,
      txRef,
      error: data?.message || "Could not initialize Flutterwave checkout.",
    };
  } catch (err: any) {
    console.error("Flutterwave initialize error:", err);
    return {
      success: false,
      txRef,
      error: err?.message || "Network error communicating with Flutterwave.",
    };
  }
}

/**
 * Verify a transaction using Flutterwave's ledger (Server-to-Server)
 * Critical Security Rule: Never rely on client-side status.
 */
export async function verifyFlutterwaveTransaction(transactionId: string | number) {
  if (!transactionId) {
    return { success: false, error: "Transaction ID is required for verification." };
  }

  try {
    const res = await fetch(
      `${FLUTTERWAVE_CONFIG.BASE_URL}/transactions/${transactionId}/verify`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FLUTTERWAVE_CONFIG.SECRET_KEY}`,
        },
        cache: "no-store",
      }
    );

    const result = await res.json();

    if (res.ok && result?.status === "success" && result?.data) {
      const data = result.data;
      const isSuccessful =
        data.status === "successful" &&
        data.currency === FLUTTERWAVE_CONFIG.CURRENCY &&
        data.amount >= 1400; // Allow ₦1,500 monthly or ₦15,000 annual

      const isAnnual = data.amount >= 10000;

      return {
        success: isSuccessful,
        status: data.status as "successful" | "failed" | "pending",
        txRef: data.tx_ref,
        flwRef: data.flw_ref,
        amount: data.amount,
        currency: data.currency,
        paymentType: data.payment_type || "Card/Transfer",
        planType: (isAnnual ? "annual" : "monthly") as "monthly" | "annual",
        customer: {
          email: data.customer?.email,
          name: data.customer?.name,
          phone: data.customer?.phone_number,
        },
        meta: data.meta || {},
        rawPayload: data,
      };
    }

    return {
      success: false,
      status: (result?.data?.status || "failed") as "successful" | "failed" | "pending",
      txRef: result?.data?.tx_ref || "",
      amount: result?.data?.amount || 0,
      currency: "NGN",
      error: result?.message || "Transaction not found or unverified.",
    };
  } catch (err: any) {
    console.error("Flutterwave verification error:", err);
    return {
      success: false,
      status: "failed" as const,
      txRef: "",
      amount: 0,
      currency: "NGN",
      error: err?.message || "Network error during verification.",
    };
  }
}
