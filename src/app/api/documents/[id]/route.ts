// src/app/api/documents/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import sql from "@/lib/db"
import { unlink } from "fs/promises"
import { join } from "path"

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id:string }> }) {
  try {
    const user = await requireAuth(); const { id } = await params
    const rows = await sql`SELECT * FROM documents WHERE id = ${id} AND user_id = ${user.userId} LIMIT 1`
    if (!rows.length) return NextResponse.json({ error:"Not found" },{ status:404 })
    const doc = rows[0] as { storage_path?:string; is_link?:boolean }
    if (!doc.is_link&&doc.storage_path) {
      const dir = process.env.UPLOAD_DIR ?? join(process.cwd(),"uploads")
      await unlink(join(dir, user.userId, doc.storage_path)).catch(()=>{})
    }
    await sql`DELETE FROM documents WHERE id = ${id}`
    return NextResponse.json({ success:true })
  } catch { return NextResponse.json({ error:"Unauthorized" },{ status:401 }) }
}
