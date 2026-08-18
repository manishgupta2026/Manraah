import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const therapists = await sql`
      SELECT id, name, title, avatar, specialties, rating, review_count as "reviewCount", hourly_rate as "hourlyRate", bio, available_times as "availableTimes"
      FROM therapists
    `;
    return NextResponse.json(therapists);
  } catch (err: any) {
    console.error("Failed to fetch therapists:", err);
    return NextResponse.json([], { status: 200 });
  }
}
