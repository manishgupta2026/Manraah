import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { getUserWithPasswordById, updateUserPassword } from "@/backend/queries/users";
import { verifyPassword, hashPassword } from "@/backend/auth/crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // 1. Authenticate currently logged-in user from session
    const session = getAuthSessionFromRequest();
    const userId = session.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Your session has expired. Please log in again." },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json().catch(() => ({}));
    const { currentPassword, newPassword, confirmPassword } = body;

    // 3. Input validation
    if (!currentPassword || typeof currentPassword !== "string" || !currentPassword.trim()) {
      return NextResponse.json(
        { error: "Current password is required." },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || !newPassword.trim()) {
      return NextResponse.json(
        { error: "New password is required." },
        { status: 400 }
      );
    }

    if (!confirmPassword || typeof confirmPassword !== "string" || !confirmPassword.trim()) {
      return NextResponse.json(
        { error: "Confirm password is required." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New passwords do not match." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // 4. Fetch user's existing password hash from database
    const users = await getUserWithPasswordById(userId);
    if (users.length === 0) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const user = users[0];

    // 5. Verify current password against stored hash
    const isCurrentPasswordValid = verifyPassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    // 6. Hash new password
    const newPasswordHash = hashPassword(newPassword);

    // 7. Update password in database
    await updateUserPassword(userId, newPasswordHash);

    // 8. Return success
    return NextResponse.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (err: any) {
    console.error("[Change Password API Error]:", err);
    return NextResponse.json(
      { error: "Failed to change password. Please try again." },
      { status: 500 }
    );
  }
}
