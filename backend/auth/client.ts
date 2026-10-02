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

export function clearAllAuthCookies(): void {
  if (typeof document === "undefined") return;

  const cookieNames = [
    "manraah_session",
    "userType",
    "manraah_userType",
    "manraah_auth_session",
    "session",
    "manraah_companion_session",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
  ];

  const host = window.location.hostname;
  const domainVariations = [
    "",
    host,
    `.${host}`,
    ...(host.includes(".") ? [`.${host.split(".").slice(-2).join(".")}`] : []),
  ];

  const paths = ["/", ""];

  cookieNames.forEach((name) => {
    paths.forEach((path) => {
      const pathAttr = path ? `; path=${path}` : "";
      
      // Standard expiry
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0${pathAttr}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0${pathAttr}; SameSite=Lax`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0${pathAttr}; SameSite=Lax; Secure`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0${pathAttr}; SameSite=None; Secure`;

      // Domain-specific expiries
      domainVariations.forEach((dom) => {
        if (dom) {
          document.cookie = `${name}=; domain=${dom}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0${pathAttr}`;
          document.cookie = `${name}=; domain=${dom}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0${pathAttr}; SameSite=Lax`;
          document.cookie = `${name}=; domain=${dom}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0${pathAttr}; SameSite=Lax; Secure`;
          document.cookie = `${name}=; domain=${dom}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0${pathAttr}; SameSite=None; Secure`;
        }
      });
    });
  });
}

export async function signOut(): Promise<void> {
  // 1. Invalidate server session immediately
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
  } catch (err) {
    console.error("Logout API call error:", err);
  }

  if (typeof window !== "undefined") {
    // 2. Clear all authentication localStorage keys
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("manraah_auth_session");
    localStorage.removeItem("manraah_dashboard_cache");

    // 3. Clear all category assessment completion & security flags from localStorage
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

    // 4. Clear all sessionStorage keys
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

    // 5. Expire all cookies thoroughly
    clearAllAuthCookies();

    // 6. Notify all components & providers in current window
    window.dispatchEvent(new CustomEvent("manraah_auth_changed", { detail: { session: null } }));

    // 7. Broadcast cross-tab logout synchronization via localStorage storage event
    try {
      localStorage.setItem("manraah_logout_broadcast", Date.now().toString());
      setTimeout(() => {
        try {
          localStorage.removeItem("manraah_logout_broadcast");
        } catch {}
      }, 500);
    } catch {}

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
    if (!session || !session.isAuthenticated || !session.user?.id) {
      signOut();
      return;
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    document.cookie = `manraah_session=${JSON.stringify(session)}; path=/; max-age=2592000; SameSite=Lax`;
    if (session.user?.selectedCategory) {
      document.cookie = `userType=${session.user.selectedCategory}; path=/; max-age=2592000; SameSite=Lax`;
    }
    window.dispatchEvent(new CustomEvent("manraah_auth_changed", { detail: { session } }));
  } catch (err) {
    console.error("Failed to update client session:", err);
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      currentPassword,
      newPassword,
      confirmPassword,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to change password. Please try again.");
  }

  return data;
}

export function getClientSession(): AuthSession {
  if (typeof window === "undefined") {
    return { user: null, token: null, isAuthenticated: false };
  }

  try {
    let raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      const cookieVal = getCookie("manraah_session");
      if (cookieVal && cookieVal !== "null" && cookieVal !== "undefined" && cookieVal.trim() !== "") {
        try {
          const parsed = JSON.parse(cookieVal);
          if (
            parsed &&
            parsed.isAuthenticated === true &&
            parsed.user &&
            parsed.user.id &&
            typeof parsed.user.id === "string" &&
            parsed.user.id.trim().length > 0
          ) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
            raw = JSON.stringify(parsed);
          } else {
            clearAllAuthCookies();
          }
        } catch {
          clearAllAuthCookies();
        }
      }
    }

    if (!raw || raw === "null" || raw === "undefined" || raw.trim() === "") {
      return { user: null, token: null, isAuthenticated: false };
    }

    const parsed = JSON.parse(raw) as AuthSession;
    if (
      !parsed ||
      parsed.isAuthenticated !== true ||
      !parsed.user ||
      !parsed.user.id ||
      typeof parsed.user.id !== "string" ||
      parsed.user.id.trim().length === 0
    ) {
      localStorage.removeItem(SESSION_KEY);
      clearAllAuthCookies();
      return { user: null, token: null, isAuthenticated: false };
    }

    return parsed;
  } catch {
    return { user: null, token: null, isAuthenticated: false };
  }
}
