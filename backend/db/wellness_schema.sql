-- ============================================================
-- Manraah Mental Wellness Platform — Dedicated Wellness Score Tables
-- ============================================================

-- 1. Wellness Categories Table
CREATE TABLE IF NOT EXISTS wellness_categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100) DEFAULT 'spa',
    color_theme VARCHAR(50) DEFAULT 'emerald',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Wellness Questions Table (5 questions per category)
CREATE TABLE IF NOT EXISTS wellness_questions (
    id SERIAL PRIMARY KEY,
    category_id VARCHAR(100) REFERENCES wellness_categories(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_order INT NOT NULL,
    reverse_scored BOOLEAN DEFAULT false,
    options_json JSONB DEFAULT '[]'::jsonb,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_category_question_order UNIQUE (category_id, question_order)
);

-- 3. Wellness Assessments Logs Table (Stores each completed assessment)
CREATE TABLE IF NOT EXISTS wellness_assessments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    category_id VARCHAR(100) REFERENCES wellness_categories(id) ON DELETE CASCADE,
    raw_score INT NOT NULL CHECK (raw_score BETWEEN 5 AND 25),
    score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wellness_assessments_user_cat ON wellness_assessments(user_id, category_id, completed_at DESC);

-- 4. Wellness Answers Details Table (Stores individual responses)
CREATE TABLE IF NOT EXISTS wellness_answers (
    id SERIAL PRIMARY KEY,
    assessment_id INT REFERENCES wellness_assessments(id) ON DELETE CASCADE,
    question_id INT REFERENCES wellness_questions(id) ON DELETE CASCADE,
    answer INT NOT NULL CHECK (answer BETWEEN 1 AND 5),
    normalized_answer INT NOT NULL CHECK (normalized_answer BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wellness_answers_assessment ON wellness_answers(assessment_id);
