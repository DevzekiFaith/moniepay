import { NextRequest, NextResponse } from "next/server";
import { verifyFlutterwaveWebhookSignature, verifyFlutterwaveTransaction } from "@/lib/flutterwave";
import { activateUserSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify webhook signature header
    const signature = request.headers.get("verif-hash");
    const isSignatureValid = verifyFlutterwaveWebhookSignature(signature);

    if (!isSignatureValid && process.env.NODE_ENV === "production") {
      console.warn("Unauthorized Flutterwave webhook signature attempt:", signature);
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    // 2. Parse webhook payload
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Empty webhook payload." }, { status: 400 });
    }

    const event = body["event"] || body["event.type"];
    const data = body.data || body;

    console.log(`[Flutterwave Webhook] Received event: ${event}`, {
      id: data?.id,
      tx_ref: data?.tx_ref,
      status: data?.status,
    });

    // We process successful charges
    if (
      event === "charge.completed" ||
      data?.status === "successful" ||
      body?.status === "successful"
    ) {
      const transactionId = data?.id;
      const txRef = data?.tx_ref || body?.tx_ref;

      if (!transactionId) {
        console.warn("[Flutterwave Webhook] Missing transaction ID in payload.");
        return NextResponse.json({ received: true, note: "Missing transaction ID" });
      }

      // 3. Double-check with Flutterwave Ledger API (Never activate blindly)
      const flwVerified = await verifyFlutterwaveTransaction(transactionId);

      if (!flwVerified.success || flwVerified.status !== "successful") {
        console.warn(
          `[Flutterwave Webhook] Verification failed for tx ${transactionId}:`,
          flwVerified.error
        );
        return NextResponse.json({
          received: true,
          note: "Transaction not verified on Flutterwave ledger",
        });
      }

      const customerEmail = flwVerified.customer?.email || data?.customer?.email;
      const userId = flwVerified.meta?.userId || data?.meta?.userId || "user_owner_01";

      // 4. Activate or renew MoniePay Plus subscription in database
      const activation = await activateUserSubscription({
        userId,
        txRef: flwVerified.txRef || txRef,
        flwTransactionId: String(transactionId),
        flwRef: flwVerified.flwRef || data?.flw_ref,
        amount: flwVerified.amount,
        paymentType: flwVerified.paymentType || data?.payment_type,
        customerEmail,
        customerName: flwVerified.customer?.name || data?.customer?.name,
        customerPhone: flwVerified.customer?.phone || data?.customer?.phone_number,
        rawPayload: body,
      });

      console.log(
        `[Flutterwave Webhook] Subscription activated successfully for user ${userId}:`,
        activation.success
      );

      return NextResponse.json({
        received: true,
        success: true,
        activated: activation.success,
      });
    }

    return NextResponse.json({ received: true, note: "Event ignored" });
  } catch (error: any) {
    console.error("[Flutterwave Webhook] Internal processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing exception.", details: error?.message },
      { status: 500 }
    );
  }
}
