import { JournalEntry } from "@/backend/types";

/**
 * Journal Database Queries (Stub)
 * 
 * TODO: Implement real database query functions once DB provider is selected.
 */

export async function fetchJournalEntries(userId: string): Promise<JournalEntry[]> {
  // TODO: Replace with real database call
  return [];
}

export async function createJournalEntry(userId: string, entry: Omit<JournalEntry, "id">): Promise<JournalEntry> {
  // TODO: Replace with real database insert call
  return {
    id: Date.now().toString(),
    ...entry,
  };
}
