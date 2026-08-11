import {
  UserProfile,
  MoodEntry,
  JournalEntry,
  Therapist,
  CommunityPost,
  ResourceArticle,
} from "@/backend/types";

export const MOCK_USER: UserProfile = {
  id: "user-101",
  name: "Gentle Bloom",
  sanctuaryName: "Gentle Bloom",
  avatar: "/images/user_avatar.jpg",
  email: "aanya@manraah.org",
  streakDays: 14,
  mindfulnessMinutes: 180,
  currentMood: "Serene & Focused",
  selectedCategory: "student",
};

export const MOCK_MOOD_HISTORY: MoodEntry[] = [
  { id: "m1", date: "Mon", mood: "calm", score: 8, note: "Felt very peaceful after morning meditation." },
  { id: "m2", date: "Tue", mood: "reflective", score: 7, note: "Busy day, took a 10 min break." },
  { id: "m3", date: "Wed", mood: "joyful", score: 9, note: "Great study session with friends!" },
  { id: "m4", date: "Thu", mood: "anxious", score: 5, note: "Exam pressure feeling high." },
  { id: "m5", date: "Fri", mood: "calm", score: 8, note: "Used breathing exercises before sleep." },
  { id: "m6", date: "Sat", mood: "joyful", score: 9, note: "Relaxing weekend start." },
  { id: "m7", date: "Sun", mood: "calm", score: 8, note: "Ready for the week ahead." },
];

export const MOCK_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "j1",
    date: "August 1, 2026",
    title: "Finding Stillness in the Midst of Change",
    excerpt: "Today I practiced letting go of what I cannot control during exam season...",
    content: "Today I practiced letting go of what I cannot control during exam season. The 4-7-8 breathing exercise helped reduce heart flutter before studying.",
    moodTag: "Reflective",
    category: "Mindfulness",
  },
  {
    id: "j2",
    date: "July 29, 2026",
    title: "Grateful for Small Wins",
    excerpt: "Completed my morning 15-minute meditation and felt grounded all afternoon...",
    content: "Completed my morning 15-minute meditation and felt grounded all afternoon. Celebrated finishing two core chapters.",
    moodTag: "Joyful",
    category: "Gratitude",
  },
];

export const MOCK_THERAPISTS: Therapist[] = [
  {
    id: "dr-sarah-jenkins",
    name: "Dr. Sarah Jenkins",
    title: "Clinical Psychologist & Mindfulness Specialist",
    avatar: "/images/therapist_sarah.jpg",
    specialties: ["Anxiety & Stress", "Student Mental Health", "CBT", "Mindfulness"],
    rating: 4.9,
    reviewCount: 128,
    hourlyRate: "₹1,800 / session",
    bio: "Dr. Sarah Jenkins has over 12 years of experience specializing in cognitive behavioral therapy, student stress management, and compassionate mindfulness practices.",
    availableTimes: ["10:00 AM", "02:30 PM", "05:00 PM", "06:30 PM"],
  },
  {
    id: "dr-arjun-mehta",
    name: "Dr. Arjun Mehta",
    title: "Counseling Psychologist & Executive Coach",
    avatar: "/images/therapist_arjun.jpg",
    specialties: ["Burnout Prevention", "Work-Life Integration", "Depression Care"],
    rating: 4.85,
    reviewCount: 94,
    hourlyRate: "₹2,200 / session",
    bio: "Dr. Arjun Mehta supports working professionals navigating workplace burnout, anxiety, and work-life harmony through empathetic human care.",
    availableTimes: ["11:00 AM", "03:00 PM", "04:30 PM"],
  },
];

export const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "p1",
    author: "Rohan V.",
    avatar: "/images/user_avatar.jpg",
    category: "Student Support",
    timeAgo: "2 hours ago",
    title: "How do you manage late night study anxiety?",
    content: "Lately I find myself overthinking right before bed during midterms. The ambient rain sounds on Manraah have been helping, but wondering what routine works best for others?",
    likes: 24,
    commentsCount: 9,
  },
  {
    id: "p2",
    author: "Priya N.",
    avatar: "/images/user_avatar.jpg",
    category: "Mindful Moments",
    timeAgo: "5 hours ago",
    title: "Small reminder: progress isn't linear 🌿",
    content: "Just wanted to share this note with anyone having a tough day. Taking 5 minutes to breathe deeply is still a huge step forward.",
    likes: 56,
    commentsCount: 14,
  },
];

export const MOCK_RESOURCES: ResourceArticle[] = [
  {
    id: "r1",
    title: "Understanding Academic Burnout & Restorative Recovery",
    readTime: "5 min read",
    category: "Mental Clarity",
    thumbnail: "/images/resource_tea.jpg",
    summary: "Practical, evidence-based techniques to spot early cognitive fatigue and restore mental energy.",
    author: "Manraah Clinical Team",
  },
  {
    id: "r2",
    title: "The Science of Ambient Soundscapes for Deep Focus",
    readTime: "7 min read",
    category: "Sleep & Rest",
    thumbnail: "/images/resource_abstract.jpg",
    summary: "Discover how ocean frequencies and binaural rain sounds quiet the sympathetic nervous system.",
    author: "Dr. Sarah Jenkins",
  },
];
// ─────────────────────────────────────────────────────────────────────────────
// STUDENT-SPECIFIC MOCK DATA (used by StudentDashboard & personalized screens)
// ─────────────────────────────────────────────────────────────────────────────

/** Belonging & Connection Signal options */
export const STUDENT_CONNECTION_OPTIONS = [
  { label: "Connected", emoji: "🤝", value: "connected", color: "bg-emerald-50 border-emerald-300 text-emerald-700" },
  { label: "Neutral", emoji: "😐", value: "neutral", color: "bg-amber-50 border-amber-300 text-amber-700" },
  { label: "Isolated", emoji: "🫂", value: "isolated", color: "bg-rose-50 border-rose-300 text-rose-700" },
] as const;

/** Upcoming exam/deadline mock — null means not set yet */
export const STUDENT_UPCOMING_EXAM: { title: string; dueDate: string } | null = null;

/** Focus Score — 0–100, derived from mock study-session consistency */
export const STUDENT_FOCUS_SCORE = {
  score: 72,
  label: "Good Focus",
  description: "You've maintained consistent study blocks 5 of 7 days this week.",
  trend: "+8% from last week",
  color: "#5FCFB0",
};

/** Pomodoro/Focus Session options */
export const STUDENT_POMODORO_PRESETS = [
  { label: "25 min Focus", minutes: 25, icon: "🍅", desc: "Classic Pomodoro" },
  { label: "45 min Deep", minutes: 45, icon: "📚", desc: "Extended study block" },
  { label: "15 min Sprint", minutes: 15, icon: "⚡", desc: "Quick revision burst" },
];

/** Weekly Progress mock data (reusable for Weekly Progress chart widget) */
export const STUDENT_WEEKLY_PROGRESS = [
  { day: "Mon", studyHours: 3.5, mood: "calm", focusScore: 68 },
  { day: "Tue", studyHours: 4.0, mood: "joyful", focusScore: 78 },
  { day: "Wed", studyHours: 2.0, mood: "anxious", focusScore: 55 },
  { day: "Thu", studyHours: 5.0, mood: "calm", focusScore: 82 },
  { day: "Fri", studyHours: 3.0, mood: "reflective", focusScore: 70 },
  { day: "Sat", studyHours: 1.5, mood: "joyful", focusScore: 60 },
  { day: "Sun", studyHours: 2.5, mood: "calm", focusScore: 72 },
];

/** Active Program card mock */
export const STUDENT_ACTIVE_PROGRAM = {
  title: "Exam Season Resilience",
  description: "A 14-day guided track for managing academic pressure, sleep, and focus leading up to exams.",
  daysCompleted: 6,
  totalDays: 14,
  nextSession: "Focus Breathing for Pre-Exam Calm",
  nextSessionLink: "/meditation",
};

/** Daily Quote for Student dashboard */
export const STUDENT_DAILY_QUOTES = [
  "\"A well-rested mind retains 40% more. Sleep is your superpower this exam season.\"",
  "\"Progress, not perfection. Every small step forward is still forward.\"",
  "\"You've survived 100% of your hardest days so far. This one is no different.\"",
  "\"Study hard, breathe deep, and remember — you are more than your grades.\"",
  "\"Your brain consolidates memory during rest. Taking a break IS studying.\"",
];

/** Student journal prompt defaults */
export const STUDENT_JOURNAL_PROMPTS = [
  "What made me smile today?",
  "What challenged me today?",
  "What am I grateful for?",
  "What can I improve tomorrow?",
  "What am I worrying about?",
];

/** Generic fallback journal prompts (non-student) */
export const GENERIC_JOURNAL_PROMPTS = [
  "What was the highlight of my day?",
  "What am I grateful for right now?",
  "How did I feel today?",
  "What would I do differently?",
  "What intention do I set for tomorrow?",
];

/** Student-pinned resources */
export const STUDENT_PINNED_RESOURCE_IDS = ["r1", "r2"];

/** Student-preferred meditation session tags */
export const STUDENT_PRIORITY_MEDITATION_TAGS = ["Focus", "Exam Anxiety Relief", "Study Reset"];

/** Student AI quick-reply chips */
export const STUDENT_AI_QUICK_REPLIES = [
  "I'm stressed about an exam",
  "Help me plan my day",
  "I just need to vent",
  "I'm struggling to focus",
  "I feel overwhelmed by deadlines",
];

/** Generic AI quick-reply chips */
export const GENERIC_AI_QUICK_REPLIES = [
  "I'm feeling anxious",
  "Help me relax",
  "I need to talk",
  "Guide me through breathing",
  "What can I do for stress?",
];

/** Student Wellness Reports copy */
export const STUDENT_WELLNESS_SUMMARY = {
  focusTrend: "Your focus consistency improved 12% this week.",
  checkInPattern: "Most check-ins happened after study sessions (8–11 PM peak).",
  moodHighlight: "You felt most calm on days with 4+ hours of study — well done.",
  recommendation: "Consider a 5-minute breathing reset between study blocks to maintain peak focus.",
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY PERSONALIZATION DATA — ALL 9 CATEGORIES
// Keys: student | young_pro | youngprofessional | working_professional |
//       workingprofessional | parent | parents | couple | couples |
//       family | women | men | senior_citizen | seniorcitizen
// ─────────────────────────────────────────────────────────────────────────────

// ── Utility types ──────────────────────────────────────────────────────────

export interface CategoryPersonalization {
  /** Badge label in MyJourneyScreen header */
  badgeLabel: string;
  /** h1 title in MyJourneyScreen */
  journeyTitle: string;
  /** Subtitle in MyJourneyScreen */
  journeySubtitle: string;
  /** Streak stat label */
  streakLabel: string;
  /** Mindfulness / activity time label */
  activityLabel: string;
  /** Wellness/serenity score label */
  scoreLabel: string;
  /** 7-day chart heading */
  chartHeading: string;
  /** AI quick-reply chips (5–6 items) */
  aiQuickReplies: string[];
  /** Human Companion context tag */
  contextTag: string;
  /** Professional Care specialty to pin first */
  pinnedSpecialty: string;
  /** Ordered specialty list — pinned first */
  specialtyList: string[];
  /** Journal prompts (5 items); SOURCED = from handbook, GENERATED = derived */
  journalPrompts: string[];
  /** Community default tab */
  communityTab: string;
  /** Community context note shown under active tab */
  communityNote: string;
  /** Featured resource tags (array) */
  resourceTags: string[];
  /** Wellness report title */
  reportTitle: string;
  /** Wellness report insight 1 heading */
  report1Heading: string;
  /** Wellness report insight 1 body */
  report1Body: string;
  /** Wellness report insight 2 heading */
  report2Heading: string;
  /** Wellness report insight 2 body */
  report2Body: string;
  /** Meditation featured session note */
  meditationBannerTitle: string;
  meditationBannerBody: string;
  meditationBadge: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ALL CATEGORY PERSONALIZATION MAP
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORY_PERSONALIZATION: Record<string, CategoryPersonalization> = {

  // ── STUDENT ──────────────────────────────────────────────────────────────
  student: {
    badgeLabel: "Academic Progress Analytics",
    journeyTitle: "My Study Journey & Milestones",
    journeySubtitle: "Track your focus streaks, exam-cycle wins, and study consistency milestones.",
    streakLabel: "Focus Streak",
    activityLabel: "Total Focus Minutes",
    scoreLabel: "Exam Readiness Score",
    chartHeading: "7-Day Study & Focus Baseline",
    // GENERATED (no explicit handbook prompts cited):
    aiQuickReplies: [
      "I'm stressed about an exam",
      "Help me plan my day",
      "I just need to vent",
      "I'm struggling to focus",
      "I feel overwhelmed by deadlines",
    ],
    contextTag: "Anonymous — Student, feeling exam pressure",
    pinnedSpecialty: "Student Mental Health",
    specialtyList: ["All", "Student Mental Health", "Anxiety & Stress", "CBT", "Mindfulness", "Burnout Prevention"],
    // GENERATED from focus areas (exam stress, study consistency, peer connection):
    journalPrompts: [
      "What made me smile today?",
      "What challenged me today?",
      "What am I grateful for?",
      "What can I improve tomorrow?",
      "What am I worrying about?",
    ],
    communityTab: "Study Support",
    communityNote: "📚 You're in the Student Study Support circle — share exam tips, focus hacks, and encouragement.",
    resourceTags: ["Mental Clarity", "Sleep & Rest"],
    reportTitle: "Monthly Study & Wellbeing Report",
    report1Heading: "Focus & Study Consistency",
    report1Body: "Your focus consistency improved 12% this week. You felt most calm on days with 4+ hours of study — well done.",
    report2Heading: "Check-in Patterns & AI Insights",
    report2Body: "Most check-ins happened after study sessions (8–11 PM peak). Consider a 5-minute breathing reset between study blocks.",
    meditationBannerTitle: "Student Focus Mode Active",
    meditationBannerBody: "Try 5 Min Calm before studying, or 1 Min Reset between topics.",
    meditationBadge: "Study Optimised",
  },

  // ── YOUNG PROFESSIONAL ────────────────────────────────────────────────────
  young_pro: {
    badgeLabel: "Career Growth Analytics",
    journeyTitle: "My Professional Journey & Wins",
    journeySubtitle: "Track your confidence milestones, career goals, and mindful work habits.",
    streakLabel: "Growth Streak",
    activityLabel: "Total Mindfulness Minutes",
    scoreLabel: "Confidence Index",
    chartHeading: "7-Day Mood & Motivation Baseline",
    // GENERATED from focus areas (career, confidence, imposter syndrome, networking):
    aiQuickReplies: [
      "I'm dealing with imposter syndrome",
      "I have a big decision at work",
      "I feel nervous about networking",
      "Help me build more confidence",
      "I'm anxious about my career path",
    ],
    contextTag: "Anonymous — Young Professional, navigating early career",
    pinnedSpecialty: "Career Counseling",
    specialtyList: ["All", "Career Counseling", "Anxiety & Stress", "CBT", "Mindfulness", "Burnout Prevention"],
    // GENERATED from focus areas (imposter syndrome, decision-making, confidence, financial planning):
    journalPrompts: [
      "What did I achieve at work today?",
      "What decision am I avoiding, and why?",
      "When did I feel most confident this week?",
      "What am I learning about my career right now?",
      "What is one goal I want to focus on this month?",
    ],
    communityTab: "Career & Growth",
    communityNote: "💼 You're in the Young Professionals circle — share career wins, challenges, and advice.",
    resourceTags: ["Anxiety & Stress", "Mental Clarity"],
    reportTitle: "Monthly Career Wellbeing Report",
    report1Heading: "Confidence & Growth Tracking",
    report1Body: "Your check-in consistency reflects steady momentum. Sustained self-reflection is a core habit of high-performing professionals.",
    report2Heading: "AI Companion Insights",
    report2Body: "Top themes this month included career decision-making and managing workplace anxiety. You're building the self-awareness that separates great leaders.",
    meditationBannerTitle: "Career Focus Mode Active",
    meditationBannerBody: "Try Morning Calm before meetings, or 5 Min Reset after a tough conversation.",
    meditationBadge: "Career Optimised",
  },

  youngprofessional: {
    badgeLabel: "Career Growth Analytics",
    journeyTitle: "My Professional Journey & Wins",
    journeySubtitle: "Track your confidence milestones, career goals, and mindful work habits.",
    streakLabel: "Growth Streak",
    activityLabel: "Total Mindfulness Minutes",
    scoreLabel: "Confidence Index",
    chartHeading: "7-Day Mood & Motivation Baseline",
    aiQuickReplies: [
      "I'm dealing with imposter syndrome",
      "I have a big decision at work",
      "I feel nervous about networking",
      "Help me build more confidence",
      "I'm anxious about my career path",
    ],
    contextTag: "Anonymous — Young Professional, navigating early career",
    pinnedSpecialty: "Career Counseling",
    specialtyList: ["All", "Career Counseling", "Anxiety & Stress", "CBT", "Mindfulness", "Burnout Prevention"],
    journalPrompts: [
      "What did I achieve at work today?",
      "What decision am I avoiding, and why?",
      "When did I feel most confident this week?",
      "What am I learning about my career right now?",
      "What is one goal I want to focus on this month?",
    ],
    communityTab: "Career & Growth",
    communityNote: "💼 You're in the Young Professionals circle — share career wins, challenges, and advice.",
    resourceTags: ["Anxiety & Stress", "Mental Clarity"],
    reportTitle: "Monthly Career Wellbeing Report",
    report1Heading: "Confidence & Growth Tracking",
    report1Body: "Your check-in consistency reflects steady momentum. Sustained self-reflection is a core habit of high-performing professionals.",
    report2Heading: "AI Companion Insights",
    report2Body: "Top themes this month included career decision-making and managing workplace anxiety. You're building the self-awareness that separates great leaders.",
    meditationBannerTitle: "Career Focus Mode Active",
    meditationBannerBody: "Try Morning Calm before meetings, or 5 Min Reset after a tough conversation.",
    meditationBadge: "Career Optimised",
  },

  // ── WORKING PROFESSIONAL ──────────────────────────────────────────────────
  working_professional: {
    badgeLabel: "Work-Life Harmony Analytics",
    journeyTitle: "My Wellbeing Journey & Balance Wins",
    journeySubtitle: "Track your burnout resilience, mindful work habits, and recovery milestones.",
    streakLabel: "Balance Streak",
    activityLabel: "Decompression Minutes",
    scoreLabel: "Burnout Resilience Score",
    chartHeading: "7-Day Stress & Recovery Baseline",
    // GENERATED from focus areas (burnout, workload, work-life balance, decision fatigue):
    aiQuickReplies: [
      "I'm feeling burned out at work",
      "I can't switch off after hours",
      "My workload is overwhelming",
      "I'm struggling with decision fatigue",
      "Help me prioritize what matters",
    ],
    contextTag: "Anonymous — Working Professional, managing workplace stress",
    pinnedSpecialty: "Burnout Prevention",
    specialtyList: ["All", "Burnout Prevention", "Anxiety & Stress", "CBT", "Mindfulness", "Work-Life Integration"],
    // GENERATED from focus areas (burnout, boundaries, work-life balance, decision fatigue):
    journalPrompts: [
      "What drained my energy most today?",
      "What work boundary do I need to protect?",
      "When did I feel in flow today?",
      "What can I let go of to reduce tomorrow's load?",
      "What is one non-work moment I'm grateful for today?",
    ],
    communityTab: "Work & Burnout",
    communityNote: "🌿 You're in the Working Professionals circle — no toxic productivity here, just real support and balance.",
    resourceTags: ["Burnout Prevention", "Sleep & Rest"],
    reportTitle: "Monthly Work-Life Wellbeing Report",
    report1Heading: "Burnout Risk & Resilience",
    report1Body: "Your mood stability this month reflects healthy decompression habits. Days with mindfulness breaks showed significantly lower stress readings.",
    report2Heading: "AI Companion Themes",
    report2Body: "Most sessions centred on workload management and switching off after hours. Sustained boundaries lead to sustainable performance.",
    meditationBannerTitle: "Decompression Mode Active",
    meditationBannerBody: "Try Stress Relief after work, or 10 Min Wind-Down before bed for deeper recovery.",
    meditationBadge: "Work-Life Balance",
  },

  workingprofessional: {
    badgeLabel: "Work-Life Harmony Analytics",
    journeyTitle: "My Wellbeing Journey & Balance Wins",
    journeySubtitle: "Track your burnout resilience, mindful work habits, and recovery milestones.",
    streakLabel: "Balance Streak",
    activityLabel: "Decompression Minutes",
    scoreLabel: "Burnout Resilience Score",
    chartHeading: "7-Day Stress & Recovery Baseline",
    aiQuickReplies: [
      "I'm feeling burned out at work",
      "I can't switch off after hours",
      "My workload is overwhelming",
      "I'm struggling with decision fatigue",
      "Help me prioritize what matters",
    ],
    contextTag: "Anonymous — Working Professional, managing workplace stress",
    pinnedSpecialty: "Burnout Prevention",
    specialtyList: ["All", "Burnout Prevention", "Anxiety & Stress", "CBT", "Mindfulness", "Work-Life Integration"],
    journalPrompts: [
      "What drained my energy most today?",
      "What work boundary do I need to protect?",
      "When did I feel in flow today?",
      "What can I let go of to reduce tomorrow's load?",
      "What is one non-work moment I'm grateful for today?",
    ],
    communityTab: "Work & Burnout",
    communityNote: "🌿 You're in the Working Professionals circle — no toxic productivity here, just real support and balance.",
    resourceTags: ["Burnout Prevention", "Sleep & Rest"],
    reportTitle: "Monthly Work-Life Wellbeing Report",
    report1Heading: "Burnout Risk & Resilience",
    report1Body: "Your mood stability this month reflects healthy decompression habits. Days with mindfulness breaks showed significantly lower stress readings.",
    report2Heading: "AI Companion Themes",
    report2Body: "Most sessions centred on workload management and switching off after hours. Sustained boundaries lead to sustainable performance.",
    meditationBannerTitle: "Decompression Mode Active",
    meditationBannerBody: "Try Stress Relief after work, or 10 Min Wind-Down before bed for deeper recovery.",
    meditationBadge: "Work-Life Balance",
  },

  // ── PARENT ────────────────────────────────────────────────────────────────
  parent: {
    badgeLabel: "Family Wellbeing Analytics",
    journeyTitle: "My Parenting Journey & Milestones",
    journeySubtitle: "Track your personal care streaks, mindful patience wins, and family balance milestones.",
    streakLabel: "Mindful Parent Streak",
    activityLabel: "Personal Calm Minutes",
    scoreLabel: "Family Balance Score",
    chartHeading: "7-Day Parenting Stress & Calm Baseline",
    // GENERATED from focus areas (parenting stress, personal time, sleep deprivation, family balance):
    aiQuickReplies: [
      "I'm feeling overwhelmed as a parent",
      "I haven't had any time for myself",
      "I'm exhausted from sleep deprivation",
      "I need help staying patient with my kids",
      "I feel guilty about needing a break",
    ],
    contextTag: "Anonymous — Parent, feeling overwhelmed",
    pinnedSpecialty: "Family Therapy",
    specialtyList: ["All", "Family Therapy", "Anxiety & Stress", "Mindfulness", "CBT", "Burnout Prevention"],
    // GENERATED from focus areas (parenting stress, personal time, balance, guilt):
    journalPrompts: [
      "What moment with my family am I most grateful for today?",
      "When did I take care of myself today?",
      "What made parenting feel hard today?",
      "What is one thing I did well as a parent today?",
      "What do I need more of to feel balanced?",
    ],
    communityTab: "Parenting",
    communityNote: "👨‍👩‍👧 You're in the Mindful Parenting circle — a judgment-free space to share, vent, and grow together.",
    resourceTags: ["Anxiety & Stress", "Sleep & Rest"],
    reportTitle: "Monthly Family Wellbeing Report",
    report1Heading: "Personal Care & Parenting Balance",
    report1Body: "Your self-care check-ins this month show growing emotional resilience. Days you carved out personal time correlated with lower stress scores.",
    report2Heading: "AI Companion Themes",
    report2Body: "Common themes included navigating parenting guilt and finding pockets of calm. You are doing better than you give yourself credit for.",
    meditationBannerTitle: "Parent Calm Mode Active",
    meditationBannerBody: "Try Breathing Exercise during nap time, or 5 Min Reset after a tough moment with kids.",
    meditationBadge: "Family Balance",
  },

  parents: {
    badgeLabel: "Family Wellbeing Analytics",
    journeyTitle: "My Parenting Journey & Milestones",
    journeySubtitle: "Track your personal care streaks, mindful patience wins, and family balance milestones.",
    streakLabel: "Mindful Parent Streak",
    activityLabel: "Personal Calm Minutes",
    scoreLabel: "Family Balance Score",
    chartHeading: "7-Day Parenting Stress & Calm Baseline",
    aiQuickReplies: [
      "I'm feeling overwhelmed as a parent",
      "I haven't had any time for myself",
      "I'm exhausted from sleep deprivation",
      "I need help staying patient with my kids",
      "I feel guilty about needing a break",
    ],
    contextTag: "Anonymous — Parent, feeling overwhelmed",
    pinnedSpecialty: "Family Therapy",
    specialtyList: ["All", "Family Therapy", "Anxiety & Stress", "Mindfulness", "CBT", "Burnout Prevention"],
    journalPrompts: [
      "What moment with my family am I most grateful for today?",
      "When did I take care of myself today?",
      "What made parenting feel hard today?",
      "What is one thing I did well as a parent today?",
      "What do I need more of to feel balanced?",
    ],
    communityTab: "Parenting",
    communityNote: "👨‍👩‍👧 You're in the Mindful Parenting circle — a judgment-free space to share, vent, and grow together.",
    resourceTags: ["Anxiety & Stress", "Sleep & Rest"],
    reportTitle: "Monthly Family Wellbeing Report",
    report1Heading: "Personal Care & Parenting Balance",
    report1Body: "Your self-care check-ins this month show growing emotional resilience. Days you carved out personal time correlated with lower stress scores.",
    report2Heading: "AI Companion Themes",
    report2Body: "Common themes included navigating parenting guilt and finding pockets of calm. You are doing better than you give yourself credit for.",
    meditationBannerTitle: "Parent Calm Mode Active",
    meditationBannerBody: "Try Breathing Exercise during nap time, or 5 Min Reset after a tough moment with kids.",
    meditationBadge: "Family Balance",
  },

  // ── COUPLES ───────────────────────────────────────────────────────────────
  couple: {
    badgeLabel: "Relationship Harmony Analytics",
    journeyTitle: "My Personal Growth in Our Relationship",
    journeySubtitle: "These reflections are private to you alone — track your individual wellness within your relationship journey.",
    streakLabel: "Reflection Streak",
    activityLabel: "Mindfulness Minutes",
    scoreLabel: "Harmony Index",
    chartHeading: "7-Day Emotional Wellbeing Baseline",
    // GENERATED from focus areas (communication, trust, conflict, shared reflection) — framed individually:
    aiQuickReplies: [
      "I'm struggling to communicate with my partner",
      "We had a conflict and I need to process it",
      "I feel disconnected from my partner",
      "I want to strengthen our trust",
      "Help me reflect on my role in this relationship",
    ],
    contextTag: "Anonymous — Individual in a relationship, seeking personal reflection",
    pinnedSpecialty: "Relationship Counseling",
    specialtyList: ["All", "Relationship Counseling", "CBT", "Anxiety & Stress", "Mindfulness", "Family Therapy"],
    // GENERATED from focus areas (framed for individual reflection, not joint use):
    journalPrompts: [
      "How did I show up for my partner today?",
      "What do I wish I had said differently today?",
      "What needs of mine am I not expressing clearly?",
      "What am I grateful for in this relationship right now?",
      "What boundary do I want to strengthen for my own wellbeing?",
    ],
    communityTab: "Relationships",
    communityNote: "💜 You're in the Relationships circle — all reflections here are personal and private to you, never shared with your partner.",
    resourceTags: ["Anxiety & Stress", "Mental Clarity"],
    reportTitle: "Monthly Relationship Wellbeing Report",
    report1Heading: "Personal Harmony & Communication Growth",
    report1Body: "Your individual reflections show increasing emotional self-awareness — a key foundation for healthy relationships. These insights are private to you.",
    report2Heading: "AI Companion Themes",
    report2Body: "Sessions focused on personal communication patterns and emotional regulation. Healthy relationships start with a healthy individual.",
    meditationBannerTitle: "Harmony Mode Active",
    meditationBannerBody: "Try Compassion Meditation for empathy, or 5 Min Calm before a difficult conversation.",
    meditationBadge: "Relationship Harmony",
  },

  couples: {
    badgeLabel: "Relationship Harmony Analytics",
    journeyTitle: "My Personal Growth in Our Relationship",
    journeySubtitle: "These reflections are private to you alone — track your individual wellness within your relationship journey.",
    streakLabel: "Reflection Streak",
    activityLabel: "Mindfulness Minutes",
    scoreLabel: "Harmony Index",
    chartHeading: "7-Day Emotional Wellbeing Baseline",
    aiQuickReplies: [
      "I'm struggling to communicate with my partner",
      "We had a conflict and I need to process it",
      "I feel disconnected from my partner",
      "I want to strengthen our trust",
      "Help me reflect on my role in this relationship",
    ],
    contextTag: "Anonymous — Individual in a relationship, seeking personal reflection",
    pinnedSpecialty: "Relationship Counseling",
    specialtyList: ["All", "Relationship Counseling", "CBT", "Anxiety & Stress", "Mindfulness", "Family Therapy"],
    journalPrompts: [
      "How did I show up for my partner today?",
      "What do I wish I had said differently today?",
      "What needs of mine am I not expressing clearly?",
      "What am I grateful for in this relationship right now?",
      "What boundary do I want to strengthen for my own wellbeing?",
    ],
    communityTab: "Relationships",
    communityNote: "💜 You're in the Relationships circle — all reflections here are personal and private to you, never shared with your partner.",
    resourceTags: ["Anxiety & Stress", "Mental Clarity"],
    reportTitle: "Monthly Relationship Wellbeing Report",
    report1Heading: "Personal Harmony & Communication Growth",
    report1Body: "Your individual reflections show increasing emotional self-awareness — a key foundation for healthy relationships. These insights are private to you.",
    report2Heading: "AI Companion Themes",
    report2Body: "Sessions focused on personal communication patterns and emotional regulation. Healthy relationships start with a healthy individual.",
    meditationBannerTitle: "Harmony Mode Active",
    meditationBannerBody: "Try Compassion Meditation for empathy, or 5 Min Calm before a difficult conversation.",
    meditationBadge: "Relationship Harmony",
  },

  // ── FAMILY ────────────────────────────────────────────────────────────────
  family: {
    badgeLabel: "Family Harmony Analytics",
    journeyTitle: "My Family Wellbeing Journey",
    journeySubtitle: "These reflections are personal to you — track your own wellbeing as part of your family's shared journey.",
    streakLabel: "Family Harmony Streak",
    activityLabel: "Mindfulness Minutes",
    scoreLabel: "Family Wellbeing Score",
    chartHeading: "7-Day Family Mood & Calm Baseline",
    // GENERATED from focus areas (communication, conflict resolution, shared activities, mutual support):
    aiQuickReplies: [
      "There's tension in our family right now",
      "I want to improve how we communicate",
      "I feel like the family's peacekeeper and it's exhausting",
      "I need space to process a family conflict",
      "Help me feel more connected to my family",
    ],
    contextTag: "Anonymous — Family member, navigating family dynamics",
    pinnedSpecialty: "Family Therapy",
    specialtyList: ["All", "Family Therapy", "CBT", "Mindfulness", "Anxiety & Stress", "Relationship Counseling"],
    // GENERATED from focus areas (communication, shared wellbeing, personal role in family, support):
    journalPrompts: [
      "What did I do today that supported my family's wellbeing?",
      "What family moment am I most grateful for today?",
      "What communication pattern do I want to change?",
      "How did I take care of myself as part of the family today?",
      "What is one positive thing about our family I want to hold onto?",
    ],
    communityTab: "Family & Home",
    communityNote: "🏠 You're in the Family Wellbeing circle — a warm, inclusive space focused on collective and individual wellbeing.",
    resourceTags: ["Mental Clarity", "Anxiety & Stress"],
    reportTitle: "Monthly Family Harmony Report",
    report1Heading: "Personal Wellbeing Within Family",
    report1Body: "Your consistent check-ins show you are actively investing in the family's collective calm. Your personal wellbeing lifts the whole household.",
    report2Heading: "AI Companion Themes",
    report2Body: "Common themes included family communication and finding balance between personal needs and family responsibilities.",
    meditationBannerTitle: "Family Calm Mode Active",
    meditationBannerBody: "Try Gentle Breathing for daily resets, or 10 Min Deep Calm after a stressful family moment.",
    meditationBadge: "Family Harmony",
  },

  // ── WOMEN ─────────────────────────────────────────────────────────────────
  women: {
    badgeLabel: "Women's Wellbeing Analytics",
    journeyTitle: "My Wellness Journey & Empowerment Wins",
    journeySubtitle: "Track your self-care streaks, confidence milestones, and personal growth moments.",
    streakLabel: "Self-Care Streak",
    activityLabel: "Mindfulness Minutes",
    scoreLabel: "Empowerment Score",
    chartHeading: "7-Day Mood & Energy Baseline",
    // GENERATED from focus areas (self-care, confidence, work-life balance, body image, hormonal mood):
    aiQuickReplies: [
      "I haven't been taking care of myself",
      "I'm feeling low confidence today",
      "I'm struggling with work-life balance",
      "I feel emotionally drained and I don't know why",
      "I need some time just for me",
    ],
    contextTag: "Anonymous — Woman, focusing on self-care and confidence",
    pinnedSpecialty: "Women's Wellness",
    specialtyList: ["All", "Women's Wellness", "Anxiety & Stress", "CBT", "Mindfulness", "Burnout Prevention"],
    // HANDBOOK-SOURCED: "How did I take care of myself today?", "What made me feel confident?", "What challenged me today?"
    // GENERATED (2 additional): "What am I proud of this week?", "What boundary did I honour today?"
    journalPrompts: [
      "How did I take care of myself today?",          // HANDBOOK-SOURCED
      "What made me feel confident today?",             // HANDBOOK-SOURCED
      "What challenged me today?",                      // HANDBOOK-SOURCED
      "What am I proud of this week?",                  // GENERATED
      "What boundary did I honour for myself today?",   // GENERATED
    ],
    communityTab: "Women's Circle",
    communityNote: "🌸 You're in the Women's Circle — a supportive, respectful space to share, be heard, and uplift each other.",
    resourceTags: ["Mental Clarity", "Anxiety & Stress"],
    reportTitle: "Monthly Women's Wellbeing Report",
    report1Heading: "Self-Care & Emotional Stability",
    report1Body: "Your self-care check-ins show a positive trend in emotional regulation this month. Days with intentional rest or mindfulness correlated with higher energy scores.",
    report2Heading: "AI Companion Insights",
    report2Body: "Top themes included building daily self-care routines and managing emotional highs and lows. Your consistency in showing up for yourself is deeply commendable.",
    meditationBannerTitle: "Women's Wellness Mode Active",
    meditationBannerBody: "Try Gentle Body Scan for daily self-care, or 5 Min Breathing Reset during overwhelming moments.",
    meditationBadge: "Self-Care First",
  },

  // ── MEN ───────────────────────────────────────────────────────────────────
  men: {
    badgeLabel: "Personal Strength Analytics",
    journeyTitle: "My Wellbeing Journey & Strengths",
    journeySubtitle: "Track your stress recovery, openness milestones, and personal wins.",
    streakLabel: "Consistency Streak",
    activityLabel: "Mindfulness Minutes",
    scoreLabel: "Resilience Score",
    chartHeading: "7-Day Stress & Resilience Baseline",
    // GENERATED from focus areas (stress management, openness, career/financial pressure, communication):
    aiQuickReplies: [
      "I'm under a lot of pressure right now",
      "I find it hard to open up about how I feel",
      "Work and finances are stressing me out",
      "I want to communicate better but don't know how",
      "I just need to talk to someone",
    ],
    contextTag: "Anonymous — Man, managing life pressure",
    pinnedSpecialty: "Men's Mental Health",
    specialtyList: ["All", "Men's Mental Health", "Anxiety & Stress", "CBT", "Mindfulness", "Burnout Prevention"],
    // HANDBOOK-SOURCED: "What stressed me today?", "What made me proud today?", "How can I improve tomorrow?"
    // GENERATED (2 additional): "Who did I lean on today, or who could I have?", "What am I grateful for right now?"
    journalPrompts: [
      "What stressed me today?",                        // HANDBOOK-SOURCED
      "What made me proud today?",                      // HANDBOOK-SOURCED
      "How can I improve tomorrow?",                    // HANDBOOK-SOURCED
      "Who did I lean on today, or who could I have?",  // GENERATED
      "What am I grateful for right now?",              // GENERATED
    ],
    communityTab: "Men's Corner",
    communityNote: "🌿 You're in the Men's Corner — no judgment, no pressure. Just open, honest conversation about what matters.",
    resourceTags: ["Anxiety & Stress", "Mental Clarity"],
    reportTitle: "Monthly Resilience Report",
    report1Heading: "Stress & Resilience Tracking",
    report1Body: "Your mood trends show steady resilience this month. Days you engaged with the platform showed measurably lower stress scores by end of day.",
    report2Heading: "AI Companion Themes",
    report2Body: "Most sessions touched on work pressure and the value of expressing emotions clearly. Showing up here already takes strength — keep going.",
    meditationBannerTitle: "Resilience Mode Active",
    meditationBannerBody: "Try Stress Release for pressure relief, or 5 Min Breathing Reset before a difficult moment.",
    meditationBadge: "Strength Through Calm",
  },

  // ── SENIOR CITIZEN ────────────────────────────────────────────────────────
  senior_citizen: {
    badgeLabel: "Wellness & Vitality Analytics",
    journeyTitle: "My Wellness Journey",
    journeySubtitle: "Track your daily calm, connection, and the small moments of joy that make each day meaningful.",
    streakLabel: "Daily Calm Streak",
    activityLabel: "Gentle Mindfulness Minutes",
    scoreLabel: "Vitality & Wellbeing Score",
    chartHeading: "7-Day Mood & Energy",
    // GENERATED — simple, clear language; no slang; short sentences:
    aiQuickReplies: [
      "I feel a bit lonely today",
      "I am worried about my health",
      "I want to talk to someone",
      "Help me relax and breathe",
      "I want to share a memory",
    ],
    contextTag: "Anonymous — Senior, looking for a kind conversation",
    pinnedSpecialty: "Geriatric Counseling",
    specialtyList: ["All", "Geriatric Counseling", "Anxiety & Stress", "Mindfulness", "CBT", "Loneliness & Isolation"],
    // GENERATED — short, simple, reflective prompts in plain language (no slang):
    journalPrompts: [
      "Who did you talk to today?",
      "What is one good memory from today?",
      "What made you smile today?",
      "What are you looking forward to tomorrow?",
      "What are you grateful for right now?",
    ],
    communityTab: "Golden Circle",
    communityNote: "🌟 You're in the Golden Circle — a warm, respectful space to share stories, memories, and daily moments of joy.",
    resourceTags: ["Sleep & Rest", "Mental Clarity"],
    reportTitle: "Monthly Wellness & Vitality Report",
    report1Heading: "Daily Calm & Connection",
    report1Body: "Your daily check-ins show a caring and steady approach to your wellbeing. Every day you engage here is a meaningful step.",
    report2Heading: "Wellness Insights",
    report2Body: "You spent meaningful time on breathing and gentle relaxation this month. Staying connected and present every day makes a real difference.",
    meditationBannerTitle: "Gentle Relaxation Mode",
    meditationBannerBody: "Try Gentle Breathing for a calm start to the day. Just 5 minutes of quiet breathing can lift your mood.",
    meditationBadge: "Gentle & Restorative",
  },

  seniorcitizen: {
    badgeLabel: "Wellness & Vitality Analytics",
    journeyTitle: "My Wellness Journey",
    journeySubtitle: "Track your daily calm, connection, and the small moments of joy that make each day meaningful.",
    streakLabel: "Daily Calm Streak",
    activityLabel: "Gentle Mindfulness Minutes",
    scoreLabel: "Vitality & Wellbeing Score",
    chartHeading: "7-Day Mood & Energy",
    aiQuickReplies: [
      "I feel a bit lonely today",
      "I am worried about my health",
      "I want to talk to someone",
      "Help me relax and breathe",
      "I want to share a memory",
    ],
    contextTag: "Anonymous — Senior, looking for a kind conversation",
    pinnedSpecialty: "Geriatric Counseling",
    specialtyList: ["All", "Geriatric Counseling", "Anxiety & Stress", "Mindfulness", "CBT", "Loneliness & Isolation"],
    journalPrompts: [
      "Who did you talk to today?",
      "What is one good memory from today?",
      "What made you smile today?",
      "What are you looking forward to tomorrow?",
      "What are you grateful for right now?",
    ],
    communityTab: "Golden Circle",
    communityNote: "🌟 You're in the Golden Circle — a warm, respectful space to share stories, memories, and daily moments of joy.",
    resourceTags: ["Sleep & Rest", "Mental Clarity"],
    reportTitle: "Monthly Wellness & Vitality Report",
    report1Heading: "Daily Calm & Connection",
    report1Body: "Your daily check-ins show a caring and steady approach to your wellbeing. Every day you engage here is a meaningful step.",
    report2Heading: "Wellness Insights",
    report2Body: "You spent meaningful time on breathing and gentle relaxation this month. Staying connected and present every day makes a real difference.",
    meditationBannerTitle: "Gentle Relaxation Mode",
    meditationBannerBody: "Try Gentle Breathing for a calm start to the day. Just 5 minutes of quiet breathing can lift your mood.",
    meditationBadge: "Gentle & Restorative",
  },
};

// ── Helper: get personalization for resolved category ──────────────────────
const DEFAULT_PERSONALIZATION: CategoryPersonalization = {
  badgeLabel: "Personal Growth Analytics",
  journeyTitle: "My Journey & Wellness Milestones",
  journeySubtitle: "Track your emotional consistency, mindfulness streaks, and completed sanctuary goals.",
  streakLabel: "Active Check-in Streak",
  activityLabel: "Total Meditation Time",
  scoreLabel: "Current Serenity Score",
  chartHeading: "7-Day Emotional Baseline",
  aiQuickReplies: [
    "I'm feeling anxious",
    "Help me relax",
    "I need to talk",
    "Guide me through breathing",
    "What can I do for stress?",
  ],
  contextTag: "Anonymous Sanctuary Member",
  pinnedSpecialty: "All",
  specialtyList: ["All", "Anxiety & Stress", "CBT", "Mindfulness", "Burnout Prevention", "Student Mental Health"],
  journalPrompts: [
    "What was the highlight of my day?",
    "What am I grateful for right now?",
    "How did I feel today?",
    "What would I do differently?",
    "What intention do I set for tomorrow?",
  ],
  communityTab: "General Discussion",
  communityNote: "",
  resourceTags: ["Mental Clarity", "Sleep & Rest"],
  reportTitle: "Monthly Serenity & Mood Report",
  report1Heading: "Emotional Stability Index",
  report1Body: "Your mood variance decreased by 18% over the past 30 days, indicating sustained emotional regulation and improved stress recovery times.",
  report2Heading: "AI Companion Interaction Insights",
  report2Body: "Top themes discussed during chat sessions included academic exam prep, sleep routine adjustments, and daily breathing exercises.",
  meditationBannerTitle: "Mindfulness Mode Active",
  meditationBannerBody: "Try 5 Min Calm for stress relief, or 10 Min Journey for a deeper reset.",
  meditationBadge: "Wellness Optimised",
};

export function getCategoryPersonalization(resolvedCategory: string): CategoryPersonalization {
  return CATEGORY_PERSONALIZATION[resolvedCategory] ?? DEFAULT_PERSONALIZATION;
}

