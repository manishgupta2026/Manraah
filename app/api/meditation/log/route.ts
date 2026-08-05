import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { getAuthSessionFromRequest } from "@/backend/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-user";

  try {
    const body = await request.json();
    const { minutes, title, category } = body;
    const sessionMinutes = typeof minutes === "number" ? minutes : 5;
    const sessionTitle = title || "Mindful Session";
    const sessionCategory = category || "Focus";

    // 1. Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS meditation_logs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        minutes INTEGER NOT NULL,
        category VARCHAR(100) DEFAULT 'Mindfulness',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 2. Insert session log
    await sql`
      INSERT INTO meditation_logs (user_id, title, minutes, category)
      VALUES (${userId}, ${sessionTitle}, ${sessionMinutes}, ${sessionCategory})
    `;

    // 3. Update user's total mindfulness_minutes in Neon DB
    const updatedUsers = await sql`
      UPDATE users
      SET mindfulness_minutes = mindfulness_minutes + ${sessionMinutes},
          streak_days = GREATEST(streak_days, 1)
      WHERE id = ${userId}
      RETURNING mindfulness_minutes, streak_days
    `;

    const totalMinutes = updatedUsers[0]?.mindfulness_minutes || sessionMinutes;
    const currentStreak = updatedUsers[0]?.streak_days || 1;

    return NextResponse.json({
      success: true,
      addedMinutes: sessionMinutes,
      totalMinutes,
      currentStreak,
      message: `Logged ${sessionMinutes} mindfulness minutes to your sanctuary profile!`,
    });
  } catch (err: any) {
    console.error("[API POST /api/meditation/log Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to log meditation session" },
      { status: 500 }
    );
  }
}
