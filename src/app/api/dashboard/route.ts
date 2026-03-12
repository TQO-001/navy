// src/app/api/dashboard/route.ts
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getDashboardStats } from "@/lib/db/queries/applications"
export async function GET() {
  try { const user = await requireAuth(); const stats = await getDashboardStats(user.userId); return NextResponse.json(stats) }
  catch { return NextResponse.json({ error:"Unauthorized" },{ status:401 }) }
}
