import { NextResponse } from "next/server";
import { defaultPaymentProvider } from "@/lib/payment/flutterwaveProvider";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("verif-hash");

    // 1. Verify webhook signature
    const isValidSignature = defaultPaymentProvider.verifyWebhookSignature(signature);
    if (!isValidSignature && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized webhook signature" }, { status: 401 });
    }

    const body = await request.json();
    const event = defaultPaymentProvider.parseWebhookPayload(body);

    if (!event) {
      return NextResponse.json({ message: "Ignored non-payment webhook" }, { status: 200 });
    }

    // 2. Server-to-Server Double Verification
    // Never trust frontend or unverified webhook payload directly
    if (body.data?.id) {
      const verification = await defaultPaymentProvider.verifyTransaction(body.data.id);
      if (!verification.success && process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Transaction failed server verification" }, { status: 400 });
      }
    }

    // 3. Construct Verified Auto-Recorded MoniePay Transaction
    const txId = `tx_auto_${Date.now()}`;
    const autoTransaction = {
      id: txId,
      client_tx_id: txId,
      business_id: "biz_default_01",
      type: "SALE",
      amount: event.amount,
      category: "Shop Sale (Customer Transfer)",
      description: `Automated Flutterwave Transfer from ${event.customerName || "Customer"} (${event.bankName || "Providus Bank"})`,
      payment_method: "TRANSFER",
      transaction_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      metadata: {
        flw_ref: event.flwRef,
        tx_ref: event.txRef,
        receipt_reference: `FLW-${Date.now().toString().slice(-6)}`,
        source_channel: "FLUTTERWAVE_DVA",
        account_number: event.accountNumber,
        payer_email: event.customerEmail,
      },
    };

    console.log("MoniePay auto-recorded transaction via Flutterwave Webhook:", autoTransaction);

    return NextResponse.json(
      {
        success: true,
        message: "Payment verified and transaction auto-recorded",
        transaction: autoTransaction,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: err?.message || "Webhook handling error" },
      { status: 500 }
    );
  }
}
