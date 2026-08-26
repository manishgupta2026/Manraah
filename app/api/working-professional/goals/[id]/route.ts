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
  const goalId = params.id;

  try {
    const body = await req.json();
    const { title, description, completed, priority, due_date } = body;

    let compAt = undefined;
    if (completed !== undefined) {
      compAt = completed ? new Date().toISOString() : null;
    }

    const result = await sql`
      UPDATE wp_goals
      SET title = COALESCE(${title}, title),
          description = COALESCE(${description}, description),
          completed = COALESCE(${completed}, completed),
          completed_at = CASE 
            WHEN ${completed} IS NOT NULL THEN ${compAt}::timestamp with time zone 
            ELSE completed_at 
          END,
          priority = COALESCE(${priority}, priority),
          due_date = COALESCE(${due_date}, due_date)
      WHERE id = ${goalId} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Goal not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (err: any) {
    console.error("PATCH goal error:", err);
    return NextResponse.json({ error: err.message || "Failed to update goal" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-wp-user";
  const goalId = params.id;

  try {
    const result = await sql`
      DELETE FROM wp_goals
      WHERE id = ${goalId} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Goal not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: goalId });
  } catch (err: any) {
    console.error("DELETE goal error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete goal" }, { status: 500 });
  }
}
