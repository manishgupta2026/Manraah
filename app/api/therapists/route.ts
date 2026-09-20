import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const therapists = await sql`
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
      ORDER BY 
        CASE id
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
