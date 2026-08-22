import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-wp-user";

  try {
    const list = await sql`
      SELECT id, doctor_name, doctor_title, doctor_avatar, appointment_date, appointment_time, status, video_call_url, created_at
      FROM wp_appointments
      WHERE user_id = ${userId}
      ORDER BY appointment_date ASC, appointment_time ASC
    `;
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load appointments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-wp-user";

  try {
    const body = await req.json();
    const { doctorName, doctorTitle, doctorAvatar, appointmentDate, appointmentTime, videoCallUrl } = body;

    if (!doctorName || !doctorTitle || !appointmentDate || !appointmentTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const inserted = await sql`
      INSERT INTO wp_appointments (user_id, doctor_name, doctor_title, doctor_avatar, appointment_date, appointment_time, status, video_call_url)
      VALUES (${userId}, ${doctorName}, ${doctorTitle}, ${doctorAvatar || null}, ${appointmentDate}, ${appointmentTime}, 'SCHEDULED', ${videoCallUrl || null})
      RETURNING id, doctor_name, doctor_title, appointment_date, appointment_time, status
    `;

    return NextResponse.json(inserted[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save appointment" }, { status: 500 });
  }
}
