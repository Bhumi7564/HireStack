-- ====================================================================
-- Flyway Migration V2: Create Interview Management Tables
-- HireStack - Applicant Tracking & Recruitment Workflow
-- ====================================================================

-- 8. Interviews Table
CREATE TABLE interviews (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    interview_type VARCHAR(50) NOT NULL DEFAULT 'VIDEO' CHECK (interview_type IN ('PHONE', 'VIDEO', 'IN_PERSON', 'TECHNICAL_ASSESSMENT')),
    interview_round VARCHAR(50) NOT NULL DEFAULT 'FIRST_ROUND' CHECK (interview_round IN ('SCREENING', 'FIRST_ROUND', 'TECHNICAL', 'MANAGERIAL', 'HR_ROUND', 'FINAL_ROUND')),
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED')),
    scheduled_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    meeting_link VARCHAR(500),
    location VARCHAR(255),
    notes TEXT,
    created_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_interview_time CHECK (scheduled_end_time > scheduled_start_time)
);

-- 9. Interview Panel Members Table (Assigning multiple interviewers to an interview)
CREATE TABLE interview_panel_members (
    id BIGSERIAL PRIMARY KEY,
    interview_id BIGINT NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'PRIMARY_INTERVIEWER',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_interview_panel_member UNIQUE (interview_id, user_id)
);

-- 10. Interview Feedback Table
CREATE TABLE interview_feedback (
    id BIGSERIAL PRIMARY KEY,
    interview_id BIGINT NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    interviewer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    overall_rating INT NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    technical_skills_rating INT CHECK (technical_skills_rating >= 1 AND technical_skills_rating <= 5),
    communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
    problem_solving_rating INT CHECK (problem_solving_rating >= 1 AND problem_solving_rating <= 5),
    cultural_fit_rating INT CHECK (cultural_fit_rating >= 1 AND cultural_fit_rating <= 5),
    recommendation VARCHAR(50) NOT NULL CHECK (recommendation IN ('STRONG_HIRE', 'HIRE', 'NEUTRAL', 'DO_NOT_HIRE', 'STRONG_DO_NOT_HIRE')),
    strengths TEXT,
    weaknesses TEXT,
    summary_comments TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_interview_feedback_submitter UNIQUE (interview_id, interviewer_id)
);

