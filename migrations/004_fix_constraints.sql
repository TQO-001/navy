-- ============================================================
-- Migration 004: Fix event_type constraint & doc_type values
-- ============================================================

-- ── FIX 1: application_events.event_type ───────────────────────────────────
-- The old CHECK only allowed a fixed list that excluded common UI values.
-- We drop and recreate with a superset that includes aliases used by the UI.
-- Note: phone_screen is NOT added here — the API normalises it to phone_call.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE application_events
  DROP CONSTRAINT IF EXISTS application_events_event_type_check;

ALTER TABLE application_events
  ADD CONSTRAINT application_events_event_type_check
  CHECK (event_type IN (
    'applied',
    'status_change',
    'note',
    'interview',
    'phone_call',
    'phone_screen',   -- legacy alias; API normalises new inserts to phone_call
    'email',
    'offer',
    'rejection',
    'follow_up',
    'other'
  ));

-- ── FIX 2: documents.doc_type ──────────────────────────────────────────────
-- The original CHECK constraint didn't include 'id_document' but the UI
-- presents it as a valid type. Add it so uploads don't fail with a constraint
-- violation when a user selects "ID Document".
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE documents
  DROP CONSTRAINT IF EXISTS documents_doc_type_check;

ALTER TABLE documents
  ADD CONSTRAINT documents_doc_type_check
  CHECK (doc_type IN (
    'resume',
    'cover_letter',
    'portfolio',
    'id_document',
    'reference',
    'other'
  ));

-- ── FIX 3: contacts — ensure updated_at exists ────────────────────────────
-- Some installations may be missing updated_at if they ran migration 003
-- but the original schema trigger was not applied. Safe no-op if it exists.
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Re-create the trigger so future updates stay consistent
DROP TRIGGER IF EXISTS set_updated_at_contacts ON contacts;
CREATE TRIGGER set_updated_at_contacts
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
