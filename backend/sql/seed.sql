-- ============================================================================
-- MANRAAH WELLNESS SANCTUARY — SEED DATA
-- ============================================================================

INSERT INTO users (id, name, sanctuary_name, email, selected_category, streak_days, mindfulness_minutes, current_mood, role)
VALUES 
  ('demo-user', 'Gentle Willow', 'Gentle Willow', 'demo@manraah.com', 'working_professional', 3, 45, 'Calm', 'user')
ON CONFLICT (id) DO UPDATE SET 
  sanctuary_name = EXCLUDED.sanctuary_name,
  selected_category = EXCLUDED.selected_category;

INSERT INTO user_streaks (id, user_id, current_streak, longest_streak, last_checkin_date)
VALUES 
  ('streak-demo-user', 'demo-user', 3, 7, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET 
  current_streak = EXCLUDED.current_streak;

INSERT INTO sanctuary_scores (id, user_id, category, total_score, percentage, wellness_level)
VALUES 
  ('score-demo-user', 'demo-user', 'working_professional', 38, 76, 'Stable')
ON CONFLICT (id) DO NOTHING;
