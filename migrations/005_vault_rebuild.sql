-- ============================================================
-- Migration 005: Vault Rebuild — new document schema columns
--
-- Strategy: ADD new columns alongside legacy ones.
-- Old columns (doc_type, storage_path, is_link, url) are kept
-- so existing data is not destroyed. New queries only use the
-- new columns; old data will show category = 'other'.
-- ============================================================

-- New column: file_url
--   Stores either a remote URL (for links) or a local storage
--   path for uploaded files. Replaces the old url / storage_path
--   split across two columns.
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS file_url TEXT;

-- New column: file_type
--   MIME type string (e.g. "application/pdf").
--   Replaces the vague doc_type column for type detection.
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS file_type TEXT;

-- New column: category
--   High-level grouping shown in the UI.
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS category TEXT
    CHECK (
      category IS NULL
      OR category IN ('resume', 'cover_letter', 'certificate', 'other')
    );

-- New column: application_id (FK to applications)
--   Lets a document be pinned to a specific job application.
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS application_id UUID
    REFERENCES applications(id) ON DELETE SET NULL;

-- ── Backfill existing rows so they surface cleanly in the UI ──────────────
-- Map old doc_type values to the new category enum
UPDATE documents
SET category = CASE
  WHEN doc_type = 'resume'       THEN 'resume'
  WHEN doc_type = 'cover_letter' THEN 'cover_letter'
  ELSE 'other'
END
WHERE category IS NULL;

-- Copy old url / storage_path into file_url so existing records
-- still have a value (storage_path takes precedence for local files)
UPDATE documents
SET file_url = COALESCE(storage_path, url)
WHERE file_url IS NULL
  AND (storage_path IS NOT NULL OR url IS NOT NULL);

-- ── Index for application-linked documents ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_documents_application_id
  ON documents(application_id);

CREATE INDEX IF NOT EXISTS idx_documents_user_category
  ON documents(user_id, category);
