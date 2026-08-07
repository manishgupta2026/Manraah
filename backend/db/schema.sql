-- ============================================================
-- Manraah Mental Wellness Platform — Neon PostgreSQL Database Schema
-- Database: manraah
-- ============================================================

-- 1. Users & Accounts Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar TEXT DEFAULT '/images/user_avatar.jpg',
    sanctuary_name VARCHAR(255) UNIQUE,
    selected_category VARCHAR(100) DEFAULT 'student',
    streak_days INT DEFAULT 1,
    mindfulness_minutes INT DEFAULT 0,
    current_mood VARCHAR(100) DEFAULT 'Sanctuary Member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Onboarding Assessments Table
CREATE TABLE IF NOT EXISTS user_assessments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    stress_frequency INT NOT NULL CHECK (stress_frequency BETWEEN 1 AND 5),
    sleep_quality INT NOT NULL CHECK (sleep_quality BETWEEN 1 AND 5),
    support_level INT NOT NULL CHECK (support_level BETWEEN 1 AND 5),
    computed_score INT NOT NULL CHECK (computed_score BETWEEN 0 AND 100),
    answers_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Daily Mood & Check-in Logs Table
CREATE TABLE IF NOT EXISTS mood_entries (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    mood VARCHAR(50) NOT NULL,
    score INT NOT NULL CHECK (score BETWEEN 1 AND 10),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Mindful Journaling Table
CREATE TABLE IF NOT EXISTS journal_entries (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    mood_tag VARCHAR(50) DEFAULT 'Reflective',
    category VARCHAR(50) DEFAULT 'Personal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Verified Therapists Directory Table
CREATE TABLE IF NOT EXISTS therapists (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    avatar TEXT NOT NULL,
    specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
    rating NUMERIC(3,2) DEFAULT 4.9,
    review_count INT DEFAULT 0,
    hourly_rate VARCHAR(50) NOT NULL,
    bio TEXT NOT NULL,
    available_times TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- 6. Safe Community Posts Table
CREATE TABLE IF NOT EXISTS community_posts (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    avatar TEXT DEFAULT '/images/user_avatar.jpg',
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    likes INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Psychoeducation Resources Library Table
CREATE TABLE IF NOT EXISTS resources (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    read_time VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    thumbnail TEXT NOT NULL,
    summary TEXT NOT NULL,
    author VARCHAR(255) NOT NULL
);
