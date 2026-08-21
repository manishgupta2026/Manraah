import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-student-user";

  try {
    const body = await req.json();
    const { duration } = body;

    if (!duration) {
      return NextResponse.json({ error: "Missing duration" }, { status: 400 });
    }

    const durationMins = Number(duration);
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - durationMins * 60 * 1000);
    const status = 'COMPLETED';

    // Insert focus session log
    const inserted = await sql`
      INSERT INTO student_focus_sessions (user_id, duration_minutes, start_time, end_time, status)
      VALUES (${userId}, ${durationMins}, ${startTime.toISOString()}, ${endTime.toISOString()}, ${status})
      RETURNING id, duration_minutes, start_time, end_time, status, created_at
    `;

    // Increment user profile total study focus minutes
    await sql`
      UPDATE users
      SET mindfulness_minutes = COALESCE(mindfulness_minutes, 0) + ${Number(duration)}
      WHERE id = ${userId}
    `;

    return NextResponse.json(inserted[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
