import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { verifyAdminSession } from "@/backend/auth/admin-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = verifyAdminSession(request);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "ALL";

  try {
    const searchPattern = search.trim() ? `%${search.trim()}%` : "";
    const categoryPattern = category && category !== "ALL"
      ? `%${category.toLowerCase().replace(/[\s_]+/g, "")}%`
      : "";

    const usersList = await sql`
      SELECT 
        u.id,
        COALESCE(u.name, 'Anonymous Member') AS name,
        u.email,
        u.sanctuary_name AS "sanctuaryName",
        COALESCE(u.selected_category, 'student') AS category,
        COALESCE(u.streak_days, 1) AS "streakDays",
        COALESCE(u.mindfulness_minutes, 0) AS "mindfulnessMinutes",
        COALESCE(u.current_mood, 'Sanctuary Member') AS "currentMood",
        u.created_at AS "createdAt",
        COALESCE(
          (SELECT computed_score FROM user_assessments WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1),
          78
        ) AS "serenityScore"
      FROM users u
      WHERE 
        (${searchPattern} = '' OR u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern} OR u.id ILIKE ${searchPattern} OR u.sanctuary_name ILIKE ${searchPattern})
        AND (${categoryPattern} = '' OR REPLACE(REPLACE(LOWER(COALESCE(u.selected_category, 'student')), '_', ''), '-', '') LIKE ${categoryPattern})
      ORDER BY u.created_at DESC 
      LIMIT 50
    `;

    return NextResponse.json({
      success: true,
      users: usersList.map((u: any) => ({
        id: u.id,
        userTag: u.sanctuaryName || u.name || `Member #${u.id.substring(0, 5)}`,
        email: u.email,
        category: u.category,
        serenityScore: Number(u.serenityScore) || 75,
        streakDays: Number(u.streakDays) || 1,
        mindfulnessMinutes: Number(u.mindfulnessMinutes) || 0,
        status: (Number(u.serenityScore) || 75) < 50 ? "Warning" : "Active",
        joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
        role: "user",
      })),
    });
  } catch (err: any) {
    console.error("[GET /api/admin/users Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch users list" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const auth = verifyAdminSession(request);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  try {
    const body = await request.json();
    const { userId, category, currentMood } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (category) {
      await sql`UPDATE users SET selected_category = ${category} WHERE id = ${userId}`;
    }
    if (currentMood) {
      await sql`UPDATE users SET current_mood = ${currentMood} WHERE id = ${userId}`;
    }

    return NextResponse.json({ success: true, message: "User profile updated successfully" });
  } catch (err: any) {
    console.error("[PATCH /api/admin/users Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to update user" }, { status: 500 });
  }
}
