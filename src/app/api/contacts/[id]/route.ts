import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { deleteContact } from "@/lib/db/queries/contacts"
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id:string }> }) {
  try { const user = await requireAuth(); const { id } = await params; await deleteContact(id, user.userId); return NextResponse.json({ success:true }) }
  catch { return NextResponse.json({ error:"Unauthorized" },{ status:401 }) }
}
