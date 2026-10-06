// ─────────────────────────────────────────────────────────────────
// MoniePay — Flutterwave API Service & Signature Verifier
// Server-side Flutterwave Checkout & Transaction Verification
// ─────────────────────────────────────────────────────────────────

export const FLUTTERWAVE_CONFIG = {
  PUBLIC_KEY:
    process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ||
    process.env.FLUTTERWAVE_PUBLIC_KEY ||
    "",
  SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY || "",
  SECRET_HASH: process.env.FLUTTERWAVE_SECRET_HASH || "moniepay_flw_secure_secret_hash",
  BASE_URL: "https://api.flutterwave.com/v3",
  SUBSCRIPTION_AMOUNT: 1500, // ₦1,500 / month
  CURRENCY: "NGN",
  PLAN_NAME: "MoniePay Plus Monthly",
};

export interface InitPaymentParams {
  userId: string;
  email: string;
  name: string;
  phone?: string;
  redirectUrl?: string;
  customTxRef?: string;
}

/**
 * Initialize standard hosted Flutterwave Checkout session
 */
export async function initializeFlutterwaveCheckout(params: InitPaymentParams) {
  const { userId, email, name, phone, redirectUrl, customTxRef } = params;
  const txRef = customTxRef || `mp_sub_${userId.substring(0, 8)}_${Date.now()}`;

  const payload = {
    tx_ref: txRef,
    amount: FLUTTERWAVE_CONFIG.SUBSCRIPTION_AMOUNT,
    currency: FLUTTERWAVE_CONFIG.CURRENCY,
    redirect_url: redirectUrl,
    payment_options: "card,banktransfer,ussd,account,qr,credit",
    customer: {
      email: email.trim().toLowerCase(),
      name: name.trim() || "Trader",
      phonenumber: phone || "08000000000",
    },
    customizations: {
      title: "MoniePay Plus Subscription",
      description: "1 Month Shop Decision Intelligence (₦1,500/mo)",
      logo: "https://moniepay.app/images/logo.png",
    },
    meta: {
      userId,
      plan: "MONIEPAY_PLUS_MONTHLY",
      duration_days: 30,
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
        data.amount >= FLUTTERWAVE_CONFIG.SUBSCRIPTION_AMOUNT;

      return {
        success: isSuccessful,
        status: data.status as "successful" | "failed" | "pending",
        txRef: data.tx_ref,
        flwRef: data.flw_ref,
        transactionId: String(data.id),
        amount: data.amount,
        currency: data.currency,
        paymentType: data.payment_type,
        customer: {
          email: data.customer?.email,
          name: data.customer?.name,
          phone: data.customer?.phone_number,
        },
        meta: data.meta,
        raw: data,
      };
    }

    return {
      success: false,
      status: (result?.data?.status || "failed") as "successful" | "failed" | "pending",
      error: result?.message || "Transaction verification failed on Flutterwave.",
    };
  } catch (err: any) {
    console.error("Flutterwave verification error:", err);
    return {
      success: false,
      error: err?.message || "Network error verifying transaction.",
    };
  }
}

/**
 * Verifies the incoming webhook signature header against secret hash
 */
export function verifyFlutterwaveWebhookSignature(signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  return signatureHeader === FLUTTERWAVE_CONFIG.SECRET_HASH;
}
