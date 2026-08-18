import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";
import { calculateWellnessScore } from "@/backend/lib/wellness-scoring";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = getAuthSessionFromRequest();
    let userId = session.user?.id;

    const body = await req.json();
    const { mood, stress, energy, sleep, workLifeBalance } = body;

    const result = calculateWellnessScore({
      mood: mood || "Good",
      stress: stress || "Manageable",
      energy: Number(energy) || 3,
      sleep: Number(sleep) || 3,
      workLifeBalance: Number(workLifeBalance) || 3,
    });

    if (userId) {
      await sql`
        INSERT INTO assessments (
          user_id, category, total_score, max_score, percentage, wellness_level
        ) VALUES (
          ${userId}, 'working-professional', ${result.score}, 100, ${result.score}, ${result.level}
        )
      `;
    }

    return NextResponse.json({
      success: true,
      score: result.score,
      level: result.level,
      breakdown: result.breakdown,
    });
  } catch (err: any) {
    console.error("POST /api/wellness-score/calculate error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to calculate wellness score" },
      { status: 500 }
    );
  }
}
