import { NextRequest, NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import {
  getUserCurrentWellness,
  getAssessmentHistoryForCategory,
} from "@/backend/queries/wellness";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    const session = getAuthSessionFromRequest();
    const userId = session.user?.id || "guest";

    if (!categoryId) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const wellness = await getUserCurrentWellness(userId, categoryId);
    const history = await getAssessmentHistoryForCategory(userId, categoryId);

    return NextResponse.json({
      success: true,
      ...wellness,
      history,
    });
  } catch (err: any) {
    console.error(`GET /api/wellness/scores/[categoryId] error:`, err);
    return NextResponse.json(
      { error: "Failed to load category score details" },
      { status: 500 }
    );
  }
}
