-- ============================================================
-- Migration 004: Sanctuary Scores Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    total_score INT NOT NULL CHECK (total_score BETWEEN 0 AND 50),
    max_score INT NOT NULL DEFAULT 50,
    percentage INT NOT NULL CHECK (percentage BETWEEN 0 AND 100),
    wellness_level VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
