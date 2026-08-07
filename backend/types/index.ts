/**
 * Shared TypeScript Interfaces for Manraah Platform
 * 
 * Central data types used across frontend components, mock data stores, and future database queries.
 */

export type UserCategory =
  | "student"
  | "young_pro"
  | "working_professional"
  | "parent"
  | "couple"
  | "family"
  | "women"
  | "men"
  | "senior_citizen"
  | string;

export interface UserProfile {
  id: string;
  name?: string;
  sanctuaryName?: string;
  avatar: string;
  email: string;
  streakDays: number;
  mindfulnessMinutes: number;
  currentMood: string;
  selectedCategory: UserCategory;
}

export interface AssessmentAnswers {
  stressFrequency: number; // 1-5
  sleepQuality: number;    // 1-5
  supportLevel: number;    // 1-5
}

export interface AssessmentResult {
  userId?: string;
  category: UserCategory;
  answers: AssessmentAnswers;
  computedScore: number; // 1-100
  createdAt: string;
}

export interface AuthSession {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: "calm" | "joyful" | "anxious" | "tired" | "reflective";
  score: number; // 1-10 scale
  note?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  content: string;
  moodTag: string;
  category: string;
}

export interface Therapist {
  id: string;
  name: string;
  title: string;
  avatar: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: string;
  bio: string;
  availableTimes: string[];
}

export interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  category: string;
  timeAgo: string;
  title: string;
  content: string;
  likes: number;
  commentsCount: number;
}

export interface ResourceArticle {
  id: string;
  title: string;
  readTime: string;
  category: string;
  thumbnail: string;
  summary: string;
  author: string;
}

export interface WellnessReport {
  id: string;
  userId: string;
  month: string;
  serenityScore: number;
  stabilityIndexChange: number;
  topDiscussedThemes: string[];
  generatedAt: string;
}
