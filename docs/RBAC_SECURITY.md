# HireStack Authentication and Role-Based Access Control (RBAC)

## 1. Authentication Architecture

HireStack employs a stateless JSON Web Token (JWT) architecture:

```
[ Client (React) ]
       |
       | 1. POST /api/v1/auth/login { email, password }
       v
[ Spring Security / AuthFilter ]
       |
       | 2. BCrypt.matches(rawPassword, storedHash)
       | 3. Generate Signed JWT (HMAC-SHA256, 24h Expiry)
       v
[ Client (React) ]
       |
       | 4. Stores JWT in localStorage
       | 5. Subsequent Requests: 'Authorization: Bearer <token>'
       v
[ JwtAuthenticationFilter ]
       |
       | 6. Validate Signature, Expiry, and Claims
       | 7. Populate SecurityContextHolder with CustomUserPrincipal
       v
[ Protected Service / Controller ]
```

---

## 2. Role Permissions Matrix

HireStack enforces three distinct hierarchical user roles:

| Feature / Operation | HR_ADMIN | RECRUITER | INTERVIEWER |
| :--- | :---: | :---: | :---: |
| **Manage Company Settings** | Yes | No | No |
| **User & Team Management** | Yes | No | No |
| **Create & Edit Job Openings** | Yes | Yes | No |
| **Close Job Openings** | Yes | Yes | No |
| **Register & Edit Candidates** | Yes | Yes | No |
| **Submit Applications to Jobs** | Yes | Yes | No |
| **Move Pipeline Stages** | Yes | Yes | No |
| **Schedule Interviews** | Yes | Yes | No |
| **View Assigned Interviews** | Yes | Yes | Yes |
| **Submit Feedback & Scores** | Yes | Yes | Yes |
| **Log Communication Notes** | Yes | Yes | No |
| **Access Recruitment Analytics** | Yes | Yes | No |
| **View Audit Trail History** | Yes | Yes | Yes |

---

## 3. Demo Accounts

All pre-seeded accounts have the password: **`password123`**

| Role | Email Address | Display Name | Permissions Scope |
| :--- | :--- | :--- | :--- |
| **HR Admin** | `admin@hirestack.io` | Elena Vance | Full system administrative access, team user management. |
| **Recruiter** | `recruiter@hirestack.io` | Marcus Chen | Job creation, candidate registration, pipeline moves, scheduling. |
| **Recruiter** | `sarah.recruiter@hirestack.io` | Sarah Jenkins | Talent acquisition, pipeline management. |
| **Interviewer** | `interviewer@hirestack.io` | Alex Rivera | Assigned interviews, candidate profiles, scorecard submission. |
| **Interviewer** | `david.tech@hirestack.io` | David Kowalski | Technical assessment panelist. |

