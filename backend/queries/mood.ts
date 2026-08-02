import { MoodEntry } from "@/backend/types";

/**
 * Mood & Daily Check-in Database Queries (Stub)
 * 
 * TODO: Implement real database query functions once the DB provider is selected.
 */

export async function fetchMoodHistory(userId: string): Promise<MoodEntry[]> {
  // TODO: Replace with real database call (e.g., db.from('mood_entries').select('*').eq('user_id', userId))
  return [];
}

export async function logDailyMood(userId: string, entry: Omit<MoodEntry, "id">): Promise<MoodEntry> {
  // TODO: Replace with real database insert call
  return {
    id: Date.now().toString(),
    ...entry,
  };
}
