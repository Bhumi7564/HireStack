# HireStack System Architecture Documentation

## 1. High-Level Architectural Overview

HireStack is designed as a modular monolithic enterprise application following industry-standard multi-tier architectural patterns:

```
+-----------------------------------------------------------+
|                    React.js Frontend                      |
| (Vite, React Router DOM, Tailwind CSS, Recharts, Lucide)  |
+-----------------------------------------------------------+
                              |
                              | HTTP / JSON (JWT in Header)
                              v
+-----------------------------------------------------------+
|                 Spring Boot 3.x Backend                   |
|   +---------------------------------------------------+   |
|   | Controller Layer (REST Controllers, Swagger)      |   |
|   +---------------------------------------------------+   |
|   | Security & Filter Layer (JWT, BCrypt, RBAC)       |   |
|   +---------------------------------------------------+   |
|   | Service Layer (State Machine, Conflict Validation)|   |
|   +---------------------------------------------------+   |
|   | Data Access Layer (Spring Data JPA / Hibernate)   |   |
|   +---------------------------------------------------+   |
+-----------------------------------------------------------+
                              |
                              | JDBC Connection Pool (HikariCP)
                              v
+-----------------------------------------------------------+
|               PostgreSQL Relational Database              |
|        (Flyway Migrations, Constraints, GIN Indexes)      |
+-----------------------------------------------------------+
```

---

## 2. Layered Responsibilities

### Presentation Layer (React Frontend)
- Single Page Application (SPA) built with React and Vite.
- Responsive design crafted with Tailwind CSS for consistent SaaS aesthetics.
- Reactive state management using React Context API for user authentication and role verification.
- Asynchronous API communication via centralized Axios instance with automatic JWT injection and 401 interceptors.
- Interactive visualizations powered by Recharts for funnel dropoff and recruiter throughput.

### Controller Layer
- Exposes versioned RESTful endpoints under `/api/v1/`.
- Validates request payloads using Jakarta Bean Validation (`@Valid`, `@NotNull`, `@NotBlank`, `@Email`).
- Standardizes all success and error responses using `ApiResponse<T>` and `ErrorResponse`.

### Security Layer
- Stateless session management using Spring Security and JSON Web Tokens (JJWT).
- Role-Based Access Control (RBAC) enforced via `@PreAuthorize` annotations and request matchers.
- BCrypt password hashing (work factor 10) for credential storage.

### Service Layer (Business Logic)
- Encapsulates critical recruitment domain logic:
  - Application Pipeline State Machine (strict validation of allowed transitions from APPLIED to HIRED or REJECTED).
  - Interview scheduling conflict detection (verifies interviewer availability and time slots).
  - Audit logging for every application status change in `application_status_history`.
  - Transactional boundary protection (`@Transactional`) ensuring data consistency across multiple repository operations.

### Data Access Layer (Spring Data JPA)
- Hibernate 6.x Object-Relational Mapping (ORM).
- Repository abstractions providing standard CRUD and custom JPQL queries.
- Optimistic locking and indexed lookups for high query throughput.

### Persistence Layer (PostgreSQL)
- Schema versioning via Flyway database migration scripts (`V1` through `V5`).
- Multi-column unique constraints (e.g., `uq_job_candidate`, `uq_company_candidate_email`).
- Foreign key cascading and referential integrity protection.

