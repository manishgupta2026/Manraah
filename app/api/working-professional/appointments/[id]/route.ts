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
  const appointmentId = params.id;

  try {
    const body = await req.json();
    const { appointmentDate, appointmentTime, status } = body;

    let result;
    if (status === "CANCELLED") {
      result = await sql`
        UPDATE wp_appointments
        SET status = 'CANCELLED'
        WHERE id = ${appointmentId} AND user_id = ${userId}
        RETURNING *
      `;
    } else {
      if (!appointmentDate || !appointmentTime) {
        return NextResponse.json({ error: "Date and time are required for rescheduling" }, { status: 400 });
      }
      result = await sql`
        UPDATE wp_appointments
        SET appointment_date = ${appointmentDate}, appointment_time = ${appointmentTime}, status = 'SCHEDULED'
        WHERE id = ${appointmentId} AND user_id = ${userId}
        RETURNING *
      `;
    }

    if (result.length === 0) {
      return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (err: any) {
    console.error("PATCH appointment error:", err);
    return NextResponse.json({ error: err.message || "Failed to update appointment" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-wp-user";
  const appointmentId = params.id;

  try {
    const result = await sql`
      DELETE FROM wp_appointments
      WHERE id = ${appointmentId} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: appointmentId });
  } catch (err: any) {
    console.error("DELETE appointment error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete appointment" }, { status: 500 });
  }
}
