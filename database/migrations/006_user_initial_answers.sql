-- ============================================================
-- MANRAAH DATABASE MIGRATION 006
-- Add initial screening questions JSON column to users table
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS initial_answers_json JSONB DEFAULT '{}'::jsonb;
