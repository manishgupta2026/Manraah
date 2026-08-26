import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { getAuthSessionFromRequest } from "@/backend/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = getAuthSessionFromRequest();
    const userId = session.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure assessment_skipped column exists
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS assessment_skipped BOOLEAN DEFAULT FALSE;
    `;

    // Verify user profile category & status
    const userCategoryResult = await sql`
      SELECT selected_category, assessment_skipped FROM users WHERE id = ${userId} LIMIT 1
    `;
    if (userCategoryResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const category = (userCategoryResult[0].selected_category || "student").toLowerCase().trim();
    const skipped = userCategoryResult[0].assessment_skipped || false;

    if (category !== "student") {
      return NextResponse.json({
        completed: false,
        skipped: false,
        latestAssessment: null
      });
    }

    // Ensure table exists just in case
    await sql`
      CREATE TABLE IF NOT EXISTS student_onboarding_assessments (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        answers JSONB DEFAULT '[]'::jsonb,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Fetch latest assessment
    const latestAssessmentResult = await sql`
      SELECT id, completed_at, answers 
      FROM student_onboarding_assessments 
      WHERE user_id = ${userId} 
      ORDER BY completed_at DESC LIMIT 1
    `;

    if (latestAssessmentResult.length === 0) {
      return NextResponse.json({
        completed: false,
        skipped,
        latestAssessment: null
      });
    }

    const latest = latestAssessmentResult[0];

    return NextResponse.json({
      completed: true,
      skipped,
      latestAssessment: {
        id: latest.id,
        completedAt: latest.completed_at,
        answers: latest.answers
      }
    });
  } catch (err: any) {
    console.error("GET /api/student/assessment/status error:", err);
    return NextResponse.json({ error: "Failed to load assessment status" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = getAuthSessionFromRequest();
    const userId = session.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { skipped } = body;

    // Ensure assessment_skipped column exists
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS assessment_skipped BOOLEAN DEFAULT FALSE;
    `;

    await sql`
      UPDATE users 
      SET assessment_skipped = ${skipped === true}
      WHERE id = ${userId}
    `;

    return NextResponse.json({ success: true, skipped: skipped === true });
  } catch (err: any) {
    console.error("POST /api/student/assessment/status error:", err);
    return NextResponse.json({ error: "Failed to update assessment status" }, { status: 500 });
  }
}
