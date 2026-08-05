import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const users = await sql`
      SELECT id, name, email, avatar, selected_category as category, streak_days, mindfulness_minutes, current_mood
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json({ category: "student" });
    }

    return NextResponse.json(users[0]);
  } catch (err: any) {
    console.error("[API GET /api/profile error]:", err);
    return NextResponse.json({ category: "student" });
  }
}
