import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-user";

  try {
    const body = await req.json();
    const { title, content, moodTag, category } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Missing title or content" }, { status: 400 });
    }

    const id = `journal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const excerpt = content.substring(0, 100);

    const result = await sql`
      INSERT INTO journal_entries (id, user_id, title, excerpt, content, mood_tag, category, created_at)
      VALUES (${id}, ${userId}, ${title}, ${excerpt}, ${content}, ${moodTag || "Reflective"}, ${category || "Personal"}, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (err: any) {
    console.error("Failed to save journal entry:", err);
    return NextResponse.json({ error: err.message || "Failed to save journal entry" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-user";

  try {
    const result = await sql`
      SELECT * FROM journal_entries
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Failed to fetch journal entries:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch journal entries" }, { status: 500 });
  }
}
