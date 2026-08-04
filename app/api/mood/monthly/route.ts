import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/backend/auth/auth";
import { getMonthlySummary } from "@/backend/queries/mood";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await getMonthlySummary(session.user.id);
    return NextResponse.json(summary);
  } catch (err: any) {
    console.error("API GET /api/mood/monthly error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
