-- ====================================================================
-- Flyway Migration V3: Evaluation, Communication, and Document Tables
-- HireStack - Applicant Tracking & Recruitment Workflow
-- ====================================================================

-- 11. Evaluation Templates Table
CREATE TABLE evaluation_templates (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    description TEXT,
    criteria_json JSONB,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 12. Evaluation Scores Table (Detailed criteria breakdown linked to feedback)
CREATE TABLE evaluation_scores (
    id BIGSERIAL PRIMARY KEY,
    feedback_id BIGINT NOT NULL REFERENCES interview_feedback(id) ON DELETE CASCADE,
    criterion_name VARCHAR(150) NOT NULL,
    score INT NOT NULL CHECK (score >= 1 AND score <= 5),
    weight NUMERIC(3, 2) DEFAULT 1.0,
    comments TEXT
);

-- 13. Communication Logs Table
CREATE TABLE communication_logs (
    id BIGSERIAL PRIMARY KEY,
    candidate_id BIGINT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    application_id BIGINT REFERENCES applications(id) ON DELETE SET NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('EMAIL', 'PHONE_CALL', 'NOTE', 'SYSTEM_UPDATE', 'OFFER_LETTER')),
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 14. Reminders Table
CREATE TABLE reminders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    application_id BIGINT REFERENCES applications(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    remind_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 15. Candidate Documents Table (Resumes, Portfolios, Certifications)
CREATE TABLE candidate_documents (
    id BIGSERIAL PRIMARY KEY,
    candidate_id BIGINT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    application_id BIGINT REFERENCES applications(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    storage_type VARCHAR(50) NOT NULL DEFAULT 'LOCAL', -- LOCAL, S3, CLOUDINARY
    storage_path VARCHAR(500) NOT NULL,
    document_category VARCHAR(50) DEFAULT 'RESUME' CHECK (document_category IN ('RESUME', 'COVER_LETTER', 'CERTIFICATE', 'PORTFOLIO', 'OFFER_LETTER', 'OTHER')),
    uploaded_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

