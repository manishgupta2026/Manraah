import { pgTable, text, integer, timestamp, boolean, jsonb, serial, numeric } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  avatar: text("avatar").default("/images/user_avatar.jpg"),
  selectedCategory: text("selected_category").default("student"),
  streakDays: integer("streak_days").default(1),
  mindfulnessMinutes: integer("mindfulness_minutes").default(0),
  currentMood: text("current_mood").default("Sanctuary Member"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  expiresAt: timestamp("expires_at"),
  password: text("password"),
  scope: text("scope"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verificationTokens = pgTable("verification_tokens", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userAssessments = pgTable("user_assessments", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  stressFrequency: integer("stress_frequency").notNull(),
  sleepQuality: integer("sleep_quality").notNull(),
  supportLevel: integer("support_level").notNull(),
  computedScore: integer("computed_score").notNull(),
  answersJson: jsonb("answers_json").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const moodEntries = pgTable("mood_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  mood: text("mood").notNull(),
  score: integer("score").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const journalEntries = pgTable("journal_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  moodTag: text("mood_tag").default("Reflective"),
  category: text("category").default("Personal"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const therapists = pgTable("therapists", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  avatar: text("avatar").notNull(),
  specialties: text("specialties").array(),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("4.9"),
  reviewCount: integer("review_count").default(0),
  hourlyRate: text("hourly_rate").notNull(),
  bio: text("bio").notNull(),
  availableTimes: text("available_times").array(),
});

export const communityPosts = pgTable("community_posts", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  authorName: text("author_name").notNull(),
  avatar: text("avatar").default("/images/user_avatar.jpg"),
  category: text("category").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  commentsCount: integer("comments_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resources = pgTable("resources", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  readTime: text("read_time").notNull(),
  category: text("category").notNull(),
  thumbnail: text("thumbnail").notNull(),
  summary: text("summary").notNull(),
  author: text("author").notNull(),
});

export const dailyCheckins = pgTable("daily_checkins", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  mood: text("mood").notNull(),
  energyLevel: integer("energy_level").notNull(),
  sleepQuality: integer("sleep_quality").notNull(),
  gratitudeReflection: text("gratitude_reflection"),
  dailyIntention: text("daily_intention"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userStreaks = pgTable("user_streaks", {
  id: text("id").primaryKey(),
  userId: text("user_id").unique().references(() => users.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").default(1),
  longestStreak: integer("longest_streak").default(1),
  lastCheckInDate: timestamp("last_checkin_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

