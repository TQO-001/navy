import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import sql from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

function uploadDir() {
  return process.env.UPLOAD_DIR ?? join(process.cwd(), "uploads")
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/documents
// BUG FIXED: The original catch block returned { error: "Unauthorized" } for
// ALL errors — including DB timeouts — causing the documents page to hang
// indefinitely when the postgres connection was slow, and masking real errors.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  let user
  try {
    user = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const docs = await sql`
      SELECT
        id, user_id, name, doc_type, storage_path, file_size,
        is_default, is_link, url, notes, created_at
      FROM documents
      WHERE user_id = ${user.userId}
      ORDER BY created_at DESC
    `
    return NextResponse.json(docs)
  } catch (e: unknown) {
    // Return a proper 500 so the client shows an error instead of spinning forever
    console.error("GET /api/documents DB error:", e)
    return NextResponse.json(
      { error: "Failed to load documents. Please try again." },
      { status: 500 }
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/documents
// BUG FIXED: The original code stored the local filename in the `url` column
// for file uploads, but the download route reads `storage_path`. This meant
// every uploaded file returned "Not a file" (400) on download.
// Fix: store the local filename in `storage_path` where the download route
// expects it, and only use `url` for external link records.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let user
  try {
    user = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const contentType = req.headers.get("content-type") ?? ""

    // ── Link Addition ──────────────────────────────────────────────────────
    if (contentType.includes("application/json")) {
      const body = await req.json()
      const { name, url, doc_type, notes } = body

      if (!name?.trim()) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 })
      }
      if (!url?.trim()) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 })
      }

      const rows = await sql`
        INSERT INTO documents (user_id, name, doc_type, notes, is_default, is_link, url)
        VALUES (
          ${user.userId},
          ${name.trim()},
          ${doc_type ?? "other"},
          ${notes ?? null},
          false,
          true,
          ${url.trim()}
        )
        RETURNING
          id, user_id, name, doc_type, storage_path, file_size,
          is_default, is_link, url, notes, created_at
      `
      return NextResponse.json(rows[0], { status: 201 })
    }

    // ── File Upload ────────────────────────────────────────────────────────
    const fd = await req.formData()
    const file = fd.get("file") as File | null
    const doc_type = (fd.get("doc_type") as string) ?? "other"
    const notes = (fd.get("notes") as string) ?? ""

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds the 10 MB size limit" },
        { status: 413 }
      )
    }

    // Ensure the per-user directory exists before writing
    const userDir = join(uploadDir(), user.userId)
    await mkdir(userDir, { recursive: true })

    // Sanitize the filename and prefix with a timestamp to avoid collisions
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const storageName = `${Date.now()}_${safeName}`
    const filePath = join(userDir, storageName)

    await writeFile(filePath, Buffer.from(await file.arrayBuffer()))

    // ✅ FIXED: store the local filename in `storage_path` (not `url`)
    //    The download route at /api/documents/[id]/file reads storage_path.
    const rows = await sql`
      INSERT INTO documents (
        user_id,
        name,
        doc_type,
        storage_path,
        file_size,
        notes,
        is_link
      )
      VALUES (
        ${user.userId},
        ${file.name},
        ${doc_type},
        ${storageName},
        ${file.size},
        ${notes || null},
        false
      )
      RETURNING
        id, user_id, name, doc_type, storage_path, file_size,
        is_default, is_link, url, notes, created_at
    `
    return NextResponse.json(rows[0], { status: 201 })
  } catch (e: unknown) {
    console.error("POST /api/documents error:", e)
    const msg = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}