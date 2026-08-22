import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-user";
  const entryId = params.id;

  try {
    const body = await req.json();
    const { title, content, moodTag, category } = body;

    let excerpt = undefined;
    if (content !== undefined) {
      excerpt = content.substring(0, 100);
    }

    const result = await sql`
      UPDATE journal_entries
      SET title = COALESCE(${title}, title),
          content = COALESCE(${content}, content),
          excerpt = COALESCE(${excerpt}, excerpt),
          mood_tag = COALESCE(${moodTag}, mood_tag),
          category = COALESCE(${category}, category),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${entryId} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Journal entry not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (err: any) {
    console.error("PATCH journal entry error:", err);
    return NextResponse.json({ error: err.message || "Failed to update journal entry" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-user";
  const entryId = params.id;

  try {
    const result = await sql`
      DELETE FROM journal_entries
      WHERE id = ${entryId} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Journal entry not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: entryId });
  } catch (err: any) {
    console.error("DELETE journal entry error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete journal entry" }, { status: 500 });
  }
}
