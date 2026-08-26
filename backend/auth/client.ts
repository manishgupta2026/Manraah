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
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("manraah_dashboard_cache");
    localStorage.removeItem("parent_assessment_completed");
    localStorage.removeItem("parent_show_security_immediately");
    localStorage.removeItem("parent_security_popup_shown_once");
    localStorage.removeItem("parent_last_security_popup");
    localStorage.removeItem("parent_assessment_modal_dismissed");
    sessionStorage.removeItem("manraah_student_privacy_acknowledged");
    sessionStorage.removeItem("manraah_student_assessment_dismissed");
    sessionStorage.removeItem("manraah_student_assessment_completed");
    document.cookie = "manraah_session=; path=/; max-age=0";
    document.cookie = "userType=; path=/; max-age=0";
    document.cookie = "manraah_userType=; path=/; max-age=0";
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(";").shift() || "");
  return null;
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
