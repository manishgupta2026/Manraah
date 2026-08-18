import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-user";

  try {
    const reflections = await sql`
      SELECT id, title, excerpt, content, mood_tag, category, created_at
      FROM journal_entries
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    return NextResponse.json({
      success: true,
      reflections,
      latestReflection: reflections.length > 0 ? reflections[0] : null,
    });
  } catch (err: any) {
    console.error("API GET /api/reflections error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch reflections" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-user";

  try {
    const body = await req.json();
    const { content, title, moodTag, category } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Reflection content cannot be empty." },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();
    const id = `refl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const finalTitle = title?.trim() || "Workday Decompression";
    const excerpt = trimmedContent.length > 120 ? `${trimmedContent.substring(0, 117)}...` : trimmedContent;
    const finalMoodTag = moodTag || "Calm";
    const finalCategory = category || "Workday Decompression";

    const result = await sql`
      INSERT INTO journal_entries (id, user_id, title, excerpt, content, mood_tag, category, created_at)
      VALUES (${id}, ${userId}, ${finalTitle}, ${excerpt}, ${trimmedContent}, ${finalMoodTag}, ${finalCategory}, CURRENT_TIMESTAMP)
      RETURNING id, user_id, title, excerpt, content, mood_tag, category, created_at
    `;

    return NextResponse.json({
      success: true,
      message: "Reflection saved peacefully.",
      reflection: result[0],
    });
  } catch (err: any) {
    console.error("API POST /api/reflections error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save reflection" },
      { status: 500 }
    );
  }
}
