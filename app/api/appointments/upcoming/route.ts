import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { getNearestUpcomingAppointment } from "@/backend/queries/appointments";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = getAuthSessionFromRequest();
    const userId = session.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const upcoming = await getNearestUpcomingAppointment(userId);

    return NextResponse.json({
      upcomingAppointment: upcoming,
    });
  } catch (err: any) {
    console.error("GET /api/appointments/upcoming error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch upcoming appointment." },
      { status: 500 }
    );
  }
}
