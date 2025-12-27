# Backend Development Plan — Floating Squirrel Peek

## 1️⃣ Executive Summary
This project builds the backend for the **Anesthesia Risk Assessment** application. The current frontend operates as a Single Page Application (SPA) with local storage; the backend will replace this persistence layer with a robust, secure API.

**Why:** To enable secure user authentication, persistent patient records across sessions/devices, and centralized audit logging.

**Constraints:**
- **Framework:** FastAPI (Python 3.13, async)
- **Database:** MongoDB Atlas (using Motor & Pydantic v2)
- **Infrastructure:** No Docker, local dev only
- **Git:** Single branch `main`
- **Testing:** Manual UI verification per task

**Plan:** 4 Sprints (S0–S3) to transition from LocalStorage to Cloud DB.

---

## 2️⃣ In-Scope & Success Criteria

**In-Scope Features:**
- **User Authentication:** Signup, Login, Logout (JWT).
- **Patient Management:** Create, Read (List/Detail), Update (Demographics, History, Airway, Notes).
- **Risk Assessment Persistence:** Saving calculated recommendations and toggle states.
- **Audit Logging:** Persisting the frontend-generated audit trail.

**Success Criteria:**
- Frontend successfully communicates with `/api/v1/*` endpoints.
- User data persists in MongoDB Atlas between browser refreshes.
- "Save Patient Data" button triggers a backend update.
- Audit logs are stored in the database.
- All tasks verified via manual UI testing.

---

## 3️⃣ API Design

**Base Path:** `/api/v1`
**Error Format:** `{ "error": "Descriptive message" }`

### **Auth**
- `POST /auth/signup`
  - **Purpose:** Register new clinician.
  - **Body:** `{ "email": "...", "password": "..." }`
- `POST /auth/login`
  - **Purpose:** Authenticate and receive JWT.
  - **Body:** `{ "username": "email", "password": "..." }` (OAuth2PasswordRequestForm)
- `GET /users/me`
  - **Purpose:** Get current user context.
- `POST /auth/logout`
  - **Purpose:** Clear session (client-side token removal).

### **Patients**
- `GET /patients`
  - **Purpose:** List summaries for "Select Patient" dropdown.
  - **Response:** `[{ "id": "...", "demographics": { "name": "...", "age": ... } }]`
- `POST /patients`
  - **Purpose:** Create a new empty or initial patient.
  - **Body:** Partial `PatientData`.
- `GET /patients/{id}`
  - **Purpose:** Load full patient details for dashboard.
- `PUT /patients/{id}`
  - **Purpose:** Save full patient state (including calculated risks/notes).
  - **Body:** Full `PatientData` object.

### **Audit Logs**
- `GET /patients/{id}/audit-logs`
  - **Purpose:** Get history for specific patient.
- `POST /patients/{id}/audit-logs`
  - **Purpose:** Append frontend actions (e.g., "Recommendation Toggled").
  - **Body:** `{ "action": "...", "details": "...", "timestamp": "..." }`

---

## 4️⃣ Data Model (MongoDB Atlas)

### **Collection: `users`**
- `email` (string, unique, required)
- `hashed_password` (string, required)
- `created_at` (datetime, default: now)

### **Collection: `patients`**
- `_id` (ObjectId, maps to `demographics.id` logic)
- `owner_id` (ObjectId, reference to `users`)
- `demographics` (Object)
  - `name`, `dob`, `age`, `gender`, `heightCm`, `weightKg`, `bmi`
- `medicalHistory` (Object)
  - `conditions` (List[str]), `surgeries` (List[str]), etc.
- `airwayExam` (Object)
  - `mallampatiScore`, `thyromentalDistanceCm`, etc.
- `clinicianNotes` (String)
- `recommendations` (List[Object]) — *Stores state of checked items*
- `created_at` (datetime)
- `updated_at` (datetime)

**Example:**
```json
{
  "owner_id": "507f1f77bcf86cd799439011",
  "demographics": { "name": "Alice", "age": 49 },
  "clinicianNotes": "Stable"
}
```

### **Collection: `audit_logs`**
- `patient_id` (ObjectId, indexed)
- `user_id` (ObjectId, reference to `users`)
- `action` (string)
- `details` (string)
- `timestamp` (datetime)

---

## 5️⃣ Frontend Audit & Feature Map

| Component | Feature | Backend Need | Auth Required |
|-----------|---------|--------------|---------------|
| `PatientDashboard` | Load Data (Init) | `GET /patients/{id}` | Yes |
| `PatientDashboard` | Save Data | `PUT /patients/{id}` | Yes |
| `PatientDashboard` | New Patient | `POST /patients` | Yes |
| `PatientSelector` | List Patients | `GET /patients` | Yes |
| `PatientDashboard` | Audit Trail | `GET /patients/{id}/audit-logs` | Yes |
| `PatientDashboard` | Log Action | `POST /patients/{id}/audit-logs` | Yes |

---

## 6️⃣ Configuration & ENV Vars

- `APP_ENV`: `development`
- `PORT`: `8000`
- `MONGODB_URI`: `mongodb+srv://...`
- `JWT_SECRET`: `...`
- `JWT_EXPIRES_IN`: `86400` (1 day)
- `CORS_ORIGINS`: `http://localhost:5173` (Vite default)

---

## 9️⃣ Testing Strategy (Manual via Frontend)

**Approach:**
1. Run Backend (`uvicorn`).
2. Run Frontend (`npm run dev`).
3. Perform UI action -> Verify Network Tab -> Verify UI feedback.

**Example Loop:**
- **Task:** Implement Login.
- **Manual Test:** Enter credentials -> Click Login.
- **Verification:** Check DevTools `Application > Local Storage` for Token; Redirection to Dashboard.

---

## 🔟 Dynamic Sprint Plan & Backlog

---

## 🧱 S0 – Environment Setup & Frontend Connection

**Objectives:**
- Initialize FastAPI project structure.
- Connect to MongoDB Atlas.
- Configure CORS and Environment.

**Tasks:**
- **Init Project & Git:**
  - Create `backend/` folder (virtualenv, requirements.txt).
  - Create `.gitignore`.
  - Initialize Git repo.
  - *Manual Test:* `git status` shows clean slate.
  - *User Test Prompt:* "Check that the repository is initialized."

- **FastAPI Skeleton & Health:**
  - Create `main.py` with `app`, CORS, and `/healthz` endpoint (pings DB).
  - *Manual Test:* Visit `http://localhost:8000/healthz` -> returns `{"status": "ok", "db": "connected"}`.
  - *User Test Prompt:* "Start the backend and hit /healthz in the browser."

**Definition of Done:**
- Backend running on port 8000.
- Connected to remote MongoDB.
- Code pushed to `main`.

---

## 🧩 S1 – Basic Auth (Signup / Login / Logout)

**Objectives:**
- Secure the application.
- Replace "Mock User" in Audit Logs with real user identity.

**Tasks:**
- **User Model & DB:**
  - Define `User` Pydantic model and Mongo collection.
  - *Manual Test:* N/A (code only).

- **Signup Endpoint:**
  - `POST /api/v1/auth/signup`.
  - Hashes password (Argon2).
  - *Manual Test:* Use Swagger UI or curl to create a user. Check Mongo Atlas collection.
  - *User Test Prompt:* "Create a user via Swagger UI and confirm it appears in the database."

- **Login Endpoint (JWT):**
  - `POST /api/v1/auth/login`.
  - Returns `access_token`.
  - *Manual Test:* Use Swagger UI to login -> get Token.
  - *User Test Prompt:* "Login via Swagger UI and copy the access token."

- **Frontend Auth Integration (Instruction):**
  - *Note:* Frontend currently lacks a login screen. Create a simple `LoginPage.tsx` and route.
  - Update `App.tsx` to protect the dashboard route.
  - *Manual Test:* Open App -> Redirected to Login -> Login -> Redirected to Dashboard.
  - *User Test Prompt:* "Open the app. Confirm you are forced to login before seeing the dashboard."

**Definition of Done:**
- User can sign up and log in via UI.
- Protected routes block unauthenticated access.
- Code pushed to `main`.

---

## 🚀 S2 – Patient Management (CRUD)

**Objectives:**
- Replace LocalStorage persistence with MongoDB.
- Enable "Save Patient" and "Load Patient".

**Tasks:**
- **Patient Models:**
  - replicate `PatientData` interface in Pydantic.
  - *Manual Test:* N/A.

- **Create/Save Patient API:**
  - `POST /api/v1/patients` (create new).
  - `PUT /api/v1/patients/{id}` (update).
  - *Manual Test:* Click "Save Patient Data" -> 200 OK. Reload page -> Data persists (requires Load API).
  - *User Test Prompt:* "Click 'Save' in the UI. Check Network tab for successful request."

- **List & Load API:**
  - `GET /api/v1/patients` (list for selector).
  - `GET /api/v1/patients/{id}` (full load).
  - *Manual Test:* Open "Load Patient" dropdown -> see list from DB. Select one -> Form fills.
  - *User Test Prompt:* "Refresh page. Open the patient selector and confirm your saved patient is listed."

- **Frontend Integration:**
  - Update `PatientDashboard.tsx` to call APIs instead of `localStorage`.
  - Update `PatientSelector.tsx` to fetch from API.
  - *Manual Test:* Full cycle: Create -> Edit -> Save -> Refresh -> Load.
  - *User Test Prompt:* "Perform a full patient lifecycle: Create, Edit details, Save, Refresh page, Load patient."

**Definition of Done:**
- Patient data is stored in MongoDB.
- LocalStorage usage for `anesthesia_risk_patient_data` is removed/deprecated.
- Code pushed to `main`.

---

## 📜 S3 – Audit Logging & Final Polish

**Objectives:**
- Persist the audit trail.
- Ensure all actions are traceable.

**Tasks:**
- **Audit API:**
  - `POST /api/v1/patients/{id}/audit-logs` (append).
  - `GET /api/v1/patients/{id}/audit-logs` (fetch).
  - *Manual Test:* Perform an action (e.g., toggle recommendation). Check DB `audit_logs` collection.
  - *User Test Prompt:* "Toggle a recommendation in the UI. Check the Audit Trail tab to see if it fetched the new log."

- **Frontend Audit Integration:**
  - Update `auditLog.ts` to call API instead of LocalStorage.
  - *Manual Test:* Clear browser cache. Load patient. Audit log should still appear.
  - *User Test Prompt:* "Clear your browser data. Login and load a patient. Confirm the audit history is preserved from the server."

**Definition of Done:**
- Audit trail is persistent and tied to real Users.
- Project is feature-complete per MVP scope.
- Final push to `main`.