// ─────────────────────────────────────────────────────────────────────────────
// src/app/api/documents/[id]/file/route.ts
// Serve uploaded files or redirect to external links
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDocumentById } from "@/lib/db/queries/documents"
import { readFile } from "fs/promises"
import { join } from "path"

const uploadBase = (): string =>
  process.env.UPLOAD_DIR ?? join(process.cwd(), "uploads")

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let user
  try {
    user = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params

    // Fetch document metadata
    const doc = await getDocumentById(id, user.userId)
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // If it's an external link, redirect to it
    if (
      doc.file_url &&
      (doc.file_url.startsWith("http://") || doc.file_url.startsWith("https://"))
    ) {
      return NextResponse.redirect(doc.file_url)
    }

    // Otherwise, serve the uploaded file
    if (!doc.file_url) {
      return NextResponse.json(
        { error: "Document file not found" },
        { status: 404 }
      )
    }

    // Read file from disk
    const filePath = join(uploadBase(), doc.file_url)
    const fileBuffer = await readFile(filePath)

    // Return file with appropriate headers
    const headers = new Headers()
    headers.set("Content-Type", doc.file_type || "application/octet-stream")
    headers.set(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(doc.name)}"`
    )
    headers.set("Cache-Control", "private, max-age=3600")

    return new NextResponse(fileBuffer, { headers })
  } catch (e: unknown) {
    console.error("GET /api/documents/[id]/file error:", e)
    return NextResponse.json(
      { error: "Failed to retrieve document" },
      { status: 500 }
    )
  }
}