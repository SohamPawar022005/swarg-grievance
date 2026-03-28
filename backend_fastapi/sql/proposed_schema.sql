-- Proposed schema to support all backend endpoints.
-- IMPORTANT: Do not run this without explicit approval.

CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  transcript TEXT NOT NULL,
  language_code VARCHAR(16),
  language_name VARCHAR(64),
  urgency_level VARCHAR(32),
  urgency_score DOUBLE PRECISION,
  keywords TEXT,
  department_assigned VARCHAR(128),
  department_confidence DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaints_session_id ON complaints(session_id);

CREATE TABLE IF NOT EXISTS complaint_logs (
  id SERIAL PRIMARY KEY,
  complaint_id INT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  status VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaint_logs_session_id ON complaint_logs(session_id);

CREATE TABLE IF NOT EXISTS complaint_routes (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  department VARCHAR(128) NOT NULL,
  route_confidence DOUBLE PRECISION,
  routing_keywords TEXT,
  routed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaint_routes_session_id ON complaint_routes(session_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  complaint_id INT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  actor VARCHAR(128) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_complaint_id ON audit_logs(complaint_id);
