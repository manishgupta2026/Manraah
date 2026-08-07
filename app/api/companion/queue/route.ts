import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { getCompanionSessionFromRequest } from "@/backend/auth/companion";

export const dynamic = "force-dynamic";

// GET /api/companion/queue - List waiting or active rooms
export async function GET(request: Request) {
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

    // ACTION: END (End room)
    if (action === "end") {
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
