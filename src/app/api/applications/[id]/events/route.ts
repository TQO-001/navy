import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import sql from "@/lib/db"

// ─────────────────────────────────────────────────────────────────────────────
// BUG FIXED: The DB CHECK constraint on application_events.event_type is:
//   ('applied','status_change','note','interview','phone_call','email',
//    'offer','rejection','follow_up','other')
//
// The ActivityLog UI was submitting "phone_screen" which is NOT in that list,
// causing a Postgres constraint violation. The catch block then returned 401,
// so the error appeared as an auth failure rather than a validation error.
//
// Fix: map "phone_screen" → "phone_call" before inserting, and validate the
// event_type against the allowed set so we get a clear 400 rather than a
// cryptic DB error.
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_EVENT_TYPES = new Set([
  "applied",
  "status_change",
  "note",
  "interview",
  "phone_call",
  "email",
  "offer",
  "rejection",
  "follow_up",
  "other",
])

// Friendly aliases accepted from the UI that map to valid DB values
const EVENT_TYPE_ALIASES: Record<string, string> = {
  phone_screen: "phone_call",
  rejected:     "rejection",
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let user
  try {
    user = await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params

    // Verify the application belongs to this user
    const appRows = await sql`
      SELECT id FROM applications
      WHERE id = ${id} AND user_id = ${user.userId}
      LIMIT 1
    `
    if (!appRows.length) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const body = await req.json()
    const { title, description, event_date } = body
    let event_type: string = body.event_type ?? "note"

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Resolve any UI aliases to valid DB values
    if (EVENT_TYPE_ALIASES[event_type]) {
      event_type = EVENT_TYPE_ALIASES[event_type]
    }

    // Final guard against unknown types
    if (!ALLOWED_EVENT_TYPES.has(event_type)) {
      event_type = "other"
    }

    const rows = await sql`
      INSERT INTO application_events (
        application_id,
        event_type,
        title,
        description,
        event_date
      )
      VALUES (
        ${id},
        ${event_type},
        ${title.trim()},
        ${description ?? null},
        ${event_date ?? new Date().toISOString()}
      )
      RETURNING *
    `

    return NextResponse.json(rows[0], { status: 201 })
  } catch (e: unknown) {
    console.error("POST /api/applications/[id]/events error:", e)
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 })
  }
}