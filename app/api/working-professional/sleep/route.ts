import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-wp-user";

  try {
    const list = await sql`
      SELECT id, duration_minutes as duration, quality_score as score, bedtime, wake_time, created_at
      FROM wp_sleep_records
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 14
    `;
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load sleep records" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-wp-user";

  try {
    const body = await req.json();
    const { bedtime, wakeTime, duration, score } = body;

    const durationMins = Number(duration) || 480;
    const qualityScore = Number(score) || 75;

    const inserted = await sql`
      INSERT INTO wp_sleep_records (user_id, duration_minutes, quality_score, bedtime, wake_time)
      VALUES (${userId}, ${durationMins}, ${qualityScore}, ${bedtime || null}, ${wakeTime || null})
      RETURNING id, duration_minutes as duration, quality_score as score, bedtime, wake_time, created_at
    `;

    return NextResponse.json(inserted[0]);
  } catch (err: any) {
    console.error("POST sleep record error:", err);
    return NextResponse.json({ error: err.message || "Failed to save sleep record" }, { status: 500 });
  }
}
