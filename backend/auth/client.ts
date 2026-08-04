import { AuthSession } from "@/backend/types";
import { signUpAction, signInAction, signOutAction } from "./actions";

/**
 * Neon Auth Helper Client
 * 
 * Manages authentication sessions directly stored in Neon Database (Better Auth integration).
 */

const SESSION_KEY = "manraah_auth_session";

export async function signUp(name: string, email: string, pass: string): Promise<AuthSession> {
  const res = await signUpAction(name, email, pass);
  if (!res.success || !res.session) {
    throw new Error(res.error || "Failed to create account.");
  }
  
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(res.session));
  }
  return res.session;
}

export async function signIn(email: string, pass: string): Promise<AuthSession> {
  const res = await signInAction(email, pass);
  if (!res.success || !res.session) {
    throw new Error(res.error || "Failed to sign in.");
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(res.session));
  }
  return res.session;
}

export async function signOut(): Promise<void> {
  await signOutAction();
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

