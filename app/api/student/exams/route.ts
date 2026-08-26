import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-student-user";

  try {
    const exams = await sql`
      SELECT id, exam_name as name, subject, exam_date as date, exam_time as time, priority, prep_progress as progress
      FROM student_exams
      WHERE user_id = ${userId}
      ORDER BY exam_date ASC
    `;

    const mapped = exams.map((ex: any) => {
      const diff = Math.ceil((new Date(ex.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      return {
        ...ex,
        exam_name: ex.name,
        exam_date: ex.date,
        exam_time: ex.time,
        progress_percentage: ex.progress,
        daysLeft: Math.max(0, diff),
      };
    });

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
    const { name, subject, date, time, priority, progress } = body;

    if (!name || !subject || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const inserted = await sql`
      INSERT INTO student_exams (user_id, exam_name, subject, exam_date, exam_time, priority, prep_progress)
      VALUES (${userId}, ${name}, ${subject}, ${new Date(date).toISOString()}, ${time || "09:00 AM"}, ${priority || "Medium"}, ${Number(progress) || 0})
      RETURNING id, exam_name as name, subject, exam_date as date, exam_time as time, priority, prep_progress as progress
    `;

    const ex = inserted[0];
    const diff = Math.ceil((new Date(ex.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    const result = {
      ...ex,
      exam_name: ex.name,
      exam_date: ex.date,
      exam_time: ex.time,
      progress_percentage: ex.progress,
      daysLeft: Math.max(0, diff),
    };

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-student-user";

  try {
    const body = await req.json();
    const { id, name, subject, date, time, priority, progress } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing exam ID" }, { status: 400 });
    }

    const updated = await sql`
      UPDATE student_exams
      SET 
        exam_name = COALESCE(${name}, exam_name),
        subject = COALESCE(${subject}, subject),
        exam_date = COALESCE(${date ? new Date(date).toISOString() : null}, exam_date),
        exam_time = COALESCE(${time}, exam_time),
        priority = COALESCE(${priority}, priority),
        prep_progress = COALESCE(${progress !== undefined ? Number(progress) : null}, prep_progress)
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id, exam_name as name, subject, exam_date as date, exam_time as time, priority, prep_progress as progress
    `;

    if (updated.length === 0) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const ex = updated[0];
    const diff = Math.ceil((new Date(ex.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    const result = {
      ...ex,
      exam_name: ex.name,
      exam_date: ex.date,
      exam_time: ex.time,
      progress_percentage: ex.progress,
      daysLeft: Math.max(0, diff),
    };

    return NextResponse.json(result);
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
      return NextResponse.json({ error: "Missing exam ID" }, { status: 400 });
    }

    await sql`
      DELETE FROM student_exams
      WHERE id = ${Number(id)} AND user_id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
