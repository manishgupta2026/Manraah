import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { getMoodInsights } from "@/backend/queries/mood";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const insights = await getMoodInsights(userId);
    return NextResponse.json(insights || []);
  } catch (err: any) {
    console.error("API GET /api/mood/insights error:", err);
    return NextResponse.json([]);
  }
}
