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
  { label: "Journal", href: "/journal", icon: "auto_stories" },
  { label: "Meditation", href: "/meditation", icon: "self_improvement" },
  { label: "Sleep Support", href: "/sleep", icon: "bedtime" },
  { label: "Community", href: "/community", icon: "groups" },
  { label: "Resources", href: "/resources", icon: "menu_book" },
  { label: "My Journey", href: "/journey", icon: "insights" },
  { label: "Wellness Reports", href: "/reports", icon: "analytics" },
  { label: "Professional Care", href: "/professional-care", icon: "medical_services" },
  { label: "Human Companion", href: "/human-companion", icon: "record_voice_over" },
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

