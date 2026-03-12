// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db/queries/users"
import { verifyPassword, createToken, setAuthCookie } from "@/lib/auth"
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error:"Email and password required" },{ status:400 })
    const user = await getUserByEmail(email)
    if (!user || !await verifyPassword(password, user.password_hash)) return NextResponse.json({ error:"Invalid credentials" },{ status:401 })
    const token = await createToken({ userId:user.id, name:user.name, email:user.email })
    await setAuthCookie(token)
    return NextResponse.json({ user:{ id:user.id, email:user.email, name:user.name } })
  } catch (e) { console.error(e); return NextResponse.json({ error:"Server error" },{ status:500 }) }
}
