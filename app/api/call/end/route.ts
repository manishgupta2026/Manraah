import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { callSessionId } = body;

    if (!callSessionId) {
      return NextResponse.json({ error: "callSessionId is required" }, { status: 400 });
    }

    await sql`
      UPDATE call_sessions
      SET status = 'ENDED', ended_at = CURRENT_TIMESTAMP
      WHERE id = ${callSessionId}
    `;

    return NextResponse.json({ success: true, callSessionId, status: "ENDED" });
  } catch (err: any) {
    console.error("[API POST /api/call/end Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to end call session" }, { status: 500 });
  }
}
