-- ============================================================================
-- MIGRATION 008: Working Professional Profile, Check-ins, and Sessions
-- ============================================================================

-- 1. Extend users table for personalized category profile
ALTER TABLE users ADD COLUMN IF NOT EXISTS age INT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profession VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS industry VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS work_schedule VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS working_hours VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS work_situation VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS wellness_goals JSONB DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- 2. Extend daily check-ins for sleep and work-life balance
ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS stress VARCHAR(50) DEFAULT 'Manageable';
ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS work_life_balance INT DEFAULT 3;
ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS note TEXT;

-- 3. Extend mood_entries for sleep and balance
ALTER TABLE mood_entries ADD COLUMN IF NOT EXISTS sleep_quality INT DEFAULT 3;
ALTER TABLE mood_entries ADD COLUMN IF NOT EXISTS work_life_balance INT DEFAULT 3;

-- 4. Decompression and Reset Sessions
CREATE TABLE IF NOT EXISTS activity_sessions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'decompression',
    duration INT NOT NULL DEFAULT 120, -- in seconds
    completed BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Indexes for fast dashboard query performance
CREATE INDEX IF NOT EXISTS idx_activity_sessions_user ON activity_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON daily_checkins(user_id, created_at DESC);
