-- ============================================================
-- Rwanda Driving Theory App - PostgreSQL Schema
-- Spring Boot + PostgreSQL
-- ============================================================


-- Set default encoding to UTF-8
SET client_encoding = 'UTF8';

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id                  BIGSERIAL PRIMARY KEY,
    first_name          VARCHAR(100)        NOT NULL,
    last_name           VARCHAR(100)        NOT NULL,
    email               VARCHAR(255)        NOT NULL UNIQUE,
    password_hash       VARCHAR(255)        NOT NULL,
    role                VARCHAR(20)         NOT NULL DEFAULT 'STUDENT'
                            CHECK (role IN ('STUDENT', 'ADMIN')),
    is_active           BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP           NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- ============================================================
-- QUESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
    id                  BIGSERIAL PRIMARY KEY,
    question_number     INT                 NOT NULL,   -- original number from PDF (1-433)
    text_rw             TEXT                NOT NULL,   -- question text in Kinyarwanda
    is_image_based      BOOLEAN             NOT NULL DEFAULT FALSE,
    image_filename      VARCHAR(255),                   -- e.g. sign_p043_i00.png (NULL if not image)
    is_active           BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP           NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- ============================================================
-- QUESTION OPTIONS (always 4 per question: a, b, c, d)
-- ============================================================
CREATE TABLE IF NOT EXISTS question_options (
    id                  BIGSERIAL PRIMARY KEY,
    question_id         BIGINT              NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_letter       CHAR(1)             NOT NULL CHECK (option_letter IN ('a','b','c','d')),
    text_rw             TEXT                NOT NULL,
    is_correct          BOOLEAN             NOT NULL DEFAULT FALSE,
    UNIQUE (question_id, option_letter)
);

-- ============================================================
-- PRACTICE SESSIONS
-- A new session is created each time a student starts practice.
-- Results are instant (per-answer feedback).
-- ============================================================
CREATE TABLE IF NOT EXISTS practice_sessions (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status              VARCHAR(20)         NOT NULL DEFAULT 'IN_PROGRESS'
                            CHECK (status IN ('IN_PROGRESS', 'COMPLETED')),
    total_questions     INT                 NOT NULL DEFAULT 20,
    correct_count       INT                 NOT NULL DEFAULT 0,
    score_percent       NUMERIC(5,2),                  -- calculated on completion
    started_at          TIMESTAMP           NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMP
);

-- ============================================================
-- PRACTICE ANSWERS
-- One row per question answered during a practice session.
-- ============================================================
CREATE TABLE IF NOT EXISTS practice_answers (
    id                  BIGSERIAL PRIMARY KEY,
    session_id          BIGINT              NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
    question_id         BIGINT              NOT NULL REFERENCES questions(id),
    selected_option_id  BIGINT              REFERENCES question_options(id),  -- NULL if skipped
    is_correct          BOOLEAN             NOT NULL DEFAULT FALSE,
    answered_at         TIMESTAMP           NOT NULL DEFAULT NOW(),
    UNIQUE (session_id, question_id)
);

-- ============================================================
-- EXAMS
-- Timed (20 min). Submit at end, then review.
-- ============================================================
CREATE TABLE IF NOT EXISTS exams (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status              VARCHAR(20)         NOT NULL DEFAULT 'IN_PROGRESS'
                            CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'TIMED_OUT')),
    total_questions     INT                 NOT NULL DEFAULT 20,
    correct_count       INT,                            -- set on submission
    score_percent       NUMERIC(5,2),                  -- set on submission
    passed              BOOLEAN,                        -- true if score >= 60%
    pass_threshold      NUMERIC(5,2)        NOT NULL DEFAULT 60.00,
    duration_seconds    INT                 NOT NULL DEFAULT 1200,  -- 20 min
    started_at          TIMESTAMP           NOT NULL DEFAULT NOW(),
    submitted_at        TIMESTAMP,
    expires_at          TIMESTAMP           NOT NULL    -- started_at + 20 min
);

-- ============================================================
-- EXAM ANSWERS
-- One row per question in the exam. selected_option_id = NULL = unanswered.
-- ============================================================
CREATE TABLE IF NOT EXISTS exam_answers (
    id                  BIGSERIAL PRIMARY KEY,
    exam_id             BIGINT              NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_id         BIGINT              NOT NULL REFERENCES questions(id),
    selected_option_id  BIGINT              REFERENCES question_options(id),  -- NULL = unanswered
    correct_option_id   BIGINT              NOT NULL REFERENCES question_options(id),  -- always stored for review
    is_correct          BOOLEAN,                        -- set on submission
    UNIQUE (exam_id, question_id)
);

-- ============================================================
-- EXAM QUESTION ORDER
-- Stores which 20 questions were drawn for this exam/practice,
-- and in what order they appear.
-- ============================================================
CREATE TABLE IF NOT EXISTS session_questions (
    id                  BIGSERIAL PRIMARY KEY,
    session_type        VARCHAR(20)         NOT NULL CHECK (session_type IN ('EXAM', 'PRACTICE')),
    session_id          BIGINT              NOT NULL,   -- points to exams.id or practice_sessions.id
    question_id         BIGINT              NOT NULL REFERENCES questions(id),
    position            INT                 NOT NULL,   -- 1-20, display order
    UNIQUE (session_type, session_id, position)
);
-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(is_active);
CREATE INDEX IF NOT EXISTS idx_questions_image ON questions(is_image_based);
CREATE INDEX IF NOT EXISTS idx_practice_user ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_status ON practice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_practice_answers_session ON practice_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_exams_user ON exams(user_id);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exam_answers_exam ON exam_answers(exam_id);
CREATE INDEX IF NOT EXISTS idx_session_questions ON session_questions(session_type, session_id);
