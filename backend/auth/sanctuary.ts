import { sql } from "@/backend/db/client";

const ADJECTIVES = ["Gentle", "Silent", "Calm", "Hopeful", "Golden", "Serene", "Peaceful", "Radiant", "Whispering", "Soft"];
const NOUNS = ["Bloom", "River", "Cedar", "Horizon", "Meadow", "Willow", "Wanderer", "Soul", "Sparrow", "Mist"];

export async function generateUniqueSanctuaryName(): Promise<string> {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const baseName = `${adj} ${noun}`;

  // Check if baseName is unique
  const existing = await sql`
    SELECT id FROM users WHERE LOWER(sanctuary_name) = LOWER(${baseName}) LIMIT 1
  `;
  if (existing.length === 0) {
    return baseName;
  }

  // Collision: append a small random number (1 to 99)
  let attempts = 0;
  while (attempts < 30) {
    const randomNum = Math.floor(Math.random() * 99) + 1;
    const candidate = `${baseName} ${randomNum}`;
    
    const duplicate = await sql`
      SELECT id FROM users WHERE LOWER(sanctuary_name) = LOWER(${candidate}) LIMIT 1
    `;
    if (duplicate.length === 0) {
      return candidate;
    }
    attempts++;
  }

  // Ultimate fallback
  return `${baseName} ${Math.floor(Math.random() * 900) + 100}`;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "ME";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  // Filter out numeric parts when taking initials
  const letterParts = parts.filter(p => isNaN(Number(p)));
  if (letterParts.length === 0) return parts[0].substring(0, 2).toUpperCase();
  if (letterParts.length === 1) return letterParts[0].substring(0, 2).toUpperCase();
  return (letterParts[0][0] + letterParts[letterParts.length - 1][0]).toUpperCase();
}
