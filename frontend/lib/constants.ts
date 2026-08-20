/**
 * Frontend UI Constants for Manraah Platform
 */

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "grid_view" },
  { label: "AI Companion", href: "/ai-chat", icon: "smart_toy" },
  { label: "Daily Check-in", href: "/checkin", icon: "mood" },
  { label: "Focus Timer", href: "/meditation", icon: "schedule" },
  { label: "Study Planner", href: "/journey", icon: "assignment" },
  { label: "Exams", href: "/dashboard/student#exam-tracker", icon: "school" },
  { label: "Analytics", href: "/reports", icon: "analytics" },
  { label: "Wellness", href: "/wellness-score", icon: "spa" },
  { label: "Journal", href: "/journal", icon: "auto_stories" },
  { label: "Sleep", href: "/sleep", icon: "bedtime" },
  { label: "Resources", href: "/resources", icon: "menu_book" },
  { label: "Community", href: "/community", icon: "groups" },
  { label: "Professional Care", href: "/professional-care", icon: "medical_services" },
];

export const MOBILE_TAB_ITEMS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: "grid_view" },
  { label: "AI Chat", href: "/ai-chat", icon: "smart_toy" },
  { label: "Check-in", href: "/checkin", icon: "mood" },
  { label: "Community", href: "/community", icon: "groups" },
  { label: "Profile", href: "/profile", icon: "person" },
];

export function getCategoryJourneyBadge(cat: string | null | undefined): string {
  if (!cat) return "🎓 Student Journey";
  const key = cat.toLowerCase().replace(/[^a-z0-9_]/g, "");
  const map: Record<string, string> = {
    student: "🎓 Student Journey",
    young_pro: "💼 Young Professional",
    youngprofessional: "💼 Young Professional",
    working_professional: "👔 Working Professional",
    workingprofessional: "👔 Working Professional",
    parent: "🍼 Parent Journey",
    parents: "🍼 Parent Journey",
    couple: "💖 Harmony Journey",
    couples: "💖 Harmony Journey",
    family: "🏡 Family Journey",
    women: "🌸 Women's Journey",
    men: "🌿 Men's Journey",
    senior_citizen: "👵 Golden Journey",
    seniorcitizen: "👵 Golden Journey",
  };
  return map[key] || "🌿 Wellness Journey";
}

export interface UserCategoryInfo {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  image: string;
}

export const USER_CATEGORIES: UserCategoryInfo[] = [
  {
    id: "student",
    name: "Student",
    desc: "Manage academic stress, exam anxiety, focus, and emotional balance.",
    emoji: "🎓",
    image: "/category/student.png",
  },
  {
    id: "working_professional",
    name: "Working Professional",
    desc: "Navigate workplace pressure, career balance, and burnout prevention.",
    emoji: "💼",
    image: "/category/Working.png",
  },
  {
    id: "parent",
    name: "Parent",
    desc: "Decompress parenting stress, family balance, and personal renewal.",
    emoji: "🍼",
    image: "/category/family.png",
  },
  {
    id: "couple",
    name: "Couple",
    desc: "Nurture relationship harmony, emotional intimacy, and communication.",
    emoji: "💖",
    image: "/category/couple.png",
  },
  {
    id: "other",
    name: "Other",
    desc: "Personalized mindfulness and gentle support tailored to your unique journey.",
    emoji: "✨",
    image: "/category/other.png",
  },
];


