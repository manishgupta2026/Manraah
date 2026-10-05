import { NextResponse } from "next/server";
import { getDoctorAvailability } from "@/backend/queries/appointments";

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

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    // Default to today if date not specified
    const targetDate = dateParam || new Date().toISOString().split("T")[0];

    const availability = await getDoctorAvailability(doctorId, targetDate);

    return NextResponse.json(availability, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/doctors/[doctorId]/availability error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch doctor availability." },
      { status: 500 }
    );
  }
}
