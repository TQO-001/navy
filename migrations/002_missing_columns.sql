-- ============================================================
-- Migration 002: Add missing columns to documents and contacts
-- ============================================================

-- documents: add is_link and url
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS is_link BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS url     TEXT;

-- contacts: add plain-text company and role
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS role    TEXT;

-- Backfill role from title for existing rows
UPDATE contacts SET role = title WHERE role IS NULL AND title IS NOT NULL;
