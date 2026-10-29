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
        text: "text-emerald-600 dark:text-[#91AD87]",
        pillText: "text-emerald-700 dark:text-[#91AD87] font-bold",
        star: "text-emerald-500 dark:text-[#91AD87]",
        bgPill: "bg-emerald-50 hover:bg-emerald-100/90 dark:bg-[#3B2C20] dark:hover:bg-[#443326] border-emerald-200/80 dark:border-[#51402E]",
        badge: "bg-emerald-600 text-white dark:bg-[#858A60] dark:text-[#211A14]",
        bar: "bg-emerald-500 dark:bg-[#91AD87]",
        ring: "focus-visible:ring-emerald-500 dark:focus-visible:ring-[#858A60]",
      };
    case "yellow":
      return {
        category: "yellow",
        text: "text-amber-600 dark:text-[#D7AD70]",
        pillText: "text-amber-700 dark:text-[#D7AD70] font-bold",
        star: "text-amber-500 dark:text-[#D7AD70]",
        bgPill: "bg-amber-50 hover:bg-amber-100/90 dark:bg-[#3B2C20] dark:hover:bg-[#443326] border-amber-200/80 dark:border-[#51402E]",
        badge: "bg-amber-500 text-white dark:bg-[#D7AD70] dark:text-[#211A14]",
        bar: "bg-amber-500 dark:bg-[#D7AD70]",
        ring: "focus-visible:ring-amber-500 dark:focus-visible:ring-[#D7AD70]",
      };
    case "red":
      return {
        category: "red",
        text: "text-rose-600 dark:text-[#C95D54]",
        pillText: "text-rose-700 dark:text-[#C95D54] font-bold",
        star: "text-rose-500 dark:text-[#C95D54]",
        bgPill: "bg-rose-50 hover:bg-rose-100/90 dark:bg-[#3B2C20] dark:hover:bg-[#443326] border-rose-200/80 dark:border-[#51402E]",
        badge: "bg-rose-600 text-white dark:bg-[#C95D54] dark:text-[#F3E9D8]",
        bar: "bg-rose-500 dark:bg-[#C95D54]",
        ring: "focus-visible:ring-rose-500 dark:focus-visible:ring-[#C95D54]",
      };
    case "gray":
    default:
      return {
        category: "gray",
        text: "text-slate-600 dark:text-[#9F907E]",
        pillText: "text-slate-600 dark:text-[#9F907E] font-medium",
        star: "text-slate-400 dark:text-[#9F907E]",
        bgPill: "bg-slate-100 hover:bg-slate-200/80 dark:bg-[#30241A] dark:hover:bg-[#3B2C20] border-slate-200 dark:border-[#51402E]",
        badge: "bg-slate-500 text-white dark:bg-[#51402E] dark:text-[#F3E9D8]",
        bar: "bg-slate-400 dark:bg-[#51402E]",
        ring: "focus-visible:ring-slate-400 dark:focus-visible:ring-[#51402E]",
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
