-- ============================================================
-- Migration 003: Add relationship & application_id to contacts
-- ============================================================

-- Add relationship column (was previously just stored in the title column)
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS relationship TEXT DEFAULT 'other'
    CHECK (relationship IN ('recruiter','hiring_manager','interviewer','employee','referral','other'));

-- Add application_id FK so contacts can be linked to a specific job
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES applications(id) ON DELETE SET NULL;

-- Backfill relationship from existing "relationship" field if it exists
-- (safe no-op if the old column was never populated)
UPDATE contacts SET relationship = 'other' WHERE relationship IS NULL;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_contacts_application_id ON contacts(application_id);
