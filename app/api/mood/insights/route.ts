import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/backend/auth/auth";
import { getMoodInsights } from "@/backend/queries/mood";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const insights = await getMoodInsights(session.user.id);
    return NextResponse.json(insights);
  } catch (err: any) {
    console.error("API GET /api/mood/insights error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
