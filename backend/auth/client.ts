import { AuthSession } from "@/backend/types";

const SESSION_KEY = "manraah_auth_session";

export async function signUp(
  name: string,
  email: string,
  pass: string,
  category?: string,
  initialAnswers?: any,
  answers?: any,
  computedScore?: number,
  percentage?: number,
  wellnessLevel?: string,
  phone?: string,
  dob?: string,
  country?: string,
  gender?: string
): Promise<AuthSession> {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      sanctuaryName: name,
      email,
      password: pass,
      category,
      initialAnswers,
      answers,
      computedScore,
      percentage,
      wellnessLevel,
      phone,
      dob,
      country,
      gender,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "We couldn't create your account. Please try again.");
  }

  const session: AuthSession = data;
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    document.cookie = `manraah_session=${JSON.stringify(session)}; path=/; max-age=2592000`;
    if (session.user?.selectedCategory) {
      document.cookie = `userType=${session.user.selectedCategory}; path=/; max-age=2592000`;
    }
    window.dispatchEvent(new CustomEvent("manraah_auth_changed", { detail: { session } }));
    window.dispatchEvent(new Event("storage"));
  }

  return session;
}

export async function signIn(
  email: string,
  pass: string,
  category?: string,
  answers?: any,
  computedScore?: number,
  percentage?: number,
  wellnessLevel?: string
): Promise<AuthSession> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password: pass,
      category,
      answers,
      computedScore,
      percentage,
      wellnessLevel,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Invalid email or password. Please try again.");
  }

  const session: AuthSession = data;
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    document.cookie = `manraah_session=${JSON.stringify(session)}; path=/; max-age=2592000`;
    if (session.user?.selectedCategory) {
      document.cookie = `userType=${session.user.selectedCategory}; path=/; max-age=2592000`;
    }
    window.dispatchEvent(new CustomEvent("manraah_auth_changed", { detail: { session } }));
    window.dispatchEvent(new Event("storage"));
  }

  return session;
}

export async function signOut(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (err) {
    console.error("Logout API call error:", err);
  }

  if (typeof window !== "undefined") {
    // 1. Clear session key and dashboard cache
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("manraah_dashboard_cache");

    // 2. Clear all category assessment completion & security flags from localStorage
    const localKeysToRemove = [
      "parent_assessment_completed",
      "parent_show_security_immediately",
      "parent_security_popup_shown_once",
      "parent_last_security_popup",
      "parent_assessment_modal_dismissed",
      "parent_reset_assessment_flow",
      "couple_assessment_completed",
      "couple_show_security_immediately",
      "working_professional_assessment_completed",
      "working_professional_show_security_immediately",
      "student_assessment_completed",
      "student_show_security_immediately",
      "other_assessment_completed",
      "other_show_security_immediately",
    ];
    localKeysToRemove.forEach((key) => localStorage.removeItem(key));

    // 3. Clear all sessionStorage keys
    try {
      sessionStorage.clear();
    } catch {
      const sessionKeysToRemove = [
        "manraah_student_privacy_acknowledged",
        "manraah_student_assessment_dismissed",
        "manraah_student_assessment_completed",
        "manraah_onboarding_assessment",
      ];
      sessionKeysToRemove.forEach((key) => sessionStorage.removeItem(key));
    }

    // 4. Expire cookies
    document.cookie = "manraah_session=; path=/; max-age=0";
    document.cookie = "userType=; path=/; max-age=0";
    document.cookie = "manraah_userType=; path=/; max-age=0";

    // 5. Notify all components & providers immediately
    window.dispatchEvent(new CustomEvent("manraah_auth_changed", { detail: { session: null } }));
    window.dispatchEvent(new Event("storage"));
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(";").shift() || "");
  return null;
}

export function updateClientSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    document.cookie = `manraah_session=${JSON.stringify(session)}; path=/; max-age=2592000`;
    if (session.user?.selectedCategory) {
      document.cookie = `userType=${session.user.selectedCategory}; path=/; max-age=2592000`;
    }
    window.dispatchEvent(new CustomEvent("manraah_auth_changed", { detail: { session } }));
  } catch (err) {
    console.error("Failed to update client session:", err);
  }
}

export function getClientSession(): AuthSession {
  if (typeof window === "undefined") {
    return { user: null, token: null, isAuthenticated: false };
  }

  try {
    let raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      const cookieVal = getCookie("manraah_session");
      if (cookieVal) {
        localStorage.setItem(SESSION_KEY, cookieVal);
        raw = cookieVal;
      }
    }
    if (!raw) return { user: null, token: null, isAuthenticated: false };
    return JSON.parse(raw) as AuthSession;
  } catch {
    return { user: null, token: null, isAuthenticated: false };
  }
}
