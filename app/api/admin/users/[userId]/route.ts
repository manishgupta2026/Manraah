import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { verifyAdminSession } from "@/backend/auth/admin-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  const auth = verifyAdminSession(request);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  const { userId } = params;
  if (!userId) {
    return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
  }

  try {
    // 1. Fetch user base record
    const userRes = await sql`
      SELECT 
        id,
        name,
        email,
        sanctuary_name AS "sanctuaryName",
        avatar,
        selected_category AS category,
        streak_days AS "streakDays",
        mindfulness_minutes AS "mindfulnessMinutes",
        current_mood AS "currentMood",
        created_at AS "createdAt"
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (userRes.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userRes[0];

    // 2. Fetch assessments, daily checkins, and journals in parallel
    const [assessments, checkins, journals] = await Promise.all([
      sql`
        SELECT id, category, stress_frequency, sleep_quality, support_level, computed_score, created_at
        FROM user_assessments
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 5
      `,
      sql`
        SELECT id, mood, energy_level, sleep_quality, stress, note, created_at
        FROM daily_checkins
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 10
      `,
      sql`
        SELECT id, title, mood_tag, category, created_at
        FROM journal_entries
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 5
      `,
    ]);

    const latestAssessmentScore = assessments[0]?.computed_score || 78;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name || "Anonymous Member",
        userTag: user.sanctuaryName || user.name || `Member #${user.id.substring(0, 5)}`,
        email: user.email,
        category: user.category || "student",
        avatar: user.avatar || "/images/user_avatar.jpg",
        role: "user",
        serenityScore: latestAssessmentScore,
        status: latestAssessmentScore < 50 ? "Warning" : "Active",
        joinedDate: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
          : "August 2026",
        mindfulnessMinutes: Number(user.mindfulnessMinutes) || 0,
        checkInStreak: Number(user.streakDays) || 1,
        recentMoods: checkins.map((c: any) => c.mood).filter(Boolean).slice(0, 5),
        assessments,
        checkins,
        journals,
      },
    });
  } catch (err: any) {
    console.error(`[GET /api/admin/users/${userId} Error]:`, err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch user details" },
      { status: 500 }
    );
  }
}
