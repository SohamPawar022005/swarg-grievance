# FastAPI Backend for Swarg Grievance

This backend serves complaint data from PostgreSQL and matches the existing frontend API contract in `src/services/database.ts`.

## 1) Setup

```bash
cd backend_fastapi
c:/Users/aarya/OneDrive/Desktop/dashboardso/.venv/Scripts/python.exe -m pip install -r requirements.txt
```

## 2) Environment

Create `backend_fastapi/.env` from `.env.example` and set:

- `DATABASE_URL`
- `API_HOST`
- `API_PORT`
- `API_PREFIX`
- `CORS_ORIGINS`

If your root `.env` already has `DATABASE_URL`, backend can read it as well.

## 3) Run

```bash
cd backend_fastapi
c:/Users/aarya/OneDrive/Desktop/dashboardso/.venv/Scripts/python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 5000
```

## 4) Health Checks

- `GET http://127.0.0.1:5000/api/health`
- `GET http://127.0.0.1:5000/api/health/db`

## 5) Supported APIs

- `GET /api/complaints`
- `GET /api/complaints/search?q=...`
- `GET /api/complaints/stats`
- `GET /api/complaints/{session_id}`
- `GET /api/complaints/{session_id}/logs`
- `GET /api/complaints/{session_id}/route`
- `GET /api/complaints/{complaint_id}/audit-logs`
- `POST /api/complaints`
- `PUT /api/complaints/{session_id}`
- `POST /api/complaints/{session_id}/logs`

## Notes about schema changes

No schema migration is executed automatically by this backend. Use `sql/proposed_schema.sql` only after explicit approval.
