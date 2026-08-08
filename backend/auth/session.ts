import { cookies } from "next/headers";

export function getAuthSessionFromRequest(): {
  user: { id: string; name: string; email: string; selectedCategory?: string; sanctuaryName?: string; avatar?: string } | null;
} {
  try {
    const cookieStore = cookies();
    const cookie = cookieStore.get("manraah_session");
    if (!cookie?.value) return { user: null };
    let raw = cookie.value;
    try {
      raw = decodeURIComponent(raw);
    } catch (e) {}
    const parsed = JSON.parse(raw);
    if (parsed && parsed.user && parsed.user.id) {
      return { user: parsed.user };
    }
  } catch (err) {
    console.error("Error reading session cookie:", err);
  }
  return { user: null };
}

