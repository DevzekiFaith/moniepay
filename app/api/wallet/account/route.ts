import { NextResponse } from "next/server";
import { defaultPaymentProvider } from "@/lib/payment/flutterwaveProvider";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "user_default";
  const businessName = searchParams.get("businessName") || "Mama Chidi Provisions";
  const email = searchParams.get("email") || "trader@moniepay.ng";

  try {
    const accountResult = await defaultPaymentProvider.createVirtualAccount({
      userId,
      email,
      businessName,
    });

    return NextResponse.json({
      success: true,
      wallet: {
        userId,
        businessName,
        availableBalance: 125000,
        moneyReceived: 420000,
        moneySpent: 295000,
        todaysActivityCount: 12,
        thisMonthVolume: 1840000,
        isActivated: true,
        kycStatus: "VERIFIED",
        account: {
          bankName: accountResult.bankName,
          accountNumber: accountResult.accountNumber,
          accountName: accountResult.accountName,
          flwRef: accountResult.flwRef,
        },
      },
    });
  } catch (err: any) {
    console.error("Wallet account API error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch wallet account" },
      { status: 500 }
    );
  }
}
