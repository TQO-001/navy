import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getUserById, updateUser } from "@/lib/db/queries/users"

export async function GET() {
  try {
    const user = await requireAuth()
    const u = await getUserById(user.userId)
    if (!u) return NextResponse.json({ error:"Not found" },{ status:404 })
    return NextResponse.json({ id:u.id, name:u.name, email:u.email, created_at:u.created_at })
  } catch { return NextResponse.json({ error:"Unauthorized" },{ status:401 }) }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth()
    const data = await req.json()
    const u = await updateUser(user.userId, data)
    return NextResponse.json(u)
  } catch { return NextResponse.json({ error:"Unauthorized" },{ status:401 }) }
}
