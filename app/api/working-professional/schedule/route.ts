import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-wp-user";

  try {
    const list = await sql`
      SELECT id, title, start_time, end_time, event_date, created_at
      FROM wp_schedule_events
      WHERE user_id = ${userId}
      ORDER BY event_date ASC, start_time ASC
    `;
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load schedule events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-wp-user";

  try {
    const body = await req.json();
    const { title, startTime, endTime, eventDate } = body;

    if (!title || !startTime || !endTime || !eventDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const inserted = await sql`
      INSERT INTO wp_schedule_events (user_id, title, start_time, end_time, event_date)
      VALUES (${userId}, ${title}, ${startTime}, ${endTime}, ${eventDate})
      RETURNING id, title, start_time, end_time, event_date, created_at
    `;

    return NextResponse.json(inserted[0]);
  } catch (err: any) {
    console.error("POST schedule event error:", err);
    return NextResponse.json({ error: err.message || "Failed to save schedule event" }, { status: 500 });
  }
}
