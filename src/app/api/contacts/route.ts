import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import sql from "@/lib/db"

// ─────────────────────────────────────────────────────────────────────────────
// BUG FIXED: Original query selected `updated_at` which doesn't exist after
// migration 003. Also, the single catch block returned 401 for ALL errors
// (including DB timeouts), masking real issues and hanging the contacts page.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  let user
  try {
    user = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const contacts = await sql`
      SELECT
        id, user_id, name, email, phone, company, role,
        relationship, linkedin_url, notes, application_id,
        last_contacted, created_at
      FROM contacts
      WHERE user_id = ${user.userId}
      ORDER BY created_at DESC
    `
    return NextResponse.json(contacts)
  } catch (e: unknown) {
    console.error("GET /api/contacts DB error:", e)
    return NextResponse.json(
      { error: "Failed to load contacts. Please try again." },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const data = await req.json()

    if (!data.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Validate application_id belongs to this user if provided
    if (data.application_id) {
      const appRows = await sql`
        SELECT id FROM applications 
        WHERE id = ${data.application_id} AND user_id = ${user.userId} 
        LIMIT 1
      `
      if (!appRows.length) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 })
      }
    }

    const rows = await sql`
      INSERT INTO contacts (
        user_id, name, email, phone, company, role,
        relationship, linkedin_url, notes, application_id
      ) VALUES (
        ${user.userId},
        ${data.name.trim()},
        ${data.email || null},
        ${data.phone || null},
        ${data.company || null},
        ${data.role || null},
        ${data.relationship || "other"},
        ${data.linkedin_url || null},
        ${data.notes || null},
        ${data.application_id || null}
      )
      RETURNING 
        id, user_id, name, email, phone, company, role,
        relationship, linkedin_url, notes, application_id, created_at
    `
    return NextResponse.json(rows[0], { status: 201 })
  } catch (e: unknown) {
    console.error("POST Contact Error:", e)
    const msg = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 })
  }
}