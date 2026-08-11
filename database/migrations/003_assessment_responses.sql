-- ============================================================
-- Migration 003: Assessment Responses Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS assessment_answers (
    id SERIAL PRIMARY KEY,
    assessment_id INT NOT NULL,
    question_id INT NOT NULL,
    question_key VARCHAR(100) NOT NULL,
    question_type VARCHAR(50) NOT NULL DEFAULT 'category',
    category VARCHAR(100) NOT NULL,
    selected_option_id VARCHAR(100) NOT NULL,
    selected_text TEXT NOT NULL,
    score INT NOT NULL CHECK (score BETWEEN 1 AND 5),
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
