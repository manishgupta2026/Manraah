import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { submitWellnessAssessment } from "@/backend/queries/wellness";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = getAuthSessionFromRequest();
    const userId = session.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please log in to complete a wellness assessment." }, { status: 401 });
    }

    const body = await req.json();
    const { categoryId, answers } = body;

    if (!categoryId || typeof categoryId !== "string") {
      return NextResponse.json({ error: "A valid categoryId is required." }, { status: 400 });
    }

    if (!answers || !Array.isArray(answers) || answers.length !== 5) {
      return NextResponse.json(
        { error: "Exactly 5 answers are required for this wellness assessment." },
        { status: 400 }
      );
    }

    // Validate structure of each answer item
    for (const ans of answers) {
      if (!ans || typeof ans.questionId !== "number" || typeof ans.answer !== "number") {
        return NextResponse.json(
          { error: "Each answer must have a numeric questionId and answer (1–5)." },
          { status: 400 }
        );
      }
      if (ans.answer < 1 || ans.answer > 5) {
        return NextResponse.json(
          { error: `Invalid response score (${ans.answer}). Answers must be between 1 and 5.` },
          { status: 400 }
        );
      }
    }

    const result = await submitWellnessAssessment(userId, categoryId, answers);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("POST /api/wellness/assessments error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to submit wellness assessment. Please try again." },
      { status: 500 }
    );
  }
}
