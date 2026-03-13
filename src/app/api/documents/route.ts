import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import sql from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

function uploadDir() { return process.env.UPLOAD_DIR ?? join(process.cwd(), "uploads") }

export async function GET() {
  try {
    const user = await requireAuth()
    const docs = await sql`SELECT * FROM documents WHERE user_id = ${user.userId} ORDER BY created_at DESC`
    return NextResponse.json(docs)
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const contentType = req.headers.get("content-type") ?? ""

    // Handle Link Addition
    if (contentType.includes("application/json")) {
      const { name, url, doc_type, notes } = await req.json()
      if (!name || !url) return NextResponse.json({ error: "Name and URL required" }, { status: 400 })
      
      const rows = await sql`
        INSERT INTO documents (user_id, name, doc_type, notes, is_default, is_link, url) 
        VALUES (${user.userId}, ${name}, ${doc_type ?? "other"}, ${notes ?? null}, false, true, ${url}) 
        RETURNING *
      `
      return NextResponse.json(rows[0], { status: 201 })
    }

    // Handle File Upload
    const fd = await req.formData()
    const file = fd.get("file") as File | null
    const doc_type = (fd.get("doc_type") as string) ?? "other"
    const notes = (fd.get("notes") as string) ?? ""

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    const userDir = join(uploadDir(), user.userId)
    await mkdir(userDir, { recursive: true })

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const storageName = `${Date.now()}_${safeName}`
    const filePath = join(userDir, storageName)

    await writeFile(filePath, Buffer.from(await file.arrayBuffer()))

    // Fixed column names to match your schema:
    // doc_type remains as sent by frontend, but we ensure we aren't calling 'file_type'
    const rows = await sql`
      INSERT INTO documents (
        user_id, 
        name, 
        doc_type, 
        url, 
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
        ${notes}, 
        false
      ) 
      RETURNING *
    `
    return NextResponse.json(rows[0], { status: 201 })
  } catch (e: any) {
    console.error("Document Upload Error:", e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}