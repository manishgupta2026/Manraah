import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { saveUserAssessment, getUserAssessment, getUserProfile } from "@/backend/queries/assessment";
import { getCategoryQuestions } from "@/frontend/lib/assessment/questions";
import { getWellnessLevel, getWellnessMessage } from "@/frontend/lib/assessment/wellness";
import { calculateSanctuaryScore } from "@/frontend/lib/assessment/scoring";
import { AssessmentAnswer } from "@/frontend/lib/assessment/types";
import { getUserById } from "@/backend/queries/users";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userResult = await getUserById(userId);

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const category = userResult[0].selected_category || "student";
    const questions = getCategoryQuestions(category);
    const latestAssessment = await getUserAssessment(userId);
    let finalAssessment = latestAssessment;

    if (!finalAssessment) {
      const profile = await getUserProfile(userId);
      if (profile && profile.percentage !== null) {
        finalAssessment = {
          total_score: profile.total_score || Math.round((profile.percentage / 100) * 50),
          max_score: 50,
          percentage: profile.percentage,
          wellness_level: profile.wellness_level || "Stable",
          answers: [],
        };
      }
    }

    return NextResponse.json({
      category,
      questions,
      assessmentCompleted: !!finalAssessment,
      latestAssessment: finalAssessment || null,
    });
  } catch (err: any) {
    console.error("[API GET /api/assessment Error]:", err);
    return NextResponse.json({ error: "Failed to fetch assessment" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "Assessment answers are required." },
        { status: 400 }
      );
    }

    // 1. Read user's PERMANENT category from database (Do NOT trust frontend category)
    const userResult = await getUserById(userId);

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const permanentCategory = userResult[0].selected_category || "student";

    // 2. Determine valid questions for that category
    const validQuestions = getCategoryQuestions(permanentCategory);
    const validQuestionIds = new Set(validQuestions.map((q) => q.id));

    // 3. Security validation: Verify all submitted questions belong to the user's permanent category
    if (answers.length !== validQuestions.length) {
      return NextResponse.json(
        {
          error: `Please answer all ${validQuestions.length} questions for your ${permanentCategory} journey.`,
        },
        { status: 400 }
      );
    }

    const validatedAnswers: AssessmentAnswer[] = [];

    for (const ans of answers) {
      const qId = Number(ans.questionId);
      if (!validQuestionIds.has(qId)) {
        return NextResponse.json(
          {
            error: `Security violation: Question ID ${qId} does not belong to your assigned ${permanentCategory} sanctuary.`,
          },
          { status: 400 }
        );
      }

      const matchingQ = validQuestions.find((q) => q.id === qId);
      if (!matchingQ) {
        return NextResponse.json(
          { error: `Invalid question ID ${qId}.` },
          { status: 400 }
        );
      }

      const matchingOpt = matchingQ.options.find(
        (o) => o.id === ans.selectedOptionId
      );

      const score = matchingOpt ? matchingOpt.score : Number(ans.score) || 3;
      const selectedText = matchingOpt ? matchingOpt.text : ans.selectedText || "";

      validatedAnswers.push({
        questionId: qId,
        questionKey: matchingQ.key,
        questionType: "category",
        category: permanentCategory,
        selectedOptionId: ans.selectedOptionId,
        selectedText: selectedText,
        score: Math.min(5, Math.max(1, score)),
        answeredAt: new Date().toISOString(),
      });
    }

    // 4. Calculate score on backend
    const { totalScore, maxScore, percentage, wellnessLevel, message } =
      calculateSanctuaryScore(validatedAnswers, 50);

    // 5. Persist assessment to Neon PostgreSQL database
    const saveResult = await saveUserAssessment(
      userId,
      permanentCategory,
      validatedAnswers,
      totalScore,
      percentage,
      wellnessLevel,
      maxScore
    );

    // 6. Update user onboarding completed state
    await sql`
      UPDATE users SET onboarding_completed = true WHERE id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      assessmentId: saveResult.assessment?.id,
      totalScore,
      maxScore,
      percentage,
      wellnessLevel,
      message,
      answers: validatedAnswers,
      completedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[API POST /api/assessment Error]:", err);
    return NextResponse.json(
      { error: "Failed to save Sanctuary Score. Please try again." },
      { status: 500 }
    );
  }
}
