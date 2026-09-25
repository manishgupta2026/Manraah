import { NextResponse } from "next/server";
import { getQuestionsForCategory } from "@/backend/queries/wellness";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const categoryId = params.categoryId;
    if (!categoryId) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const questions = await getQuestionsForCategory(categoryId);
    if (questions.length === 0) {
      return NextResponse.json(
        { error: `No active questions found for category '${categoryId}'` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      categoryId,
      questions,
    });
  } catch (err: any) {
    console.error(`GET /api/wellness/categories/[categoryId]/questions error:`, err);
    return NextResponse.json(
      { error: "Failed to fetch category questions" },
      { status: 500 }
    );
  }
}
