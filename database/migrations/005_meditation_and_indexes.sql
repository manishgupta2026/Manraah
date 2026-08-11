-- ============================================================
-- Migration 005: Meditation Logs and Performance Indexes
-- ============================================================

CREATE TABLE IF NOT EXISTS meditation_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    minutes INT NOT NULL,
    category VARCHAR(100) DEFAULT 'Mindfulness',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_assessment_id ON assessment_answers(assessment_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_id ON daily_checkins(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meditation_logs_user_id ON meditation_logs(user_id, created_at DESC);
