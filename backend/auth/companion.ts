import { cookies } from "next/headers";

export interface CompanionSession {
  companion: {
    id: string;
    name: string;
    email: string;
    role: "COMPANION" | "SUPERVISOR" | "ADMIN";
    status: "ONLINE" | "BUSY" | "OFFLINE";
  } | null;
  isAuthenticated: boolean;
}

export function getCompanionSessionFromRequest(): CompanionSession {
  try {
    const cookieStore = cookies();
    const raw = cookieStore.get("manraah_companion_session")?.value;
    if (!raw) return { companion: null, isAuthenticated: false };
    const parsed = JSON.parse(raw);
    if (parsed && parsed.companion && parsed.companion.id) {
      return { companion: parsed.companion, isAuthenticated: true };
    }
  } catch (err) {
    console.error("Error reading companion session cookie:", err);
  }
  return { companion: null, isAuthenticated: false };
}
