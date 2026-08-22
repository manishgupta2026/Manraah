import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-wp-user";

  try {
    const body = await req.json();
    const { work, personal, recovery } = body;

    const workVal = Math.min(100, Math.max(0, Number(work) || 70));
    const personalVal = Math.min(100, Math.max(0, Number(personal) || 80));
    const recoveryVal = Math.min(100, Math.max(0, Number(recovery) || 60));

    // Calculate balance score: higher personal/recovery and moderated work is better
    const balanceScore = Math.round(( (100 - workVal) + personalVal + recoveryVal ) / 2);

    const inserted = await sql`
      INSERT INTO wp_work_life_records (user_id, work_val, personal_val, recovery_val, balance_score)
      VALUES (${userId}, ${workVal}, ${personalVal}, ${recoveryVal}, ${balanceScore})
      RETURNING id, work_val as work, personal_val as personal, recovery_val as recovery, balance_score as balanceScore, created_at
    `;

    return NextResponse.json(inserted[0]);
  } catch (err: any) {
    console.error("POST work-life error:", err);
    return NextResponse.json({ error: err.message || "Failed to save work-life data" }, { status: 500 });
  }
}
