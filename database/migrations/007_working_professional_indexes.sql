-- ============================================================================
-- MIGRATION 007: Working Professional & Dashboard Performance Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_selected_category ON users(selected_category);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_created ON daily_checkins(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_created ON mood_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wellness_metrics_user_date ON wellness_metrics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_category ON journal_entries(user_id, category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sanctuary_scores_user ON sanctuary_scores(user_id, created_at DESC);
