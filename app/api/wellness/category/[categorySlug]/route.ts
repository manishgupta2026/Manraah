import { NextRequest, NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import {
  getUserCurrentWellness,
  getAssessmentHistoryForCategory,
} from "@/backend/queries/wellness";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categorySlug: string }> }
) {
  try {
    const { categorySlug } = await params;
    const session = getAuthSessionFromRequest();
    const userId = session.user?.id || "guest";

    const wellness = await getUserCurrentWellness(userId, categorySlug);
    const history = await getAssessmentHistoryForCategory(userId, categorySlug);

    return NextResponse.json({
      ...wellness,
      history,
    });
  } catch (err: any) {
    console.error("GET /api/wellness/category/[categorySlug] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch category wellness details." },
      { status: 500 }
    );
  }
}
