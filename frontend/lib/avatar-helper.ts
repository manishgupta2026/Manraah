/**
 * Shared Avatar Initials & Color Helper for Manraah
 *
 * Rules:
 * - Take the FIRST letter of the user's first name.
 * - Take the FIRST letter of the user's last name.
 * - Display both letters in CAPITAL LETTERS.
 * - Examples:
 *   - "Mohan Yadav" → "MY"
 *   - "Priya Sharma" → "PS"
 *   - "Working1" → "W" (if there is no last name)
 *   - "Amit Kumar Singh" → "AK"
 * - If the user has only one name, display only its first letter.
 * - Trim extra spaces before processing the name.
 * - Handle missing/null/empty names safely.
 *
 * Color Rules:
 * - Deterministic hash from name (same name always gets the same color).
 * - Avoid green shades (so it doesn't clash with Manraah green theme), pure black, and pure white.
 * - Varied pleasant palette: lavender, muted blue, sky blue, soft pink, coral, peach, orange, amber, rose, terracotta, violet.
 */

export interface AvatarPalette {
  bg: string;
  text: string;
}

export const AVATAR_PALETTES: AvatarPalette[] = [
  { bg: "#7C6BC4", text: "#FFFFFF" }, // Soft Lavender / Purple
  { bg: "#3B82F6", text: "#FFFFFF" }, // Muted Royal Blue
  { bg: "#E56A54", text: "#FFFFFF" }, // Coral / Terracotta
  { bg: "#EC4899", text: "#FFFFFF" }, // Soft Pink
  { bg: "#F59E0B", text: "#FFFFFF" }, // Amber / Gold Warm
  { bg: "#8B5CF6", text: "#FFFFFF" }, // Soft Violet
  { bg: "#0EA5E9", text: "#FFFFFF" }, // Sky Blue
  { bg: "#F43F5E", text: "#FFFFFF" }, // Rose
  { bg: "#EA580C", text: "#FFFFFF" }, // Warm Orange
  { bg: "#6366F1", text: "#FFFFFF" }, // Indigo
  { bg: "#D97706", text: "#FFFFFF" }, // Terracotta Ochre
  { bg: "#A855F7", text: "#FFFFFF" }, // Purple Orchis
  { bg: "#0284C7", text: "#FFFFFF" }, // Deep Sky Blue
  { bg: "#E11D48", text: "#FFFFFF" }, // Crimson Rose
  { bg: "#CA8A04", text: "#FFFFFF" }, // Warm Amber Gold
  { bg: "#4F46E5", text: "#FFFFFF" }, // Vibrant Indigo
];

export function getInitials(
  name?: string | null,
  firstName?: string | null,
  lastName?: string | null
): string {
  // If firstName and lastName are explicitly provided
  if (firstName && firstName.trim()) {
    const f = firstName.trim();
    const l = lastName ? lastName.trim() : "";
    if (l) {
      return (f.charAt(0) + l.charAt(0)).toUpperCase();
    }
    // If only firstName is provided, process as a full name string
    return getInitials(f);
  }

  if (!name || typeof name !== "string") return "M";
  const trimmed = name.trim();
  if (!trimmed) return "M";

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "M";
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  // First letter of first name + First letter of second word / last name
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

export function getAvatarPalette(name?: string | null): AvatarPalette {
  if (!name || typeof name !== "string" || !name.trim()) {
    return AVATAR_PALETTES[0];
  }

  const clean = name.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0; // 32-bit integer conversion
  }

  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

export function getPastelBgColor(name: string): string {
  return getAvatarPalette(name).bg;
}

export function getPastelTextColor(name: string): string {
  return getAvatarPalette(name).text;
}


