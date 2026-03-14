// ─────────────────────────────────────────────────────────────────────────────
// src/lib/db/queries/documents.ts
// Vault document queries — written against the schema added in migration 005.
// ─────────────────────────────────────────────────────────────────────────────
import sql from "@/lib/db"
import type { Document, CreateDocumentInput, DocumentCategory } from "@/types"

// ── Row shape returned by SELECT statements ───────────────────────────────────
// We SELECT only the columns defined in the new Document interface so the
// return value is strongly typed with no implicit any.
interface DocumentRow {
  id: string
  user_id: string
  application_id: string | null
  name: string
  file_url: string | null
  file_type: string | null
  category: DocumentCategory
  created_at: string
}

const SELECT_COLS = sql`
  id,
  user_id,
  application_id,
  name,
  file_url,
  file_type,
  category,
  created_at
`

// ── getDocumentsByUserId ──────────────────────────────────────────────────────
/**
 * Fetch all documents belonging to a user, newest first.
 * Rows that pre-date migration 005 will have category = 'other' (backfilled)
 * and file_url = null (not backfilled if storage_path/url were both null).
 */
export async function getDocumentsByUserId(userId: string): Promise<Document[]> {
  if (!userId) return []

  const rows = await sql<DocumentRow[]>`
    SELECT ${SELECT_COLS}
    FROM   documents
    WHERE  user_id = ${userId}
    ORDER  BY created_at DESC
  `

  return rows.map(normalise)
}

// ── getDocumentById ───────────────────────────────────────────────────────────
/**
 * Fetch a single document by id, scoped to the authenticated user.
 * Returns null if not found or if the document belongs to another user.
 */
export async function getDocumentById(
  id: string,
  userId: string
): Promise<Document | null> {
  if (!id || !userId) return null

  const rows = await sql<DocumentRow[]>`
    SELECT ${SELECT_COLS}
    FROM   documents
    WHERE  id      = ${id}
    AND    user_id = ${userId}
    LIMIT  1
  `

  return rows[0] ? normalise(rows[0]) : null
}

// ── getDocumentsByApplicationId ───────────────────────────────────────────────
/**
 * Fetch all documents linked to a specific application.
 * Used by the application detail page to show attached files.
 */
export async function getDocumentsByApplicationId(
  applicationId: string,
  userId: string
): Promise<Document[]> {
  if (!applicationId || !userId) return []

  const rows = await sql<DocumentRow[]>`
    SELECT ${SELECT_COLS}
    FROM   documents
    WHERE  application_id = ${applicationId}
    AND    user_id        = ${userId}
    ORDER  BY created_at DESC
  `

  return rows.map(normalise)
}

// ── createDocument ────────────────────────────────────────────────────────────
/**
 * Insert a new document record.
 * Uses explicit named parameters — no Partial<> spread to avoid accidental
 * undefined → NULL mismatches that caused previous type errors.
 *
 * The function also writes to the legacy doc_type column so that any code
 * still reading the old column continues to function.
 */
export async function createDocument(
  input: CreateDocumentInput
): Promise<Document> {
  // Map the new category to the nearest legacy doc_type value
  const legacyDocType: string =
    input.category === "resume"       ? "resume"
    : input.category === "cover_letter" ? "cover_letter"
    : "other"

  const rows = await sql<DocumentRow[]>`
    INSERT INTO documents (
      user_id,
      application_id,
      name,
      file_url,
      file_type,
      category,
      -- legacy columns kept in sync so old queries still work
      doc_type,
      is_link,
      url,
      storage_path
    )
    VALUES (
      ${input.user_id},
      ${input.application_id ?? null},
      ${input.name},
      ${input.file_url ?? null},
      ${input.file_type ?? null},
      ${input.category},
      ${legacyDocType},
      ${input.file_url !== null && isExternalUrl(input.file_url)},
      ${input.file_url !== null && isExternalUrl(input.file_url) ? input.file_url : null},
      ${input.file_url !== null && !isExternalUrl(input.file_url) ? input.file_url : null}
    )
    RETURNING ${SELECT_COLS}
  `

  if (!rows[0]) {
    throw new Error("createDocument: INSERT returned no rows")
  }

  return normalise(rows[0])
}

// ── deleteDocument ────────────────────────────────────────────────────────────
/**
 * Hard-delete a document record owned by the given user.
 * Returns true if a row was deleted, false otherwise.
 */
export async function deleteDocument(
  id: string,
  userId: string
): Promise<boolean> {
  if (!id || !userId) return false

  const result = await sql`
    DELETE FROM documents
    WHERE  id      = ${id}
    AND    user_id = ${userId}
  `

  return (result.count ?? 0) > 0
}

// ── updateDocumentLink ────────────────────────────────────────────────────────
/**
 * Pin or unpin a document from a job application.
 */
export async function updateDocumentApplicationLink(
  id: string,
  userId: string,
  applicationId: string | null
): Promise<Document | null> {
  if (!id || !userId) return null

  const rows = await sql<DocumentRow[]>`
    UPDATE documents
    SET    application_id = ${applicationId}
    WHERE  id      = ${id}
    AND    user_id = ${userId}
    RETURNING ${SELECT_COLS}
  `

  return rows[0] ? normalise(rows[0]) : null
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Coerce a raw DB row to the Document interface. */
function normalise(row: DocumentRow): Document {
  return {
    id:             row.id,
    user_id:        row.user_id,
    application_id: row.application_id ?? null,
    name:           row.name,
    file_url:       row.file_url ?? null,
    file_type:      row.file_type ?? null,
    category:       (row.category as DocumentCategory) ?? "other",
    created_at:     typeof row.created_at === "string"
                      ? row.created_at
                      : (row.created_at as Date).toISOString(),
  }
}

/** Decide whether a file_url is a remote link vs a local storage path. */
function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://")
}