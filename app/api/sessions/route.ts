import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = getAuthSessionFromRequest();
    let userId = session.user?.id;

    const body = await req.json();
    const { type, duration, completed, metadata } = body;

    if (!userId) {
      const users = await sql`
        SELECT id FROM users 
        WHERE selected_category IN ('working-professional', 'working_professional')
        ORDER BY created_at DESC LIMIT 1
      `;
      userId = users.length > 0 ? users[0].id : "demo-wp-user";
    }

    const sessionType = type || "decompression";
    const durationSec = Number(duration) || 120;
    const isCompleted = completed !== undefined ? Boolean(completed) : true;

    await sql`
      INSERT INTO activity_sessions (
        user_id, type, duration, completed, metadata
      ) VALUES (
        ${userId}, ${sessionType}, ${durationSec}, ${isCompleted}, ${JSON.stringify(metadata || {})}
      )
    `;

    // Increment user mindfulness minutes
    const addedMinutes = Math.max(1, Math.round(durationSec / 60));
    await sql`
      UPDATE users SET
        mindfulness_minutes = COALESCE(mindfulness_minutes, 0) + ${addedMinutes}
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      message: "Session logged successfully",
      minutesAdded: addedMinutes,
    });
  } catch (err: any) {
    console.error("POST /api/sessions error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to log session" },
      { status: 500 }
    );
  }
}
