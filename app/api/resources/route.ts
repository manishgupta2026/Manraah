import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await sql`
      SELECT id, title, read_time as "readTime", category, thumbnail, summary, author
      FROM resources
    `;
    return NextResponse.json(res);
  } catch (err: any) {
    console.error("Failed to fetch resources:", err);
    return NextResponse.json([], { status: 200 });
  }
}
