import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getApplicationById, updateApplication, deleteApplication } from "@/lib/db/queries/applications"

type P = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: P) {
  try {
    const user = await requireAuth(); const { id } = await params
    const app = await getApplicationById(id, user.userId)
    if (!app) return NextResponse.json({ error:"Not found" },{ status:404 })
    return NextResponse.json(app)
  } catch { return NextResponse.json({ error:"Unauthorized" },{ status:401 }) }
}

export async function PATCH(req: NextRequest, { params }: P) {
  try {
    const user = await requireAuth(); const { id } = await params
    const data = await req.json()
    const app = await updateApplication(id, user.userId, data)
    if (!app) return NextResponse.json({ error:"Not found" },{ status:404 })
    return NextResponse.json(app)
  } catch { return NextResponse.json({ error:"Unauthorized" },{ status:401 }) }
}

export async function DELETE(_req: NextRequest, { params }: P) {
  try {
    const user = await requireAuth(); const { id } = await params
    await deleteApplication(id, user.userId)
    return NextResponse.json({ success:true })
  } catch { return NextResponse.json({ error:"Unauthorized" },{ status:401 }) }
}
