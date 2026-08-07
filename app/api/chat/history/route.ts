import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    return NextResponse.json({ error: "roomId parameter is required" }, { status: 400 });
  }

  try {
    const history = await sql`
      SELECT id, room_id as "roomId", sender_type as "senderType", message, created_at as "createdAt"
      FROM messages
      WHERE room_id = ${roomId}
      ORDER BY created_at ASC
    `;

    return NextResponse.json(history);
  } catch (err: any) {
    console.error("[API GET /api/chat/history Error]:", err);
    return NextResponse.json([]);
  }
}
