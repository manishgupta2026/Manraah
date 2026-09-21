import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id;

  if (!userId) {
    return NextResponse.json([]);
  }

  try {
    const entries = await sql`
      SELECT 
        id, 
        user_id as "userId", 
        title, 
        excerpt, 
        content, 
        mood_tag as "moodTag", 
        category, 
        created_at as "createdAt"
      FROM journal_entries
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return NextResponse.json(entries);
  } catch (err: any) {
    console.error("Failed to fetch journal entries:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, content, moodTag, category } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Missing title or content" }, { status: 400 });
    }

    const id = `journal-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const excerpt = content.length > 120 ? content.substring(0, 117) + "..." : content;

    const result = await sql`
      INSERT INTO journal_entries (id, user_id, title, excerpt, content, mood_tag, category)
      VALUES (${id}, ${userId}, ${title}, ${excerpt}, ${content}, ${moodTag || "Reflective"}, ${category || "General"})
      RETURNING id, user_id as "userId", title, excerpt, content, mood_tag as "moodTag", category, created_at as "createdAt"
    `;

    return NextResponse.json(result[0]);
  } catch (err: any) {
    console.error("Failed to save journal entry:", err);
    return NextResponse.json({ error: err.message || "Failed to save journal entry" }, { status: 500 });
  }
}
