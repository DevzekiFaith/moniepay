import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { CREDIT_PACKS } from "@/types/credit.types";
import { FLUTTERWAVE_CONFIG } from "@/lib/flutterwave";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await request.json().catch(() => ({}));

    const userId = body.userId || user?.id || "user_owner_01";
    const email = body.email || user?.email || "trader@moniepay.app";
    const name = body.name || user?.name || "Market Trader";
    const phone = body.phone || "08000000000";
    const packId = body.packId as "pack_10" | "pack_60" | "pack_140";

    const pack = CREDIT_PACKS.find((p) => p.id === packId);
    if (!pack) {
      return NextResponse.json(
        { success: false, error: "Please select a valid credit pack (₦100, ₦500, or ₦1,000)." },
        { status: 400 }
      );
    }

    const txRef = `mp_cred_${pack.id}_${userId.substring(0, 8)}_${Date.now()}`;

    // Determine redirect URL
    const origin =
      request.headers.get("origin") ||
      request.headers.get("referer") ||
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const cleanOrigin = origin.split("?")[0].replace(/\/$/, "");
    const redirectUrl = `${cleanOrigin}/insights?credit_status=callback&tx_ref=${txRef}&pack_id=${pack.id}`;

    const payload = {
      tx_ref: txRef,
      amount: pack.priceNgn,
      currency: "NGN",
      redirect_url: redirectUrl,
      payment_options: "card,banktransfer,ussd,account,qr",
      customer: {
        email: email.trim().toLowerCase(),
        name: name.trim() || "Trader",
        phonenumber: phone,
      },
      customizations: {
        title: `MoniePay — ${pack.credits} Insight Credits`,
        description: `${pack.label} (${pack.description})`,
        logo: "https://moniepay.app/images/logo.png",
      },
      meta: {
        userId,
        packId: pack.id,
        credits: pack.credits,
        type: "INSIGHT_CREDITS",
        appName: "MoniePay",
      },
    };

    // If Flutterwave Secret Key is configured, initialize hosted checkout
    if (FLUTTERWAVE_CONFIG.SECRET_KEY) {
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
          return NextResponse.json({
            success: true,
            paymentLink: data.data.link as string,
            txRef,
            amount: pack.priceNgn,
            credits: pack.credits,
            packId: pack.id,
          });
        }
      } catch (err) {
        console.warn("Could not call live Flutterwave checkout API:", err);
      }
    }

    // In local dev/test or when hosted checkout is unavailable, return local test callback
    return NextResponse.json({
      success: true,
      paymentLink: `${cleanOrigin}/insights?credit_status=callback&tx_ref=${txRef}&pack_id=${pack.id}&amount=${pack.priceNgn}&simulated=true`,
      txRef,
      amount: pack.priceNgn,
      credits: pack.credits,
      packId: pack.id,
      isSimulated: true,
    });
  } catch (error: any) {
    console.error("Initialize credit payment error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to initialize payment." },
      { status: 500 }
    );
  }
}
