import { NextResponse } from "next/server";
import { generateUniqueSanctuaryName } from "@/backend/auth/sanctuary";
import { saveUserAssessment } from "@/backend/queries/assessment";
import { getUserById, updateUserSanctuaryName, checkSanctuaryNameDuplicate, updateUserCategory, updateUserAvatar, updateUserDashboardState } from "@/backend/queries/users";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const users = await getUserById(userId);

    if (users.length === 0) {
      return NextResponse.json({ category: "student" });
    }

    const user = users[0];

    // Migrate/generate sanctuary name if missing
    let sanctuaryName = user.sanctuary_name;
    if (!sanctuaryName) {
      sanctuaryName = await generateUniqueSanctuaryName();
      await updateUserSanctuaryName(user.id, sanctuaryName);
    }

    return NextResponse.json({
      id: user.id,
      name: sanctuaryName,
      sanctuaryName: sanctuaryName,
      email: user.email,
      avatar: user.avatar,
      category: user.category === "couples" || user.category === "couple" ? "couples" : (user.category === "parents" || user.category === "parent" ? "parents" : user.category),
      streakDays: user.streak_days,
      mindfulnessMinutes: user.mindfulness_minutes,
      currentMood: user.current_mood
    });
  } catch (err: any) {
    console.error("[API GET /api/profile error]:", err);
    return NextResponse.json({ category: "student" });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, sanctuaryName, category, avatar, dashboardState } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // 1. Verify user exists
    const existingUsers = await getUserById(userId);
    if (existingUsers.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const currentUser = existingUsers[0];

    // 2. Validate sanctuaryName if changed
    if (sanctuaryName && sanctuaryName.trim() !== currentUser.sanctuary_name) {
      const trimmedName = sanctuaryName.trim();
      if (trimmedName.length < 2 || trimmedName.length > 30) {
        return NextResponse.json(
          { error: "Sanctuary Name must be between 2 and 30 characters." },
          { status: 400 }
        );
      }

      const duplicate = await checkSanctuaryNameDuplicate(trimmedName, userId);
      if (duplicate.length > 0) {
        return NextResponse.json(
          { error: "This Sanctuary Name is already taken." },
          { status: 400 }
        );
      }

      await updateUserSanctuaryName(userId, trimmedName);
    }



    // 3. Update category if provided
    if (category) {
      const targetCategory = category === "couples" || category === "couple" ? "couples" : (category === "parents" || category === "parent" ? "parents" : category);
      await updateUserCategory(userId, targetCategory);
    }

    // Save assessment if provided in PUT payload (e.g. when retaking assessment on active session)
    const { answers, computedScore, percentage, wellnessLevel } = body;
    if (answers && Array.isArray(answers) && answers.length > 0) {
      const targetCategory = category === "couples" || category === "couple" ? "couples" : (category === "parents" || category === "parent" ? "parents" : category || "student");
      await saveUserAssessment(
        userId,
        targetCategory,
        answers,
        typeof computedScore === "number" ? computedScore : 50,
        typeof percentage === "number" ? percentage : 50,
        wellnessLevel || "Balanced"
      );
    }

    // 4. Update avatar if provided
    if (avatar) {
      await updateUserAvatar(userId, avatar);
    }

    // Update dashboardState if provided
    if (dashboardState) {
      await updateUserDashboardState(userId, dashboardState);
    }

    // 5. Fetch updated user details
    const updatedUsers = await getUserById(userId);
    const updatedUser = updatedUsers[0];

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.sanctuary_name || updatedUser.name,
        sanctuaryName: updatedUser.sanctuary_name || updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        selectedCategory: updatedUser.selected_category,
        streakDays: updatedUser.streak_days,
        mindfulnessMinutes: updatedUser.mindfulness_minutes,
        currentMood: updatedUser.current_mood,
        dashboardState: updatedUser.dashboard_state || null,
      }
    });

  } catch (err: any) {
    console.error("[API PUT /api/profile error]:", err);
    return NextResponse.json({ error: err.message || "Failed to update profile." }, { status: 500 });
  }
}
