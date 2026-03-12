// src/app/api/contacts/route.ts
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getContactsByUserId, createContact } from "@/lib/db/queries/contacts"

export async function GET() {
  try { const user = await requireAuth(); return NextResponse.json(await getContactsByUserId(user.userId)) }
  catch { return NextResponse.json({ error:"Unauthorized" },{ status:401 }) }
}
export async function POST(req: NextRequest) {
  try { const user = await requireAuth(); const data = await req.json(); const contact = await createContact(user.userId, data); return NextResponse.json(contact,{ status:201 }) }
  catch { return NextResponse.json({ error:"Unauthorized" },{ status:401 }) }
}
