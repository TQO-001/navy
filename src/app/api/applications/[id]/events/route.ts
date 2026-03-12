// src/app/api/applications/[id]/events/route.ts
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import sql from "@/lib/db"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id:string }> }) {
  try {
    const user = await requireAuth(); const { id } = await params
    const app = await sql`SELECT id FROM applications WHERE id = ${id} AND user_id = ${user.userId} LIMIT 1`
    if (!app.length) return NextResponse.json({ error:"Not found" },{ status:404 })
    const { event_type, title, description, event_date } = await req.json()
    if (!title) return NextResponse.json({ error:"Title required" },{ status:400 })
    const rows = await sql`
      INSERT INTO application_events (application_id, event_type, title, description, event_date)
      VALUES (${id}, ${event_type||"note"}, ${title}, ${description||null}, ${event_date||new Date().toISOString()})
      RETURNING *`
    return NextResponse.json(rows[0],{ status:201 })
  } catch { return NextResponse.json({ error:"Unauthorized" },{ status:401 }) }
}
