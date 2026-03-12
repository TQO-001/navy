import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import sql from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

function uploadDir() { return process.env.UPLOAD_DIR ?? join(process.cwd(),"uploads") }

export async function GET() {
  try { const user = await requireAuth(); const docs = await sql`SELECT * FROM documents WHERE user_id = ${user.userId} ORDER BY created_at DESC`; return NextResponse.json(docs) }
  catch { return NextResponse.json({ error:"Unauthorized" },{ status:401 }) }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const ct = req.headers.get("content-type") ?? ""

    if (ct.includes("application/json")) {
      const { name, url, doc_type, notes } = await req.json()
      if (!name||!url) return NextResponse.json({ error:"Name and URL required" },{ status:400 })
      const rows = await sql`INSERT INTO documents (user_id,name,doc_type,notes,is_default,is_link,url) VALUES (${user.userId},${name},${doc_type??"other"},${notes??null},false,true,${url}) RETURNING *`
      return NextResponse.json(rows[0],{ status:201 })
    }

    const fd = await req.formData()
    const file = fd.get("file") as File|null
    const doc_type = fd.get("doc_type") as string ?? "other"
    const notes    = fd.get("notes")    as string ?? ""
    if (!file) return NextResponse.json({ error:"No file" },{ status:400 })
    if (file.size>10*1024*1024) return NextResponse.json({ error:"File too large (max 10MB)" },{ status:400 })
    const dir = join(uploadDir(), user.userId)
    await mkdir(dir,{ recursive:true })
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g,"_")
    const filename = Date.now()+"_"+safeName
    await writeFile(join(dir,filename), Buffer.from(await file.arrayBuffer()))
    const rows = await sql`INSERT INTO documents (user_id,name,doc_type,storage_path,file_size,notes,is_default,is_link) VALUES (${user.userId},${file.name},${doc_type},${filename},${file.size},${notes||null},false,false) RETURNING *`
    return NextResponse.json(rows[0],{ status:201 })
  } catch (err) { console.error(err); return NextResponse.json({ error:"Server error" },{ status:500 }) }
}
