import { createAuthClient } from "better-auth/react";
import { AuthSession } from "@/backend/types";

// Standard Better Auth client
export const authClient = createAuthClient();

const SESSION_KEY = "manraah_auth_session";

export async function signUp(name: string, email: string, pass: string): Promise<AuthSession> {
  const { data, error } = await authClient.signUp.email({
    email,
    password: pass,
    name,
  });

  if (error) {
    throw new Error(error.message || "We couldn't create your account. Please try again.");
  }

  if (!data) {
    throw new Error("We couldn't create your account. Please try again.");
  }

  const authData = data as any;
  const session: AuthSession = {
    user: {
      id: authData.user.id,
      name: authData.user.name,
      email: authData.user.email,
      avatar: authData.user.image || "/images/user_avatar.jpg",
      streakDays: 1,
      mindfulnessMinutes: 0,
      currentMood: "Sanctuary Member",
      selectedCategory: "student",
    },
    token: authData.session?.token || "session_token",
    isAuthenticated: true,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  return session;
}

export async function signIn(email: string, pass: string): Promise<AuthSession> {
  const { data, error } = await authClient.signIn.email({
    email,
    password: pass,
  });

  if (error) {
    throw new Error(error.message || "Invalid credentials. Please try again.");
  }

  if (!data) {
    throw new Error("Invalid credentials. Please try again.");
  }

  const authData = data as any;
  const session: AuthSession = {
    user: {
      id: authData.user.id,
      name: authData.user.name,
      email: authData.user.email,
      avatar: authData.user.image || "/images/user_avatar.jpg",
      streakDays: 14,
      mindfulnessMinutes: 180,
      currentMood: "Serene & Focused",
      selectedCategory: "student",
    },
    token: authData.session?.token || "session_token",
    isAuthenticated: true,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  return session;
}

export async function signOut(): Promise<void> {
  await authClient.signOut();
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
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
