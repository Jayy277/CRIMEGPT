# CrimeGPT — Backend API Service

CrimeGPT is a comprehensive Crime Management System backend built with **Node.js, Express, MongoDB (Mongoose), and JWT Authentication**. It supports role-based access control (RBAC) across three distinct user roles: `officer`, `analyst`, and `admin`.

---

## Technical Stack
- **Node.js & Express.js** — REST API infrastructure
- **MongoDB & Mongoose** — Document schemas, indexes, and aggregation pipelines
- **JWT (JSON Web Tokens)** — Authentication with role claims
- **bcryptjs** — Secure password hashing
- **Multer** — Integrated structure for file and evidence uploads
- **PDFKit** — Dynamic PDF document generation for case reports

---

## Installation & Setup

1. **Prerequisites**
   Ensure you have [Node.js](https://nodejs.org/) installed and a [MongoDB](https://www.mongodb.com/) instance running locally on `mongodb://localhost:27017/`.

2. **Clone/Navigate to Project and Install Dependencies**
   ```bash
   cd J:\CrimeGPT
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory (already done by the setup script):
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/crimegpt
   JWT_SECRET=crimegpt_super_jwt_secret_key_2026
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

4. **Seed the Database**
   Pre-populates locations, crime categories, legal sections, and a default system administrator.
   ```bash
   npm run seed
   ```
   **Default Admin Account Created:**
   - **Email:** `admin@crimegpt.com`
   - **Password:** `Admin@123`

5. **Start the Server**
   - **Development mode (auto-reload):** `npm run dev`
   - **Production mode:** `npm start`

6. **Run Automated Verification Tests**
   Exercises all controllers, middleware, status logic, and custom features:
   ```bash
   npm test
   ```

---

## Highlighted Custom Features

### 🌟 Custom Feature A: Crime-Type Based Legal Sections
- **Endpoint:** `GET /api/crime-categories/:id/sections`
- **Mechanism:** In the database, each `CrimeCategory` (e.g. Theft, Fraud) stores an array of corresponding acts/sections (BNS, BNSS, BSA). When registering/editing a case, the officer selects the Crime Type, causing the frontend to load this endpoint and populate the legal section dropdown list. Selected sections are saved directly on the crime case document.

### 🌟 Custom Feature B: Pending Case Red-Dot Flag
- **Endpoint:** `GET /api/crimes/pending`
- **Mechanism:** The `Crime` model implements a mongoose virtual property `isPending` that dynamically evaluates as `true` if the status is anything other than `'Solved'` or `'Closed'`. The `/api/crimes/pending` route returns all cases matching this criteria so the UI can flag them with a red dot.

### 🌟 Custom Feature C: Similar / Related Case Finder
- **Endpoint:** `GET /api/crimes/:id/similar`
- **Mechanism:** Uses a custom-weighted proximity algorithm that queries other cases and ranks similarity based on:
  - Same crime type (Category) = **Weight: 5**
  - Jurisdiction proximity (Police Station = **Weight: 4**, City = **Weight: 3**, District = **Weight: 2**)
  - Date proximity (Within 30 days = **Weight: 3**, Within 90 days = **Weight: 1**)
  - Textual description matches (Compares sanitized keywords, **Weight: 1** per matching word)
  Returns a ranked list of matched case IDs along with specific similarity reasons (e.g. `"Same crime type + same city"`).

---

## API Route Documentation

All API endpoints are documented below with required permissions, headers, and request body formats.

### 1. Authentication
* **POST** `/api/auth/login`
  * **Description:** Log in with email/username.
  * **Payload:** `{ "usernameOrEmail": "admin@crimegpt.com", "password": "Admin@123" }`
  * **Response:** JWT token, user object, and profile details.
* **POST** `/api/auth/signup`
  * **Description:** Register new staff (officers/analysts). **Admin Only.**
  * **Headers:** `Authorization: Bearer <AdminToken>`
  * **Payload (Officer):** 
    ```json
    {
      "name": "Officer Name",
      "email": "officer@crimegpt.com",
      "password": "Password123",
      "role": "officer",
      "badgeNo": "BADGE-5001",
      "station": "603f90f23d4e8c14f0a0d1aa", // Location ID
      "contact": "9876543210"
    }
    ```
  * **Payload (Analyst):** 
    ```json
    {
      "name": "Analyst Name",
      "email": "analyst@crimegpt.com",
      "password": "Password123",
      "role": "analyst",
      "department": "Cyber Crime Intelligence Unit"
    }
    ```
* **POST** `/api/auth/forgot-password`
  * **Description:** Request password reset token.
  * **Payload:** `{ "email": "officer@crimegpt.com" }`
* **POST** `/api/auth/reset-password/:token`
  * **Description:** Reset password using the token retrieved.
  * **Payload:** `{ "password": "NewSecurePassword123" }`

### 2. Crime Cases Management
* **POST** `/api/crimes`
  * **Description:** Register a new case. Automatically triggers "New Case Assigned" notification and "High Priority Alert" if priority is High or Critical.
  * **Headers:** `Authorization: Bearer <Officer/AdminToken>`
  * **Payload:**
    ```json
    {
      "crimeCategory": "603f90f23d4e8c14f0a0d1aa", // Category ID
      "date": "2026-07-01",
      "time": "22:15",
      "location": "603f90f23d4e8c14f0a0d2bb", // Location ID
      "description": "Smart phone snatching from a pedestrian at a bus stop.",
      "officer": "603f90f23d4e8c14f0a0d3cc", // Officer ID
      "priority": "Medium",
      "sections": [
        { "act": "BNS", "section": "305", "description": "Theft" }
      ]
    }
    ```
* **GET** `/api/crimes`
  * **Description:** List cases with optional search/filters (`?crimeId=`, `?priority=`, `?status=`, `?suspectName=`, `?search=`, `?assignedOnly=true`).
  * **Headers:** `Authorization: Bearer <UserToken>`
* **GET** `/api/crimes/pending` *(Custom Feature B)*
  * **Description:** Fetch all cases with status other than Solved/Closed. Includes virtual `isPending`.
* **GET** `/api/crimes/:id`
  * **Description:** Retrieve details of a specific case by ID.
* **PUT** `/api/crimes/:id`
  * **Description:** Edit case details. Officers can edit only cases assigned to them; Admins can edit all.
* **PATCH** `/api/crimes/:id/status`
  * **Description:** Progress investigation status strictly. Flow order: `Reported` → `Assigned` → `Under Investigation` → `Evidence Collected` → `Solved` → `Closed`.
  * **Payload:** `{ "status": "Assigned" }`
* **PATCH** `/api/crimes/:id/close-solved`
  * **Description:** Shortcut to mark status as Solved or Closed.
  * **Payload:** `{ "status": "Solved" }`
* **POST** `/api/crimes/:id/notes`
  * **Description:** Append case notes or timeline events.
  * **Payload:** `{ "note": "Added search warrant details." }`
* **GET** `/api/crimes/:id/similar` *(Custom Feature C)*
  * **Description:** Retrieve top 10 related past cases based on proximity and textual similarity.
* **DELETE** `/api/crimes/:id`
  * **Description:** Hard delete a case. **Admin Only.**

### 3. Suspects & Victims Management
* **POST** `/api/suspects`
  * **Description:** Create suspect profile. Automatically scans and bidirectionally syncs previous cases of suspects with the same name.
  * **Payload:**
    ```json
    {
      "name": "Suspect Name",
      "age": 28,
      "gender": "Male",
      "address": "456 Gangster Road, District A",
      "status": "Suspect",
      "linkedCrime": "603f90f23d4e8c14f0a0d4dd" // Case ID
    }
    ```
* **GET** `/api/suspects`
  * **Description:** List suspect records. Supports `?name=`, `?status=`, `?linkedCrime=`.
* **PUT** `/api/suspects/:id`
  * **Description:** Edit suspect profile.
* **DELETE** `/api/suspects/:id`
  * **Description:** Delete suspect profile.

* **POST** `/api/victims`
  * **Description:** Add victim record to a case.
  * **Payload:**
    ```json
    {
      "name": "Victim Name",
      "contact": "8888888888",
      "statement": "Statement taken by officer on site.",
      "evidenceReference": "Knife marks verified.",
      "linkedCrime": "603f90f23d4e8c14f0a0d4dd"
    }
    ```
* **GET** `/api/victims` / **PUT** `/api/victims/:id` / **DELETE** `/api/victims/:id`
  * **Description:** Standard operations for victim records.

### 4. Evidence Management
* **POST** `/api/evidence`
  * **Description:** Add evidence record. Supports file upload.
  * **Headers:** `Authorization: Bearer <Token>`
  * **Payload (Multipart Form):** `type`, `description`, `collectionDate`, `assignedOfficer`, `linkedCrime`, `file` (optional binary upload)
* **GET** `/api/evidence` / **PUT** `/api/evidence/:id` / **DELETE** `/api/evidence/:id`
  * **Description:** Standard operations for evidence metadata.

### 5. Dashboards & Reports
* **GET** `/api/dashboard/officer`
  * **Description:** Retrieve assigned case metrics and 5 latest cases for the logged-in officer.
* **GET** `/api/dashboard/analyst`
  * **Description:** Retrieve advanced MongoDB aggregations (Monthly trends, hotspot stations, top categories, peak hours).
* **GET** `/api/dashboard/admin`
  * **Description:** Retrieve general user counts and case completion ratios.
* **GET** `/api/dashboard/report`
  * **Description:** Fetch report list as JSON or download PDF.
  * **Params:** `?startDate=2026-06-01&endDate=2026-07-01&format=pdf` (supports downloading dynamic PDFs).

### 6. Notifications
* **GET** `/api/notifications`
  * **Description:** Get unread and read alerts for the logged-in user.
* **PATCH** `/api/notifications/read-all`
  * **Description:** Bulk mark all notifications as read.
* **PATCH** `/api/notifications/:id/read`
  * **Description:** Mark single notification as read.

### 7. Administrative Controls (Admin Only)
* **GET** `/api/admin/users` — List and search all staff.
* **PUT** `/api/admin/users/:id` — Update staff roles/profiles.
* **PATCH** `/api/admin/users/:id/toggle-active` — Deactivate or activate accounts.
* **GET** `/api/admin/staff-search` — Query officers by badge and analysts by department.
* **GET** `/api/admin/logs` — View system login histories, status changes, and user updates from the `AuditLog` collection.
