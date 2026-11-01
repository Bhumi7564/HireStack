# HireStack REST API Specification

All API endpoints are versioned under `/api/v1/`.

Interactive Swagger UI documentation is available at:
`http://localhost:8080/swagger-ui/index.html`

OpenAPI JSON specification is available at:
`http://localhost:8080/api-docs`

---

## 1. Authentication (`/api/v1/auth`)

### POST `/api/v1/auth/login`
- **Description**: Authenticate with email and password to receive a JWT bearer token.
- **Request Body**:
  ```json
  {
    "email": "recruiter@hirestack.io",
    "password": "password123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "accessToken": "eyJhbGciOi...",
      "tokenType": "Bearer",
      "id": 2,
      "companyId": 1,
      "email": "recruiter@hirestack.io",
      "firstName": "Marcus",
      "lastName": "Chen",
      "role": "ROLE_RECRUITER"
    }
  }
  ```

### GET `/api/v1/auth/me`
- **Description**: Retrieve authenticated user profile.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`

---

## 2. Job Openings (`/api/v1/jobs`)

### GET `/api/v1/jobs`
- **Parameters**: `department`, `location`, `status`, `search`, `page`, `size`, `sortBy`, `sortDirection`
- **Response**: `200 OK` with paginated job listings.

### POST `/api/v1/jobs`
- **Authorization**: `ROLE_HR_ADMIN`, `ROLE_RECRUITER`
- **Request Body**:
  ```json
  {
    "title": "Senior Backend Engineer",
    "department": "Engineering",
    "location": "San Francisco, CA / Remote",
    "employmentType": "FULL_TIME",
    "experienceLevel": "SENIOR_LEVEL",
    "description": "Lead distributed Java microservices development.",
    "requirements": "Java 17+, Spring Boot, PostgreSQL, Docker",
    "salaryRangeMin": 140000,
    "salaryRangeMax": 175000,
    "openingsCount": 2,
    "recruiterId": 1
  }
  ```

### PATCH `/api/v1/jobs/{id}/close`
- **Description**: Close a job opening requisition.

---

## 3. Candidates (`/api/v1/candidates`)

### GET `/api/v1/candidates`
- **Parameters**: `source`, `search`, `page`, `size`
- **Response**: `200 OK`

### POST `/api/v1/candidates`
- **Authorization**: `ROLE_HR_ADMIN`, `ROLE_RECRUITER`
- **Request Body**:
  ```json
  {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com",
    "phone": "+1-555-0199",
    "currentCompany": "Stripe",
    "currentTitle": "Staff Software Engineer",
    "experienceYears": 7.5,
    "location": "Seattle, WA",
    "skills": "Java, React, PostgreSQL, Kafka",
    "source": "LINKEDIN"
  }
  ```

---

## 4. Applications & Pipeline (`/api/v1/applications`)

### GET `/api/v1/applications/board`
- **Description**: Retrieve applications organized for the Kanban board view.
- **Parameters**: `jobId` (optional filter)

### POST `/api/v1/applications`
- **Description**: Submit a candidate application for a job requisition.
- **Request Body**:
  ```json
  {
    "jobId": 1,
    "candidateId": 2,
    "coverLetter": "Experienced software architect interested in role."
  }
  ```

### PATCH `/api/v1/applications/{id}/stage`
- **Description**: Advance or update pipeline stage with state transition verification.
- **Request Body**:
  ```json
  {
    "targetStage": "SCREENING",
    "reason": "Resume meets all technical requirements."
  }
  ```
- **Response**: `200 OK` on success, or `422 Unprocessable Entity` on invalid state transition.

### GET `/api/v1/applications/{id}/history`
- **Description**: Get full audit log of all stage transitions for an application.

---

## 5. Interviews (`/api/v1/interviews`)

### GET `/api/v1/interviews`
- **Parameters**: `status`, `search`, `page`, `size`

### GET `/api/v1/interviews/my-interviews`
- **Description**: Get interviews assigned to the authenticated panel member.

### POST `/api/v1/interviews`
- **Description**: Schedule interview with panel conflict checking.
- **Request Body**:
  ```json
  {
    "applicationId": 1,
    "title": "System Design Architecture Round",
    "interviewType": "VIDEO",
    "interviewRound": "TECHNICAL",
    "scheduledStartTime": "2026-11-05T14:00:00Z",
    "scheduledEndTime": "2026-11-05T15:00:00Z",
    "meetingLink": "https://meet.google.com/xyz-123",
    "interviewerUserIds": [4, 5]
  }
  ```

---

## 6. Feedback & Evaluation (`/api/v1/feedback`)

### POST `/api/v1/feedback`
- **Description**: Submit interview scorecard and recommendation.
- **Request Body**:
  ```json
  {
    "interviewId": 1,
    "overallRating": 5,
    "technicalSkillsRating": 5,
    "communicationRating": 4,
    "problemSolvingRating": 5,
    "culturalFitRating": 5,
    "recommendation": "STRONG_HIRE",
    "strengths": "Deep knowledge of concurrency and Spring Data JPA.",
    "weaknesses": "None observed.",
    "summaryComments": "Outstanding senior candidate."
  }
  ```

---

## 7. Analytics (`/api/v1/analytics`)

- `GET /api/v1/analytics/overview`: Key recruitment metrics and summary numbers.
- `GET /api/v1/analytics/pipeline`: Volume and percentage by stage for funnel graphs.
- `GET /api/v1/analytics/recruiters`: Recruiter workload, managed jobs, and hire rate.
- `GET /api/v1/analytics/time-to-hire`: Average days to fill positions.
- `GET /api/v1/analytics/source-effectiveness`: Candidate conversion rates by channel.

