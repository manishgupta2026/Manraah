export type RatingColorCategory = "green" | "yellow" | "red" | "gray";

/**
 * Doctor Rating Color Logic per specifications:
 * - Rating > 3.8 → GREEN
 * - Rating >= 2.0 AND <= 3.8 → YELLOW
 * - Rating < 2.0 → RED
 * - 0 reviews / unrated → Gray
 */
export function getRatingColorCategory(
  rating: number | string | undefined | null,
  reviewCount?: number | string | null
): RatingColorCategory {
  if (
    rating === undefined ||
    rating === null ||
    rating === ""
  ) {
    return "gray";
  }

  const countNum =
    reviewCount !== undefined && reviewCount !== null
      ? typeof reviewCount === "string"
        ? parseInt(reviewCount, 10)
        : reviewCount
      : undefined;

  if (countNum !== undefined && countNum === 0) {
    return "gray";
  }

  const num = typeof rating === "string" ? parseFloat(rating) : rating;
  if (isNaN(num) || num === 0) return "gray";

  if (num > 3.8) {
    return "green";
  }
  if (num >= 2.0) {
    return "yellow";
  }
  return "red";
}

export function getRatingColorClasses(
  rating: number | string | undefined | null,
  reviewCount?: number | string | null
) {
  const cat = getRatingColorCategory(rating, reviewCount);
  switch (cat) {
    case "green":
      return {
        category: "green",
        text: "text-emerald-600 dark:text-emerald-400",
        pillText: "text-emerald-700 dark:text-emerald-300 font-bold",
        star: "text-emerald-500 dark:text-emerald-400",
        bgPill: "bg-emerald-50 hover:bg-emerald-100/90 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 border-emerald-200/80 dark:border-emerald-800/60",
        badge: "bg-emerald-600 text-white",
        bar: "bg-emerald-500 dark:bg-emerald-400",
        ring: "focus-visible:ring-emerald-500",
      };
    case "yellow":
      return {
        category: "yellow",
        text: "text-amber-600 dark:text-amber-400",
        pillText: "text-amber-700 dark:text-amber-300 font-bold",
        star: "text-amber-500 dark:text-amber-400",
        bgPill: "bg-amber-50 hover:bg-amber-100/90 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 border-amber-200/80 dark:border-amber-800/60",
        badge: "bg-amber-500 text-white",
        bar: "bg-amber-500 dark:bg-amber-400",
        ring: "focus-visible:ring-amber-500",
      };
    case "red":
      return {
        category: "red",
        text: "text-rose-600 dark:text-rose-400",
        pillText: "text-rose-700 dark:text-rose-300 font-bold",
        star: "text-rose-500 dark:text-rose-400",
        bgPill: "bg-rose-50 hover:bg-rose-100/90 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 border-rose-200/80 dark:border-rose-800/60",
        badge: "bg-rose-600 text-white",
        bar: "bg-rose-500 dark:bg-rose-400",
        ring: "focus-visible:ring-rose-500",
      };
    case "gray":
    default:
      return {
        category: "gray",
        text: "text-slate-600 dark:text-slate-400",
        pillText: "text-slate-600 dark:text-slate-400 font-medium",
        star: "text-slate-400 dark:text-slate-500",
        bgPill: "bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/60",
        badge: "bg-slate-500 text-white",
        bar: "bg-slate-400 dark:bg-slate-500",
        ring: "focus-visible:ring-slate-400",
      };
  }
}

/**
 * Formats doctor rating display string
 * e.g. "4.88" or "No ratings yet"
 */
export function formatDoctorRating(
  rating: number | string | undefined | null,
  reviewCount?: number | string | null
): { isUnrated: boolean; displayText: string; subText: string } {
  if (
    rating === undefined ||
    rating === null ||
    rating === ""
  ) {
    return {
      isUnrated: true,
      displayText: "No ratings yet",
      subText: "Be the first to share your experience",
    };
  }

  const countNum =
    reviewCount !== undefined && reviewCount !== null
      ? typeof reviewCount === "string"
        ? parseInt(reviewCount, 10)
        : reviewCount
      : 0;

  const num = typeof rating === "string" ? parseFloat(rating) : rating;
  if (isNaN(num) || num === 0 || countNum === 0) {
    return {
      isUnrated: true,
      displayText: "No ratings yet",
      subText: "Be the first to share your experience",
    };
  }

  return {
    isUnrated: false,
    displayText: num.toFixed(2),
    subText: `(${countNum})`,
  };
}
