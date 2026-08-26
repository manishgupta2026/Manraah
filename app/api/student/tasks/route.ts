import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-student-user";

  try {
    const tasks = await sql`
      SELECT id, subject, task_title as title, priority, due_date as date, estimated_duration as duration, completed
      FROM student_tasks
      WHERE user_id = ${userId}
      ORDER BY completed ASC, due_date ASC
    `;
    const mapped = tasks.map((t: any) => ({
      ...t,
      due_date: t.date,
      duration_minutes: t.duration
    }));
    return NextResponse.json(mapped);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-student-user";

  try {
    const body = await req.json();
    const { subject, title, priority, date, duration } = body;

    if (!subject || !title || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const inserted = await sql`
      INSERT INTO student_tasks (user_id, subject, task_title, priority, due_date, estimated_duration, completed)
      VALUES (${userId}, ${subject}, ${title}, ${priority || "Medium"}, ${new Date(date).toISOString()}, ${Number(duration) || 30}, false)
      RETURNING id, subject, task_title as title, priority, due_date as date, estimated_duration as duration, completed
    `;

    const t = inserted[0];
    return NextResponse.json({
      ...t,
      due_date: t.date,
      duration_minutes: t.duration
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-student-user";

  try {
    const body = await req.json();
    const { id, subject, title, priority, date, duration, completed } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing task ID" }, { status: 400 });
    }

    const updated = await sql`
      UPDATE student_tasks
      SET 
        subject = COALESCE(${subject}, subject),
        task_title = COALESCE(${title}, task_title),
        priority = COALESCE(${priority}, priority),
        due_date = COALESCE(${date ? new Date(date).toISOString() : null}, due_date),
        estimated_duration = COALESCE(${duration !== undefined ? Number(duration) : null}, estimated_duration),
        completed = COALESCE(${completed !== undefined ? Boolean(completed) : null}, completed)
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id, subject, task_title as title, priority, due_date as date, estimated_duration as duration, completed
    `;

    if (updated.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const t = updated[0];
    return NextResponse.json({
      ...t,
      due_date: t.date,
      duration_minutes: t.duration
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-student-user";

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing task ID" }, { status: 400 });
    }

    await sql`
      DELETE FROM student_tasks
      WHERE id = ${Number(id)} AND user_id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
