import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getApplicationsByUserId, createApplication } from "@/lib/db/queries/applications"

export async function GET() {
  try {
    const user = await requireAuth()
    const apps = await getApplicationsByUserId(user.userId)
    return NextResponse.json(apps)
  } catch { return NextResponse.json({ error:"Unauthorized" },{ status:401 }) }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const data = await req.json()

    // Ensure required fields exist before attempting database insertion
    if (!data.company_name || !data.job_title) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const app = await createApplication(user.userId, data)
    return NextResponse.json(app, { status:201 })
  } catch (e: unknown) {
    // Log the specific database error to your terminal for debugging
    console.error("POST Application Error:", e) 
    
    const msg = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ error:msg },{ status: msg==="Unauthorized"?401:500 })
  }
}