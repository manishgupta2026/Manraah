import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { generateUniqueSanctuaryName } from "@/backend/auth/sanctuary";
import { saveUserAssessment } from "@/backend/queries/assessment";
import { getUserById, updateUserSanctuaryName, checkSanctuaryNameDuplicate, updateUserCategory, updateUserAvatar, updateUserStreak } from "@/backend/queries/users";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const avatarUrl = user.avatar || user.image || "";
    const previouslyLoggedIn = Boolean(user.has_logged_in_before);
    const count = Number(user.login_count || 0);
    const isFirst = !previouslyLoggedIn && count <= 1;

    return NextResponse.json({
      id: user.id,
      name: sanctuaryName,
      sanctuaryName: sanctuaryName,
      email: user.email,
      avatar: avatarUrl,
      profileImage: avatarUrl,
      category: (
        user.selected_category === "working_professional" || user.selected_category === "working-professional" || user.selected_category === "young_pro" || user.selected_category === "youngprofessional" ? "working-professional" :
        user.selected_category === "couples" || user.selected_category === "couple" ? "couple" :
        user.selected_category === "parents" || user.selected_category === "parent" ? "parent" :
        user.selected_category || "student"
      ),
      streakDays: user.streak_days,
      mindfulnessMinutes: user.mindfulness_minutes,
      currentMood: user.current_mood,
      hasLoggedInBefore: previouslyLoggedIn,
      loginCount: count,
      isFirstLogin: isFirst,
    });
  } catch (err: any) {
    console.error("[API GET /api/profile error]:", err);
    return NextResponse.json({ category: "student", avatar: "/images/user_avatar.jpg", profileImage: "/images/user_avatar.jpg" });
  }
}

export async function PUT(request: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sanctuaryName, category, avatar, profileImage } = body;

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
      const normalizedCat = (
        category === "working_professional" || category === "working-professional" || category === "young_pro" || category === "youngprofessional" ? "working-professional" :
        category === "couples" || category === "couple" ? "couple" :
        category === "parents" || category === "parent" ? "parent" :
        category
      );
      await updateUserCategory(userId, normalizedCat);
    }

    // Save assessment if provided in PUT payload (e.g. when retaking assessment on active session)
    const { answers, computedScore, percentage, wellnessLevel, maxScore } = body;
    if (answers && Array.isArray(answers) && answers.length > 0) {
      const targetCategory = category === "couples" || category === "couple" ? "couple" : (category === "parents" || category === "parent" ? "parent" : category || "student");
      await saveUserAssessment(
        userId,
        targetCategory,
        answers,
        typeof computedScore === "number" ? computedScore : 50,
        typeof percentage === "number" ? percentage : 50,
        wellnessLevel || "Balanced",
        typeof maxScore === "number" ? maxScore : 50
      );
    }

    // 4. Update avatar if provided
    const newAvatar = avatar || profileImage;
    if (newAvatar) {
      await updateUserAvatar(userId, newAvatar);
    }

    // 5. Fetch updated user details
    const updatedUsers = await getUserById(userId);
    const updatedUser = updatedUsers[0];

    const finalAvatar = updatedUser.avatar || updatedUser.image || newAvatar || "/images/user_avatar.jpg";

    const userProfile = {
      id: updatedUser.id,
      name: updatedUser.sanctuary_name || updatedUser.name,
      sanctuaryName: updatedUser.sanctuary_name || updatedUser.name,
      email: updatedUser.email,
      avatar: finalAvatar,
      profileImage: finalAvatar,
      selectedCategory: updatedUser.selected_category || "student",
      streakDays: updatedUser.streak_days,
      mindfulnessMinutes: updatedUser.mindfulness_minutes,
      currentMood: updatedUser.current_mood,
    };

    const sessionData = {
      user: userProfile,
      token: "m_token_" + updatedUser.id,
      isAuthenticated: true,
      category: userProfile.selectedCategory,
    };

    const response = NextResponse.json({
      success: true,
      user: userProfile,
    });

    response.cookies.set("manraah_session", JSON.stringify(sessionData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    response.cookies.set("userType", userProfile.selectedCategory, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("[API PUT /api/profile error]:", err);
    return NextResponse.json({ error: err.message || "Failed to update profile." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete the user from the users table. Foreign key cascade deletes will remove records.
    await sql`DELETE FROM users WHERE id = ${userId}`;

    // Clear session cookies
    const response = NextResponse.json({ success: true, message: "Account deleted successfully." });
    response.cookies.set("manraah_session", "", {
      httpOnly: false,
      maxAge: 0,
      path: "/",
    });
    response.cookies.set("userType", "", {
      httpOnly: false,
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("[API DELETE /api/profile error]:", err);
    return NextResponse.json({ error: err.message || "Failed to delete account." }, { status: 500 });
  }
}

