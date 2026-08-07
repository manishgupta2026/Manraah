import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { callSessionId, sender, candidate } = body;

    if (!callSessionId || !candidate) {
      return NextResponse.json({ error: "callSessionId and candidate are required" }, { status: 400 });
    }

    const signalId = "sig_ice_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5);

    await sql`
      INSERT INTO call_signals (id, call_session_id, sender, type, payload)
      VALUES (${signalId}, ${callSessionId}, ${sender || "USER"}, 'ICE_CANDIDATE', ${JSON.stringify(candidate)})
    `;

    return NextResponse.json({ success: true, signalId });
  } catch (err: any) {
    console.error("[API POST /api/call/ice Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to store ICE candidate" }, { status: 500 });
  }
}
