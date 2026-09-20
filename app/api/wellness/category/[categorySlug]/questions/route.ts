import { NextRequest, NextResponse } from "next/server";
import { getQuestionsForCategory } from "@/backend/queries/wellness";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categorySlug: string }> }
) {
  try {
    const { categorySlug } = await params;
    if (!categorySlug) {
      return NextResponse.json({ error: "Category slug is required" }, { status: 400 });
    }

    const questions = await getQuestionsForCategory(categorySlug);
    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: `No questions configured for category '${categorySlug}'` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      categoryId: categorySlug,
      questions,
    });
  } catch (err: any) {
    console.error("GET /api/wellness/category/[categorySlug]/questions error:", err);
    return NextResponse.json(
      { error: "Failed to fetch assessment questions." },
      { status: 500 }
    );
  }
}
