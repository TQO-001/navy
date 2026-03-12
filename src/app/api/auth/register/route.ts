import { NextRequest, NextResponse } from "next/server"
import { getUserByEmail, createUser } from "@/lib/db/queries/users"
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth"
export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json()
    if (!email||!name||!password) return NextResponse.json({ error:"All fields required" },{ status:400 })
    if (await getUserByEmail(email)) return NextResponse.json({ error:"Email already registered" },{ status:409 })
    const user = await createUser(email, name, await hashPassword(password))
    const token = await createToken({ userId:user.id, name:user.name, email:user.email })
    await setAuthCookie(token)
    return NextResponse.json({ user:{ id:user.id, email:user.email, name:user.name } },{ status:201 })
  } catch (e) { console.error(e); return NextResponse.json({ error:"Server error" },{ status:500 }) }
}
