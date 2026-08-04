"use server";

import { sql } from "@/backend/db/client";
import { initDatabase } from "@/backend/queries/assessment";

export async function getDashboardSummaryAction(userId: string): Promise<any> {
  await initDatabase();
  try {
    const userResult = await sql`
      SELECT id, name, email FROM users WHERE id = ${userId} LIMIT 1
    `;
    if (userResult.length === 0) return null;

    const user = userResult[0];
    const profileResult = await sql`
      SELECT * FROM user_profiles WHERE user_id = ${userId} LIMIT 1
    `;
    const profile = profileResult.length > 0 ? profileResult[0] : null;

    return {
      name: user.name,
      email: user.email,
      category: profile ? profile.category : null,
      totalScore: profile ? profile.total_score : null,
      percentage: profile ? profile.percentage : null,
      wellnessLevel: profile ? profile.wellness_level : null,
    };
  } catch (err) {
    console.error("Error in getDashboardSummaryAction server action:", err);
    return null;
  }
}
