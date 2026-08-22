import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-wp-user";

  try {
    const body = await req.json();
    const { duration, completed, type } = body;

    const inserted = await sql`
      INSERT INTO activity_sessions (user_id, type, duration, completed)
      VALUES (${userId}, ${type || 'decompression'}, ${Number(duration) || 120}, ${completed !== false})
      RETURNING *
    `;

    return NextResponse.json(inserted[0]);
  } catch (err: any) {
    console.error("POST activity session error:", err);
    return NextResponse.json({ error: err.message || "Failed to log activity session" }, { status: 500 });
  }
}
