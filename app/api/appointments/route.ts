import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import {
  getUpcomingAppointments,
  getPastAppointments,
  getNearestUpcomingAppointment,
  bookAppointment,
} from "@/backend/queries/appointments";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = getAuthSessionFromRequest();
    const userId = session.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const [upcoming, past, nearest] = await Promise.all([
      getUpcomingAppointments(userId),
      getPastAppointments(userId),
      getNearestUpcomingAppointment(userId),
    ]);

    return NextResponse.json({
      upcoming,
      past,
      nearest,
    });
  } catch (err: any) {
    console.error("GET /api/appointments error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch appointments." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = getAuthSessionFromRequest();
    const userId = session.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const {
      therapistId,
      therapistName,
      therapistRole,
      therapistImage,
      appointmentDate,
      focusArea,
      sessionType,
      durationMinutes,
    } = body;

    if (!therapistId || !therapistName || !appointmentDate) {
      return NextResponse.json(
        { error: "therapistId, therapistName, and appointmentDate are required." },
        { status: 400 }
      );
    }

    const appointment = await bookAppointment(userId, {
      therapistId,
      therapistName,
      therapistRole,
      therapistImage,
      appointmentDate,
      focusArea,
      sessionType,
      durationMinutes,
    });

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (err: any) {
    console.error("POST /api/appointments error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to book appointment." },
      { status: 500 }
    );
  }
}
