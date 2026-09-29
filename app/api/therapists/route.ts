import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { ensureDoctorReviewsSchema } from "@/backend/queries/ratings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDoctorReviewsSchema();

    const therapists = await sql`
      SELECT 
        t.id, 
        t.name, 
        t.title, 
        COALESCE(t.profile_image, t.avatar, '/images/therapists/default-professional.jpg') as "profileImage",
        COALESCE(t.avatar, t.profile_image, '/images/therapists/default-professional.jpg') as avatar,
        t.specialties, 
        COALESCE(
          (SELECT ROUND(AVG(r.rating)::numeric, 2) FROM doctor_reviews r WHERE r.doctor_id = t.id),
          t.rating,
          4.90
        ) as rating, 
        COALESCE(
          (SELECT COUNT(*)::int FROM doctor_reviews r WHERE r.doctor_id = t.id),
          t.review_count,
          0
        ) as "reviewCount", 
        t.hourly_rate as "hourlyRate", 
        t.bio, 
        t.available_times as "availableTimes"
      FROM therapists t
      ORDER BY 
        CASE t.id
          WHEN 'dr-sarah-jenkins' THEN 1
          WHEN 'dr-arjun-mehta' THEN 2
          WHEN 'dr-neha-kapoor' THEN 3
          WHEN 'dr-vikram-patel' THEN 4
          WHEN 'dr-ananya-sen' THEN 5
          ELSE 6
        END ASC
    `;
    return NextResponse.json(therapists);
  } catch (err: any) {
    console.error("Failed to fetch therapists:", err);
    return NextResponse.json([], { status: 200 });
  }
}
