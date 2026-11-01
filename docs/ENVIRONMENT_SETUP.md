# HireStack Environment Setup & Upgrade Guide

## 1. Environment Inspection Findings

During the initial environment audit, the following local state was detected:
- **Installed Java**: Java 8 (`jdk1.8.0_202` at `C:\Program Files\Java\jdk1.8.0_202`).
- **Spring Boot 3 Requirement**: Spring Boot 3.3.x **strictly requires Java 17 or Java 21**. Running Spring Boot 3 on Java 8 will result in `UnsupportedClassVersionError: class file version 61.0`.
- **Maven**: Maven wrapper (`mvnw.cmd`) is included directly inside `backend/`, meaning no global Maven installation is necessary.
- **Node.js & npm**: Required for running the React Vite frontend development server.

---

## 2. Java 17/21 Upgrade Instructions

### Option A: Install via Windows Package Manager (`winget`) (Recommended)
Open PowerShell as Administrator or regular user and run:
```powershell
winget install EclipseAdoptium.Temurin.17.JDK
```
*Alternatively, install JDK 21:*
```powershell
winget install EclipseAdoptium.Temurin.21.JDK
```

### Option B: Direct Installer Download
1. Download the Eclipse Adoptium Temurin 17 (LTS) Windows x64 `.msi` installer from:
   [https://adoptium.net/temurin/releases/?version=17](https://adoptium.net/temurin/releases/?version=17)
2. Run the installer and ensure the feature **"Set JAVA_HOME variable"** is checked.
3. Verify in a new terminal window:
   ```cmd
   java -version
   ```
   *Expected output: `openjdk version "17.0.x"`*

---

## 3. PostgreSQL Database Setup

HireStack uses real persistent PostgreSQL storage with Flyway database version migrations.

### Step 1: Install PostgreSQL (if not already installed)
Install PostgreSQL 15 or 16:
```powershell
winget install PostgreSQL.PostgreSQL
```
*Or download the installer from:* [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)

### Step 2: Create the Database
Open `psql` or `pgAdmin` and execute:
```sql
CREATE DATABASE hirestack_db;
```

### Step 3: Configure Database Credentials
HireStack reads standard environment variables with sensible defaults:
- `DB_URL`: `jdbc:postgresql://localhost:5432/hirestack_db`
- `DB_USERNAME`: `postgres` (or your local Postgres user)
- `DB_PASSWORD`: `postgres` (or your local Postgres password)

You can set them in PowerShell before launching:
```powershell
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_password"
```

---

## 4. Node.js & npm Setup (Frontend)

To run the React frontend:
```powershell
winget install OpenJS.NodeJS.LTS
```
*Verify installation:*
```cmd
node -v
npm -v
```

---

## 5. Running the Application

### Step 1: Start the Backend (Spring Boot)
Open a terminal in `HireStack/backend`:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
*Flyway will automatically detect PostgreSQL, create all 15 relational tables, apply indexes, and seed realistic demo data on the first start.*

- Backend API: `http://localhost:8080/api/v1`
- Swagger UI Documentation: `http://localhost:8080/swagger-ui/index.html`

### Step 2: Start the Frontend (React + Vite)
Open a separate terminal in `HireStack/frontend`:
```powershell
cd frontend
npm install
npm run dev
```
- Frontend Web App: `http://localhost:5173`

---

## 6. Running Tests

### Backend Tests
```powershell
cd backend
.\mvnw.cmd test
```

### Frontend Build Verification
```powershell
cd frontend
npm run build
```

