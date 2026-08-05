import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { getAuthSessionFromRequest } from "@/backend/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-user";

  try {
    const users = await sql`
      SELECT mindfulness_minutes, streak_days FROM users WHERE id = ${userId} LIMIT 1
    `;

    let totalLogs: any[] = [{ count: 0 }];
    try {
      totalLogs = await sql`
        SELECT COUNT(*) as count FROM meditation_logs WHERE user_id = ${userId}
      `;
    } catch {
      // Table might be initializing
    }

    const totalMinutes = users[0]?.mindfulness_minutes || 0;
    const streakDays = users[0]?.streak_days || 1;
    const totalSessions = parseInt(totalLogs[0]?.count || "0", 10);

    return NextResponse.json({
      totalMinutes,
      streakDays,
      totalSessions,
    });
  } catch (err: any) {
    console.error("[API GET /api/meditation/stats Error]:", err);
    return NextResponse.json({
      totalMinutes: 0,
      streakDays: 1,
      totalSessions: 0,
    });
  }
}
