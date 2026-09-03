import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { getCompanionSessionFromRequest } from "@/backend/auth/companion";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    return NextResponse.json({ error: "roomId parameter is required" }, { status: 400 });
  }

  // 1. Verify that the requester has a valid session (either User or Companion)
  const userSession = getAuthSessionFromRequest();
  const companionSession = getCompanionSessionFromRequest();

  const userId = userSession.user?.id;
  const companionId = companionSession.companion?.id;

  if (!userId && (!companionSession.isAuthenticated || !companionId)) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    // 2. Fetch room participant metadata
    const rooms = await sql`
      SELECT id, user_id, companion_id
      FROM anonymous_rooms
      WHERE id = ${roomId}
      LIMIT 1
    `;

    if (rooms.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const room = rooms[0];

    // 3. Verify that the session belongs to a legitimate participant (or admin/supervisor)
    const isUserParticipant = userId && room.user_id === userId;
    const isCompanionAdmin = companionSession.companion?.role === "ADMIN" || companionSession.companion?.role === "SUPERVISOR";
    const isCompanionParticipant = companionId && (room.companion_id === companionId || isCompanionAdmin);

    if (!isUserParticipant && !isCompanionParticipant) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to view this conversation." },
        { status: 403 }
      );
    }

    const history = await sql`
      SELECT id, room_id as "roomId", sender_type as "senderType", message, created_at as "createdAt"
      FROM messages
      WHERE room_id = ${roomId}
      ORDER BY created_at ASC
    `;

    return NextResponse.json(history);
  } catch (err: any) {
    console.error("[API GET /api/chat/history Error]:", err);
    return NextResponse.json({ error: "Failed to retrieve conversation history." }, { status: 500 });
  }
}
