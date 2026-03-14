import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import sql from "@/lib/db"
import { readFile } from "fs/promises"
import { join, extname } from "path"

// Map common extensions to proper MIME types so browsers preview inline
const MIME_TYPES: Record<string, string> = {
  ".pdf":  "application/pdf",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif":  "image/gif",
  ".webp": "image/webp",
  ".doc":  "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".txt":  "text/plain",
}

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

    const rows = await sql`
      SELECT id, name, storage_path, is_link, user_id
      FROM documents
      WHERE id = ${id} AND user_id = ${user.userId}
      LIMIT 1
    `

    if (!rows.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const doc = rows[0] as {
      id: string
      name: string
      storage_path: string | null
      is_link: boolean
      user_id: string
    }

    if (doc.is_link || !doc.storage_path) {
      return NextResponse.json(
        { error: "This document is an external link and has no local file." },
        { status: 400 }
      )
    }

    const dir = process.env.UPLOAD_DIR ?? join(process.cwd(), "uploads")
    const filePath = join(dir, user.userId, doc.storage_path)
    const buf = await readFile(filePath)

    const ext = extname(doc.storage_path).toLowerCase()
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream"

    // For PDFs and images serve inline so the preview modal can display them
    // For other types force a download
    const isPrevieable = [".pdf", ".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext)
    const disposition = isPrevieable
      ? `inline; filename="${doc.name}"`
      : `attachment; filename="${doc.name}"`

    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch (e: unknown) {
    const isNotFound =
      e instanceof Error &&
      (e.message.includes("ENOENT") || e.message.includes("no such file"))

    if (isNotFound) {
      return NextResponse.json(
        { error: "File not found on server. It may have been deleted." },
        { status: 404 }
      )
    }

    console.error("GET /api/documents/[id]/file error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}