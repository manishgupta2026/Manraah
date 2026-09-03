import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { getWeeklySummary } from "@/backend/queries/mood";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await getWeeklySummary(userId);
    return NextResponse.json(summary || { averageMood: 7, totalCheckIns: 0 });
  } catch (err: any) {
    console.error("API GET /api/mood/weekly error:", err);
    return NextResponse.json({ averageMood: 7, totalCheckIns: 0 });
  }
}
