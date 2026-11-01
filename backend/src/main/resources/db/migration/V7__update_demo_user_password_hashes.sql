-- ====================================================================
-- Flyway Migration V7: Update demo user password hashes
-- Valid BCrypt hash for password: password123
-- Generated using Spring Security BCryptPasswordEncoder (strength 10)
-- ====================================================================

UPDATE users
SET password_hash = '$2a$10$IN.v2ISgMBfIPogH4lNQbO55.SIuNw1Gsy/XKbg2pAzEfzRKHaKqm',
    updated_at = CURRENT_TIMESTAMP
WHERE email IN (
    'admin@hirestack.io',
    'recruiter@hirestack.io',
    'sarah.recruiter@hirestack.io',
    'interviewer@hirestack.io',
    'david.tech@hirestack.io'
);

