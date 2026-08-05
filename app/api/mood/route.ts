import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { saveMoodEntry, getMoodHistory } from "@/backend/queries/mood";

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-user";

  try {
    const body = await req.json();
    const { mood, energy, stress, reflection, factors } = body;

    if (!mood || energy === undefined || !stress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newEntry = await saveMoodEntry(userId, {
      mood,
      energy: Number(energy),
      stress,
      reflection,
      factors,
    });

    return NextResponse.json(newEntry);
  } catch (err: any) {
    console.error("API POST /api/mood error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-user";

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "all";

  try {
    const history = await getMoodHistory(userId, filter);
    return NextResponse.json(history || []);
  } catch (err: any) {
    console.error("API GET /api/mood error:", err);
    return NextResponse.json([]);
  }
}
