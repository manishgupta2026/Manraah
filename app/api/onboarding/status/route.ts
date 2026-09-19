import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { getAuthSessionFromRequest } from "@/backend/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = getAuthSessionFromRequest();
    const userId = session.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await sql`
      SELECT onboarding_completed FROM users WHERE id = ${userId} LIMIT 1
    `;

    if (res.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      completed: !!res[0].onboarding_completed,
    });
  } catch (err: any) {
    console.error("GET /api/onboarding/status error:", err);
    return NextResponse.json({ error: "Unable to retrieve onboarding status." }, { status: 500 });
  }
}
