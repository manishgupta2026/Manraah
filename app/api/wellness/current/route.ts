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

    const data = await getUserCurrentWellness(userId, rawCategory);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET /api/wellness/current error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch current wellness score." },
      { status: 500 }
    );
  }
}
