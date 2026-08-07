import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { callSessionId, sender, sdpAnswer } = body;

    if (!callSessionId || !sdpAnswer) {
      return NextResponse.json({ error: "callSessionId and sdpAnswer are required" }, { status: 400 });
    }

    // Update Call session status to ACTIVE
    await sql`
      UPDATE call_sessions
      SET status = 'ACTIVE'
      WHERE id = ${callSessionId}
    `;

    // Store Answer Signal
    const signalId = "sig_" + Date.now();
    await sql`
      INSERT INTO call_signals (id, call_session_id, sender, type, payload)
      VALUES (${signalId}, ${callSessionId}, ${sender || "COMPANION"}, 'ANSWER', ${JSON.stringify(sdpAnswer)})
    `;

    return NextResponse.json({ success: true, callSessionId, status: "ACTIVE" });
  } catch (err: any) {
    console.error("[API POST /api/call/answer Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to process call answer" }, { status: 500 });
  }
}
