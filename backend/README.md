# CrimePilot AI — National Crime Intelligence Command Center

CrimePilot AI is a premium, mission-critical digital crime intelligence and command center platform designed for police departments, investigators, and government security agencies. 

The project features a full suite of automated FIR logs, evidence indexing vaults, AI-powered predictive threat maps, an interactive Modus Operandi assistant, and multiple access gateways (Citizen, Officer, Analyst, and Admin).

---

## Project Structure

The project has been refactored into a professional MERN/Django monorepo layout:

```
CrimePilot/
│
├── backend/
│   ├── config/             # DB connection settings
│   ├── controllers/        # Express route logic
│   ├── middleware/         # Auth verification and audit log handlers
│   ├── models/             # Mongoose database schemas
│   ├── routes/             # Express API endpoints
│   ├── scripts/            # Database seeding scripts
│   ├── utils/              # PDF and document utilities
│   ├── uploads/            # Temporary evidence storage
│   ├── backend_django/     # Second backend service (Django Rest Framework)
│   ├── .env                # Server configurations
│   ├── package.json        # Node dependency manifest
│   ├── server.js           # Node app bootstrapper
│   └── README.md           # Backend documentation
│
├── frontend/
│   ├── src/                # React dashboard application
│   ├── public/             # Static public assets
│   ├── index.html          # HTML entry point
│   ├── vite.config.js      # Vite compilation and proxy configs
│   └── package.json        # Frontend package manifest
│
└── README.md               # Main repository documentation
```

---

## Technical Stack

### Backend
1. **Node.js & Express** — REST API routing, session tracking, and PDF compilation.
2. **Django Rest Framework (DRF)** — Database models for citizen portals, verification logs, and mail dispatches.
3. **MongoDB & Mongoose** — Case indexing, text keyword search, and aggregation pipelines.
4. **SQLite** — Relational database utilized by Django backend profiles.

### Frontend
1. **React** — Single page dashboard layouts.
2. **Vite** — Optimized frontend build and hot module replacement.
3. **Recharts** — Theme-unified light-cyan data visualization charts.

---

## Quick Start & Running Guide

### 1. Backend Setup & Start
Navigate to the `backend/` directory:
```bash
cd backend
```

Configure the environment variables by confirming `.env` values:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/crimegpt
JWT_SECRET=crimegpt_super_jwt_secret_key_2026
JWT_EXPIRE=30d
NODE_ENV=development
```

Install dependencies and run:
- **Production Mode:**
  ```bash
  npm start
  # or
  npm run server
  ```
- **Development Mode (Auto-Reload):**
  ```bash
  npm run dev
  ```

To seed the MongoDB database with initial stations, categories, and an administrator account:
```bash
npm run seed
```

---

### 2. Django Backend (Citizen & Verification Service)
Navigate to the Django application inside `backend/`:
```bash
cd backend/backend_django
```

Activate the python virtual environment and run the Django service:
```bash
# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Start Django Server (runs on http://127.0.0.1:8000/)
python manage.py runserver
```

---

### 3. Frontend Dashboard Setup & Start
Navigate to the `frontend/` directory:
```bash
cd frontend
```

Install packages and run:
```bash
npm install
npm run dev
```
The React frontend dashboard compiles and serves interactively at `http://localhost:3000/`. All API queries to `/api/*` are dynamically proxied to port `5000`.

---

## System Access Roles

| Role | Access Level | Portal Gateway Path |
|---|---|---|
| **Citizen** | Log complaints, track FIRs, upload evidence | `/citizen/login` |
| **Officer** | Manage assigned caseload, update status, check similarity | `/login` |
| **Analyst** | Hotspot analytics charts, forecast predictions, generate reports | `/login` |
| **Admin** | Configure system locations, verify citizen IDs, audit logs | `/login` |

---
*RESTRICTED USE — AUTHORIZED LAW ENFORCEMENT & INTELLIGENCE AGENCY PERSONNEL ONLY.*
