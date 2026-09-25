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
function parseEmergencyContact(raw: any) {
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      const p = JSON.parse(raw);
      if (p && typeof p === "object" && (p.name || p.phone)) return p;
      return null;
    } catch {
      return null;
    }
  }
  if (typeof raw === "object" && (raw.name || raw.phone)) return raw;
  return null;
}

    let session = JSON.parse(decodeURIComponent(sessionCookie));
    if (session?.user?.id) {
      const dbUsers = await getUserById(session.user.id);
      if (dbUsers.length > 0) {
        const u = dbUsers[0];
        const previouslyLoggedIn = Boolean(u.has_logged_in_before);
        const count = Number(u.login_count || 0);
        // If login count > 1 or has_logged_in_before is true, not first login
        const isFirst = !previouslyLoggedIn && count <= 1;
        const savedContact = parseEmergencyContact(u.emergencyContact || (u as any).emergency_contact) || session.user.emergencyContact || null;

        session.user = {
          ...session.user,
          name: u.name || u.sanctuary_name || session.user.name || "",
          sanctuaryName: u.sanctuary_name || u.name || session.user.sanctuaryName || "",
          selectedCategory: u.selected_category || session.user.selectedCategory || "student",
          currentMood: u.current_mood || session.user.currentMood || "Calm",
          streakDays: u.streak_days ?? session.user.streakDays,
          hasLoggedInBefore: previouslyLoggedIn,
          loginCount: count,
          isFirstLogin: isFirst,
          emergencyContact: savedContact,
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
