-- ============================================================
-- Navy Database Schema — Migration 001: Initial Setup
-- Run: psql -U postgres -d navy -f migrations/001_initial.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  title         TEXT,
  phone         TEXT,
  location      TEXT,
  linkedin_url  TEXT,
  github_url    TEXT,
  portfolio_url TEXT,
  bio           TEXT,
  target_role   TEXT,
  target_salary_min INTEGER,
  target_salary_max INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COMPANIES
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  website    TEXT,
  industry   TEXT,
  size       TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- APPLICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id          UUID REFERENCES companies(id) ON DELETE SET NULL,
  company_name        TEXT NOT NULL,
  job_title           TEXT NOT NULL,
  job_url             TEXT,
  status              TEXT NOT NULL DEFAULT 'wishlist'
                      CHECK (status IN ('wishlist','applied','phone_screen','interview','offer','rejected','withdrawn','ghosted')),
  priority            TEXT NOT NULL DEFAULT 'medium'
                      CHECK (priority IN ('low','medium','high')),
  salary_min          INTEGER,
  salary_max          INTEGER,
  salary_currency     TEXT DEFAULT 'USD',
  location            TEXT,
  work_type           TEXT DEFAULT 'onsite'
                      CHECK (work_type IN ('onsite','remote','hybrid')),
  job_description     TEXT,
  application_date    DATE,
  deadline_date       DATE,
  next_follow_up_date DATE,
  notes               TEXT,
  cover_letter_used   BOOLEAN DEFAULT FALSE,
  source              TEXT,
  excitement_level    INTEGER CHECK (excitement_level BETWEEN 1 AND 5),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- APPLICATION TIMELINE EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS application_events (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  event_type     TEXT NOT NULL
                 CHECK (event_type IN ('applied','status_change','note','interview','phone_call','email','offer','rejection','follow_up','other')),
  title          TEXT NOT NULL,
  description    TEXT,
  event_date     TIMESTAMPTZ DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CONTACTS
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id     UUID REFERENCES companies(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  title          TEXT,
  email          TEXT,
  phone          TEXT,
  linkedin_url   TEXT,
  relationship   TEXT DEFAULT 'recruiter'
                 CHECK (relationship IN ('recruiter','hiring_manager','interviewer','employee','referral','other')),
  notes          TEXT,
  last_contacted TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  doc_type     TEXT NOT NULL
               CHECK (doc_type IN ('resume','cover_letter','portfolio','reference','other')),
  version      TEXT,
  storage_path TEXT,
  file_size    BIGINT DEFAULT 0,
  is_default   BOOLEAN DEFAULT FALSE,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status  ON applications(status);
CREATE INDEX IF NOT EXISTS idx_events_application   ON application_events(application_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id     ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_user_id    ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id    ON documents(user_id);

-- ============================================================
-- AUTO-UPDATE TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_companies
  BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_applications
  BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_contacts
  BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- SEED: Default admin user
-- Password: changeme123  — CHANGE IN PRODUCTION
-- ============================================================
INSERT INTO users (email, password_hash, name, title)
VALUES (
  'admin@navy.local',
  '$2b$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WrxJx/FeC9.aNKxkiYV2',
  'Admin',
  'Job Seeker'
) ON CONFLICT (email) DO NOTHING;
