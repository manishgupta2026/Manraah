/**
 * Canonical date formatting utility for backend queries and endpoints.
 * Standardizes on Asia/Kolkata timezone with ISO-style YYYY-MM-DD format (en-CA).
 */

export function getCalendarDayString(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(d);
}
