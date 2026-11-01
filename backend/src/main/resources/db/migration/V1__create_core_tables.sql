-- ====================================================================
-- Flyway Migration V1: Create Core Recruitment Tables
-- HireStack - Applicant Tracking & Recruitment Workflow
-- ====================================================================

-- 1. Companies Table
CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Users Table (Authentication and RBAC)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ROLE_HR_ADMIN', 'ROLE_RECRUITER', 'ROLE_INTERVIEWER')),
    phone VARCHAR(50),
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Recruiters Table
CREATE TABLE recruiters (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    department VARCHAR(100),
    title VARCHAR(100),
    max_active_jobs INT DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Job Openings Table
CREATE TABLE job_openings (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    recruiter_id BIGINT REFERENCES recruiters(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    employment_type VARCHAR(50) NOT NULL DEFAULT 'FULL_TIME',
    experience_level VARCHAR(50) NOT NULL DEFAULT 'MID_LEVEL',
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    salary_range_min NUMERIC(12, 2),
    salary_range_max NUMERIC(12, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('DRAFT', 'OPEN', 'PAUSED', 'CLOSED')),
    openings_count INT DEFAULT 1 NOT NULL,
    posted_date DATE DEFAULT CURRENT_DATE,
    closing_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Candidates Table
CREATE TABLE candidates (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    current_company VARCHAR(150),
    current_title VARCHAR(150),
    experience_years NUMERIC(4, 1) DEFAULT 0.0,
    location VARCHAR(150),
    skills TEXT,
    linkedin_url VARCHAR(255),
    source VARCHAR(100) DEFAULT 'CAREER_PORTAL',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_company_candidate_email UNIQUE (company_id, email)
);

-- 6. Applications Table
CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL REFERENCES job_openings(id) ON DELETE CASCADE,
    candidate_id BIGINT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    current_stage VARCHAR(50) NOT NULL DEFAULT 'APPLIED' CHECK (current_stage IN ('APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED')),
    applied_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    cover_letter TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    rejection_reason TEXT,
    hired_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_job_candidate UNIQUE (job_id, candidate_id)
);

-- 7. Application Status History Table
CREATE TABLE application_status_history (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    from_stage VARCHAR(50),
    to_stage VARCHAR(50) NOT NULL,
    changed_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    change_reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

