import { sql } from "@/backend/db/client";

const ADJECTIVES = [
  "Gentle", "Silent", "Calm", "Moonlit", "Quiet",
  "Golden", "Morning", "Forest", "Ocean", "Hopeful",
  "Serene", "Peaceful", "Radiant", "Whispering", "Soft",
  "Restful", "Tranquil", "Mindful", "Loving", "Pure"
];

const NOUNS = [
  "Bloom", "Willow", "Wanderer", "Soul", "River",
  "Sparrow", "Mist", "Dreamer", "Whisper", "Horizon",
  "Pebble", "Breeze", "Meadow", "Glow", "Echo",
  "Path", "Harbor", "Sanctuary", "Forest", "Dawn"
];

export async function generateUniqueSanctuaryName(): Promise<string> {
  let attempts = 0;
  while (attempts < 15) {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    let candidate = `${adj} ${noun}`;
    
    // Add a random 3-digit suffix if we are struggling to find a unique name
    if (attempts > 5) {
      candidate += ` ${Math.floor(100 + Math.random() * 900)}`;
    }

    // Check uniqueness in database
    const existing = await sql`
      SELECT id FROM users WHERE LOWER(sanctuary_name) = LOWER(${candidate}) LIMIT 1
    `;
    if (existing.length === 0) {
      return candidate;
    }
    attempts++;
  }
  return `Serene Soul ${Math.floor(1000 + Math.random() * 9000)}`;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "ME";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
