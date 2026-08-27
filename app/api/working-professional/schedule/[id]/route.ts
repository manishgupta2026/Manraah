import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-wp-user";
  const eventId = params.id;

  try {
    const body = await req.json();
    const { title, description, category, location, startTime, endTime, eventDate } = body;

    if (!title || !startTime || !endTime || !eventDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await sql`
      UPDATE wp_schedule_events
      SET title = ${title},
          description = ${description || null},
          category = ${category || null},
          location = ${location || null},
          start_time = ${startTime},
          end_time = ${endTime},
          event_date = ${eventDate}
      WHERE id = ${eventId} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Event not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (err: any) {
    console.error("PATCH schedule event error:", err);
    return NextResponse.json({ error: err.message || "Failed to update schedule event" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-wp-user";
  const eventId = params.id;

  try {
    const result = await sql`
      DELETE FROM wp_schedule_events
      WHERE id = ${eventId} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Event not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: eventId });
  } catch (err: any) {
    console.error("DELETE schedule event error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete schedule event" }, { status: 500 });
  }
}
