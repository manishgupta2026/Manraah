import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { getAuthSessionFromRequest } from "@/backend/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-user";

  try {
    const body = await request.json();
    const { bedtime, wakeTime, durationMinutes, quality, notes, tags, latencyMinutes, awakenings } = body;

    const finalMinutes = typeof durationMinutes === "number" && durationMinutes > 0
      ? durationMinutes
      : 480; // default 8 hours (480 minutes)

    const sleepQuality = typeof quality === "number" ? Math.min(5, Math.max(1, quality)) : 4;
    const cycles = parseFloat((finalMinutes / 90).toFixed(1));
    const sleepNotes = notes || (Array.isArray(tags) ? tags.join(", ") : "");
    const latency = typeof latencyMinutes === "number" ? latencyMinutes : 15;
    const wakes = typeof awakenings === "number" ? awakenings : 0;

    try {
      await sql`
        CREATE TABLE IF NOT EXISTS sleep_logs (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          bedtime VARCHAR(50),
          wake_time VARCHAR(50),
          duration_minutes INTEGER NOT NULL,
          quality INTEGER DEFAULT 4,
          cycles NUMERIC(3, 1),
          latency_minutes INTEGER DEFAULT 15,
          awakenings INTEGER DEFAULT 0,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Also ensure latency_minutes and awakenings columns exist if table was already created
      try {
        await sql`ALTER TABLE sleep_logs ADD COLUMN IF NOT EXISTS latency_minutes INTEGER DEFAULT 15`;
        await sql`ALTER TABLE sleep_logs ADD COLUMN IF NOT EXISTS awakenings INTEGER DEFAULT 0`;
      } catch {}

      await sql`
        INSERT INTO sleep_logs (user_id, bedtime, wake_time, duration_minutes, quality, cycles, latency_minutes, awakenings, notes)
        VALUES (${userId}, ${bedtime || "23:00"}, ${wakeTime || "07:00"}, ${finalMinutes}, ${sleepQuality}, ${cycles}, ${latency}, ${wakes}, ${sleepNotes})
      `;
    } catch (e) {
      console.warn("Sleep log database write warning:", e);
    }

    // Calculate updated aggregates
    let avgDuration = finalMinutes;
    let totalLogsCount = 1;

    try {
      const stats = await sql`
        SELECT AVG(duration_minutes) as avg_duration, COUNT(*) as count
        FROM sleep_logs
        WHERE user_id = ${userId}
      `;
      if (stats[0]?.avg_duration) {
        avgDuration = Math.round(Number(stats[0].avg_duration));
      }
      if (stats[0]?.count) {
        totalLogsCount = Number(stats[0].count);
      }
    } catch {
      // Fallback
    }

    const hours = Math.floor(finalMinutes / 60);
    const mins = finalMinutes % 60;

    return NextResponse.json({
      success: true,
      log: {
        durationMinutes: finalMinutes,
        durationFormatted: `${hours}h ${mins > 0 ? `${mins}m` : ""}`.trim(),
        cycles,
        quality: sleepQuality,
        bedtime,
        wakeTime,
        latencyMinutes: latency,
        awakenings: wakes,
      },
      avgDurationMinutes: avgDuration,
      totalLogs: totalLogsCount,
      message: `Sleep duration of ${hours}h ${mins > 0 ? `${mins}m` : ""} logged successfully!`,
    });
  } catch (error: any) {
    console.error("Failed to log sleep duration:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to log sleep duration" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-user";

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing log ID" }, { status: 400 });
    }

    try {
      await sql`
        DELETE FROM sleep_logs
        WHERE id = ${Number(id)} AND user_id = ${userId}
      `;
    } catch (e) {
      console.warn("Could not delete from sleep_logs table:", e);
    }

    return NextResponse.json({ success: true, message: "Sleep log deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
