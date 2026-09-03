import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { getMonthlySummary } from "@/backend/queries/mood";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await getMonthlySummary(userId);
    return NextResponse.json(summary);
  } catch (err: any) {
    console.error("API GET /api/mood/monthly error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
