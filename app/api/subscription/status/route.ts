import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getUserSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    const userId = user?.id || "user_owner_01";

    const subscription = await getUserSubscription(userId);

    return NextResponse.json({
      success: true,
      subscription,
      user: {
        id: userId,
        email: user?.email || "demo@moniepay.app",
        name: user?.name || "Mama Chidi",
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
