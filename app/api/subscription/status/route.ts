import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getUserSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");
    const user = await getSessionUser();
    const userId = queryUserId || user?.id || "user_owner_01";

    const subscription = await getUserSubscription(userId);

    return NextResponse.json({
      success: true,
      subscription,
      user: {
        id: userId,
        email: user?.email || "demo@moniepay.app",
        name: user?.name || "Shop Owner",
      },
    });
  } catch (error: any) {
    console.error("Subscription status API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription status." },
      { status: 500 }
    );
  }
}
