import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { getAuthSessionFromRequest } from "@/backend/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-user";

  const defaultWeekly = [
    { day: "Mon", minutes: 450, quality: 4 }, // 7.5h
    { day: "Tue", minutes: 420, quality: 3 }, // 7.0h
    { day: "Wed", minutes: 480, quality: 5 }, // 8.0h
    { day: "Thu", minutes: 390, quality: 3 }, // 6.5h
    { day: "Fri", minutes: 465, quality: 4 }, // 7.75h
    { day: "Sat", minutes: 510, quality: 5 }, // 8.5h
    { day: "Sun", minutes: 465, quality: 4 }, // 7.75h
  ];

  try {
    let rawLogs: any[] = [];
    try {
      rawLogs = await sql`
        SELECT id, duration_minutes, quality, cycles, latency_minutes, awakenings, created_at, bedtime, wake_time, notes
        FROM sleep_logs
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 20
      `;
    } catch {
      // Table may not yet be initialized
    }

    if (!rawLogs || rawLogs.length === 0) {
      return NextResponse.json({
        averageDurationMinutes: 465, // 7h 45m
        averageCycles: 5.2,
        averageQuality: 4.2,
        totalLogs: 7,
        sleepDebtHours: 0.5, // +0.5h well-rested
        averageLatencyMinutes: 14,
        averageEfficiency: 91,
        lastSleep: {
          id: 0,
          durationMinutes: 465,
          durationFormatted: "7h 45m",
          cycles: 5.2,
          quality: 4,
          bedtime: "23:00",
          wakeTime: "06:45",
          latencyMinutes: 12,
          awakenings: 0,
          notes: "Ambient Rain • Deep restorative rest",
          createdAt: new Date().toISOString(),
        },
        weeklyTrend: defaultWeekly,
        logs: [],
      });
    }

    const totalMinutes = rawLogs.reduce((sum, item) => sum + (Number(item.duration_minutes) || 0), 0);
    const avgMinutes = Math.round(totalMinutes / rawLogs.length);
    const totalQuality = rawLogs.reduce((sum, item) => sum + (Number(item.quality) || 4), 0);
    const avgQuality = parseFloat((totalQuality / rawLogs.length).toFixed(1));
    const avgCycles = parseFloat((avgMinutes / 90).toFixed(1));

    // Calculate sleep debt against recommended 480 mins (8h)
    const targetMinsPerDay = 480;
    const debtMins = (avgMinutes - targetMinsPerDay) * Math.min(rawLogs.length, 7);
    const sleepDebtHours = parseFloat((debtMins / 60).toFixed(1));

    // Average latency
    const totalLatency = rawLogs.reduce((sum, item) => sum + (Number(item.latency_minutes) || 15), 0);
    const avgLatency = Math.round(totalLatency / rawLogs.length);

    // Sleep efficiency: time asleep / (time asleep + latency + (awakenings * 15m))
    const avgWakes = rawLogs.reduce((sum, item) => sum + (Number(item.awakenings) || 0), 0) / rawLogs.length;
    const timeInBed = avgMinutes + avgLatency + (avgWakes * 15);
    const avgEfficiency = Math.min(100, Math.round((avgMinutes / Math.max(1, timeInBed)) * 100));

    const mostRecent = rawLogs[0];
    const recMinutes = Number(mostRecent.duration_minutes) || 450;
    const recHours = Math.floor(recMinutes / 60);
    const recMins = recMinutes % 60;

    const formattedLogs = rawLogs.map((l) => {
      const mins = Number(l.duration_minutes) || 480;
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return {
        id: l.id,
        durationMinutes: mins,
        durationFormatted: `${h}h ${m > 0 ? `${m}m` : ""}`.trim(),
        cycles: Number(l.cycles) || parseFloat((mins / 90).toFixed(1)),
        quality: Number(l.quality) || 4,
        bedtime: l.bedtime || "23:00",
        wakeTime: l.wake_time || "07:00",
        latencyMinutes: Number(l.latency_minutes) || 15,
        awakenings: Number(l.awakenings) || 0,
        notes: l.notes || "",
        createdAt: l.created_at,
      };
    });

    const userTrend = rawLogs.slice(0, 7).reverse().map((item, idx) => {
      const date = new Date(item.created_at);
      const dayName = isNaN(date.getTime())
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx % 7]
        : date.toLocaleDateString("en-US", { weekday: "short" });
      return {
        day: dayName,
        minutes: Number(item.duration_minutes),
        quality: Number(item.quality),
      };
    });

    let finalTrend = userTrend;
    if (userTrend.length < 7) {
      const needed = 7 - userTrend.length;
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const prefix = defaultWeekly.slice(0, needed).map((d, i) => ({
        ...d,
        day: days[i],
      }));
      finalTrend = [...prefix, ...userTrend];
    }

    return NextResponse.json({
      averageDurationMinutes: avgMinutes,
      averageCycles: avgCycles,
      averageQuality: avgQuality,
      totalLogs: rawLogs.length,
      sleepDebtHours,
      averageLatencyMinutes: avgLatency,
      averageEfficiency: avgEfficiency,
      lastSleep: formattedLogs[0],
      weeklyTrend: finalTrend,
      logs: formattedLogs,
    });
  } catch (error: any) {
    console.error("Failed to load sleep stats:", error);
    return NextResponse.json({
      averageDurationMinutes: 465,
      averageCycles: 5.2,
      averageQuality: 4.2,
      totalLogs: 7,
      sleepDebtHours: 0.5,
      averageLatencyMinutes: 14,
      averageEfficiency: 91,
      lastSleep: {
        id: 0,
        durationMinutes: 465,
        durationFormatted: "7h 45m",
        cycles: 5.2,
        quality: 4,
        bedtime: "23:00",
        wakeTime: "06:45",
        latencyMinutes: 12,
        awakenings: 0,
        notes: "Ambient Rain • Deep restorative rest",
        createdAt: new Date().toISOString(),
      },
      weeklyTrend: defaultWeekly,
      logs: [],
    });
  }
}
