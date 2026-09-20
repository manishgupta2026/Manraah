import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { cancelAppointment } from "@/backend/queries/appointments";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getAuthSessionFromRequest();
    const userId = session.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { id: appointmentId } = await params;

    if (!appointmentId) {
      return NextResponse.json({ error: "Appointment ID is required." }, { status: 400 });
    }

    const success = await cancelAppointment(userId, appointmentId);

    if (!success) {
      return NextResponse.json({ error: "Appointment not found or could not be cancelled." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Appointment cancelled successfully." });
  } catch (err: any) {
    console.error("POST /api/appointments/[id]/cancel error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to cancel appointment." },
      { status: 500 }
    );
  }
}
