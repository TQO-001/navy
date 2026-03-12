import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import sql from "@/lib/db"

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(); const { ids } = await req.json()
    if (!ids?.length) return NextResponse.json({ error:"No IDs" },{ status:400 })
    await sql`DELETE FROM applications WHERE id = ANY(${ids}::uuid[]) AND user_id = ${user.userId}`
    return NextResponse.json({ success:true })
  } catch { return NextResponse.json({ error:"Unauthorized" },{ status:401 }) }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(); const { ids, status } = await req.json()
    if (!ids?.length||!status) return NextResponse.json({ error:"Missing fields" },{ status:400 })
    await sql`UPDATE applications SET status = ${status} WHERE id = ANY(${ids}::uuid[]) AND user_id = ${user.userId}`
    return NextResponse.json({ success:true })
  } catch { return NextResponse.json({ error:"Unauthorized" },{ status:401 }) }
}
