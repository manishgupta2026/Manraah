/**
 * Canonical helper for normalizing user categories to match database schema conventions
 * (e.g. `parent`, `couple`, `working_professional`, `young_pro`, `student`, `other`).
 */
export function normalizeCategoryForDb(cat?: string | null): string {
  if (!cat) return "student";
  const c = cat.toLowerCase().trim().replace(/-/g, "_");
  if (c === "parents") return "parent";
  if (c === "couples") return "couple";
  if (c === "others") return "other";
  if (c === "youngprofessional" || c === "young_professional") return "young_pro";
  if (c === "workingprofessional") return "working_professional";
  if (c === "seniorcitizen") return "senior_citizen";
  return c;
}
