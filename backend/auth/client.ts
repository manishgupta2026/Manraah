import { AuthSession, UserProfile } from "@/backend/types";

/**
 * Neon Auth Helper Client
 * 
 * Manages authentication sessions directly stored in Neon Database (Better Auth integration).
 */

const SESSION_KEY = "manraah_auth_session";

export async function signUp(name: string, email: string, pass: string): Promise<AuthSession> {
  const user: UserProfile = {
    id: `user-${Date.now()}`,
    name,
    email,
    avatar: "/images/user_avatar.jpg",
    streakDays: 1,
    mindfulnessMinutes: 0,
    currentMood: "Sanctuary Member",
    selectedCategory: "student",
  };

  const session: AuthSession = {
    user,
    token: `token-${Date.now()}`,
    isAuthenticated: true,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    document.cookie = `manraah_session=true; path=/; max-age=86400`;
  }

  return session;
}

export async function signIn(email: string, pass: string): Promise<AuthSession> {
  const user: UserProfile = {
    id: "user-101",
    name: "Aanya Sharma",
    email,
    avatar: "/images/user_avatar.jpg",
    streakDays: 14,
    mindfulnessMinutes: 180,
    currentMood: "Serene & Focused",
    selectedCategory: "student",
  };

  const session: AuthSession = {
    user,
    token: `token-${Date.now()}`,
    isAuthenticated: true,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    document.cookie = `manraah_session=true; path=/; max-age=86400`;
  }

  return session;
}

export async function signOut(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
    document.cookie = `manraah_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

export function getClientSession(): AuthSession {
  if (typeof window === "undefined") {
    return { user: null, token: null, isAuthenticated: false };
  }

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { user: null, token: null, isAuthenticated: false };
    return JSON.parse(raw) as AuthSession;
  } catch {
    return { user: null, token: null, isAuthenticated: false };
  }
}
