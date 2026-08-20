import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-student-user";

  try {
    const appts = await sql`
      SELECT id, doctor_name as name, doctor_title as title, doctor_avatar as avatar, appointment_date as date, appointment_time as time, status, video_call_url
      FROM student_appointments
      WHERE user_id = ${userId} AND status = 'ACTIVE'
      ORDER BY appointment_date ASC
    `;
    return NextResponse.json(appts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-student-user";

  try {
    const body = await req.json();
    const { name, title, avatar, date, time, videoCallUrl } = body;

    if (!name || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const inserted = await sql`
      INSERT INTO student_appointments (user_id, doctor_name, doctor_title, doctor_avatar, appointment_date, appointment_time, status, video_call_url)
      VALUES (${userId}, ${name}, ${title || "Therapist"}, ${avatar || "/images/therapist_sarah.jpg"}, ${new Date(date).toISOString()}, ${time}, 'ACTIVE', ${videoCallUrl || "https://video.manraah.com/room/consult"})
      RETURNING id, doctor_name as name, doctor_title as title, doctor_avatar as avatar, appointment_date as date, appointment_time as time, status, video_call_url
    `;

    return NextResponse.json(inserted[0]);
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
      return NextResponse.json({ error: "Missing appointment ID" }, { status: 400 });
    }

    await sql`
      UPDATE student_appointments
      SET status = 'CANCELLED'
      WHERE id = ${Number(id)} AND user_id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
