import { AuthSession } from "@/backend/types";

const SESSION_KEY = "manraah_auth_session";

// Module-level latches to prevent race conditions during logout / session sync
let _isLoggingOut = false;
let _lastLogoutTimestamp = 0;

export function isLoggingOutState(): boolean {
  return _isLoggingOut || (typeof Date !== "undefined" && Date.now() - _lastLogoutTimestamp < 3000);
}

export function setLogoutStateLatch(): void {
  _isLoggingOut = true;
  _lastLogoutTimestamp = Date.now();
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem("manraah_logout_ts", _lastLogoutTimestamp.toString());
    } catch {}
  }
}

export function clearLogoutStateLatch(): void {
  _isLoggingOut = false;
}

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
    _lastLogoutTimestamp = 0;
    _isLoggingOut = false;
    try {
      sessionStorage.removeItem("manraah_logout_ts");
    } catch {}
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    document.cookie = `manraah_session=${JSON.stringify(session)}; path=/; max-age=2592000; SameSite=Lax`;
    if (session.user?.selectedCategory) {
      document.cookie = `userType=${session.user.selectedCategory}; path=/; max-age=2592000; SameSite=Lax`;
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
    _lastLogoutTimestamp = 0;
    _isLoggingOut = false;
    try {
      sessionStorage.removeItem("manraah_logout_ts");
    } catch {}
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    document.cookie = `manraah_session=${JSON.stringify(session)}; path=/; max-age=2592000; SameSite=Lax`;
    if (session.user?.selectedCategory) {
      document.cookie = `userType=${session.user.selectedCategory}; path=/; max-age=2592000; SameSite=Lax`;
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

  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const domainVariations = [
    "",
    host,
    host ? `.${host}` : "",
    ...(host && host.includes(".") ? [`.${host.split(".").slice(-2).join(".")}`] : []),
  ].filter(Boolean);

  const paths = ["/", ""];

  cookieNames.forEach((name) => {
    paths.forEach((path) => {
      const pathAttr = path ? `; path=${path}` : "";
      
      // Standard local expiry
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
          document.cookie = `${name}=; domain=${dom}; domain=${dom}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0${pathAttr}; SameSite=None; Secure`;
        }
      });
    });
  });
}

/**
 * Idempotent, race-condition-safe logout operation
 */
export async function signOut(): Promise<void> {
  // Set in-memory latch immediately so no in-flight requests can restore state
  setLogoutStateLatch();

  if (typeof window !== "undefined") {
    // 1. Synchronously clear client auth keys from localStorage
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem("manraah_auth_session");
      localStorage.removeItem("manraah_dashboard_cache");
    } catch {}

    // 2. Synchronously clear assessment & security flags
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
    localKeysToRemove.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {}
    });

    // 3. Clear auth sessionStorage keys
    try {
      sessionStorage.clear();
    } catch {
      const sessionKeysToRemove = [
        "manraah_student_privacy_acknowledged",
        "manraah_student_assessment_dismissed",
        "manraah_student_assessment_completed",
        "manraah_onboarding_assessment",
      ];
      sessionKeysToRemove.forEach((key) => {
        try {
          sessionStorage.removeItem(key);
        } catch {}
      });
    }

    // 4. Synchronously expire all cookies on client
    clearAllAuthCookies();

    // 5. Notify all components & contexts in current window immediately
    window.dispatchEvent(new CustomEvent("manraah_auth_changed", { detail: { session: null } }));

    // 6. Broadcast cross-tab logout synchronization via localStorage storage event
    try {
      localStorage.setItem("manraah_logout_broadcast", Date.now().toString());
      setTimeout(() => {
        try {
          localStorage.removeItem("manraah_logout_broadcast");
        } catch {}
      }, 1000);
    } catch {}

    window.dispatchEvent(new Event("storage"));
  }

  // 7. Invalidate server-side session cookie via logout endpoint
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
      keepalive: true,
    });
  } catch (err) {
    console.error("[signOut] Logout API call error:", err);
  } finally {
    // Re-verify cookie expiration
    if (typeof window !== "undefined") {
      clearAllAuthCookies();
    }
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
  if (isLoggingOutState()) return;

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
  const unauthenticated: AuthSession = { user: null, token: null, isAuthenticated: false };
  if (typeof window === "undefined") {
    return unauthenticated;
  }

  if (isLoggingOutState()) {
    return unauthenticated;
  }

  try {
    let raw = localStorage.getItem(SESSION_KEY);
    const cookieVal = getCookie("manraah_session");

    // Case 1: Both localStorage and cookie are absent -> Clean unauthenticated state
    if ((!raw || raw === "null" || raw === "undefined" || raw.trim() === "") &&
        (!cookieVal || cookieVal === "null" || cookieVal === "undefined" || cookieVal.trim() === "")) {
      return unauthenticated;
    }

    // Case 2: localStorage has data, but cookie is absent -> Server or logout cleared cookie
    // Stale localStorage MUST NOT restore authentication!
    if (raw && (!cookieVal || cookieVal === "null" || cookieVal === "undefined" || cookieVal.trim() === "")) {
      localStorage.removeItem(SESSION_KEY);
      clearAllAuthCookies();
      return unauthenticated;
    }

    // Case 3: Cookie has data, but localStorage is missing -> Hydrate from validated cookie
    if ((!raw || raw === "null" || raw === "undefined" || raw.trim() === "") && cookieVal) {
      try {
        let cookieRaw = cookieVal;
        try {
          cookieRaw = decodeURIComponent(cookieRaw);
        } catch {}
        const parsedCookie = JSON.parse(cookieRaw);
        if (
          parsedCookie &&
          parsedCookie.isAuthenticated === true &&
          parsedCookie.user &&
          parsedCookie.user.id &&
          typeof parsedCookie.user.id === "string" &&
          parsedCookie.user.id.trim().length > 0
        ) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(parsedCookie));
          return parsedCookie;
        } else {
          clearAllAuthCookies();
          return unauthenticated;
        }
      } catch {
        clearAllAuthCookies();
        return unauthenticated;
      }
    }

    // Case 4: Both localStorage and cookie are present -> Validate format
    if (raw) {
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
        return unauthenticated;
      }
      return parsed;
    }

    return unauthenticated;
  } catch {
    return unauthenticated;
  }
}
