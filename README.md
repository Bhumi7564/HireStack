# HIRESTACK – Full-Stack Applicant Tracking & Recruitment Workflow Platform

[![Spring Boot 3.3.4](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java 17](https://img.shields.io/badge/Java-17%2B-orange.svg)](https://adoptium.net/)
[![React 18](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791.svg)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 1. Executive Summary

**HireStack** is a modern, enterprise-grade Applicant Tracking System (ATS) and recruitment workflow management platform. Developed as a comprehensive full-stack solution, HireStack centralizes the entire hiring lifecycle—from job requisition creation and candidate sourcing to multi-round interview scheduling, evaluator feedback rubrics, candidate communication logs, and real-time recruitment intelligence.

---

## 2. Technology Stack

### Backend
- **Framework**: Spring Boot 3.3.4
- **Language**: Java 17 LTS
- **Security**: Spring Security 6 with stateless JWT (HMAC-SHA256) & BCrypt password hashing
- **Persistence**: Spring Data JPA & Hibernate 6.x
- **Database**: PostgreSQL with Flyway database migration scripts
- **API Documentation**: SpringDoc OpenAPI 2.6.0 (Swagger UI)
- **Build Tool**: Maven Wrapper (`mvnw` / `mvnw.cmd`)
- **Testing**: JUnit 5, Mockito, Spring Boot Test

### Frontend
- **Framework**: React 18.3 with Vite
- **Styling**: Tailwind CSS (Modern Slate & Navy enterprise SaaS aesthetic)
- **HTTP Client**: Axios with centralized authorization interceptors and error handlers
- **Routing**: React Router DOM 6.27
- **Analytics & Data Visualizations**: Recharts
- **Iconography**: Lucide React

---

## 3. System Architecture

HireStack follows a modular multi-tier architecture with clean separation of concerns:

```
[ React 18 Web Client ]  <--- HTTP / JSON / JWT Header --->  [ Spring Boot 3 REST API ]
  - Vite SPA                                                   - Controllers (/api/v1/)
  - Context Auth Provider                                      - JWT AuthenticationFilter
  - Kanban Pipeline Board                                      - Pipeline State Machine
  - Recharts Visualizations                                    - Conflict Detection
                                                               - Spring Data JPA
                                                                       |
                                                                       v
                                                           [ PostgreSQL Database ]
                                                             - 15 Relational Tables
                                                             - Flyway Schema Migrations
                                                             - GIN Search Indexes
```

---

## 4. Key Functional Phases

### Phase 1: Hiring Core Setup
- **Company Management**: Multi-tenant company profile and data isolation.
- **Recruiter Profiles**: Link company users to recruiter workloads and capacity limits.
- **Job Requisitions**: Full CRUD, department and location tagging, salary bands, and status lifecycle (`DRAFT`, `OPEN`, `PAUSED`, `CLOSED`).
- **Candidate Talent Pool**: Sourcing channel tracking (`LINKEDIN`, `REFERRAL`, `CAREER_PORTAL`, `INDEED`, `HEADHUNTER`), resume skills parsing, duplicate candidate email prevention.
- **Application Intake**: Link candidates to jobs, duplicate application detection (`uq_job_candidate`), cover letters, and ratings.

### Phase 2: Recruitment Pipeline & Interview Flow
- **Kanban Pipeline Board**: Interactive visual board spanning `APPLIED` -> `SCREENING` -> `INTERVIEW` -> `OFFER` -> `HIRED` / `REJECTED`.
- **Strict State Machine**: Enforces valid stage progression, rejecting invalid transitions with `422 Unprocessable Entity`.
- **Complete Audit Trail**: Every status move records previous stage, new stage, user who performed the transition, reason, and exact timestamp in `application_status_history`.
- **Interview Scheduling**: Multi-round interview coordination (`SCREENING`, `FIRST_ROUND`, `TECHNICAL`, `MANAGERIAL`, `HR_ROUND`, `FINAL_ROUND`).
- **Conflict Validation Engine**: Automatically verifies interviewer schedules to prevent double-booking.

### Phase 3: Evaluation, Communication & Documents
- **Interviewer Feedback Rubric**: Evaluates candidates across 1-5 ratings for technical depth, problem-solving, communication, and cultural alignment, with recommendations (`STRONG_HIRE`, `HIRE`, `NEUTRAL`, `DO_NOT_HIRE`, `STRONG_DO_NOT_HIRE`).
- **Candidate Communications**: Log candidate touchpoints (`EMAIL`, `PHONE_CALL`, `NOTE`, `OFFER_LETTER`).
- **Follow-up Reminders**: Task checklists with completion checkboxes for recruiters.
- **Document Management**: Configurable storage abstraction (`StorageService` interface with `LocalStorageService`, AWS S3, and Cloudinary adapters) for resumes and portfolios.

### Phase 4: Recruitment Intelligence & Analytics
- **Live Funnel Conversion**: Dropoff analysis across all hiring stages.
- **Recruiter Productivity Leaderboard**: Workload tracking, active requisitions, candidate interviews, and hire ratios.
- **Time-to-Hire Velocity**: Calculation of average days taken from application submission to hire.
- **Source Channel ROI**: Channel conversion rate percentages from application to final offer acceptance.

---

## 5. Seed Data & Demo Credentials

The database migration `V5__seed_demo_data.sql` pre-populates realistic data. All accounts use the standard password: **`password123`**

| Role | Email | Name | Capabilities |
| :--- | :--- | :--- | :--- |
| **HR Admin** | `admin@hirestack.io` | Elena Vance | Full administration, user management, company settings. |
| **Recruiter** | `recruiter@hirestack.io` | Marcus Chen | Job postings, candidate management, pipeline moves, scheduling. |
| **Recruiter** | `sarah.recruiter@hirestack.io` | Sarah Jenkins | Talent acquisition partner. |
| **Interviewer**| `interviewer@hirestack.io` | Alex Rivera | Assigned interviews, candidate reviews, scorecard submissions. |
| **Interviewer**| `david.tech@hirestack.io` | David Kowalski | Technical interview panelist. |

*Quick login buttons are available directly on the login screen for one-click testing.*

---

## 6. Setup & Execution Instructions

### Prerequisites
1. **Java 17 or Java 21**: If Java 8 is installed, follow [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md) to install JDK 17 via `winget install EclipseAdoptium.Temurin.17.JDK`.
2. **PostgreSQL**: Running locally on port `5432`.
3. **Node.js**: v18+ or v20+ with npm.

### Step 1: Initialize Database
In PostgreSQL:
```sql
CREATE DATABASE hirestack_db;
```

### Step 2: Start Spring Boot Backend
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
*Flyway executes migrations automatically, applying schemas `V1` through `V5` and seeding records into `hirestack_db`.*

- **Backend API Base**: `http://localhost:8080/api/v1`
- **Swagger Documentation**: `http://localhost:8080/swagger-ui/index.html`

### Step 3: Start React Frontend
In a new terminal:
```powershell
cd frontend
npm install
npm run dev
```
- **Web Application**: `http://localhost:5173`

---

## 7. Automated Testing Suite

To run backend unit and integration tests (testing pipeline transitions, duplicate detection, scheduling conflict checks, and analytics):
```powershell
cd backend
.\mvnw.cmd test
```

To build production frontend distribution:
```powershell
cd frontend
npm run build
```

---

## 8. Project Structure

```
HireStack/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/hirestack/
│   │   │   │   ├── analytics/          # Recruitment intelligence & KPIs
│   │   │   │   ├── application/        # Pipeline state machine & audit logs
│   │   │   │   ├── auth/               # User entities, JWT auth, user management
│   │   │   │   ├── candidate/          # Candidate pool & unique constraints
│   │   │   │   ├── common/             # Global exception handlers & DTOs
│   │   │   │   ├── company/            # Multi-tenant company entity & service
│   │   │   │   ├── communication/      # Communication logs & task reminders
│   │   │   │   ├── config/             # Security, CORS, and OpenAPI configs
│   │   │   │   ├── document/           # Document storage abstraction (Local/S3/Cloudinary)
│   │   │   │   ├── feedback/           # Interview evaluations, rubrics & scores
│   │   │   │   ├── interview/          # Scheduling engine & conflict checks
│   │   │   │   ├── job/                # Job requisitions CRUD & closing
│   │   │   │   ├── recruiter/          # Recruiter profiles & capacity
│   │   │   │   ├── security/           # JWT provider & UserDetailsService
│   │   │   │   └── HireStackApplication.java
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── application-dev.yml
│   │   │       └── db/migration/       # Flyway V1 to V5 SQL scripts
│   │   └── test/java/com/hirestack/    # JUnit 5 & Mockito test suite
│   ├── mvnw & mvnw.cmd                 # Maven wrapper scripts
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── api/axios.js                # Centralized Axios with JWT interceptors
│   │   ├── components/                 # Reusable UI components & layouts
│   │   ├── context/AuthContext.jsx     # Authentication & RBAC state
│   │   ├── pages/                      # Dashboard, Jobs, Candidates, Pipeline, etc.
│   │   ├── App.jsx                     # Protected routing configuration
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── docs/                               # Architecture, ER diagram, API docs, RBAC, Setup
├── .env.example
├── .gitignore
└── README.md
```

---

## 9. GitHub Submission Guidelines

To push HireStack to GitHub:
```powershell
git init
git add .
git commit -m "feat: complete full-stack HireStack recruitment and applicant tracking platform"
git branch -M main
git remote add origin https://github.com/<your-username>/HireStack.git
git push -u origin main
```
*Note: Secrets and passwords are kept in environment variables and `.env.example`. Real credentials are never committed.*

