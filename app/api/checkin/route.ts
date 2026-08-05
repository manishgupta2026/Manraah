import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { saveMoodEntry } from "@/backend/queries/mood";
import { saveDailyCheckIn } from "@/backend/queries/assessment";

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-user";

  try {
    const body = await req.json();
    const { mood, energy, stress, sleep, reflection, factors } = body;

    if (!mood || energy === undefined || !stress) {
      return NextResponse.json({ error: "Missing required fields: mood, energy, stress" }, { status: 400 });
    }

    // 1. Save entry to mood_entries table
    const newMoodEntry = await saveMoodEntry(userId, {
      mood,
      energy: Number(energy),
      stress,
      reflection: reflection || "",
      factors: factors || "",
    });

    // 2. Save check-in to daily_checkins (for streaks and history tracking)
    try {
      await saveDailyCheckIn(userId, {
        mood,
        energyLevel: Number(energy),
        sleepQuality: sleep ? Number(sleep) : 3, // fallback sleep quality
        gratitudeReflection: factors || "Checked in",
        dailyIntention: reflection || "Take deep breaths",
        reflection: reflection || "",
      });
    } catch (err) {
      console.warn("Non-fatal: could not sync to daily_checkins database table:", err);
    }

    return NextResponse.json(newMoodEntry);
  } catch (err: any) {
    console.error("API POST /api/checkin error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
