-- Performance optimization migration
-- Add missing indexes for better query performance

-- Additional indexes for exams
CREATE INDEX IF NOT EXISTS idx_exams_passed ON exams(passed);
CREATE INDEX IF NOT EXISTS idx_exams_user_status ON exams(user_id, status);
CREATE INDEX IF NOT EXISTS idx_exams_started_at ON exams(started_at DESC);

-- Additional indexes for practice sessions
CREATE INDEX IF NOT EXISTS idx_practice_user_status ON practice_sessions(user_id, status);

-- Index for users by role (for admin dashboard)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Index for questions by active status (already exists but ensure it)
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(is_active);