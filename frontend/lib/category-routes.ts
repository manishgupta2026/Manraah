/**
 * Scalable Category-to-Dashboard Routing Engine
 * Maps user categories cleanly to dedicated dashboards without hardcoding conditions everywhere.
 */

export function getCategoryDashboardRoute(categoryRaw?: string | null): string {
  if (!categoryRaw) return "/dashboard/student";

  const normalized = categoryRaw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  switch (normalized) {
    case "working_professional":
    case "workingprofessional":
    case "young_pro":
    case "youngprofessional":
      return "/dashboard/working-professional";

    case "student":
      return "/dashboard/student";

    case "parent":
    case "parents":
      return "/dashboard/parents";

    case "couple":
    case "couples":
      return "/dashboard/couples";

    case "senior_citizen":
    case "seniorcitizen":
      return "/dashboard/senior_citizen";

    default:
      // If starts with working, route to working-professional
      if (normalized.includes("working") || normalized.includes("prof")) {
        return "/dashboard/working-professional";
      }
      return `/dashboard/${categoryRaw.toLowerCase().replace(/_/g, "-")}`;
  }
}
