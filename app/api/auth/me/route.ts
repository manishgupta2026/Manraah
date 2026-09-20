import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserById } from "@/backend/queries/users";

export async function GET() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("manraah_session")?.value;

  if (!sessionCookie) {
    return NextResponse.json(
      { user: null, isAuthenticated: false },
      { status: 401 }
    );
  }

  try {
    let session = JSON.parse(decodeURIComponent(sessionCookie));
    if (session?.user?.id) {
      const dbUsers = await getUserById(session.user.id);
      if (dbUsers.length > 0) {
        const u = dbUsers[0];
        const previouslyLoggedIn = Boolean(u.has_logged_in_before);
        const count = Number(u.login_count || 0);
        // If login count > 1 or has_logged_in_before is true, not first login
        const isFirst = !previouslyLoggedIn && count <= 1;

        session.user = {
          ...session.user,
          name: u.sanctuary_name || u.name || session.user.name,
          sanctuaryName: u.sanctuary_name || session.user.sanctuaryName,
          selectedCategory: u.selected_category || session.user.selectedCategory,
          currentMood: u.current_mood || session.user.currentMood,
          streakDays: u.streak_days ?? session.user.streakDays,
          hasLoggedInBefore: previouslyLoggedIn,
          loginCount: count,
          isFirstLogin: isFirst,
        };
        session.isFirstLogin = isFirst;
        session.hasLoggedInBefore = previouslyLoggedIn;
        session.loginCount = count;
      }
    }
    return NextResponse.json(session);
  } catch {
    return NextResponse.json(
      { user: null, isAuthenticated: false },
      { status: 401 }
    );
  }
}
