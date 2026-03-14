// ─────────────────────────────────────────────────────────────────────────────
// src/app/api/documents/route.ts
// Vault API  —  GET (list) · POST (create link or upload file)
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import {
  getDocumentsByUserId,
  createDocument,
} from "@/lib/db/queries/documents"
import type { CreateDocumentInput, DocumentCategory } from "@/types"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB
const uploadBase     = (): string =>
  process.env.UPLOAD_DIR ?? join(process.cwd(), "uploads")

const VALID_CATEGORIES = new Set<DocumentCategory>([
  "resume",
  "cover_letter",
  "certificate",
  "other",
])

// ── GET /api/documents ────────────────────────────────────────────────────────
export async function GET(): Promise<NextResponse> {
  let user
  try {
    user = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const docs = await getDocumentsByUserId(user.userId)
    return NextResponse.json(docs)
  } catch (e: unknown) {
    console.error("GET /api/documents error:", e)
    return NextResponse.json(
      { error: "Failed to load documents. Please try again." },
      { status: 500 }
    )
  }
}

// ── POST /api/documents ───────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  let user
  try {
    user = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const ct = req.headers.get("content-type") ?? ""

    if (ct.includes("application/json")) {
      return handleLinkCreation(req, user.userId)
    }

    if (ct.includes("multipart/form-data")) {
      return handleFileUpload(req, user.userId)
    }

    return NextResponse.json(
      { error: "Unsupported Content-Type. Send application/json or multipart/form-data." },
      { status: 415 }
    )
  } catch (e: unknown) {
    console.error("POST /api/documents error:", e)
    const msg = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLERS
// ─────────────────────────────────────────────────────────────────────────────

async function handleLinkCreation(
  req: NextRequest,
  userId: string
): Promise<NextResponse> {
  // Accept an unknown body and validate each field explicitly
  const body: Record<string, unknown> = await req.json()

  const name = coerceString(body.name)
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 })

  const file_url = coerceString(body.file_url)
  if (!file_url) return NextResponse.json({ error: "file_url is required" }, { status: 400 })

  // Basic URL syntax check
  try { new URL(file_url) } catch {
    return NextResponse.json({ error: "file_url must be a valid URL" }, { status: 400 })
  }

  const input: CreateDocumentInput = {
    user_id:        userId,
    application_id: coerceString(body.application_id) ?? null,
    name,
    file_url,
    file_type:      coerceString(body.file_type) ?? "text/uri-list",
    category:       resolveCategory(body.category),
  }

  const doc = await createDocument(input)
  return NextResponse.json(doc, { status: 201 })
}

async function handleFileUpload(
  req: NextRequest,
  userId: string
): Promise<NextResponse> {
  const fd   = await req.formData()
  const file = fd.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: `File exceeds the 10 MB limit` },
      { status: 413 }
    )
  }

  const name           = coerceString(fd.get("name")) ?? file.name
  const category       = resolveCategory(fd.get("category"))
  const application_id = coerceString(fd.get("application_id")) ?? null

  // Write to uploads/<userId>/<timestamp>_<safeName>
  const userDir    = join(uploadBase(), userId)
  await mkdir(userDir, { recursive: true })

  const safeName   = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const storedName = `${Date.now()}_${safeName}`
  await writeFile(join(userDir, storedName), Buffer.from(await file.arrayBuffer()))

  const input: CreateDocumentInput = {
    user_id:        userId,
    application_id,
    name,
    // Relative path served by /api/documents/[id]/file
    file_url:  `${userId}/${storedName}`,
    file_type: file.type || "application/octet-stream",
    category,
  }

  const doc = await createDocument(input)
  return NextResponse.json(doc, { status: 201 })
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function coerceString(v: unknown): string | null {
  if (typeof v === "string") {
    const s = v.trim()
    return s.length > 0 ? s : null
  }
  return null
}

function resolveCategory(v: unknown): DocumentCategory {
  if (typeof v === "string" && VALID_CATEGORIES.has(v as DocumentCategory)) {
    return v as DocumentCategory
  }
  return "other"
}