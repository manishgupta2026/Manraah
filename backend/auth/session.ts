import { cookies } from "next/headers";

export function getAuthSessionFromRequest(): { user: { id: string; name: string; email: string; selectedCategory?: string } | null } {
  try {
    const cookieStore = cookies();
    const raw = cookieStore.get("manraah_session")?.value;
    if (!raw) return { user: null };
    const parsed = JSON.parse(raw);
    if (parsed && parsed.user && parsed.user.id) {
      return { user: parsed.user };
    }
  } catch (err) {
    console.error("Error reading session cookie:", err);
  }
  return { user: null };
}
