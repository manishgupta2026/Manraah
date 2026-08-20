import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-student-user";

  try {
    const body = await req.json();
    const { sleepTime, wakeTime, duration, score } = body;

    const inserted = await sql`
      INSERT INTO student_sleep_records (user_id, sleep_time, wake_time, duration_minutes, quality_score)
      VALUES (${userId}, ${sleepTime ? new Date(sleepTime).toISOString() : null}, ${wakeTime ? new Date(wakeTime).toISOString() : null}, ${Number(duration) || 480}, ${Number(score) || 78})
      RETURNING id, sleep_time, wake_time, duration_minutes as duration, quality_score as score
    `;

    return NextResponse.json(inserted[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
