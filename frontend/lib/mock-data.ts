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
