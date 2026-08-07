import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, senderType, message } = body;

    if (!roomId || !senderType || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const msgId = "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);

    await sql`
      INSERT INTO messages (id, room_id, sender_type, message)
      VALUES (${msgId}, ${roomId}, ${senderType}, ${message})
    `;

    return NextResponse.json({
      id: msgId,
      roomId,
      senderType,
      message,
      createdAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[API POST /api/chat/message Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to send message" }, { status: 500 });
  }
}
