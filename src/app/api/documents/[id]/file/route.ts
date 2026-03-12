import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import sql from "@/lib/db"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id:string }> }) {
  try {
    const user = await requireAuth(); const { id } = await params
    const rows = await sql`SELECT * FROM documents WHERE id = ${id} AND user_id = ${user.userId} LIMIT 1`
    if (!rows.length) return NextResponse.json({ error:"Not found" },{ status:404 })
    const doc = rows[0] as { storage_path?:string; name?:string; is_link?:boolean }
    if (doc.is_link||!doc.storage_path) return NextResponse.json({ error:"Not a file" },{ status:400 })
    const dir = process.env.UPLOAD_DIR ?? join(process.cwd(),"uploads")
    const buf = await readFile(join(dir, user.userId, doc.storage_path))
    return new NextResponse(buf, { headers:{ "Content-Disposition":`attachment; filename="${doc.name}"`, "Content-Type":"application/octet-stream" } })
  } catch { return NextResponse.json({ error:"Server error" },{ status:500 }) }
}
