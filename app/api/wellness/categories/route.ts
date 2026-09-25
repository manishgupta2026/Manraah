import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { getAll5WellnessCategoriesWithScores } from "@/backend/queries/wellness";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = getAuthSessionFromRequest();
    const userId = session.user?.id || null;

    const categories = await getAll5WellnessCategoriesWithScores(userId);
    return NextResponse.json({
      categories,
    });
  } catch (err: any) {
    console.error("GET /api/wellness/categories error:", err);
    return NextResponse.json(
      { error: "Failed to fetch wellness categories." },
      { status: 500 }
    );
  }
}
