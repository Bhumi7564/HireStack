-- ====================================================================
-- Flyway Migration V4: Indexes for Performance and Analytics Queries
-- HireStack - Applicant Tracking & Recruitment Workflow
-- ====================================================================

-- Index for searching and filtering jobs
CREATE INDEX idx_jobs_company_status ON job_openings(company_id, status);
CREATE INDEX idx_jobs_department ON job_openings(department);
CREATE INDEX idx_jobs_recruiter ON job_openings(recruiter_id);

-- Index for candidate search
CREATE INDEX idx_candidates_company_email ON candidates(company_id, email);
CREATE INDEX idx_candidates_source ON candidates(source);
CREATE INDEX idx_candidates_skills ON candidates USING gin (to_tsvector('english', skills));

-- Indexes for application pipeline queries
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_stage ON applications(current_stage);
CREATE INDEX idx_applications_applied_date ON applications(applied_date);

-- Status history queries
CREATE INDEX idx_status_history_application ON application_status_history(application_id);
CREATE INDEX idx_status_history_date ON application_status_history(changed_at);

-- Interview lookup & scheduling conflict validation
CREATE INDEX idx_interviews_application ON interviews(application_id);
CREATE INDEX idx_interviews_status_schedule ON interviews(status, scheduled_start_time, scheduled_end_time);
CREATE INDEX idx_panel_interview_user ON interview_panel_members(interview_id, user_id);
CREATE INDEX idx_panel_user ON interview_panel_members(user_id);

-- Communication & Documents
CREATE INDEX idx_comm_candidate ON communication_logs(candidate_id);
CREATE INDEX idx_docs_candidate ON candidate_documents(candidate_id);

