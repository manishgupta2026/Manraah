import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { getCompanionSessionFromRequest } from "@/backend/auth/companion";

export const dynamic = "force-dynamic";

// GET /api/companion/queue - List waiting or active rooms
export async function GET(request: Request) {
  const companionSession = getCompanionSessionFromRequest();
  if (!companionSession.isAuthenticated || !companionSession.companion?.id) {
    return NextResponse.json(
      { error: "Unauthorized: Valid companion authentication required." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "WAITING";

  try {
    const rooms = await sql`
      SELECT id, user_alias, companion_alias, user_category, topic, status, created_at
      FROM anonymous_rooms
      WHERE status = ${status}
      ORDER BY created_at DESC
    `;
    return NextResponse.json(rooms);
  } catch (err: any) {
    console.error("[API GET /api/companion/queue Error]:", err);
    return NextResponse.json([]);
  }
}

// POST /api/companion/queue - Actions: join, accept, end
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, category, topic, roomId } = body;

    // ACTION: JOIN (User requests anonymous support)
    if (action === "join") {
      const userSession = getAuthSessionFromRequest();
      const userId = userSession.user?.id || "usr_" + Date.now();
      const roomIdNew = "rm_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
      const userAlias = `Anonymous User #${Math.floor(100 + Math.random() * 900)}`;

      await sql`
        INSERT INTO anonymous_rooms (id, user_id, user_alias, companion_alias, user_category, topic, status)
        VALUES (${roomIdNew}, ${userId}, ${userAlias}, 'Companion #12', ${category || "Student"}, ${topic || "Emotional Support"}, 'WAITING')
      `;

      return NextResponse.json({
        success: true,
        room: {
          id: roomIdNew,
          userAlias,
          companionAlias: "Companion #12",
          category: category || "Student",
          topic: topic || "Emotional Support",
          status: "WAITING",
        },
      });
    }

    // ACTION: ACCEPT (Companion accepts room)
    if (action === "accept") {
      const companionSession = getCompanionSessionFromRequest();
      if (!companionSession.isAuthenticated || !companionSession.companion) {
        return NextResponse.json({ error: "Unauthorized companion" }, { status: 401 });
      }

      const companionId = companionSession.companion.id;
      const companionAlias = `${companionSession.companion.name} (${companionSession.companion.role})`;

      await sql`
        UPDATE anonymous_rooms
        SET companion_id = ${companionId}, companion_alias = ${companionAlias}, status = 'ACTIVE'
        WHERE id = ${roomId}
      `;

      return NextResponse.json({ success: true, roomId, status: "ACTIVE" });
    }

    // ACTION: END (End room - participant ownership required)
    if (action === "end") {
      if (!roomId) {
        return NextResponse.json({ error: "roomId parameter is required" }, { status: 400 });
      }

      const userSession = getAuthSessionFromRequest();
      const companionSession = getCompanionSessionFromRequest();

      const currentUserId = userSession.user?.id;
      const currentCompanionId = companionSession.companion?.id;
      const isCompanionAdmin =
        companionSession.companion?.role === "ADMIN" ||
        companionSession.companion?.role === "SUPERVISOR";

      if (!currentUserId && !currentCompanionId) {
        return NextResponse.json(
          { error: "Unauthorized: Active session required to end room." },
          { status: 401 }
        );
      }

      const existingRooms = await sql`
        SELECT id, user_id, companion_id, status
        FROM anonymous_rooms
        WHERE id = ${roomId}
        LIMIT 1
      `;

      if (existingRooms.length === 0) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
      }

      const room = existingRooms[0];
      const isUserOwner = currentUserId && room.user_id === currentUserId;
      const isCompanionOwner = currentCompanionId && (room.companion_id === currentCompanionId || isCompanionAdmin);

      if (!isUserOwner && !isCompanionOwner) {
        return NextResponse.json(
          { error: "Forbidden: You are not authorized to terminate this session." },
          { status: 403 }
        );
      }

      await sql`
        UPDATE anonymous_rooms
        SET status = 'ENDED', ended_at = CURRENT_TIMESTAMP
        WHERE id = ${roomId}
      `;

      return NextResponse.json({ success: true, roomId, status: "ENDED" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("[API POST /api/companion/queue Error]:", err);
    return NextResponse.json({ error: err.message || "Failed queue operation" }, { status: 500 });
  }
}
