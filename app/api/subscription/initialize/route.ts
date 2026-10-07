import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { initializeFlutterwaveCheckout } from "@/lib/flutterwave";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await request.json().catch(() => ({}));

    const userId = body.userId || user?.id || "user_owner_01";
    const email = body.email || user?.email || "trader@moniepay.app";
    const name = body.name || user?.name || "Shop Trader";
    const phone = body.phone || "08000000000";
    const planType: "monthly" | "annual" = body.planType === "annual" ? "annual" : "monthly";

    // Determine absolute origin redirect URL
    const origin =
      request.headers.get("origin") ||
      request.headers.get("referer") ||
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const cleanOrigin = origin.split("?")[0].replace(/\/$/, "");
    const redirectUrl = `${cleanOrigin}/upgrade?status=callback`;

    const result = await initializeFlutterwaveCheckout({
      userId,
      email,
      name,
      phone,
      planType,
      redirectUrl,
    });

    if (result.success && result.paymentLink) {
      return NextResponse.json({
        success: true,
        paymentLink: result.paymentLink,
        txRef: result.txRef,
        amount: result.amount,
        planType: result.planType,
      });
    }

    return NextResponse.json(
      {
        success: false,
        txRef: result.txRef,
        error: result.error || "Could not generate Flutterwave payment link.",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Subscription initialize error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
