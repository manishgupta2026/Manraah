import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { getDoctorRatingsSummary } from "@/backend/queries/ratings";
import { getAuthSessionFromRequest } from "@/backend/auth/session";

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

    // Fetch doctor from database
    const doctorRows = await sql`
      SELECT 
        id, 
        name, 
        title, 
        COALESCE(profile_image, avatar, '/images/therapists/default-professional.jpg') as "profileImage",
        COALESCE(avatar, profile_image, '/images/therapists/default-professional.jpg') as avatar,
        specialties, 
        rating, 
        review_count as "reviewCount", 
        hourly_rate as "hourlyRate", 
        bio, 
        available_times as "availableTimes"
      FROM therapists
      WHERE id = ${doctorId}
      LIMIT 1
    `;

    if (!doctorRows || doctorRows.length === 0) {
      return NextResponse.json(
        { error: "Doctor profile not found." },
        { status: 404 }
      );
    }

    const doctor = doctorRows[0];
    const ratingSummary = await getDoctorRatingsSummary(doctorId, currentUserId);

    return NextResponse.json({
      doctor: {
        id: doctor.id,
        name: doctor.name,
        role: doctor.title,
        title: doctor.title,
        profileImage: doctor.profileImage,
        image: doctor.profileImage,
        specialties: doctor.specialties || [],
        rating: ratingSummary.averageRating ?? doctor.rating ?? 4.9,
        reviewCount: ratingSummary.totalRatings ?? doctor.reviewCount ?? 0,
        hourlyRate: doctor.hourlyRate || "₹1,800 / session",
        bio: doctor.bio || "Dedicated mental health professional providing empathetic care.",
        availableTimes: doctor.availableTimes || [],
        experience: "8+ years experience",
        verified: true,
      },
      ratings: ratingSummary,
    });
  } catch (err: any) {
    console.error("GET /api/doctors/[doctorId] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load doctor profile." },
      { status: 500 }
    );
  }
}
