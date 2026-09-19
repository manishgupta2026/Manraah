/**
 * Date formatting helpers for frontend components and screens.
 */

export function formatDisplayDate(dateVal: string | null | undefined, fallback = "No date"): string {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "Date unavailable";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "Date unavailable";
  }
}

export function displayExamDate(dateVal: string | null | undefined): string {
  return formatDisplayDate(dateVal, "Date not scheduled");
}

export function displayTaskDate(dateVal: string | null | undefined): string {
  return formatDisplayDate(dateVal, "No due date");
}
