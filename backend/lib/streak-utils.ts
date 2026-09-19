import { getCalendarDayString } from "@/backend/lib/date-utils";

/**
 * Calculates deterministic daily check-in streak based on an array of check-in records or dates.
 * Uses canonical Asia/Kolkata calendar day representation.
 *
 * Rules:
 * 1. Only one check-in counts per calendar day.
 * 2. If today has been checked in, today counts toward the streak, and we count consecutive past days backwards.
 * 3. If today is NOT checked in yet:
 *    - If yesterday was checked in, the active unbroken streak from yesterday is preserved (pending today's check-in).
 *    - If yesterday was NOT checked in (missed day), current streak is 0.
 * 4. A brand new user with 0 check-ins has currentStreak = 0.
 */
export function calculateCheckinStreak(
  checkinDates: (string | Date)[],
  referenceDate: Date = new Date()
): {
  currentStreak: number;
  longestStreak: number;
  hasCheckedInToday: boolean;
  todayDateStr: string;
} {
  const todayDateStr = getCalendarDayString(referenceDate);

  // Normalize all dates to unique sorted YYYY-MM-DD set
  const dateSet = new Set<string>();
  for (const d of checkinDates) {
    if (!d) continue;
    try {
      const str = getCalendarDayString(d);
      if (str && str.length === 10) {
        dateSet.add(str);
      }
    } catch {
      // ignore malformed date
    }
  }

  const hasCheckedInToday = dateSet.has(todayDateStr);

  let currentStreak = 0;
  const cursor = new Date(referenceDate);

  if (hasCheckedInToday) {
    // Today is completed. Count today + consecutive days backwards.
    currentStreak = 1;
    while (true) {
      cursor.setDate(cursor.getDate() - 1);
      const prevDateStr = getCalendarDayString(cursor);
      if (dateSet.has(prevDateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else {
    // Today not completed yet. Check yesterday.
    cursor.setDate(cursor.getDate() - 1);
    const yesterdayDateStr = getCalendarDayString(cursor);
    if (dateSet.has(yesterdayDateStr)) {
      // Active unbroken streak ending yesterday
      currentStreak = 1;
      while (true) {
        cursor.setDate(cursor.getDate() - 1);
        const prevDateStr = getCalendarDayString(cursor);
        if (dateSet.has(prevDateStr)) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else {
      // Missed yesterday and not checked in today -> streak is 0
      currentStreak = 0;
    }
  }

  // Calculate longest historical streak
  const sortedUniqueDates = Array.from(dateSet).sort();
  let longestStreak = currentStreak;
  let runningStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedUniqueDates) {
    const [year, month, day] = dateStr.split("-").map(Number);
    const curr = new Date(year, month - 1, day);

    if (prevDate === null) {
      runningStreak = 1;
    } else {
      const diffDays = Math.round((curr.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        runningStreak++;
      } else if (diffDays > 1) {
        runningStreak = 1;
      }
    }
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    prevDate = curr;
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    hasCheckedInToday,
    todayDateStr,
  };
}
