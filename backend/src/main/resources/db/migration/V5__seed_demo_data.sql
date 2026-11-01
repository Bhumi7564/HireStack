-- ====================================================================
-- Flyway Migration V5: Comprehensive Seed Data for Demonstration
-- Password for all demo accounts: password123
-- BCrypt Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- ====================================================================

-- 1. Insert Sample Company
INSERT INTO companies (id, name, industry, website, description, location, created_at, updated_at)
VALUES (1, 'HireStack Global Technologies', 'Information Technology & Software', 'https://hirestack.io', 'Leading cloud and distributed recruitment software enterprise.', 'San Francisco, CA / Remote', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Insert Users (HR Admin, Recruiters, Interviewers)
INSERT INTO users (id, company_id, email, password_hash, first_name, last_name, role, phone, active, created_at, updated_at)
VALUES 
(1, 1, 'admin@hirestack.io', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Elena', 'Vance', 'ROLE_HR_ADMIN', '+1-555-0101', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 'recruiter@hirestack.io', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Marcus', 'Chen', 'ROLE_RECRUITER', '+1-555-0102', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 'sarah.recruiter@hirestack.io', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sarah', 'Jenkins', 'ROLE_RECRUITER', '+1-555-0103', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 1, 'interviewer@hirestack.io', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Alex', 'Rivera', 'ROLE_INTERVIEWER', '+1-555-0104', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 1, 'david.tech@hirestack.io', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'David', 'Kowalski', 'ROLE_INTERVIEWER', '+1-555-0105', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. Insert Recruiters Profile
INSERT INTO recruiters (id, user_id, company_id, department, title, max_active_jobs, created_at, updated_at)
VALUES
(1, 2, 1, 'Engineering & Product', 'Senior Technical Recruiter', 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 3, 1, 'Design & Operations', 'Talent Acquisition Partner', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. Insert Job Openings
INSERT INTO job_openings (id, company_id, recruiter_id, title, department, location, employment_type, experience_level, description, requirements, responsibilities, salary_range_min, salary_range_max, status, openings_count, posted_date, created_at, updated_at)
VALUES
(1, 1, 1, 'Senior Full-Stack Engineer (Java & React)', 'Engineering', 'Remote / US', 'FULL_TIME', 'SENIOR_LEVEL', 'Build high-performance web applications, scalable REST APIs, and responsive React frontend systems.', 'Java 17+, Spring Boot, PostgreSQL, React, TypeScript, Docker, Microservices knowledge.', 'Design and implement robust backend services; collaborate with product team; review peer code.', 130000.00, 165000.00, 'OPEN', 2, CURRENT_DATE - 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 1, 'Cloud DevOps Architect', 'Infrastructure', 'Austin, TX / Hybrid', 'FULL_TIME', 'LEAD_LEVEL', 'Design cloud infrastructure, CI/CD pipelines, Kubernetes clusters and monitoring infrastructure.', 'AWS/GCP, Terraform, Kubernetes, Helm, CI/CD with GitHub Actions, Linux administration.', 'Maintain 99.99% uptime; implement automated staging and deployment workflows; enhance security posture.', 145000.00, 180000.00, 'OPEN', 1, CURRENT_DATE - 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 2, 'Senior Product Designer (UI/UX)', 'Product Design', 'New York, NY / Hybrid', 'FULL_TIME', 'SENIOR_LEVEL', 'Lead product design initiatives, establish unified design system, and craft intuitive recruitment flows.', 'Figma mastery, Design Systems, UX research, interactive prototyping, user empathy.', 'Create responsive web mockups; conduct usability tests; collaborate with engineers.', 115000.00, 140000.00, 'OPEN', 1, CURRENT_DATE - 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 1, 1, 'Staff Backend Systems Engineer', 'Engineering', 'San Francisco, CA', 'FULL_TIME', 'LEAD_LEVEL', 'Architect high-throughput transactional distributed systems with strict latency requirements.', 'High-concurrency Java/Kotlin, PostgreSQL tuning, Kafka, Redis, Distributed consensus.', 'Architect database schema migrations; optimize query performance; mentor junior engineers.', 160000.00, 200000.00, 'OPEN', 1, CURRENT_DATE - 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 1, 2, 'Talent Operations Coordinator', 'Human Resources', 'Remote', 'FULL_TIME', 'ENTRY_LEVEL', 'Support candidate coordination, interview scheduling, and recruitment pipeline integrity.', 'Strong communication, organization, spreadsheet expertise, ATS familiarity.', 'Schedule interviews; coordinate with hiring managers; maintain candidate records.', 60000.00, 75000.00, 'CLOSED', 1, CURRENT_DATE - 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 5. Insert Candidates
INSERT INTO candidates (id, company_id, first_name, last_name, email, phone, current_company, current_title, experience_years, location, skills, linkedin_url, source, notes, created_at, updated_at)
VALUES
(1, 1, 'Aarav', 'Sharma', 'aarav.sharma@example.com', '+1-555-1101', 'CloudScale Inc', 'Senior Software Engineer', 6.5, 'Seattle, WA', 'Java, Spring Boot, React, PostgreSQL, Docker, AWS', 'https://linkedin.com/in/aarav-sharma-dev', 'LINKEDIN', 'Strong background in enterprise microservices and React dashboards.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 'Maya', 'Patel', 'maya.patel@example.com', '+1-555-1102', 'NextGen Systems', 'DevOps Specialist', 5.0, 'Denver, CO', 'Kubernetes, Terraform, AWS, Docker, Python, Jenkins', 'https://linkedin.com/in/maya-patel-cloud', 'REFERRAL', 'Referred by David Kowalski. Solid Kubernetes operational experience.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 'Liam', 'O''Connor', 'liam.oconnor@example.com', '+1-555-1103', 'Creative Studio 9', 'Lead UX Designer', 7.0, 'Brooklyn, NY', 'Figma, Design Systems, UX Research, Prototyping, CSS', 'https://linkedin.com/in/liam-ux-design', 'CAREER_PORTAL', 'Exceptional portfolio showcasing enterprise dashboard UX redesigns.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 1, 'Sophia', 'Tanaka', 'sophia.tanaka@example.com', '+1-555-1104', 'Apex Data Corp', 'Full Stack Developer', 4.5, 'San Jose, CA', 'JavaScript, TypeScript, React, Node.js, PostgreSQL', 'https://linkedin.com/in/sophia-tanaka', 'INDEED', 'Excellent frontend state management and clean component architecture.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 1, 'James', 'Wilson', 'james.wilson@example.com', '+1-555-1105', 'FinTech Dynamics', 'Principal Java Developer', 10.0, 'Chicago, IL', 'Java, Spring Cloud, Kafka, PostgreSQL, Distributed Systems', 'https://linkedin.com/in/james-wilson-tech', 'HEADHUNTER', 'High concurrency specialist, extensive fintech experience.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 1, 'Chloe', 'Dubois', 'chloe.dubois@example.com', '+1-555-1106', 'Global Logistics Lab', 'Software Engineer', 3.0, 'Boston, MA', 'Java, Spring Boot, MySQL, REST APIs', 'https://linkedin.com/in/chloe-dubois', 'CAMPUS_RECRUITMENT', 'Quick learner, high GPA in Computer Science.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 1, 'Lucas', 'Mendez', 'lucas.mendez@example.com', '+1-555-1107', 'CloudNet Solutions', 'SRE / Systems Engineer', 4.0, 'Austin, TX', 'Linux, Docker, Terraform, Prometheus, Grafana', 'https://linkedin.com/in/lucas-mendez', 'LINKEDIN', 'Experienced in telemetry and infrastructure monitoring.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 1, 'Zoe', 'Kaufman', 'zoe.kaufman@example.com', '+1-555-1108', 'Enterprise Portal LLC', 'Full Stack Engineer', 5.5, 'Remote, OR', 'React, Java, Spring Boot, GraphQL, TailwindCSS', 'https://linkedin.com/in/zoe-kaufman', 'REFERRAL', 'Well rounded across full stack with strong UI aesthetics.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 6. Insert Applications (Demonstrating all 6 pipeline stages)
INSERT INTO applications (id, job_id, candidate_id, current_stage, applied_date, cover_letter, rating, created_at, updated_at)
VALUES
(1, 1, 1, 'INTERVIEW', CURRENT_TIMESTAMP - INTERVAL '10 days', 'Excited about HireStack''s mission and modern tech stack. I have 6+ years shipping production Spring Boot and React services.', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 2, 'OFFER', CURRENT_TIMESTAMP - INTERVAL '12 days', 'Strong alignment with your Kubernetes and infrastructure automation goals.', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 3, 3, 'HIRED', CURRENT_TIMESTAMP - INTERVAL '25 days', 'Passionate about creating human-centric recruitment tools with clean typography.', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 1, 4, 'SCREENING', CURRENT_TIMESTAMP - INTERVAL '5 days', 'Looking to transition my strong React and backend foundation to enterprise scale.', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 4, 5, 'INTERVIEW', CURRENT_TIMESTAMP - INTERVAL '7 days', 'I specialize in low latency Java architectures and look forward to scaling your backend.', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 1, 6, 'REJECTED', CURRENT_TIMESTAMP - INTERVAL '14 days', 'Enthusiastic junior engineer looking for opportunities.', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 2, 7, 'SCREENING', CURRENT_TIMESTAMP - INTERVAL '4 days', 'Background in SRE and Terraform infrastructure.', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 1, 8, 'APPLIED', CURRENT_TIMESTAMP - INTERVAL '1 day', 'I love building intuitive web experiences with React and Spring Boot.', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 7. Insert Status History for Audit Trail
INSERT INTO application_status_history (application_id, from_stage, to_stage, changed_by_user_id, change_reason, changed_at)
VALUES
(1, NULL, 'APPLIED', 2, 'Initial application submitted', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(1, 'APPLIED', 'SCREENING', 2, 'Resume meets all requirements for Senior role', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(1, 'SCREENING', 'INTERVIEW', 2, 'Candidate cleared initial recruiter phone screen', CURRENT_TIMESTAMP - INTERVAL '5 days'),

(2, NULL, 'APPLIED', 2, 'Referred application received', CURRENT_TIMESTAMP - INTERVAL '12 days'),
(2, 'APPLIED', 'SCREENING', 2, 'Approved by recruiter', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(2, 'SCREENING', 'INTERVIEW', 2, 'Passed technical panel with high remarks', CURRENT_TIMESTAMP - INTERVAL '6 days'),
(2, 'INTERVIEW', 'OFFER', 1, 'Offer letter prepared and extended to candidate', CURRENT_TIMESTAMP - INTERVAL '2 days'),

(3, NULL, 'APPLIED', 3, 'Candidate applied via career portal', CURRENT_TIMESTAMP - INTERVAL '25 days'),
(3, 'APPLIED', 'SCREENING', 3, 'Portfolio review successful', CURRENT_TIMESTAMP - INTERVAL '22 days'),
(3, 'SCREENING', 'INTERVIEW', 3, 'Design whiteboard interview passed', CURRENT_TIMESTAMP - INTERVAL '18 days'),
(3, 'INTERVIEW', 'OFFER', 3, 'Offer approved', CURRENT_TIMESTAMP - INTERVAL '12 days'),
(3, 'OFFER', 'HIRED', 1, 'Offer accepted. Onboarding initiated.', CURRENT_TIMESTAMP - INTERVAL '3 days'),

(6, NULL, 'APPLIED', 2, 'Application received', CURRENT_TIMESTAMP - INTERVAL '14 days'),
(6, 'APPLIED', 'SCREENING', 2, 'Reviewing candidate experience', CURRENT_TIMESTAMP - INTERVAL '12 days'),
(6, 'SCREENING', 'REJECTED', 2, 'Role requires 5+ years senior experience; candidate notified politely', CURRENT_TIMESTAMP - INTERVAL '10 days');

-- 8. Insert Interviews
INSERT INTO interviews (id, application_id, title, interview_type, interview_round, status, scheduled_start_time, scheduled_end_time, meeting_link, location, notes, created_by_user_id, created_at, updated_at)
VALUES
(1, 1, 'Technical Deep Dive: Spring Boot Architecture', 'VIDEO', 'TECHNICAL', 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '1 hour', 'https://meet.google.com/abc-hire-xyz', 'Google Meet', 'Assess concurrency, database tuning, and API design.', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 'Managerial & Cultural Alignment', 'VIDEO', 'MANAGERIAL', 'SCHEDULED', CURRENT_TIMESTAMP + INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '45 minutes', 'https://meet.google.com/mgr-hire-123', 'Google Meet', 'Discussion with Engineering Director regarding team culture and leadership.', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 5, 'Distributed Systems System Design', 'VIDEO', 'TECHNICAL', 'SCHEDULED', CURRENT_TIMESTAMP + INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '1 hour', 'https://meet.google.com/sys-des-789', 'Google Meet', 'System architecture: Kafka, partition keys, idempotency.', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 9. Insert Interview Panel Members
INSERT INTO interview_panel_members (interview_id, user_id, role)
VALUES
(1, 4, 'PRIMARY_INTERVIEWER'),
(1, 5, 'SECONDARY_INTERVIEWER'),
(2, 1, 'HIRING_MANAGER'),
(3, 5, 'PRIMARY_INTERVIEWER');

-- 10. Insert Interview Feedback
INSERT INTO interview_feedback (id, interview_id, interviewer_id, overall_rating, technical_skills_rating, communication_rating, problem_solving_rating, cultural_fit_rating, recommendation, strengths, weaknesses, summary_comments, submitted_at, updated_at)
VALUES
(1, 1, 4, 5, 5, 4, 5, 5, 'STRONG_HIRE', 'Deep mastery of Spring Boot transactions, JPA indexing, and React concurrency hooks. Excellent code structure.', 'Could elaborate more on distributed tracing with OpenTelemetry.', 'Aarav is an exceptional senior candidate. Highly recommended for the team.', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '2 hours', CURRENT_TIMESTAMP);

-- 11. Insert Evaluation Templates
INSERT INTO evaluation_templates (id, company_id, title, department, description, criteria_json, active, created_at, updated_at)
VALUES
(1, 1, 'Standard Software Engineering Rubric', 'Engineering', 'Comprehensive evaluation for frontend, backend, and full-stack software engineers.', '{"criteria": ["Data Structures & Algorithms", "System Architecture & Design", "Clean Code & Best Practices", "Communication & Collaboration"]}', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 12. Insert Evaluation Scores
INSERT INTO evaluation_scores (feedback_id, criterion_name, score, weight, comments)
VALUES
(1, 'System Architecture & Design', 5, 1.0, 'Designed a clean, resilient database schema with caching.'),
(1, 'Clean Code & Best Practices', 5, 1.0, 'Followed SOLID principles and test-driven mindset.'),
(1, 'Communication & Collaboration', 4, 1.0, 'Articulated trade-offs clearly.');

-- 13. Insert Communication Logs
INSERT INTO communication_logs (candidate_id, application_id, user_id, type, subject, content, logged_at)
VALUES
(1, 1, 2, 'EMAIL', 'Invitation to Technical Interview - Senior Full-Stack Engineer', 'Hi Aarav, we were impressed by your background and would like to invite you to our 60-minute technical interview.', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(1, 1, 2, 'PHONE_CALL', 'Recruiter Pre-screen Discussion', 'Discussed salary expectations, remote setup, and notice period (2 weeks). Candidate is enthusiastic.', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(2, 2, 2, 'OFFER_LETTER', 'Official Offer of Employment - Cloud DevOps Architect', 'Formal offer letter extended with competitive package and sign-on bonus.', CURRENT_TIMESTAMP - INTERVAL '2 days');

-- 14. Insert Reminders
INSERT INTO reminders (user_id, application_id, title, description, remind_at, completed)
VALUES
(2, 1, 'Send managerial interview prep details to Aarav', 'Ensure interview link and attendee list are sent 24 hours prior.', CURRENT_TIMESTAMP + INTERVAL '12 hours', false),
(2, 2, 'Follow up on Offer Letter acceptance for Maya Patel', 'Check in regarding benefits and start date confirmation.', CURRENT_TIMESTAMP + INTERVAL '1 day', false);

-- 15. Insert Candidate Documents Metadata
INSERT INTO candidate_documents (candidate_id, application_id, file_name, file_type, file_size_bytes, storage_type, storage_path, document_category, uploaded_by_user_id, uploaded_at)
VALUES
(1, 1, 'Aarav_Sharma_Resume_2026.pdf', 'application/pdf', 142850, 'LOCAL', 'uploads/resumes/aarav_sharma_resume.pdf', 'RESUME', 2, CURRENT_TIMESTAMP - INTERVAL '10 days'),
(2, 2, 'Maya_Patel_Cloud_Certifications.pdf', 'application/pdf', 285400, 'LOCAL', 'uploads/resumes/maya_patel_certifications.pdf', 'CERTIFICATE', 2, CURRENT_TIMESTAMP - INTERVAL '12 days'),
(3, 3, 'Liam_OConnor_UX_Case_Studies.pdf', 'application/pdf', 419200, 'LOCAL', 'uploads/resumes/liam_oconnor_portfolio.pdf', 'PORTFOLIO', 3, CURRENT_TIMESTAMP - INTERVAL '25 days');

-- Synchronize database sequences
SELECT setval('companies_id_seq', (SELECT MAX(id) FROM companies));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('recruiters_id_seq', (SELECT MAX(id) FROM recruiters));
SELECT setval('job_openings_id_seq', (SELECT MAX(id) FROM job_openings));
SELECT setval('candidates_id_seq', (SELECT MAX(id) FROM candidates));
SELECT setval('applications_id_seq', (SELECT MAX(id) FROM applications));
SELECT setval('application_status_history_id_seq', (SELECT MAX(id) FROM application_status_history));
SELECT setval('interviews_id_seq', (SELECT MAX(id) FROM interviews));
SELECT setval('interview_panel_members_id_seq', (SELECT MAX(id) FROM interview_panel_members));
SELECT setval('interview_feedback_id_seq', (SELECT MAX(id) FROM interview_feedback));
SELECT setval('evaluation_templates_id_seq', (SELECT MAX(id) FROM evaluation_templates));
SELECT setval('evaluation_scores_id_seq', (SELECT MAX(id) FROM evaluation_scores));
SELECT setval('communication_logs_id_seq', (SELECT MAX(id) FROM communication_logs));
SELECT setval('reminders_id_seq', (SELECT MAX(id) FROM reminders));
SELECT setval('candidate_documents_id_seq', (SELECT MAX(id) FROM candidate_documents));

