import { NextRequest, NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { getUserCurrentWellness } from "@/backend/queries/wellness";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = getAuthSessionFromRequest();
    const userId = session.user?.id || "guest";
    const rawCategory =
      request.nextUrl.searchParams.get("category") ||
      session.user?.selectedCategory ||
      "student";

    const wellness = await getUserCurrentWellness(userId, rawCategory);
    return NextResponse.json({
      success: true,
      ...wellness,
    });
  } catch (err: any) {
    console.error("GET /api/wellness/scores error:", err);
    return NextResponse.json(
      { error: "Failed to load wellness scores" },
      { status: 500 }
    );
  }
}
