import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { getUserWellnessHistory } from "@/backend/queries/wellness";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = getAuthSessionFromRequest();
    const userId = session.user?.id || null;

    if (!userId) {
      return NextResponse.json({ history: [] });
    }

    const history = await getUserWellnessHistory(userId);
    return NextResponse.json({ history });
  } catch (err: any) {
    console.error("GET /api/wellness/history error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch wellness assessment history." },
      { status: 500 }
    );
  }
}
