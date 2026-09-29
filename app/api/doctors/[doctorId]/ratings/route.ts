import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import {
  getDoctorRatingsSummary,
  submitOrUpdateDoctorRating,
} from "@/backend/queries/ratings";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { doctorId: string } }
) {
  try {
    const doctorId = params.doctorId;
    if (!doctorId) {
      return NextResponse.json({ error: "Doctor ID is required." }, { status: 400 });
    }

    const session = getAuthSessionFromRequest();
    const currentUserId = session.user?.id || null;

    const summary = await getDoctorRatingsSummary(doctorId, currentUserId);
    return NextResponse.json(summary);
  } catch (err: any) {
    console.error("GET /api/doctors/[doctorId]/ratings error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load doctor ratings." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { doctorId: string } }
) {
  try {
    const doctorId = params.doctorId;
    if (!doctorId) {
      return NextResponse.json({ error: "Doctor ID is required." }, { status: 400 });
    }

    // 1. Authenticate user from session cookie (do NOT trust patientId from body)
    const session = getAuthSessionFromRequest();
    const patientId = session.user?.id;

    if (!patientId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to rate a practitioner." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { rating, feedback, appointmentId } = body;

    // 2. Validate rating
    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5." },
        { status: 400 }
      );
    }

    // 3. Submit or update review in database
    const updatedSummary = await submitOrUpdateDoctorRating({
      doctorId,
      patientId,
      rating: parsedRating,
      feedback: typeof feedback === "string" ? feedback : null,
      appointmentId: typeof appointmentId === "string" ? appointmentId : null,
    });

    return NextResponse.json(updatedSummary, { status: 200 });
  } catch (err: any) {
    console.error("POST /api/doctors/[doctorId]/ratings error:", err);

    if (err.message && err.message.includes("after completing a session")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: err.message || "Failed to submit doctor rating." },
      { status: 500 }
    );
  }
}
