-- ====================================================================
-- Flyway Migration V8: Extra Dev Seed Data
-- Sequence-driven (no hardcoded primary keys) and fully idempotent.
-- Password for all demo accounts: password123
-- ====================================================================

-- 0. Synchronize database sequences with existing maximum IDs before inserting
SELECT setval('candidates_id_seq', (SELECT COALESCE(MAX(id), 1) FROM candidates));
SELECT setval('applications_id_seq', (SELECT COALESCE(MAX(id), 1) FROM applications));
SELECT setval('application_status_history_id_seq', (SELECT COALESCE(MAX(id), 1) FROM application_status_history));
SELECT setval('interviews_id_seq', (SELECT COALESCE(MAX(id), 1) FROM interviews));
SELECT setval('interview_panel_members_id_seq', (SELECT COALESCE(MAX(id), 1) FROM interview_panel_members));
SELECT setval('interview_feedback_id_seq', (SELECT COALESCE(MAX(id), 1) FROM interview_feedback));

-- 1. Extra Candidate accounts (PostgreSQL sequence allocates primary keys)
INSERT INTO candidates (company_id, first_name, last_name, email, phone, current_company, current_title, experience_years, location, skills, linkedin_url, source, notes, created_at, updated_at)
VALUES
(1, 'Priya',    'Nair',     'priya.nair@example.com',     '+1-555-2001', 'DataStream Inc',      'Data Engineer',            4.0, 'Atlanta, GA',   'Python, Spark, dbt, Airflow, PostgreSQL',            'https://linkedin.com/in/priya-nair',     'LINKEDIN',           'Strong pipeline experience with modern data stack.',     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Kevin',    'Park',     'kevin.park@example.com',     '+1-555-2002', 'StartupHub',          'Product Manager',          5.0, 'Seattle, WA',   'Product Strategy, Agile, Jira, SQL, Figma',          'https://linkedin.com/in/kevin-park',     'REFERRAL',           'Ex-Google APM, great cross-functional skills.',          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Emily',    'Torres',   'emily.torres@example.com',   '+1-555-2003', 'HealthTech Corp',     'Backend Engineer',         3.5, 'Dallas, TX',    'Java, Spring Boot, Kafka, Docker, MySQL',             'https://linkedin.com/in/emily-torres',   'CAREER_PORTAL',      'Solid backend fundamentals, eager for growth.',          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Rahul',    'Kapoor',   'rahul.kapoor@example.com',   '+1-555-2004', 'Finova Solutions',    'Cloud Architect',          8.0, 'Chicago, IL',   'AWS, Azure, Terraform, Kubernetes, Python',           'https://linkedin.com/in/rahul-kapoor',   'HEADHUNTER',         'Certified AWS Solutions Architect, multi-cloud exp.',     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Nina',     'Carlson',  'nina.carlson@example.com',   '+1-555-2005', 'UX Lab',              'Senior UX Researcher',     6.0, 'Portland, OR',  'User Research, Usability Testing, Figma, Sketch',    'https://linkedin.com/in/nina-carlson',   'LINKEDIN',           'Deep expertise in mixed methods research.',              CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Derek',    'Woo',      'derek.woo@example.com',      '+1-555-2006', 'DevCo',               'Senior DevOps Engineer',   7.0, 'San Jose, CA',  'Jenkins, GitHub Actions, Helm, Prometheus, Grafana',  'https://linkedin.com/in/derek-woo',      'INDEED',             'Specializes in CI/CD automation and SRE practices.',     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Aisha',    'Okafor',   'aisha.okafor@example.com',   '+1-555-2007', 'LearnSoft',           'Full Stack Developer',     4.5, 'Houston, TX',   'Vue.js, Node.js, MongoDB, GraphQL, Docker',           'https://linkedin.com/in/aisha-okafor',   'CAMPUS_RECRUITMENT', 'Full stack, strong focus on real-time systems.',         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Tom',      'Huang',    'tom.huang@example.com',      '+1-555-2008', 'Rapid Systems',       'iOS Developer',            5.5, 'San Francisco', 'Swift, SwiftUI, UIKit, CoreData, Firebase',           'https://linkedin.com/in/tom-huang',      'LINKEDIN',           'Published 3 apps in the App Store.',                     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Sara',     'Andersen', 'sara.andersen@example.com',  '+1-555-2009', 'Agile Corp',          'Scrum Master',             6.0, 'Remote',        'Scrum, Kanban, JIRA, SAFe, Facilitation',             'https://linkedin.com/in/sara-andersen',  'REFERRAL',           'Certified SAFe Agilist with 12 successful sprints.',     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Bruno',    'Lima',     'bruno.lima@example.com',     '+1-555-2010', 'GlobalSoft',          'Java Tech Lead',           9.0, 'Remote',        'Java 17, Spring Batch, Kafka, Redis, PostgreSQL',     'https://linkedin.com/in/bruno-lima',     'HEADHUNTER',         'Led migration of monolith to microservices at scale.',   CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (company_id, email) DO NOTHING;

-- 2. Extra Applications across stages (candidate_id dynamically resolved)
INSERT INTO applications (job_id, candidate_id, current_stage, applied_date, cover_letter, rating, created_at, updated_at)
VALUES
(2, (SELECT id FROM candidates WHERE email = 'priya.nair@example.com' AND company_id = 1),     'SCREENING', CURRENT_TIMESTAMP - INTERVAL '3 days',  'Strong pipeline background matching your DevOps needs.',       4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, (SELECT id FROM candidates WHERE email = 'kevin.park@example.com' AND company_id = 1),     'APPLIED',   CURRENT_TIMESTAMP - INTERVAL '2 days',  'Excited about the design challenges at HireStack.',            3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, (SELECT id FROM candidates WHERE email = 'emily.torres@example.com' AND company_id = 1),   'SCREENING', CURRENT_TIMESTAMP - INTERVAL '6 days',  'Java background aligns perfectly with your tech stack.',       4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, (SELECT id FROM candidates WHERE email = 'rahul.kapoor@example.com' AND company_id = 1),   'INTERVIEW', CURRENT_TIMESTAMP - INTERVAL '9 days',  'Years of cloud architecture experience to contribute.',        5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, (SELECT id FROM candidates WHERE email = 'nina.carlson@example.com' AND company_id = 1),   'OFFER',     CURRENT_TIMESTAMP - INTERVAL '15 days', 'UX research expertise to elevate your product design.',        5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, (SELECT id FROM candidates WHERE email = 'derek.woo@example.com' AND company_id = 1),      'HIRED',     CURRENT_TIMESTAMP - INTERVAL '22 days', 'DevOps background perfect for your infrastructure goals.',     5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, (SELECT id FROM candidates WHERE email = 'aisha.okafor@example.com' AND company_id = 1),   'REJECTED',  CURRENT_TIMESTAMP - INTERVAL '18 days', 'Frontend focus, exploring full-stack opportunities.',          2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, (SELECT id FROM candidates WHERE email = 'tom.huang@example.com' AND company_id = 1),      'APPLIED',   CURRENT_TIMESTAMP - INTERVAL '1 day',   'Mobile background, keen to transition to enterprise Java.',    3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, (SELECT id FROM candidates WHERE email = 'sara.andersen@example.com' AND company_id = 1),  'SCREENING', CURRENT_TIMESTAMP - INTERVAL '4 days',  'Agile leadership across 15+ engineering teams.',               4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, (SELECT id FROM candidates WHERE email = 'bruno.lima@example.com' AND company_id = 1),     'INTERVIEW', CURRENT_TIMESTAMP - INTERVAL '7 days',  'Tech lead experience aligns with your Staff Engineer role.',   5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (job_id, candidate_id) DO NOTHING;

-- 3. Status history for new applications (idempotent via WHERE NOT EXISTS)
INSERT INTO application_status_history (application_id, from_stage, to_stage, changed_by_user_id, change_reason, changed_at)
SELECT a.id, v.from_stage, v.to_stage, v.changed_by, v.reason, v.changed_at
FROM (
  VALUES
  ('priya.nair@example.com',   2, NULL,        'APPLIED',    2, 'Application received from LinkedIn referral',                  CURRENT_TIMESTAMP - INTERVAL '3 days'),
  ('priya.nair@example.com',   2, 'APPLIED',   'SCREENING',  2, 'Resume matched infrastructure profile requirements',           CURRENT_TIMESTAMP - INTERVAL '2 days'),
  ('kevin.park@example.com',   3, NULL,        'APPLIED',    3, 'Application submitted via career portal',                      CURRENT_TIMESTAMP - INTERVAL '2 days'),
  ('emily.torres@example.com', 1, NULL,        'APPLIED',    2, 'Received via career portal',                                   CURRENT_TIMESTAMP - INTERVAL '6 days'),
  ('emily.torres@example.com', 1, 'APPLIED',   'SCREENING',  2, 'Initial resume review passed',                                 CURRENT_TIMESTAMP - INTERVAL '5 days'),
  ('rahul.kapoor@example.com', 2, NULL,        'APPLIED',    2, 'Headhunter referral',                                          CURRENT_TIMESTAMP - INTERVAL '9 days'),
  ('rahul.kapoor@example.com', 2, 'APPLIED',   'SCREENING',  2, 'Cloud certification verified',                                 CURRENT_TIMESTAMP - INTERVAL '8 days'),
  ('rahul.kapoor@example.com', 2, 'SCREENING', 'INTERVIEW',  2, 'Passed phone screen with strong cloud design answers',         CURRENT_TIMESTAMP - INTERVAL '5 days'),
  ('nina.carlson@example.com', 3, NULL,        'APPLIED',    3, 'Applied via career portal',                                    CURRENT_TIMESTAMP - INTERVAL '15 days'),
  ('nina.carlson@example.com', 3, 'APPLIED',   'SCREENING',  3, 'Portfolio review scored 4.8/5',                               CURRENT_TIMESTAMP - INTERVAL '13 days'),
  ('nina.carlson@example.com', 3, 'SCREENING', 'INTERVIEW',  3, 'Excellent UX research exercise submission',                    CURRENT_TIMESTAMP - INTERVAL '10 days'),
  ('nina.carlson@example.com', 3, 'INTERVIEW', 'OFFER',      1, 'Strong panel recommendation; offer drafted and extended',      CURRENT_TIMESTAMP - INTERVAL '5 days'),
  ('derek.woo@example.com',    2, NULL,        'APPLIED',    2, 'Headhunter sourced candidate',                                 CURRENT_TIMESTAMP - INTERVAL '22 days'),
  ('derek.woo@example.com',    2, 'APPLIED',   'SCREENING',  2, 'DevOps skills verified',                                      CURRENT_TIMESTAMP - INTERVAL '20 days'),
  ('derek.woo@example.com',    2, 'SCREENING', 'INTERVIEW',  2, 'Cleared technical assessment with top score',                  CURRENT_TIMESTAMP - INTERVAL '17 days'),
  ('derek.woo@example.com',    2, 'INTERVIEW', 'OFFER',      1, 'Unanimous hire recommendation from panel',                     CURRENT_TIMESTAMP - INTERVAL '13 days'),
  ('derek.woo@example.com',    2, 'OFFER',     'HIRED',      1, 'Offer accepted. Start date confirmed.',                        CURRENT_TIMESTAMP - INTERVAL '8 days'),
  ('aisha.okafor@example.com', 1, NULL,        'APPLIED',    2, 'Application received',                                         CURRENT_TIMESTAMP - INTERVAL '18 days'),
  ('aisha.okafor@example.com', 1, 'APPLIED',   'SCREENING',  2, 'Reviewing candidate profile',                                  CURRENT_TIMESTAMP - INTERVAL '16 days'),
  ('aisha.okafor@example.com', 1, 'SCREENING', 'REJECTED',   2, 'Experience level does not match senior requirements',          CURRENT_TIMESTAMP - INTERVAL '14 days'),
  ('tom.huang@example.com',    4, NULL,        'APPLIED',    2, 'Application via career portal',                                CURRENT_TIMESTAMP - INTERVAL '1 day'),
  ('sara.andersen@example.com',4, NULL,        'APPLIED',    2, 'Application received',                                         CURRENT_TIMESTAMP - INTERVAL '4 days'),
  ('sara.andersen@example.com',4, 'APPLIED',   'SCREENING',  2, 'Agile certifications verified',                               CURRENT_TIMESTAMP - INTERVAL '3 days'),
  ('bruno.lima@example.com',   4, NULL,        'APPLIED',    2, 'Application from headhunter network',                          CURRENT_TIMESTAMP - INTERVAL '7 days'),
  ('bruno.lima@example.com',   4, 'APPLIED',   'SCREENING',  2, 'Impressive architecture portfolio',                            CURRENT_TIMESTAMP - INTERVAL '6 days'),
  ('bruno.lima@example.com',   4, 'SCREENING', 'INTERVIEW',  2, 'Cleared system design challenge with excellent score',         CURRENT_TIMESTAMP - INTERVAL '4 days')
) AS v(email, job_id, from_stage, to_stage, changed_by, reason, changed_at)
JOIN candidates c ON c.email = v.email AND c.company_id = 1
JOIN applications a ON a.candidate_id = c.id AND a.job_id = v.job_id
WHERE NOT EXISTS (
  SELECT 1 FROM application_status_history ash
  WHERE ash.application_id = a.id
    AND ash.to_stage = v.to_stage
    AND (ash.from_stage = v.from_stage OR (ash.from_stage IS NULL AND v.from_stage IS NULL))
);

-- 4. Extra Interviews (application_id dynamically resolved, sequence generates id)
INSERT INTO interviews (application_id, title, interview_type, interview_round, status, scheduled_start_time, scheduled_end_time, meeting_link, location, notes, created_by_user_id, created_at, updated_at)
SELECT a.id, v.title, v.itype, v.iround, v.status, v.start_time, v.end_time, v.meeting_link, v.location, v.notes, v.created_by, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
  VALUES
  ('rahul.kapoor@example.com', 2, 'Cloud Architecture System Design',        'VIDEO', 'TECHNICAL',   'SCHEDULED', CURRENT_TIMESTAMP + INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '1 hour',     'https://meet.google.com/cld-arch-456', 'Google Meet', 'Evaluate multi-region cloud design skills.',        2),
  ('bruno.lima@example.com',    4, 'Java Concurrency & Design Patterns',      'VIDEO', 'TECHNICAL',   'SCHEDULED', CURRENT_TIMESTAMP + INTERVAL '5 days', CURRENT_TIMESTAMP + INTERVAL '5 days' + INTERVAL '90 minutes',  'https://meet.google.com/jav-con-789',   'Google Meet', 'Deep-dive into Java concurrency and SOLID.',        2),
  ('nina.carlson@example.com',  3, 'UX Design Portfolio & Research Review',   'VIDEO', 'MANAGERIAL',  'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '1 hour',     'https://meet.google.com/ux-rev-111',    'Google Meet', 'Portfolio walk-through and cultural alignment.',   3),
  ('rahul.kapoor@example.com', 2, 'Hiring Manager Cultural Fit Interview',   'VIDEO', 'HR_ROUND',    'SCHEDULED', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP + INTERVAL '7 days' + INTERVAL '45 minutes',  'https://meet.google.com/hr-fit-222',    'Google Meet', 'Final cultural fit and compensation discussion.',  1)
) AS v(email, job_id, title, itype, iround, status, start_time, end_time, meeting_link, location, notes, created_by)
JOIN candidates c ON c.email = v.email AND c.company_id = 1
JOIN applications a ON a.candidate_id = c.id AND a.job_id = v.job_id
WHERE NOT EXISTS (
  SELECT 1 FROM interviews i WHERE i.application_id = a.id AND i.title = v.title
);

-- 5. Panel members for new interviews (linked dynamically by interview title)
INSERT INTO interview_panel_members (interview_id, user_id, role, assigned_at)
SELECT i.id, v.user_id, v.role, CURRENT_TIMESTAMP
FROM (
  VALUES
  ('Cloud Architecture System Design',      5, 'PRIMARY_INTERVIEWER'),
  ('Cloud Architecture System Design',      4, 'SECONDARY_INTERVIEWER'),
  ('Java Concurrency & Design Patterns',    4, 'PRIMARY_INTERVIEWER'),
  ('UX Design Portfolio & Research Review', 3, 'PRIMARY_INTERVIEWER'),
  ('UX Design Portfolio & Research Review', 1, 'HIRING_MANAGER'),
  ('Hiring Manager Cultural Fit Interview', 1, 'HIRING_MANAGER')
) AS v(interview_title, user_id, role)
JOIN interviews i ON i.title = v.interview_title
ON CONFLICT ON CONSTRAINT uq_interview_panel_member DO NOTHING;

-- 6. Feedback for the completed UX interview (linked dynamically by interview title)
INSERT INTO interview_feedback (interview_id, interviewer_id, overall_rating, technical_skills_rating, communication_rating, problem_solving_rating, cultural_fit_rating, recommendation, strengths, weaknesses, summary_comments, submitted_at, updated_at)
SELECT i.id, 3, 5, 4, 5, 5, 5, 'STRONG_HIRE',
  'Presented 3 compelling case studies with measurable impact. Strong user empathy.',
  'Could deepen quantitative analysis skills, but compensated by qualitative depth.',
  'Nina is a rare researcher who bridges empathy and business impact. Strong hire recommendation.',
  CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '2 hours', CURRENT_TIMESTAMP
FROM interviews i
WHERE i.title = 'UX Design Portfolio & Research Review'
ON CONFLICT ON CONSTRAINT uq_interview_feedback_submitter DO NOTHING;

-- 7. Synchronize sequences after batch inserts
SELECT setval('candidates_id_seq', (SELECT COALESCE(MAX(id), 1) FROM candidates));
SELECT setval('applications_id_seq', (SELECT COALESCE(MAX(id), 1) FROM applications));
SELECT setval('application_status_history_id_seq', (SELECT COALESCE(MAX(id), 1) FROM application_status_history));
SELECT setval('interviews_id_seq', (SELECT COALESCE(MAX(id), 1) FROM interviews));
SELECT setval('interview_panel_members_id_seq', (SELECT COALESCE(MAX(id), 1) FROM interview_panel_members));
SELECT setval('interview_feedback_id_seq', (SELECT COALESCE(MAX(id), 1) FROM interview_feedback));
