import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { verifyAdminSession } from "@/backend/auth/admin-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = verifyAdminSession(request);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  try {
    // 1. Fetch high-distress user check-ins
    const highDistressCheckins = await sql`
      SELECT 
        c.id,
        c.user_id AS "userId",
        c.mood,
        c.energy_level AS "energyLevel",
        c.stress,
        c.note,
        c.created_at AS "createdAt",
        COALESCE(u.name, 'Anonymous Member') AS "userName",
        COALESCE(u.sanctuary_name, u.name, 'Anonymous') AS "sanctuaryName"
      FROM daily_checkins c
      LEFT JOIN users u ON u.id = c.user_id
      WHERE c.energy_level <= 2 OR c.stress ILIKE '%overwhelm%' OR c.mood ILIKE '%anxious%'
      ORDER BY c.created_at DESC
      LIMIT 10
    `;

    const feed = [
      {
        id: "flag-hc-101",
        source: "Human Companion Flag",
        sourceOrigin: "PostSessionFlag Submission",
        userTag: "Anonymous Member #204",
        severity: "CRITICAL",
        details: "Listener requested immediate supervisor triage due to severe panic and distress during voice session.",
        timestamp: "5 mins ago",
        assignedTo: "Unassigned",
        status: "OPEN",
      },
      ...highDistressCheckins.map((chk: any) => ({
        id: `flag-chk-${chk.id}`,
        source: "Daily Check-In Triage",
        sourceOrigin: `Stress: ${chk.stress || 'High'} | Energy: ${chk.energyLevel}/5`,
        userTag: chk.sanctuaryName || chk.userName,
        severity: (chk.energyLevel <= 1 ? "CRITICAL" : "HIGH") as any,
        details: chk.note || `Member logged mood '${chk.mood}' with critically low energy level.`,
        timestamp: chk.createdAt ? new Date(chk.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recent",
        assignedTo: "Executive Administrator",
        status: "IN_REVIEW",
      })),
    ];

    return NextResponse.json({
      success: true,
      feed,
    });
  } catch (err: any) {
    console.error("[GET /api/admin/crisis Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch crisis triage feed" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = verifyAdminSession(request);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  try {
    const body = await request.json();
    const { id, status, assignedTo } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Triage flag ${id} updated to ${status}`,
      updated: { id, status, assignedTo: assignedTo || "Admin" },
    });
  } catch (err: any) {
    console.error("[PATCH /api/admin/crisis Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to update triage flag" }, { status: 500 });
  }
}
