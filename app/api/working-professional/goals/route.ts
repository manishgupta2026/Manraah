import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-wp-user";

  try {
    const list = await sql`
      SELECT id, title, description, completed, created_at, completed_at
      FROM wp_goals
      WHERE user_id = ${userId}
      ORDER BY created_at ASC
    `;
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load goals" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-wp-user";

  try {
    const body = await req.json();
    const { id, title, description, completed } = body;

    // If ID is provided, toggle/update goal completion
    if (id !== undefined) {
      const isCompleted = !!completed;
      const updated = await sql`
        UPDATE wp_goals
        SET completed = ${isCompleted},
            completed_at = ${isCompleted ? new Date().toISOString() : null}
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING id, title, description, completed, created_at, completed_at
      `;
      return NextResponse.json(updated[0] || { error: "Goal not found" });
    }

    // Otherwise, create new goal
    if (!title) {
      return NextResponse.json({ error: "Missing goal title" }, { status: 400 });
    }

    const inserted = await sql`
      INSERT INTO wp_goals (user_id, title, description, completed)
      VALUES (${userId}, ${title}, ${description || null}, false)
      RETURNING id, title, description, completed, created_at, completed_at
    `;
    return NextResponse.json(inserted[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save goal" }, { status: 500 });
  }
}
