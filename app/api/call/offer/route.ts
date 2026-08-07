import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, sender, sdpOffer } = body;

    if (!roomId || !sdpOffer) {
      return NextResponse.json({ error: "roomId and sdpOffer are required" }, { status: 400 });
    }

    const callSessionId = "call_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);

    // Create call session
    await sql`
      INSERT INTO call_sessions (id, room_id, status)
      VALUES (${callSessionId}, ${roomId}, 'CONNECTING')
    `;

    // Store Offer Signal
    const signalId = "sig_" + Date.now();
    await sql`
      INSERT INTO call_signals (id, call_session_id, sender, type, payload)
      VALUES (${signalId}, ${callSessionId}, ${sender || "USER"}, 'OFFER', ${JSON.stringify(sdpOffer)})
    `;

    return NextResponse.json({
      success: true,
      callSessionId,
      status: "CONNECTING",
    });
  } catch (err: any) {
    console.error("[API POST /api/call/offer Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to create call offer" }, { status: 500 });
  }
}
