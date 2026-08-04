import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/backend/auth/auth";
import { getMoodHistory } from "@/backend/queries/mood";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "all";

  try {
    const history = await getMoodHistory(session.user.id, filter);
    return NextResponse.json(history);
  } catch (err: any) {
    console.error("API GET /api/mood/history error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
