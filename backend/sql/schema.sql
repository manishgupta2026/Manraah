-- ============================================================================
-- MANRAAH WELLNESS SANCTUARY — DATABASE SCHEMA
-- ============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sanctuary_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  avatar TEXT,
  phone VARCHAR(50),
  dob VARCHAR(50),
  country VARCHAR(100),
  gender VARCHAR(50),
  selected_category VARCHAR(100) DEFAULT 'student' NOT NULL,
  streak_days INT DEFAULT 1 NOT NULL,
  mindfulness_minutes INT DEFAULT 0 NOT NULL,
  current_mood VARCHAR(100) DEFAULT 'Sanctuary Member',
  role VARCHAR(50) DEFAULT 'user' NOT NULL,
  initial_answers JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Daily Check-ins Table
CREATE TABLE IF NOT EXISTS daily_checkins (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood VARCHAR(50) NOT NULL,
  energy_level INT NOT NULL,
  stress VARCHAR(50) NOT NULL,
  sleep_quality INT DEFAULT 3 NOT NULL,
  gratitude_reflection TEXT,
  daily_intention TEXT,
  reflection TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Mood Entries Table
CREATE TABLE IF NOT EXISTS mood_entries (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood VARCHAR(50) NOT NULL,
  score INT NOT NULL,
  energy INT DEFAULT 3 NOT NULL,
  stress VARCHAR(50) DEFAULT 'Manageable' NOT NULL,
  reflection TEXT,
  factors TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. User Streaks Table
CREATE TABLE IF NOT EXISTS user_streaks (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 1 NOT NULL,
  longest_streak INT DEFAULT 1 NOT NULL,
  last_checkin_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Wellness Metrics Table
CREATE TABLE IF NOT EXISTS wellness_metrics (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  wellness_score INT NOT NULL,
  stress_score INT NOT NULL,
  energy_score INT NOT NULL,
  sleep_score INT NOT NULL,
  mood_score INT NOT NULL,
  streak INT DEFAULT 1 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Journal & Reflections Table
CREATE TABLE IF NOT EXISTS journal_entries (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  mood_tag VARCHAR(50) DEFAULT 'Reflective',
  category VARCHAR(100) DEFAULT 'Personal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. Assessment Responses & Scores
CREATE TABLE IF NOT EXISTS assessment_responses (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  question_key VARCHAR(100) NOT NULL,
  selected_score INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS sanctuary_scores (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  total_score INT NOT NULL,
  percentage INT NOT NULL,
  wellness_level VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
